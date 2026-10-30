from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.department import DepartmentOut

class StatusHistoryOut(BaseModel):
    id: int
    complaint_id: int
    previous_status: Optional[str] = None
    new_status: str
    changed_by: str
    notes: Optional[str] = None
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True

class DuplicateCandidateOut(BaseModel):
    id: int
    complaint_id: int
    matched_complaint_id: int
    similarity_score: float
    distance_km: float
    reason: str
    status: str
    created_at: datetime
    # We can include matched complaint summary
    matched_tracking_id: Optional[str] = None
    matched_title: Optional[str] = None

    class Config:
        from_attributes = True

class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: str = Field(..., min_length=2, max_length=50)
    address: str = Field(..., min_length=3, max_length=300)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ComplaintStatusUpdate(BaseModel):
    new_status: str = Field(..., description="Submitted, Under Review, Assigned, In Progress, Resolved")
    notes: Optional[str] = None
    changed_by: Optional[str] = "Admin Officer"
    is_public: Optional[bool] = True

class ComplaintAssignUpdate(BaseModel):
    department_id: int
    notes: Optional[str] = None
    changed_by: Optional[str] = "Admin Dispatcher"

class ComplaintPriorityUpdate(BaseModel):
    priority: str = Field(..., description="Critical, High, Medium, Low")
    override_reason: str = Field(..., min_length=5)
    changed_by: Optional[str] = "Admin Officer"

class ComplaintOut(BaseModel):
    id: int
    tracking_id: str
    title: str
    description: str
    category: str
    image_url: Optional[str] = None
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    department_id: Optional[int] = None
    department: Optional[DepartmentOut] = None
    
    # AI Engine Results
    priority: str
    priority_score: float
    priority_explanation: Optional[str] = None
    priority_factors: Optional[Dict[str, Any]] = None
    ai_summary: Optional[str] = None
    ai_predicted_category: Optional[str] = None
    ai_analysis_method: Optional[str] = None
    
    is_duplicate: bool
    duplicate_of_id: Optional[int] = None
    priority_overridden: bool
    priority_override_reason: Optional[str] = None

    created_at: datetime
    updated_at: datetime
    history: Optional[List[StatusHistoryOut]] = []
    duplicate_candidates: Optional[List[DuplicateCandidateOut]] = []

    class Config:
        from_attributes = True

class PublicTrackingOut(BaseModel):
    tracking_id: str
    title: str
    category: str
    address: str
    status: str
    department_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    public_summary: Optional[str] = None
    timeline: List[StatusHistoryOut]

    class Config:
        from_attributes = True
