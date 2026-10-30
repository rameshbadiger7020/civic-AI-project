from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.complaint import Complaint
from app.ai import run_ai_pipeline

router = APIRouter(prefix="/ai", tags=["AI Engine"])

class AnalyzeRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = "Other"
    address: Optional[str] = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.post("/analyze")
def analyze_text(request: AnalyzeRequest, db: Session = Depends(get_db)):
    """
    Dry-run analysis endpoint for frontend interactive preview.
    Predicts category, calculates priority, generates factual summary,
    and checks for duplicate candidates against stored records without persisting.
    """
    existing_records = db.query(Complaint).all()
    existing_list = [
        {
            "id": c.id,
            "tracking_id": c.tracking_id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "status": c.status,
            "latitude": c.latitude,
            "longitude": c.longitude
        }
        for c in existing_records
    ]

    result = run_ai_pipeline(
        title=request.title,
        description=request.description,
        category=request.category,
        address=request.address,
        latitude=request.latitude,
        longitude=request.longitude,
        existing_complaints=existing_list
    )
    return result

@router.post("/reprocess/{id}")
def reprocess_complaint(id: int, db: Session = Depends(get_db)):
    """
    Re-runs AI analysis for an existing complaint using latest database context.
    """
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint #{id} not found")

    existing_records = db.query(Complaint).filter(Complaint.id != id).all()
    existing_list = [
        {
            "id": c.id,
            "tracking_id": c.tracking_id,
            "title": c.title,
            "description": c.description,
            "category": c.category,
            "status": c.status,
            "latitude": c.latitude,
            "longitude": c.longitude
        }
        for c in existing_records
    ]

    result = run_ai_pipeline(
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        address=complaint.address,
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        existing_complaints=existing_list
    )

    complaint.ai_summary = result["ai_summary"]
    if not complaint.priority_overridden:
        complaint.priority = result["priority"]
        complaint.priority_score = result["priority_score"]
        complaint.priority_explanation = result["priority_explanation"]
        complaint.priority_factors = result["priority_factors"]

    db.commit()
    db.refresh(complaint)
    return {"message": "Complaint AI analysis successfully refreshed", "complaint": complaint}
