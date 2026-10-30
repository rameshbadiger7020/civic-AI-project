from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False, index=True)
    previous_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    changed_by = Column(String(100), default="System", nullable=False)
    notes = Column(Text, nullable=True)
    is_public = Column(Boolean, default=True) # Citizen visible
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    complaint = relationship("Complaint", back_populates="history")
