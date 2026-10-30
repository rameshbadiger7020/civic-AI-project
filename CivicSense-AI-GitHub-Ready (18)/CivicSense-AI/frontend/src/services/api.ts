import {
  Complaint,
  DashboardStats,
  Department,
  PublicTrackingData,
  AIAnalysisResult,
  HotspotBrief
} from '../types';

const API_BASE = '/api/v1';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Add auth token if stored
  const token = localStorage.getItem('civicsense_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Complaints
  getComplaints: async (params?: {
    category?: string;
    priority?: string;
    status?: string;
    department_id?: number;
    search?: string;
  }): Promise<Complaint[]> => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params?.status && params.status !== 'All') query.append('status', params.status);
    if (params?.department_id) query.append('department_id', params.department_id.toString());
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchApi<Complaint[]>(`/complaints${queryString}`);
  },

  getComplaint: async (id: number): Promise<Complaint> => {
    return fetchApi<Complaint>(`/complaints/${id}`);
  },

  trackComplaint: async (trackingId: string): Promise<PublicTrackingData> => {
    return fetchApi<PublicTrackingData>(`/complaints/track/${encodeURIComponent(trackingId.trim().toUpperCase())}`);
  },

  createComplaint: async (formData: FormData): Promise<Complaint> => {
    return fetchApi<Complaint>('/complaints', {
      method: 'POST',
      body: formData,
    });
  },

  updateComplaintStatus: async (
    id: number,
    data: { new_status: string; notes?: string; changed_by?: string; is_public?: boolean }
  ): Promise<Complaint> => {
    return fetchApi<Complaint>(`/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  assignDepartment: async (
    id: number,
    data: { department_id: number; notes?: string; changed_by?: string }
  ): Promise<Complaint> => {
    return fetchApi<Complaint>(`/complaints/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  overridePriority: async (
    id: number,
    data: { priority: string; override_reason: string; changed_by?: string }
  ): Promise<Complaint> => {
    return fetchApi<Complaint>(`/complaints/${id}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  confirmDuplicate: async (id: number, candidateId: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/complaints/${id}/duplicate/${candidateId}/confirm`, {
      method: 'POST',
    });
  },

  dismissDuplicate: async (id: number, candidateId: number): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/complaints/${id}/duplicate/${candidateId}/dismiss`, {
      method: 'POST',
    });
  },

  // Dashboard & Hotspots
  getDashboardStats: async (): Promise<DashboardStats> => {
    return fetchApi<DashboardStats>('/dashboard/stats');
  },

  getHotspots: async (): Promise<HotspotBrief[]> => {
    return fetchApi<HotspotBrief[]>('/dashboard/hotspots');
  },

  // Departments
  getDepartments: async (): Promise<Department[]> => {
    return fetchApi<Department[]>('/departments');
  },

  // AI Dry Run
  analyzeIssueAI: async (data: {
    title: string;
    description: string;
    category?: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<AIAnalysisResult> => {
    return fetchApi<AIAnalysisResult>('/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Auth
  login: async (username: string, password: string): Promise<{ access_token: string; full_name: string; role: string }> => {
    return fetchApi<{ access_token: string; full_name: string; role: string }>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  },
};
