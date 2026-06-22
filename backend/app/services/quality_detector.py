import pandas as pd
import numpy as np
from typing import List, Dict, Any

class QualityDetectorService:
    @staticmethod
    def detect_issues(df: pd.DataFrame, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Scans a dataset based on its profile and returns detailed quality anomalies.
        """
        issues = []
        row_count = profile["row_count"]
        
        # 1. Uniqueness check (Table-Level)
        duplicate_rows = profile["duplicate_rows"]
        if duplicate_rows > 0:
            issues.append({
                "column": "ALL_COLUMNS",
                "dimension": "uniqueness",
                "severity": "high" if profile["duplicate_percentage"] > 10 else "medium",
                "description": f"Dataset contains {duplicate_rows} duplicate rows ({profile['duplicate_percentage']}%).",
                "count": duplicate_rows,
                "suggested_fix": "Drop exact duplicate rows.",
                "allow_llm_fix": False
            })
            
        # Column checks
        for col_name, col_prof in profile["columns"].items():
            col_type = col_prof["type"]
            null_count = col_prof["null_count"]
            unique_count = col_prof["unique_count"]
            
            # 2. Completeness check (Nulls)
            if null_count > 0:
                severity = "high" if col_prof["null_percentage"] > 30 else ("medium" if col_prof["null_percentage"] > 5 else "low")
                issues.append({
                    "column": col_name,
                    "dimension": "completeness",
                    "severity": severity,
                    "description": f"Column '{col_name}' has {null_count} missing values ({col_prof['null_percentage']}%).",
                    "count": null_count,
                    "suggested_fix": f"Impute missing values with mean/mode or a custom placeholder.",
                    "allow_llm_fix": True if col_type == "text" else False
                })
                
            # 3. Validity (Outliers for numeric)
            if col_type == "numeric":
                outliers = col_prof.get("outlier_count", 0)
                if outliers > 0:
                    pct = round((outliers / row_count) * 100, 2) if row_count > 0 else 0
                    issues.append({
                        "column": col_name,
                        "dimension": "validity",
                        "severity": "medium" if pct < 5 else "high",
                        "description": f"Column '{col_name}' contains {outliers} statistical outliers ({pct}% of rows).",
                        "count": outliers,
                        "suggested_fix": "Clip outliers to bounds (IQR method) or cap them.",
                        "allow_llm_fix": False
                    })
                    
            # 4. Consistency checks
            if col_type == "text":
                series = df[col_name].dropna().astype(str)
                if not series.empty:
                    # Case inconsistency check (e.g., mix of lowercase, uppercase, titlecase)
                    casing = series.apply(QualityDetectorService._get_casing)
                    unique_casings = casing.nunique()
                    if unique_casings > 1:
                        issues.append({
                            "column": col_name,
                            "dimension": "consistency",
                            "severity": "low",
                            "description": f"Column '{col_name}' has mixed casing styles (e.g. uppercase, lowercase, titlecase).",
                            "count": int(len(series)),
                            "suggested_fix": "Standardize casing style (e.g., lowercase or titlecase).",
                            "allow_llm_fix": False
                        })
                        
                    # Semantic typo check / Inconsistent values
                    # Let's count high-frequency values. If we find close matches, it might be spelling variants.
                    # This is suitable for LLM fix.
                    if unique_count > 1 and unique_count < 100:
                        issues.append({
                            "column": col_name,
                            "dimension": "consistency",
                            "severity": "medium",
                            "description": f"Column '{col_name}' has {unique_count} distinct categories. Some values may contain spelling variations or formatting inconsistencies.",
                            "count": unique_count,
                            "suggested_fix": "Run LLM Semantic Clean to normalize typos, abbreviations, and similar labels.",
                            "allow_llm_fix": True
                        })
                        
            # 5. Timeliness check
            if col_type == "datetime":
                # Check if dates are in the future or extreme past
                dates = pd.to_datetime(df[col_name], errors='coerce').dropna()
                if not dates.empty:
                    now = pd.Timestamp.now()
                    future_dates = int((dates > now).sum())
                    if future_dates > 0:
                        issues.append({
                            "column": col_name,
                            "dimension": "validity",
                            "severity": "high",
                            "description": f"Column '{col_name}' contains {future_dates} records with future timestamps.",
                            "count": future_dates,
                            "suggested_fix": "Cap dates to today or mark as invalid.",
                            "allow_llm_fix": False
                        })
                        
        return issues
        
    @staticmethod
    def _get_casing(val: str) -> str:
        s = val.strip()
        if not s:
            return "empty"
        if s.isupper():
            return "upper"
        if s.islower():
            return "lower"
        if s.istitle():
            return "title"
        return "mixed"
