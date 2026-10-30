from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class DuplicateCandidate(Base):
    __tablename__ = "duplicate_candidates"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False, index=True)
    matched_complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False, index=True)
    similarity_score = Column(Float, nullable=False) # 0.0 - 1.0 (TF-IDF Cosine Similarity)
    distance_km = Column(Float, nullable=False) # Haversine geographic distance in km
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="Pending", nullable=False) # Pending, Confirmed, Dismissed
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", foreign_keys=[complaint_id], back_populates="duplicate_candidates")
    matched_complaint = relationship("Complaint", foreign_keys=[matched_complaint_id])
