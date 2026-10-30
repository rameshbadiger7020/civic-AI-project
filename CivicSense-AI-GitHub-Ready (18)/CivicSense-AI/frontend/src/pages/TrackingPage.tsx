import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { PublicTrackingData } from '../types';

const SAMPLE_TRACKING_IDS = [
  { id: 'CS-2026-KOR01', label: 'Koramangala Waterlogging' },
  { id: 'CS-2026-SAF01', label: 'Victoria Hospital Safety Hazard' },
  { id: 'CS-2026-IND01', label: 'Indiranagar Garbage' },
  { id: 'CS-2026-WHI01', label: 'Whitefield Pipeline Burst' },
  { id: 'CS-2026-JAY01', label: 'Jayanagar Resolved Pothole' },
];

const LIFECYCLE_STEPS = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const TrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';

  const [inputTrackingId, setInputTrackingId] = useState(queryId);
  const [trackingData, setTrackingData] = useState<PublicTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTracking = async (id: string) => {
    if (!id.trim()) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.trackComplaint(id.trim());
      setTrackingData(data);
      setSearchParams({ id: id.trim() });
    } catch (err: any) {
      setTrackingData(null);
      setErrorMsg(err.message || 'No complaint found matching this tracking ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setInputTrackingId(queryId);
      fetchTracking(queryId);
    }
  }, [queryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(inputTrackingId);
  };

  // Helper to determine step status
  const getStepState = (stepName: string, currentStatus: string) => {
    const stepIdx = LIFECYCLE_STEPS.indexOf(stepName);
    const currIdx = LIFECYCLE_STEPS.indexOf(currentStatus);
    if (stepIdx < currIdx) return 'completed';
    if (stepIdx === currIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Transparent Citizen Redressal Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Complaint Progress
        </h1>
        <p className="text-sm text-slate-600">
          Enter your unique tracking reference number to inspect real-time department assignment, field inspection logs, and remediation timeline.
        </p>
      </div>

      {/* Tracking Input Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Enter Reference (e.g. CS-2026-KOR01)"
              value={inputTrackingId}
              onChange={(e) => setInputTrackingId(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm uppercase font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputTrackingId.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Track Progress</span>
          </button>
        </form>

        {/* Quick Demo ID links */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Sample Cases:
          </span>
          {SAMPLE_TRACKING_IDS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setInputTrackingId(item.id);
                fetchTracking(item.id);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-medium transition-colors"
            >
              {item.id}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-800 font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TRACKING DETAILS VIEW */}
      {trackingData && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-8 p-6 sm:p-8 animate-in fade-in">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-600 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
                  {trackingData.tracking_id}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {trackingData.category}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {trackingData.title}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {trackingData.address}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Current Status
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                trackingData.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                trackingData.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse' :
                'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {trackingData.status}
              </span>
            </div>
          </div>

          {/* 5-STAGE PROGRESS BAR */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Redressal Lifecycle
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {LIFECYCLE_STEPS.map((step) => {
                const state = getStepState(step, trackingData.status);
                return (
                  <div key={step} className="space-y-2 text-center">
                    <div className={`h-2.5 rounded-full transition-all ${
                      state === 'completed' ? 'bg-emerald-500' :
                      state === 'active' ? 'bg-blue-600 animate-pulse' :
                      'bg-slate-200'
                    }`} />
                    <span className={`text-[11px] font-bold block ${
                      state === 'completed' ? 'text-emerald-700' :
                      state === 'active' ? 'text-blue-700' :
                      'text-slate-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Brief & Department Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Operational summary */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Public Administrative Summary
              </span>
              <p className="text-xs text-blue-950 font-medium leading-relaxed">
                {trackingData.public_summary || 'Complaint logged and verified by civic intelligence triage.'}
              </p>
            </div>

            {/* Department Assignment */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                Responsible Division
              </span>
              <p className="text-sm font-bold text-slate-800">
                {trackingData.department_name || 'Pending Municipal Department Assignment'}
              </p>
              <p className="text-[11px] text-slate-500">
                Field engineers are notified automatically via operational dispatch.
              </p>
            </div>
          </div>

          {/* TIMELINE AUDIT HISTORY */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Official Progress Updates</h3>
              <button
                onClick={() => fetchTracking(trackingData.tracking_id)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Status
              </button>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {trackingData.timeline.map((item, index) => (
                <div key={item.id || index} className="relative group">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{item.new_status}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {item.notes}
                    </p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                      Logged by: <strong>{item.changed_by}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Another CTA */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Notice any changes in the field? Submit additional details anytime.
            </span>
            <Link
              to="/report"
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
            >
              Report Another Issue
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
