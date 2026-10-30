from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class KPICards(BaseModel):
    total_complaints: int
    pending_complaints: int
    critical_complaints: int
    resolved_complaints: int
    potential_duplicates: int
    active_hotspots: int

class CategoryCount(BaseModel):
    category: str
    count: int

class PriorityCount(BaseModel):
    priority: str
    count: int
    color: str

class StatusCount(BaseModel):
    status: str
    count: int

class TrendPoint(BaseModel):
    date: str
    count: int

class DepartmentWorkload(BaseModel):
    department: str
    total: int
    in_progress: int
    resolved: int

class HotspotBrief(BaseModel):
    id: str
    location_name: str
    latitude: float
    longitude: float
    complaint_count: int
    dominant_category: str
    highest_priority: str
    related_categories: List[str]
    common_issues: List[str]
    action_brief: str
    complaint_ids: List[int]

class DashboardStatsOut(BaseModel):
    kpis: KPICards
    category_distribution: List[CategoryCount]
    priority_distribution: List[PriorityCount]
    status_breakdown: List[StatusCount]
    trend_timeline: List[TrendPoint]
    department_workload: List[DepartmentWorkload]
    hotspots: List[HotspotBrief]
