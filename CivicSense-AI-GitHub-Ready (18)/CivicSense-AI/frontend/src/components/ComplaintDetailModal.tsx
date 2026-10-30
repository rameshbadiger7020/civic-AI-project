import React, { useState } from 'react';
import { 
  Complaint, 
  Department, 
  StatusHistory 
} from '../types';
import { api } from '../services/api';
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  ArrowRight, 
  Building, 
  Sliders, 
  Copy, 
  Check, 
  Sparkles,
  Layers,
  FileText,
  ShieldAlert,
  Send,
  Eye,
  Calendar
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint;
  departments: Department[];
  onClose: () => void;
  onUpdate: (updatedComplaint: Complaint) => void;
}

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

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  departments,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'duplicates' | 'history'>('details');
  const [selectedDeptId, setSelectedDeptId] = useState<number>(complaint.department_id || (departments[0]?.id || 1));
  const [newStatus, setNewStatus] = useState<string>(complaint.status);
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [isPublicNote, setIsPublicNote] = useState<boolean>(true);
  
  const [overridePriorityVal, setOverridePriorityVal] = useState<string>(complaint.priority);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [showOverrideForm, setShowOverrideForm] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(complaint.tracking_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Assign Department
  const handleAssign = async () => {
    try {
      setLoading(true);
      const updated = await api.assignDepartment(complaint.id, {
        department_id: selectedDeptId,
        notes: `Department assigned via Administrative Command Center.`,
      });
      setFeedback({ type: 'success', message: 'Department assigned successfully.' });
      onUpdate(updated);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to assign department.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Update Status
  const handleStatusUpdate = async () => {
    if (newStatus === complaint.status && !statusNotes.trim()) {
      setFeedback({ type: 'error', message: 'Please select a different status or add a note.' });
      return;
    }
    try {
      setLoading(true);
      const updated = await api.updateComplaintStatus(complaint.id, {
        new_status: newStatus,
        notes: statusNotes.trim() || `Status updated to ${newStatus}.`,
        is_public: isPublicNote,
      });
      setStatusNotes('');
      setFeedback({ type: 'success', message: `Status updated to ${newStatus}.` });
      onUpdate(updated);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update status.' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Override Priority
  const handlePriorityOverride = async () => {
    if (!overrideReason.trim() || overrideReason.length < 5) {
      setFeedback({ type: 'error', message: 'Override reason must be at least 5 characters.' });
      return;
    }
    try {
      setLoading(true);
      const updated = await api.overridePriority(complaint.id, {
        priority: overridePriorityVal,
        override_reason: overrideReason.trim(),
      });
      setShowOverrideForm(false);
      setFeedback({ type: 'success', message: `Priority successfully overridden to ${overridePriorityVal}.` });
      onUpdate(updated);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to override priority.' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Confirm / Dismiss Duplicate
  const handleDuplicateAction = async (candidateId: number, action: 'confirm' | 'dismiss') => {
    try {
      setLoading(true);
      if (action === 'confirm') {
        await api.confirmDuplicate(complaint.id, candidateId);
        setFeedback({ type: 'success', message: 'Candidate confirmed as duplicate.' });
      } else {
        await api.dismissDuplicate(complaint.id, candidateId);
        setFeedback({ type: 'success', message: 'Candidate dismissed as duplicate.' });
      }
      // Refresh complaint
      const refreshed = await api.getComplaint(complaint.id);
      onUpdate(refreshed);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Action failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-md font-mono text-xs font-bold text-slate-800 transition-colors"
              title="Click to copy Tracking ID"
            >
              <span>{complaint.tracking_id}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_BADGES[complaint.status]}`}>
              {complaint.status}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${PRIORITY_BADGES[complaint.priority]}`}>
              {complaint.priority} ({complaint.priority_score.toFixed(0)}/100)
            </span>
            {complaint.is_duplicate && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Confirmed Duplicate
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-red-50 text-red-800 border-b border-red-200'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="underline hover:text-black">Dismiss</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex gap-6 text-sm font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'details' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Issue Overview
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'ai' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            AI Intelligence & Scoring
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'duplicates' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-600" />
            Duplicate Candidates
            {complaint.duplicate_candidates && complaint.duplicate_candidates.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded-full">
                {complaint.duplicate_candidates.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Audit History ({complaint.history?.length || 0})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: DETAILS & ADMINISTRATIVE ACTIONS */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Details */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{complaint.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {complaint.address}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* AI Executive Summary Banner */}
                {complaint.ai_summary && (
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        AI Actionable Brief
                      </span>
                      <span className="text-[11px] font-semibold text-blue-700">
                        Method: {complaint.ai_analysis_method || 'Hybrid NLP Engine'}
                      </span>
                    </div>
                    <p className="text-xs text-blue-950 leading-relaxed font-medium">
                      {complaint.ai_summary}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                    Citizen Description
                  </label>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                {/* Photo attachment if available */}
                {complaint.image_url && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Attached Photograph
                    </label>
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-w-sm">
                      <img 
                        src={complaint.image_url} 
                        alt="Citizen attachment" 
                        className="w-full h-48 object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Administrative Workflow Actions */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Operational Dispatch
                </h4>

                {/* Department Assignment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Assigned Municipal Department
                  </label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssign}
                    disabled={loading}
                    className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Assign Department
                  </button>
                </div>

                {/* Status Transition */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Update Operational Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Enter resolution notes / remarks..."
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg h-16 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublicNote"
                      checked={isPublicNote}
                      onChange={(e) => setIsPublicNote(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isPublicNote" className="text-[11px] text-slate-600">
                      Visible on Citizen Tracking Portal
                    </label>
                  </div>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={loading}
                    className="w-full py-1.5 px-3 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Commit Status Update
                  </button>
                </div>

                {/* Priority Override Button */}
                <div className="pt-2 border-t border-slate-200">
                  {!showOverrideForm ? (
                    <button
                      onClick={() => setShowOverrideForm(true)}
                      className="w-full py-1 px-2 border border-slate-300 hover:bg-white text-slate-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      Override AI Priority ({complaint.priority})
                    </button>
                  ) : (
                    <div className="space-y-2 p-2.5 bg-white border border-amber-300 rounded-lg">
                      <div className="text-xs font-bold text-amber-900">Priority Override</div>
                      <select
                        value={overridePriorityVal}
                        onChange={(e) => setOverridePriorityVal(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Justification reason (required)..."
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className="w-full text-xs p-1.5 border border-slate-300 rounded"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handlePriorityOverride}
                          disabled={loading}
                          className="flex-1 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
                        >
                          Confirm Override
                        </button>
                        <button
                          onClick={() => setShowOverrideForm(false)}
                          className="py-1 px-2 border border-slate-300 text-xs rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI INTELLIGENCE & SCORING BREAKDOWN */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      Autonomous Intelligence Pipeline
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border border-blue-300 text-blue-800">
                    Category: {complaint.category} (Predicted: {complaint.ai_predicted_category || complaint.category})
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  CivicSense AI evaluates every complaint against an explainable 5-factor weighted model to eliminate human triage bias and prioritize hazardous municipal conditions.
                </p>
              </div>

              {/* 5-Factor Score Radar / Progress Bars */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Priority Score Breakdown ({complaint.priority_score.toFixed(1)} / 100)
                  </h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${PRIORITY_BADGES[complaint.priority]}`}>
                    {complaint.priority}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Safety Risk */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Safety Risk (Max: 35)</span>
                      <span className="text-red-700 font-bold">{complaint.priority_factors?.safety_risk ?? 15} pts</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-red-600 h-full rounded-full" 
                        style={{ width: `${((complaint.priority_factors?.safety_risk ?? 15) / 35) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Time Urgency (Max: 25)</span>
                      <span className="text-orange-700 font-bold">{complaint.priority_factors?.urgency ?? 12} pts</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full rounded-full" 
                        style={{ width: `${((complaint.priority_factors?.urgency ?? 12) / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Community Impact */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Community Impact (Max: 20)</span>
                      <span className="text-blue-700 font-bold">{complaint.priority_factors?.community_impact ?? 10} pts</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full" 
                        style={{ width: `${((complaint.priority_factors?.community_impact ?? 10) / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Repeated Density */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Repeat Density (Max: 10)</span>
                      <span className="text-teal-700 font-bold">{complaint.priority_factors?.repeated_complaints ?? 4} pts</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-600 h-full rounded-full" 
                        style={{ width: `${((complaint.priority_factors?.repeated_complaints ?? 4) / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Location Sensitivity */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 sm:col-span-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-700">Location Sensitivity Corridor (Max: 10)</span>
                      <span className="text-purple-700 font-bold">{complaint.priority_factors?.location_sensitivity ?? 4} pts</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full rounded-full" 
                        style={{ width: `${((complaint.priority_factors?.location_sensitivity ?? 4) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainable Rationale */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Explainable Decision Rationale
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {complaint.priority_explanation || 'Priority derived through multi-factor weighted civic analysis.'}
                </p>
                {complaint.priority_overridden && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-amber-800 bg-amber-50 p-2 rounded">
                    <strong>Administrative Override Recorded:</strong> {complaint.priority_override_reason}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DUPLICATE CANDIDATES */}
          {activeTab === 'duplicates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Correlated Duplicate Reports</h4>
                  <p className="text-xs text-slate-500">
                    Calculated via TF-IDF Cosine Similarity &amp; Haversine Geographic Distance thresholding.
                  </p>
                </div>
              </div>

              {(!complaint.duplicate_candidates || complaint.duplicate_candidates.length === 0) ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No duplicate candidates detected</p>
                  <p className="text-xs text-slate-500">
                    This report represents an isolated or newly emergent civic complaint in this locality.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {complaint.duplicate_candidates.map((cand) => (
                    <div 
                      key={cand.id} 
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        cand.status === 'Confirmed' 
                          ? 'bg-purple-50/50 border-purple-200' 
                          : cand.status === 'Dismissed'
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-amber-50/40 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            Candidate #{cand.id} &rarr; Target #{cand.matched_complaint_id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cand.status === 'Confirmed' ? 'bg-purple-200 text-purple-900' :
                            cand.status === 'Dismissed' ? 'bg-slate-200 text-slate-700' :
                            'bg-amber-200 text-amber-900'
                          }`}>
                            {cand.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="text-blue-700 font-mono">
                            {(cand.similarity_score * 100).toFixed(0)}% Similarity
                          </span>
                          <span>•</span>
                          <span className="text-slate-600">
                            {cand.distance_km < 1 ? `${Math.round(cand.distance_km * 1000)}m away` : `${cand.distance_km.toFixed(2)} km`}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {cand.reason}
                      </p>

                      {cand.status === 'Pending' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                          <button
                            onClick={() => handleDuplicateAction(cand.id, 'confirm')}
                            disabled={loading}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Confirm Duplicate
                          </button>
                          <button
                            onClick={() => handleDuplicateAction(cand.id, 'dismiss')}
                            disabled={loading}
                            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Dismiss Candidate
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Immutable Lifecycle Audit Trail</h4>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(complaint.history || []).map((h, i) => (
                  <div key={h.id || i} className="relative group">
                    <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <span>{h.new_status}</span>
                          {h.previous_status && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              (from {h.previous_status})
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(h.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {h.notes || 'Status updated.'}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Actor: <strong>{h.changed_by}</strong></span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] ${h.is_public ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                          {h.is_public ? 'Publicly Visible' : 'Internal Audit'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
