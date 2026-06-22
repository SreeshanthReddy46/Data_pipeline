from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    row_count = Column(Integer, default=0)
    col_count = Column(Integer, default=0)
    original_score = Column(Float, default=0.0)
    current_score = Column(Float, default=0.0)
    file_path = Column(String, nullable=False)
    clean_file_path = Column(String, nullable=True)
    columns_metadata = Column(Text, nullable=True)  # JSON-encoded column metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    audit_logs = relationship("AuditLog", back_populates="dataset", cascade="all, delete-orphan")
    lineage_steps = relationship("LineageStep", back_populates="dataset", cascade="all, delete-orphan")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    action = Column(String, nullable=False)
    target_column = Column(String, nullable=True)
    rows_affected = Column(Integer, default=0)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="audit_logs")

class LineageStep(Base):
    __tablename__ = "lineage_steps"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    step_index = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    score_before = Column(Float, default=0.0)
    score_after = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

    dataset = relationship("Dataset", back_populates="lineage_steps")
