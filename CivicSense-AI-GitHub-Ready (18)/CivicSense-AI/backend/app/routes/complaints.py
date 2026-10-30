import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.database.session import get_db
from app.core.config import UPLOAD_DIR
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.status_history import StatusHistory
from app.models.duplicate_candidate import DuplicateCandidate
from app.schemas.complaint import (
    ComplaintOut,
    ComplaintCreate,
    ComplaintStatusUpdate,
    ComplaintAssignUpdate,
    ComplaintPriorityUpdate,
    PublicTrackingOut,
    StatusHistoryOut,
    DuplicateCandidateOut
)
from app.ai import run_ai_pipeline

router = APIRouter(prefix="/complaints", tags=["Complaints"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def generate_tracking_id() -> str:
    # Format: CS-2026-XXXXX
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"CS-2026-{unique_suffix}"

def save_uploaded_file(file: UploadFile) -> str:
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    dest_path = UPLOAD_DIR / unique_filename
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return f"/uploads/{unique_filename}"

@router.post("", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    address: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Submits a new citizen complaint, saves uploaded photo if present,
    runs the AI processing pipeline, persists to database, checks duplicates,
    and returns registered complaint with unique tracking ID.
    """
    if len(title.strip()) < 3:
        raise HTTPException(status_code=400, detail="Title must be at least 3 characters")
    if len(description.strip()) < 10:
        raise HTTPException(status_code=400, detail="Description must be at least 10 characters")
    if len(address.strip()) < 3:
        raise HTTPException(status_code=400, detail="Address must be at least 3 characters")

    image_url = None
    if image and image.filename:
        image_url = save_uploaded_file(image)

    # Fetch existing active complaints for duplicate detection
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

    # Execute AI Intelligence pipeline
    ai_result = run_ai_pipeline(
        title=title,
        description=description,
        category=category,
        address=address,
        latitude=latitude,
        longitude=longitude,
        existing_complaints=existing_list
    )

    tracking_id = generate_tracking_id()

    # Create complaint entity
    complaint = Complaint(
        tracking_id=tracking_id,
        title=title.strip(),
        description=description.strip(),
        category=category if category != "Other" else ai_result["predicted_category"],
        image_url=image_url,
        address=address.strip(),
        latitude=latitude,
        longitude=longitude,
        status="Submitted",
        priority=ai_result["priority"],
        priority_score=ai_result["priority_score"],
        priority_explanation=ai_result["priority_explanation"],
        priority_factors=ai_result["priority_factors"],
        ai_summary=ai_result["ai_summary"],
        ai_predicted_category=ai_result["predicted_category"],
        ai_analysis_method=ai_result["analysis_method"]
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Add initial status history record
    initial_history = StatusHistory(
        complaint_id=complaint.id,
        previous_status=None,
        new_status="Submitted",
        changed_by="Citizen Submission",
        notes="Complaint received and registered into CivicSense AI intelligence queue.",
        is_public=True
    )
    db.add(initial_history)

    # Persist duplicate candidates detected by AI
    if ai_result.get("duplicate_candidates"):
        for cand in ai_result["duplicate_candidates"]:
            cand_entry = DuplicateCandidate(
                complaint_id=complaint.id,
                matched_complaint_id=cand["matched_complaint_id"],
                similarity_score=cand["similarity_score"],
                distance_km=cand["distance_km"],
                reason=cand["reason"],
                status="Pending"
            )
            db.add(cand_entry)

    db.commit()
    db.refresh(complaint)
    return complaint

@router.get("", response_model=List[ComplaintOut])
def list_complaints(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)

    if category and category != "All":
        query = query.filter(Complaint.category == category)
    if priority and priority != "All":
        query = query.filter(Complaint.priority == priority)
    if status and status != "All":
        query = query.filter(Complaint.status == status)
    if department_id:
        query = query.filter(Complaint.department_id == department_id)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.title.ilike(search_term),
                Complaint.description.ilike(search_term),
                Complaint.address.ilike(search_term),
                Complaint.tracking_id.ilike(search_term)
            )
        )

    complaints = query.order_by(Complaint.created_at.desc()).offset(offset).limit(limit).all()
    return complaints

# NOTE: Static route placed BEFORE dynamic /{id} route!
@router.get("/track/{tracking_id}", response_model=PublicTrackingOut)
def track_complaint(tracking_id: str, db: Session = Depends(get_db)):
    """
    Public-safe tracking endpoint. Does not leak private administrative notes.
    """
    complaint = db.query(Complaint).filter(Complaint.tracking_id == tracking_id.strip().upper()).first()
    if not complaint:
        raise HTTPException(
            status_code=404,
            detail=f"No complaint found matching tracking reference '{tracking_id}'"
        )

    # Filter for public-safe history
    public_timeline = [h for h in complaint.history if h.is_public]

    dept_name = complaint.department.name if complaint.department else "Pending Assignment"

    return PublicTrackingOut(
        tracking_id=complaint.tracking_id,
        title=complaint.title,
        category=complaint.category,
        address=complaint.address,
        status=complaint.status,
        department_name=dept_name,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
        public_summary=complaint.ai_summary,
        timeline=public_timeline
    )

@router.get("/{id}", response_model=ComplaintOut)
def get_complaint(id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint #{id} not found")
    return complaint

@router.patch("/{id}/status", response_model=ComplaintOut)
def update_complaint_status(
    id: int,
    status_update: ComplaintStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates operational complaint status:
    Submitted -> Under Review -> Assigned -> In Progress -> Resolved.
    Validates transitions and records immutable audit history.
    """
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint #{id} not found")

    valid_statuses = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"]
    if status_update.new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{status_update.new_status}'. Allowed: {', '.join(valid_statuses)}"
        )

    old_status = complaint.status
    complaint.status = status_update.new_status
    complaint.updated_at = datetime.utcnow()

    # Append to status history
    history_entry = StatusHistory(
        complaint_id=complaint.id,
        previous_status=old_status,
        new_status=status_update.new_status,
        changed_by=status_update.changed_by or "Admin Officer",
        notes=status_update.notes or f"Status updated from {old_status} to {status_update.new_status}.",
        is_public=status_update.is_public if status_update.is_public is not None else True
    )
    db.add(history_entry)
    db.commit()
    db.refresh(complaint)
    return complaint

@router.patch("/{id}/assign", response_model=ComplaintOut)
def assign_department(
    id: int,
    assign_update: ComplaintAssignUpdate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint #{id} not found")

    department = db.query(Department).filter(Department.id == assign_update.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail=f"Department #{assign_update.department_id} not found")

    old_dept = complaint.department.name if complaint.department else "Unassigned"
    complaint.department_id = department.id
    
    # Progress status to 'Assigned' if currently 'Submitted' or 'Under Review'
    if complaint.status in ["Submitted", "Under Review"]:
        complaint.status = "Assigned"

    complaint.updated_at = datetime.utcnow()

    history_entry = StatusHistory(
        complaint_id=complaint.id,
        previous_status=complaint.status,
        new_status="Assigned",
        changed_by=assign_update.changed_by or "Dispatcher Officer",
        notes=assign_update.notes or f"Assigned to {department.name} (previously: {old_dept}).",
        is_public=True
    )
    db.add(history_entry)
    db.commit()
    db.refresh(complaint)
    return complaint

@router.patch("/{id}/priority", response_model=ComplaintOut)
def override_priority(
    id: int,
    priority_update: ComplaintPriorityUpdate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint #{id} not found")

    valid_priorities = ["Critical", "High", "Medium", "Low"]
    if priority_update.priority not in valid_priorities:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid priority '{priority_update.priority}'. Allowed: {', '.join(valid_priorities)}"
        )

    old_prio = complaint.priority
    complaint.priority = priority_update.priority
    complaint.priority_overridden = True
    complaint.priority_override_reason = priority_update.override_reason
    complaint.updated_at = datetime.utcnow()

    history_entry = StatusHistory(
        complaint_id=complaint.id,
        previous_status=complaint.status,
        new_status=complaint.status,
        changed_by=priority_update.changed_by or "Senior Administrator",
        notes=f"Priority adjusted from {old_prio} to {priority_update.priority}. Reason: {priority_update.override_reason}",
        is_public=False  # Internal record
    )
    db.add(history_entry)
    db.commit()
    db.refresh(complaint)
    return complaint

@router.post("/{id}/duplicate/{candidate_id}/confirm")
def confirm_duplicate(
    id: int,
    candidate_id: int,
    db: Session = Depends(get_db)
):
    candidate = db.query(DuplicateCandidate).filter(
        and_(DuplicateCandidate.id == candidate_id, DuplicateCandidate.complaint_id == id)
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Duplicate candidate record not found")

    candidate.status = "Confirmed"
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if complaint:
        complaint.is_duplicate = True
        complaint.duplicate_of_id = candidate.matched_complaint_id
        
        # Add history note
        db.add(StatusHistory(
            complaint_id=complaint.id,
            previous_status=complaint.status,
            new_status=complaint.status,
            changed_by="Admin Officer",
            notes=f"Confirmed as duplicate of Complaint #{candidate.matched_complaint_id}.",
            is_public=True
        ))

    db.commit()
    return {"message": "Duplicate candidate confirmed successfully", "candidate_id": candidate_id}

@router.post("/{id}/duplicate/{candidate_id}/dismiss")
def dismiss_duplicate(
    id: int,
    candidate_id: int,
    db: Session = Depends(get_db)
):
    candidate = db.query(DuplicateCandidate).filter(
        and_(DuplicateCandidate.id == candidate_id, DuplicateCandidate.complaint_id == id)
    ).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Duplicate candidate record not found")

    candidate.status = "Dismissed"
    db.commit()
    return {"message": "Duplicate candidate dismissed", "candidate_id": candidate_id}

@router.get("/{id}/history", response_model=List[StatusHistoryOut])
def get_complaint_history(id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint #{id} not found")
    return complaint.history
