import os
import uuid
import json
import logging
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO

# Import local modules
from app.config import settings
from app.db.session import engine, Base, get_db
from app.db.models import Dataset, AuditLog, LineageStep
from app.services.profiler import ProfilerService
from app.services.quality_detector import QualityDetectorService
from app.services.scorer import ScorerService
from app.services.remediator import RemediatorService

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Data Readiness Pipeline API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper: Load DataFrame from path
def load_dataframe(file_path: str) -> pd.DataFrame:
    if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        return pd.read_excel(file_path)
    return pd.read_csv(file_path)

# Helper: Save DataFrame to path
def save_dataframe(df: pd.DataFrame, file_path: str):
    if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        df.to_excel(file_path, index=False)
    else:
        df.to_csv(file_path, index=False)

@app.get("/api/datasets")
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "row_count": d.row_count,
            "col_count": d.col_count,
            "original_score": d.original_score,
            "current_score": d.current_score,
            "created_at": d.created_at.isoformat()
        }
        for d in datasets
    ]

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Save file
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.csv', '.xlsx', '.xls']:
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported.")
        
    original_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_original{ext}")
    working_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_working{ext}")
    
    with open(original_path, "wb") as buffer:
        buffer.write(await file.read())
        
    # Duplicate original as working
    import shutil
    shutil.copyfile(original_path, working_path)
    
    try:
        df = load_dataframe(working_path)
    except Exception as e:
        # Cleanup
        os.remove(original_path)
        os.remove(working_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")
        
    row_count = len(df)
    col_count = len(df.columns)
    
    # 2. Profile
    profile = ProfilerService.profile_dataframe(df)
    issues = QualityDetectorService.detect_issues(df, profile)
    score_res = ScorerService.calculate_score(profile, issues)
    
    # 3. Create Dataset DB Record
    db_dataset = Dataset(
        id=file_id,
        filename=file.filename,
        row_count=row_count,
        col_count=col_count,
        original_score=score_res["overall"],
        current_score=score_res["overall"],
        file_path=working_path,
        columns_metadata=json.dumps(profile)
    )
    db.add(db_dataset)
    
    # 4. Save Initial Audit Log
    db.add(AuditLog(
        dataset_id=file_id,
        action="UPLOAD",
        details=f"Uploaded raw dataset: {file.filename} with {row_count} rows and {col_count} columns. Initial Readiness Score: {score_res['overall']}/100."
    ))
    
    # 5. Save Lineage Step
    db.add(LineageStep(
        dataset_id=file_id,
        step_index=0,
        name="Ingestion",
        description=f"Ingested raw dataset '{file.filename}'",
        score_before=score_res["overall"],
        score_after=score_res["overall"]
    ))
    
    db.commit()
    db.refresh(db_dataset)
    
    return {
        "id": db_dataset.id,
        "filename": db_dataset.filename,
        "score": score_res,
        "profile": profile,
        "issues": issues
    }

@app.get("/api/datasets/{dataset_id}")
def get_dataset_details(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    profile = json.loads(dataset.columns_metadata)
    
    # Reload dataframe to run current checks
    df = load_dataframe(dataset.file_path)
    issues = QualityDetectorService.detect_issues(df, profile)
    score_res = ScorerService.calculate_score(profile, issues)
    
    # Get lineage
    lineage = db.query(LineageStep).filter(LineageStep.dataset_id == dataset_id).order_by(LineageStep.step_index.asc()).all()
    audit_logs = db.query(AuditLog).filter(AuditLog.dataset_id == dataset_id).order_by(AuditLog.timestamp.desc()).all()
    
    return {
        "id": dataset.id,
        "filename": dataset.filename,
        "row_count": dataset.row_count,
        "col_count": dataset.col_count,
        "original_score": dataset.original_score,
        "current_score": dataset.current_score,
        "profile": profile,
        "issues": issues,
        "score": score_res,
        "lineage": [
            {
                "step_index": s.step_index,
                "name": s.name,
                "description": s.description,
                "score_before": s.score_before,
                "score_after": s.score_after,
                "timestamp": s.timestamp.isoformat()
            } for s in lineage
        ],
        "audit_logs": [
            {
                "action": a.action,
                "target_column": a.target_column,
                "rows_affected": a.rows_affected,
                "details": a.details,
                "timestamp": a.timestamp.isoformat()
            } for a in audit_logs
        ]
    }

@app.get("/api/datasets/{dataset_id}/data")
def get_dataset_data(
    dataset_id: str, 
    page: int = Query(1, ge=1), 
    page_size: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    df = load_dataframe(dataset.file_path)
    
    # Fill float NaNs with None so they translate to JSON nulls properly
    df_clean = df.replace({np.nan: None, pd.NA: None})
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_df = df_clean.iloc[start:end]
    
    return {
        "page": page,
        "page_size": page_size,
        "total_rows": len(df),
        "columns": df.columns.tolist(),
        "rows": paginated_df.to_dict(orient="records")
    }

from fastapi import Header

@app.post("/api/datasets/{dataset_id}/remediate")
def remediate_dataset(
    dataset_id: str,
    payload: Dict[str, Any],
    x_gemini_key: str = Header(None),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    rule_type = payload.get("rule_type")
    column = payload.get("column")
    parameters = payload.get("parameters", {})
    
    if not rule_type:
        raise HTTPException(status_code=400, detail="Missing 'rule_type' in payload.")
        
    df = load_dataframe(dataset.file_path)
    
    # Calculate score before fix
    profile_before = json.loads(dataset.columns_metadata)
    issues_before = QualityDetectorService.detect_issues(df, profile_before)
    score_before = ScorerService.calculate_score(profile_before, issues_before)["overall"]
    
    # Apply cleaning operation
    try:
        if rule_type == "llm_clean":
            api_key = x_gemini_key or payload.get("gemini_key") or settings.GEMINI_API_KEY
            df_after, rows_affected, audit_msg = RemediatorService.apply_llm_fix(
                df=df,
                column=column,
                fix_type=parameters.get("fix_type", "standardize"),
                api_key=api_key
            )
            action_name = "LLM_FIX"
        else:
            df_after, rows_affected, audit_msg = RemediatorService.apply_rule_fix(
                df=df,
                rule_type=rule_type,
                column=column,
                parameters=parameters
            )
            action_name = "RULE_FIX"
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Remediation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Remediation failed: {str(e)}")
        
    # Save the updated data back
    save_dataframe(df_after, dataset.file_path)
    
    # Recalculate metrics
    profile_after = ProfilerService.profile_dataframe(df_after)
    issues_after = QualityDetectorService.detect_issues(df_after, profile_after)
    score_after_res = ScorerService.calculate_score(profile_after, issues_after)
    score_after = score_after_res["overall"]
    
    # Update DB fields
    dataset.row_count = len(df_after)
    dataset.col_count = len(df_after.columns)
    dataset.current_score = score_after
    dataset.columns_metadata = json.dumps(profile_after)
    
    # Add audit log
    db.add(AuditLog(
        dataset_id=dataset_id,
        action=action_name,
        target_column=column,
        rows_affected=rows_affected,
        details=audit_msg
    ))
    
    # Get current max lineage step index
    last_step = db.query(LineageStep).filter(LineageStep.dataset_id == dataset_id).order_by(LineageStep.step_index.desc()).first()
    next_index = (last_step.step_index + 1) if last_step else 1
    
    # Create Lineage Step
    step_name = f"Remediate ({rule_type})" if rule_type != "llm_clean" else f"Gemini Clean ({column})"
    db.add(LineageStep(
        dataset_id=dataset_id,
        step_index=next_index,
        name=step_name,
        description=audit_msg[:200],
        score_before=score_before,
        score_after=score_after
    ))
    
    db.commit()
    
    return {
        "status": "success",
        "rows_affected": rows_affected,
        "score_before": score_before,
        "score_after": score_after,
        "score": score_after_res,
        "profile": profile_after,
        "issues": issues_after
    }

@app.post("/api/datasets/{dataset_id}/reset")
def reset_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    ext = os.path.splitext(dataset.filename)[1].lower()
    original_path = os.path.join(settings.UPLOAD_DIR, f"{dataset_id}_original{ext}")
    working_path = dataset.file_path
    
    import shutil
    shutil.copyfile(original_path, working_path)
    
    df = load_dataframe(working_path)
    
    # Profile & Scoring
    profile = ProfilerService.profile_dataframe(df)
    issues = QualityDetectorService.detect_issues(df, profile)
    score_res = ScorerService.calculate_score(profile, issues)
    
    # Update Dataset DB
    dataset.row_count = len(df)
    dataset.col_count = len(df.columns)
    dataset.current_score = score_res["overall"]
    dataset.columns_metadata = json.dumps(profile)
    
    # Delete downstream audit/lineage except ingestion
    db.query(AuditLog).filter(AuditLog.dataset_id == dataset_id).delete()
    db.query(LineageStep).filter(LineageStep.dataset_id == dataset_id, LineageStep.step_index > 0).delete()
    
    # Reset lineage 0 score
    ingest_step = db.query(LineageStep).filter(LineageStep.dataset_id == dataset_id, LineageStep.step_index == 0).first()
    if ingest_step:
        ingest_step.score_before = score_res["overall"]
        ingest_step.score_after = score_res["overall"]
        
    db.add(AuditLog(
        dataset_id=dataset_id,
        action="RESET",
        details="Reverted dataset to its original, raw state. Deleted all previous cleaning steps."
    ))
    
    db.commit()
    
    return {
        "status": "success",
        "score": score_res,
        "profile": profile,
        "issues": issues
    }

@app.get("/api/datasets/{dataset_id}/export")
def export_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    if not os.path.exists(dataset.file_path):
        raise HTTPException(status_code=404, detail="File not found on system.")
        
    return FileResponse(
        path=dataset.file_path,
        filename=f"clean_{dataset.filename}",
        media_type="application/octet-stream"
    )

@app.get("/api/datasets/{dataset_id}/report")
def export_pdf_report(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    profile = json.loads(dataset.columns_metadata)
    
    # Reload dataframe to run current checks
    df = load_dataframe(dataset.file_path)
    issues = QualityDetectorService.detect_issues(df, profile)
    score_res = ScorerService.calculate_score(profile, issues)
    
    # Let's generate a simple PDF report using ReportLab
    # If reportlab fails or is slow, we can stream a formatted PDF buffer.
    buffer = BytesIO()
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        story = []
        
        styles = getSampleStyleSheet()
        # Custom monochrome styles
        title_style = ParagraphStyle(
            name="TitleStyle",
            parent=styles["Title"],
            fontSize=24,
            leading=28,
            textColor=colors.black,
            alignment=0 # Left aligned
        )
        subtitle_style = ParagraphStyle(
            name="SubStyle",
            parent=styles["Heading2"],
            fontSize=14,
            textColor=colors.gray,
            spaceAfter=20
        )
        heading_style = ParagraphStyle(
            name="HeadStyle",
            parent=styles["Heading3"],
            fontSize=16,
            leading=20,
            textColor=colors.black,
            spaceBefore=15,
            spaceAfter=8
        )
        body_style = ParagraphStyle(
            name="BodyStyle",
            parent=styles["BodyText"],
            fontSize=10,
            leading=14,
            textColor=colors.black
        )
        
        # Header
        story.append(Paragraph("DATA AI-READINESS REPORT", title_style))
        story.append(Paragraph(f"Dataset: {dataset.filename} | Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", subtitle_style))
        story.append(Spacer(1, 10))
        
        # Section 1: Summary Table
        story.append(Paragraph("Dataset Quality Metrics", heading_style))
        data_summary = [
            ["Metric", "Value"],
            ["Total Rows", str(dataset.row_count)],
            ["Total Columns", str(dataset.col_count)],
            ["Original Readiness Score", f"{dataset.original_score}/100"],
            ["Current Readiness Score", f"{dataset.current_score}/100"],
            ["Completeness Dimension", f"{score_res['dimensions']['completeness']}/100"],
            ["Validity Dimension", f"{score_res['dimensions']['validity']}/100"],
            ["Uniqueness Dimension", f"{score_res['dimensions']['uniqueness']}/100"],
            ["Consistency Dimension", f"{score_res['dimensions']['consistency']}/100"],
            ["Timeliness Dimension", f"{score_res['dimensions']['timeliness']}/100"],
        ]
        
        t_summary = Table(data_summary, colWidths=[200, 200])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.black),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,1), (-1,-1), 9),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.whitesmoke])
        ]))
        story.append(t_summary)
        story.append(Spacer(1, 15))
        
        # Section 2: Remaining Quality Issues
        story.append(Paragraph("Outstanding Quality Issues", heading_style))
        if not issues:
            story.append(Paragraph("Excellent! No outstanding data quality issues detected. This dataset is AI-ready.", body_style))
        else:
            issue_data = [["Column", "Dimension", "Severity", "Description"]]
            for issue in issues[:15]: # Show first 15 issues max
                issue_data.append([
                    issue["column"],
                    issue["dimension"].capitalize(),
                    issue["severity"].upper(),
                    issue["description"]
                ])
            t_issues = Table(issue_data, colWidths=[100, 80, 70, 250])
            t_issues.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.black),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 6),
                ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
                ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
                ('FONTSIZE', (0,1), (-1,-1), 8),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.whitesmoke])
            ]))
            story.append(t_issues)
            if len(issues) > 15:
                story.append(Paragraph(f"...and {len(issues) - 15} more issues.", body_style))
                
        story.append(Spacer(1, 15))
        
        # Section 3: Audit Trail & Lineage
        story.append(Paragraph("Data Cleaning Lineage Audit Trail", heading_style))
        lineage = db.query(LineageStep).filter(LineageStep.dataset_id == dataset_id).order_by(LineageStep.step_index.asc()).all()
        
        lineage_data = [["Step", "Operation", "Details", "Score Before", "Score After"]]
        for step in lineage:
            lineage_data.append([
                str(step.step_index),
                step.name,
                step.description[:50] + "..." if len(step.description) > 50 else step.description,
                f"{step.score_before}/100",
                f"{step.score_after}/100"
            ])
            
        t_lineage = Table(lineage_data, colWidths=[40, 100, 200, 80, 80])
        t_lineage.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.black),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,1), (-1,-1), 8),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.whitesmoke])
        ]))
        story.append(t_lineage)
        
        doc.build(story)
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment;filename=readiness_report_{dataset_id}.pdf"})
    except Exception as e:
        logger.error(f"Failed to generate PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

@app.post("/api/datasets/demo")
def load_demo_dataset(db: Session = Depends(get_db)):
    # 1. Create simulated messy enterprise dataset
    data = {
        "customer_id": [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1007, 1009, 1010],
        "name": ["John Doe", "Jane Smith", "alice johnson", "BOB BROWN", "Charley Davis", "Eva Martinez", "Frank Wilson", "Frank Wilson", "Grace Lee", "Henry Taylor"],
        "email": ["john.doe@gmail.com", "jane.smith@yahoo.com", "alice.j@corp.com", "", "charley.d@outlook.com", "eva.m@gmail.com", "frank@corp.com", "frank@corp.com", "grace.l@gmail.com", "henry@gmail.com"],
        "state": ["CA", "cali", "NY", "New York", "tx", "Texas", "N.Y.", "N.Y.", "CA", "Calfornia"],
        "country": ["US", "United States", "US", "USA", "USA", "us", "USA", "USA", "US", "U.S.A."],
        "revenue_usd": [12000, 1500000, 45000, 0, 78000, 32000, 95000, 95000, -500, 110000], # 1500000 is an outlier, -500 is invalid
        "signup_date": ["2024-01-15", "2024-02-20", "2024-03-10", "2024-04-05", "2024-05-12", "2024-06-18", "2026-12-31", "2026-12-31", "2024-09-02", ""] # 2026-12-31 is future date
    }
    df = pd.DataFrame(data)
    
    file_id = "demo-customer-registry"
    working_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_working.csv")
    original_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_original.csv")
    
    # Save files
    df.to_csv(working_path, index=False)
    df.to_csv(original_path, index=False)
    
    # Check if DB already has it
    existing = db.query(Dataset).filter(Dataset.id == file_id).first()
    if existing:
        # Re-initialize it
        db.query(AuditLog).filter(AuditLog.dataset_id == file_id).delete()
        db.query(LineageStep).filter(LineageStep.dataset_id == file_id).delete()
        db.delete(existing)
        db.commit()
        
    row_count = len(df)
    col_count = len(df.columns)
    
    # Profile & Scorer
    profile = ProfilerService.profile_dataframe(df)
    issues = QualityDetectorService.detect_issues(df, profile)
    score_res = ScorerService.calculate_score(profile, issues)
    
    db_dataset = Dataset(
        id=file_id,
        filename="messy_customer_registry_demo.csv",
        row_count=row_count,
        col_count=col_count,
        original_score=score_res["overall"],
        current_score=score_res["overall"],
        file_path=working_path,
        columns_metadata=json.dumps(profile)
    )
    db.add(db_dataset)
    
    # Audit log
    db.add(AuditLog(
        dataset_id=file_id,
        action="UPLOAD",
        details="Initialized pre-loaded messy Customer Registry demo dataset."
    ))
    
    # Lineage step
    db.add(LineageStep(
        dataset_id=file_id,
        step_index=0,
        name="Ingestion",
        description="Ingested pre-loaded messy Customer Registry demo dataset",
        score_before=score_res["overall"],
        score_after=score_res["overall"]
    ))
    
    db.commit()
    db.refresh(db_dataset)
    
    return {
        "status": "success",
        "id": db_dataset.id,
        "filename": db_dataset.filename,
        "score": score_res,
        "profile": profile,
        "issues": issues
    }
