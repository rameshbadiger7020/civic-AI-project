export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  contact_email?: string;
  head_officer?: string;
  created_at: string;
}

export interface StatusHistory {
  id: number;
  complaint_id: number;
  previous_status?: string | null;
  new_status: string;
  changed_by: string;
  notes?: string | null;
  is_public: boolean;
  created_at: string;
}

export interface DuplicateCandidate {
  id: number;
  complaint_id: number;
  matched_complaint_id: number;
  similarity_score: number;
  distance_km: number;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Dismissed';
  created_at: string;
  matched_tracking_id?: string;
  matched_title?: string;
}

export interface PriorityFactors {
  safety_risk: number;
  urgency: number;
  community_impact: number;
  repeated_complaints: number;
  location_sensitivity: number;
  total_score: number;
}

export interface Complaint {
  id: number;
  tracking_id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved';
  department_id?: number | null;
  department?: Department | null;
  
  // AI fields
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  priority_score: number;
  priority_explanation?: string | null;
  priority_factors?: PriorityFactors | null;
  ai_summary?: string | null;
  ai_predicted_category?: string | null;
  ai_analysis_method?: string | null;

  is_duplicate: boolean;
  duplicate_of_id?: number | null;
  priority_overridden: boolean;
  priority_override_reason?: string | null;

  created_at: string;
  updated_at: string;
  history?: StatusHistory[];
  duplicate_candidates?: DuplicateCandidate[];
}

export interface PublicTrackingData {
  tracking_id: string;
  title: string;
  category: string;
  address: string;
  status: string;
  department_name?: string | null;
  created_at: string;
  updated_at: string;
  public_summary?: string | null;
  timeline: StatusHistory[];
}

export interface KPICards {
  total_complaints: number;
  pending_complaints: number;
  critical_complaints: number;
  resolved_complaints: number;
  potential_duplicates: number;
  active_hotspots: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface PriorityCount {
  priority: string;
  count: number;
  color: string;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface DepartmentWorkload {
  department: string;
  total: number;
  in_progress: number;
  resolved: number;
}

export interface HotspotBrief {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  complaint_count: number;
  dominant_category: string;
  highest_priority: string;
  related_categories: string[];
  common_issues: string[];
  action_brief: string;
  complaint_ids: number[];
}

export interface DashboardStats {
  kpis: KPICards;
  category_distribution: CategoryCount[];
  priority_distribution: PriorityCount[];
  status_breakdown: StatusCount[];
  trend_timeline: TrendPoint[];
  department_workload: DepartmentWorkload[];
  hotspots: HotspotBrief[];
}

export interface AIAnalysisResult {
  predicted_category: string;
  confidence: number;
  classification_explanation: string;
  analysis_method: string;
  ai_summary: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  priority_score: number;
  priority_explanation: string;
  priority_factors: PriorityFactors;
  duplicate_candidates: any[];
}
