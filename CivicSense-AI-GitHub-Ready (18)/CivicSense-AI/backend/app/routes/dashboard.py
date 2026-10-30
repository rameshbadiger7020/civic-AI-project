from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.duplicate_candidate import DuplicateCandidate
from app.schemas.dashboard import (
    DashboardStatsOut,
    KPICards,
    CategoryCount,
    PriorityCount,
    StatusCount,
    TrendPoint,
    DepartmentWorkload,
    HotspotBrief
)
from app.ai.clustering import detect_hotspots

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsOut)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Fetch complaints
    all_complaints = db.query(Complaint).all()
    total_count = len(all_complaints)
    
    # KPIs
    pending_count = sum(1 for c in all_complaints if c.status != "Resolved")
    critical_count = sum(1 for c in all_complaints if c.priority == "Critical" and c.status != "Resolved")
    resolved_count = sum(1 for c in all_complaints if c.status == "Resolved")
    
    potential_duplicates_count = db.query(DuplicateCandidate).filter(DuplicateCandidate.status == "Pending").count()

    # Hotspot calculation
    complaint_dicts = [
        {
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "priority": c.priority,
            "status": c.status,
            "address": c.address,
            "latitude": c.latitude,
            "longitude": c.longitude
        }
        for c in all_complaints
        if c.status != "Resolved"
    ]
    hotspot_list = detect_hotspots(complaint_dicts, radius_km=1.2, min_complaints=3)
    active_hotspots_count = len(hotspot_list)

    kpis = KPICards(
        total_complaints=total_count,
        pending_complaints=pending_count,
        critical_complaints=critical_count,
        resolved_complaints=resolved_count,
        potential_duplicates=potential_duplicates_count,
        active_hotspots=active_hotspots_count
    )

    # 2. Category Distribution
    cat_counts = Counter([c.category for c in all_complaints])
    category_distribution = [
        CategoryCount(category=cat, count=cnt)
        for cat, cnt in cat_counts.most_common()
    ]

    # 3. Priority Distribution
    priority_colors = {
        "Critical": "#DC2626",
        "High": "#F97316",
        "Medium": "#F59E0B",
        "Low": "#16A34A"
    }
    prio_counts = Counter([c.priority for c in all_complaints])
    priority_distribution = [
        PriorityCount(
            priority=prio,
            count=prio_counts.get(prio, 0),
            color=priority_colors.get(prio, "#64748B")
        )
        for prio in ["Critical", "High", "Medium", "Low"]
    ]

    # 4. Status Breakdown
    status_order = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"]
    stat_counts = Counter([c.status for c in all_complaints])
    status_breakdown = [
        StatusCount(status=s, count=stat_counts.get(s, 0))
        for s in status_order
    ]

    # 5. Trend Timeline (Grouped by date over the past 7-14 days)
    # Generate past 7 days points
    date_map = {}
    for i in range(6, -1, -1):
        day_str = (datetime.utcnow() - timedelta(days=i)).strftime("%b %d")
        date_map[day_str] = 0

    for c in all_complaints:
        if c.created_at:
            day_str = c.created_at.strftime("%b %d")
            if day_str in date_map:
                date_map[day_str] += 1
            else:
                date_map[day_str] = 1

    trend_timeline = [TrendPoint(date=d, count=c) for d, c in date_map.items()]

    # 6. Department Workload
    departments = db.query(Department).all()
    dept_workload = []
    for dept in departments:
        dept_complaints = [c for c in all_complaints if c.department_id == dept.id]
        dept_workload.append(DepartmentWorkload(
            department=dept.name,
            total=len(dept_complaints),
            in_progress=sum(1 for c in dept_complaints if c.status in ["Assigned", "In Progress"]),
            resolved=sum(1 for c in dept_complaints if c.status == "Resolved")
        ))

    # Convert hotspots to Pydantic objects
    formatted_hotspots = [
        HotspotBrief(
            id=hs["id"],
            location_name=hs["location_name"],
            latitude=hs["latitude"],
            longitude=hs["longitude"],
            complaint_count=hs["complaint_count"],
            dominant_category=hs["dominant_category"],
            highest_priority=hs["highest_priority"],
            related_categories=hs["related_categories"],
            common_issues=hs["common_issues"],
            action_brief=hs["action_brief"],
            complaint_ids=hs["complaint_ids"]
        )
        for hs in hotspot_list
    ]

    return DashboardStatsOut(
        kpis=kpis,
        category_distribution=category_distribution,
        priority_distribution=priority_distribution,
        status_breakdown=status_breakdown,
        trend_timeline=trend_timeline,
        department_workload=dept_workload,
        hotspots=formatted_hotspots
    )

@router.get("/hotspots")
def get_hotspots_endpoint(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).filter(Complaint.status != "Resolved").all()
    complaint_dicts = [
        {
            "id": c.id,
            "title": c.title,
            "category": c.category,
            "priority": c.priority,
            "status": c.status,
            "address": c.address,
            "latitude": c.latitude,
            "longitude": c.longitude
        }
        for c in complaints
    ]
    return detect_hotspots(complaint_dicts, radius_km=1.2, min_complaints=3)
