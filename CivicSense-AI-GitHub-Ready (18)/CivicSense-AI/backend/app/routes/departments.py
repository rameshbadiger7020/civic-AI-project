from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.department import Department
from app.schemas.department import DepartmentOut, DepartmentCreate

router = APIRouter(prefix="/departments", tags=["Departments"])

DEFAULT_DEPARTMENTS = [
    {
        "name": "Road Maintenance",
        "code": "RD-ENG",
        "description": "Pothole repair, asphalt surfacing, pavement stabilization, and road structural maintenance.",
        "contact_email": "roads@civicsense.gov.in",
        "head_officer": "Er. R. Sundaram"
    },
    {
        "name": "Drainage & Stormwater",
        "code": "DRN-OPS",
        "description": "Storm drain desilting, culvert clearing, gutter maintenance, and flood mitigation.",
        "contact_email": "drainage@civicsense.gov.in",
        "head_officer": "Dr. K. Ananth"
    },
    {
        "name": "Solid Waste Management",
        "code": "SWM-SAN",
        "description": "Daily municipal garbage collection, bin maintenance, bulk waste clearing, and street sanitation.",
        "contact_email": "sanitation@civicsense.gov.in",
        "head_officer": "Smt. P. Lakshmi"
    },
    {
        "name": "Electrical & Streetlights",
        "code": "ELEC-LTG",
        "description": "Streetlight pole wiring, sodium/LED bulb replacement, feeder pillar repair, and corridor illumination.",
        "contact_email": "streetlights@civicsense.gov.in",
        "head_officer": "Er. M. Venkatesh"
    },
    {
        "name": "Water Supply & Sewerage",
        "code": "WSS-BWSSB",
        "description": "Potable water distribution, pipeline leak repairs, main valve operations, and sewage line clearing.",
        "contact_email": "watersupply@civicsense.gov.in",
        "head_officer": "Er. S. Narayanan"
    },
    {
        "name": "Public Safety & Emergency",
        "code": "SAF-CIVIC",
        "description": "Hazardous site fencing, structural safety inspections, fallen tree clearing, and emergency response.",
        "contact_email": "safety@civicsense.gov.in",
        "head_officer": "Insp. V. Ramesh"
    }
]

def seed_default_departments(db: Session):
    for dept_data in DEFAULT_DEPARTMENTS:
        existing = db.query(Department).filter(Department.name == dept_data["name"]).first()
        if not existing:
            dept = Department(**dept_data)
            db.add(dept)
    db.commit()

@router.get("", response_model=List[DepartmentOut])
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()
    if not departments:
        seed_default_departments(db)
        departments = db.query(Department).all()
    return departments

@router.post("", response_model=DepartmentOut)
def create_department(dept: DepartmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Department).filter(Department.name == dept.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name already exists")
    db_dept = Department(**dept.model_dump())
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept
