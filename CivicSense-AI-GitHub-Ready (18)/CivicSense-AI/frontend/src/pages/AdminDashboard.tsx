import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sliders, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  PlusCircle, 
  BarChart2, 
  PieChart as PieIcon,
  Maximize2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { 
  Complaint, 
  DashboardStats, 
  Department, 
  HotspotBrief 
} from '../types';
import { ComplaintMap } from '../components/ComplaintMap';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';

const PRIORITY_BADGES: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_BADGES: Record<string, string> = {
  Submitted: 'bg-slate-100 text-slate-700 border-slate-300',
  'Under Review': 'bg-purple-50 text-purple-700 border-purple-200',
  Assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters State
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected Complaint for Modal Inspection
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Dashboard Sub-View Tab
  const [activeView, setActiveView] = useState<'all' | 'queue' | 'map' | 'hotspots'>('all');

  // Load Data
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [statsData, complaintsData, deptsData] = await Promise.all([
        api.getDashboardStats(),
        api.getComplaints({
          category: filterCategory,
          priority: filterPriority,
          status: filterStatus,
          search: searchQuery,
        }),
        api.getDepartments(),
      ]);
      setStats(statsData);
      setComplaints(complaintsData);
      setDepartments(deptsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCategory, filterPriority, filterStatus, searchQuery]);

  // Handle complaint update from modal
  const handleComplaintUpdated = (updated: Complaint) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedComplaint(updated);
    // Refresh stats in background
    api.getDashboardStats().then(setStats).catch(() => {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Karnataka Smart Municipal Operations
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrative Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated complaint triaging, multi-factor duplicate deduplication, and geospatial hotspot clustering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <div className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-mono font-semibold flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
            <span>Admin Clearance: SuperAdmin</span>
          </div>
        </div>
      </div>

      {/* 6 KEY PERFORMANCE INDICATOR (KPI) CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Ingested */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Ingested
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats?.kpis.total_complaints ?? 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">100% Persisted DB</span>
        </div>

        {/* Pending Triage */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Triage
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {stats?.kpis.pending_complaints ?? 0}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold block">Under Ops Execution</span>
        </div>

        {/* Critical Safety */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Critical Urgency
          </span>
          <div className="text-2xl font-black text-red-600 font-mono">
            {stats?.kpis.critical_complaints ?? 0}
          </div>
          <span className="text-[10px] text-red-600 font-semibold block">Score &ge; 85 / 100</span>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Resolved Issues
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {stats?.kpis.resolved_complaints ?? 0}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">Validated by Engr</span>
        </div>

        {/* Duplicate Candidates */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Duplicate Queue
          </span>
          <div className="text-2xl font-black text-purple-600 font-mono">
            {stats?.kpis.potential_duplicates ?? 0}
          </div>
          <span className="text-[10px] text-purple-700 font-semibold block">TF-IDF Proximity</span>
        </div>

        {/* Active Hotspots */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Hotspots
          </span>
          <div className="text-2xl font-black text-teal-600 font-mono">
            {stats?.kpis.active_hotspots ?? 0}
          </div>
          <span className="text-[10px] text-teal-700 font-semibold block">DBSCAN Clusters</span>
        </div>
      </div>

      {/* VIEW SELECTOR PILLS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveView('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeView === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Comprehensive Command View
        </button>
        <button
          onClick={() => setActiveView('queue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeView === 'queue' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Complaints Work Queue ({complaints.length})
        </button>
        <button
          onClick={() => setActiveView('map')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeView === 'map' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Geographic Intelligence Map
        </button>
        <button
          onClick={() => setActiveView('hotspots')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeView === 'hotspots' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Autonomous Hotspot Briefs ({stats?.hotspots.length ?? 0})
        </button>
      </div>

      {/* RECHARTS DATA VISUALIZATIONS (Overview) */}
      {(activeView === 'all') && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Distribution Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Category Ingestion
              </h3>
              <span className="text-[11px] text-slate-400">Total: {stats.kpis.total_complaints}</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.category_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Distribution Pie Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-red-600" />
                Urgency Breakdown
              </h3>
              <span className="text-[11px] text-slate-400">Explainable Model</span>
            </div>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.priority_distribution}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {stats.priority_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7-Day Trend Timeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                7-Day Ingestion Velocity
              </h3>
              <span className="text-[11px] text-slate-400">Daily Volume</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trend_timeline} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Line type="monotone" dataKey="count" stroke="#14B8A6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* GEOGRAPHIC INTELLIGENCE MAP SECTION */}
      {(activeView === 'all' || activeView === 'map') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Live Bengaluru Geospatial Intelligence Map
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing stored complaint coordinates color-coded by explainable priority with autonomous cluster overlays.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 self-start sm:self-auto">
              Interactive Leaflet / OpenStreetMap
            </span>
          </div>

          <ComplaintMap
            complaints={complaints}
            hotspots={stats?.hotspots || []}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            selectedCategory={filterCategory}
            selectedPriority={filterPriority}
            height="480px"
          />
        </div>
      )}

      {/* HOTSPOT INTELLIGENCE ACTION BRIEFS */}
      {(activeView === 'all' || activeView === 'hotspots') && stats && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Autonomous Infrastructure Hotspot Analysis
              </h3>
              <p className="text-xs text-slate-500">
                Correlated clusters detected using spatial radius proximity and multi-category pattern recognition.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              {stats.hotspots.length} Active Hotspots
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.hotspots.map((hs) => (
              <div 
                key={hs.id} 
                className="bg-slate-50 hover:bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      {hs.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                      {hs.location_name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                    {hs.complaint_count} reports
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-700">Dominant: {hs.dominant_category}</span>
                  <span>•</span>
                  <span className={`font-bold ${
                    hs.highest_priority === 'Critical' ? 'text-red-600' :
                    hs.highest_priority === 'High' ? 'text-orange-600' : 'text-amber-600'
                  }`}>
                    Max: {hs.highest_priority}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-slate-200">
                  {hs.action_brief}
                </p>

                <div className="flex flex-wrap gap-1">
                  {hs.common_issues.map((kw, i) => (
                    <span key={i} className="text-[10px] font-medium bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL COMPLAINTS WORK QUEUE TABLE & FILTER BAR */}
      {(activeView === 'all' || activeView === 'queue') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Operational Complaint Queue ({complaints.length} Records)
              </h3>
              <p className="text-xs text-slate-500">
                Click any complaint to inspect AI factors, assign field departments, adjust status, and audit history.
              </p>
            </div>
          </div>

          {/* Functional Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search ID, title, street..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Streetlight Issues">Streetlight Issues</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Drainage">Drainage</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Other">Other</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical (85–100)</option>
              <option value="High">High (65–84)</option>
              <option value="Medium">Medium (40–64)</option>
              <option value="Low">Low (0–39)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl p-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setFilterCategory('All');
                setFilterPriority('All');
                setFilterStatus('All');
                setSearchQuery('');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Tracking ID</th>
                  <th className="py-3.5 px-4">Issue Title &amp; Location</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority (Score)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Dept</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500 font-medium">
                      No complaints match the specified filter criteria.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedComplaint(c)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {c.tracking_id}
                        {c.is_duplicate && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-purple-100 text-purple-800">
                            Dup
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {c.address}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${PRIORITY_BADGES[c.priority]}`}>
                          {c.priority} ({c.priority_score.toFixed(0)})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold border ${STATUS_BADGES[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium truncate max-w-[140px]">
                        {c.department?.name || 'Pending Assignment'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(c);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg shadow-sm"
                        >
                          Inspect &rarr;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECTOR MODAL */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          departments={departments}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={handleComplaintUpdated}
        />
      )}
    </div>
  );
};
