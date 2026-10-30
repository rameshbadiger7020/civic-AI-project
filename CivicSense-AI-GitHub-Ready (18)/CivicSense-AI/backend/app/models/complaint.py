from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String(32), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # User submitted or confirmed
    
    # Optional image attachment
    image_url = Column(String(500), nullable=True)

    # Location
    address = Column(String(300), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Operational status
    # Submitted -> Under Review -> Assigned -> In Progress -> Resolved
    status = Column(String(30), default="Submitted", nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)

    # AI Intelligence outputs
    priority = Column(String(20), default="Medium", nullable=False, index=True) # Critical, High, Medium, Low
    priority_score = Column(Float, default=50.0, nullable=False) # 0.0 - 100.0
    priority_explanation = Column(Text, nullable=True)
    priority_factors = Column(JSON, nullable=True) # {safety_risk, urgency, community_impact, repeat_count, location_sensitivity}
    
    ai_summary = Column(Text, nullable=True)
    ai_predicted_category = Column(String(50), nullable=True)
    ai_analysis_method = Column(String(50), default="Local NLP Engine") # Local NLP Engine / Configured LLM

    # Duplicate management
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)

    # Administrative override tracking
    priority_overridden = Column(Boolean, default=False)
    priority_override_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="complaints")
    history = relationship("StatusHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="StatusHistory.created_at.desc()")
    duplicate_candidates = relationship(
        "DuplicateCandidate",
        foreign_keys="[DuplicateCandidate.complaint_id]",
        back_populates="complaint",
        cascade="all, delete-orphan"
    )
