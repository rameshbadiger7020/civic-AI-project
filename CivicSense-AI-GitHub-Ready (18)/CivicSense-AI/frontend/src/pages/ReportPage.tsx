import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Camera, 
  Upload, 
  X, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowRight,
  Sliders,
  Send,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { AIAnalysisResult, Complaint } from '../types';

const CATEGORIES = [
  'Road Damage',
  'Waterlogging',
  'Waste Management',
  'Streetlight Issues',
  'Water Supply',
  'Drainage',
  'Public Safety',
  'Other',
];

const QUICK_LOCATIONS = [
  { name: 'Koramangala Sony World Junction', lat: 12.9348, lon: 77.6269, address: 'Near Sony World Signal, 80 Feet Road, Koramangala, Bengaluru' },
  { name: 'Indiranagar 100 Feet Road', lat: 12.9698, lon: 77.6412, address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru' },
  { name: 'Victoria Hospital Entrance', lat: 12.9632, lon: 77.5755, address: 'Victoria Hospital Gate 2, Fort Road, Bengaluru' },
  { name: 'Whitefield ITPL Main Road', lat: 12.9862, lon: 77.7295, address: 'ITPL Main Road, Whitefield, Bengaluru' },
  { name: 'HSR Layout 27th Main', lat: 12.9125, lon: 77.6495, address: '27th Main Road, Sector 1, HSR Layout, Bengaluru' },
  { name: 'Malleshwaram 8th Cross', lat: 13.0045, lon: 77.5710, address: '8th Cross, Margosa Road, Malleshwaram, Bengaluru' },
];

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Waterlogging');
  const [address, setAddress] = useState(QUICK_LOCATIONS[0].address);
  const [latitude, setLatitude] = useState<number | null>(QUICK_LOCATIONS[0].lat);
  const [longitude, setLongitude] = useState<number | null>(QUICK_LOCATIONS[0].lon);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // AI Dry Run State
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiPreview, setAiPreview] = useState<AIAnalysisResult | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle image pick
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('File size exceeds 10MB limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // Quick preset location selection
  const selectQuickLocation = (loc: typeof QUICK_LOCATIONS[0]) => {
    setAddress(loc.address);
    setLatitude(loc.lat);
    setLongitude(loc.lon);
  };

  // Real-time AI preview dry run
  const handleRunAIPreview = async () => {
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter both Title and Description to run AI analysis.');
      return;
    }
    try {
      setAnalyzingAI(true);
      setErrorMsg(null);
      const res = await api.analyzeIssueAI({
        title,
        description,
        category,
        address,
        latitude,
        longitude,
      });
      setAiPreview(res);
      // Auto-update category if user left it as Other or wants suggestion
      if (res.predicted_category && res.predicted_category !== 'Other' && category === 'Other') {
        setCategory(res.predicted_category);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'AI preview analysis failed.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  // Submit Complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      setErrorMsg('Title must be at least 3 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setErrorMsg('Description must be at least 10 characters.');
      return;
    }
    if (address.trim().length < 3) {
      setErrorMsg('Please provide a valid location/address.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('address', address.trim());
      if (latitude !== null) formData.append('latitude', latitude.toString());
      if (longitude !== null) formData.append('longitude', longitude.toString());
      if (selectedFile) formData.append('image', selectedFile);

      const created = await api.createComplaint(formData);
      setSubmittedComplaint(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit complaint. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyTrackingId = () => {
    if (submittedComplaint) {
      navigator.clipboard.writeText(submittedComplaint.tracking_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* SUCCESS CONFIRMATION MODAL / SCREEN */}
      {submittedComplaint ? (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Registration Successful
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Your Complaint Has Been Logged
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              CivicSense AI has ingested your report, completed initial categorization and priority scoring, and queued it for administrative dispatch.
            </p>
          </div>

          {/* Tracking ID Hero Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Unique Citizen Tracking ID
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
                {submittedComplaint.tracking_id}
              </span>
              <button
                onClick={copyTrackingId}
                className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                title="Copy Tracking ID"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Save this reference ID to track field inspection status anytime without logging in.
            </p>
          </div>

          {/* AI Intelligence Output Summary */}
          {submittedComplaint.ai_summary && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 max-w-xl mx-auto text-left space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI Operational Synthesis
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px]">
                  Priority: {submittedComplaint.priority} ({submittedComplaint.priority_score.toFixed(0)}/100)
                </span>
              </div>
              <p className="text-xs text-blue-950 leading-relaxed font-medium">
                "{submittedComplaint.ai_summary}"
              </p>
            </div>
          )}

          {/* Next Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to={`/track?id=${submittedComplaint.tracking_id}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Track Resolution Live</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setTitle('');
                setDescription('');
                setAiPreview(null);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        /* REPORT SUBMISSION FORM */
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Smart Citizen Reporting Wizard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Report a Civic Issue in Bengaluru
            </h1>
            <p className="text-sm text-slate-600">
              Submit potholes, flooding, garbage, broken lights or public hazards. Our autonomous engine triages issues in under 1 second.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-800 font-semibold">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Severe waterlogging near Sony World Signal blocking vehicles"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-900"
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      category === cat
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span>{cat}</span>
                    {category === cat && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Min 10 characters</span>
              </div>
              <textarea
                required
                rows={4}
                placeholder="Describe what happened, depth or severity, and how it impacts traffic or pedestrians..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-900"
              />
            </div>

            {/* AI Real-Time Preview Button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleRunAIPreview}
                disabled={analyzingAI || !title.trim() || !description.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
              >
                {analyzingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-teal-600" />}
                <span>Preview AI Intelligence Triage</span>
              </button>
              <span className="text-[11px] text-slate-400 italic">Optional pre-check</span>
            </div>

            {/* AI Preview Result Card */}
            {aiPreview && (
              <div className="p-4 bg-gradient-to-r from-teal-50/80 to-blue-50/80 border border-teal-200 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-teal-900">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>AI Pre-Analysis Assessment</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white text-teal-800 border border-teal-300 text-[11px]">
                    Urgency Score: {aiPreview.priority_score.toFixed(0)}/100 ({aiPreview.priority})
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div><strong>Predicted Category:</strong> {aiPreview.predicted_category} ({(aiPreview.confidence * 100).toFixed(0)}% confidence)</div>
                  <div><strong>Operational Summary:</strong> {aiPreview.ai_summary}</div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-teal-200/50">
                    {aiPreview.priority_explanation}
                  </div>
                </div>
              </div>
            )}

            {/* Location & Quick Presets */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Location / Address <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">Bengaluru Demonstration Pilot</span>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_LOCATIONS.map((loc) => (
                  <button
                    type="button"
                    key={loc.name}
                    onClick={() => selectQuickLocation(loc)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      address === loc.address
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 font-medium'
                    }`}
                  >
                    📍 {loc.name}
                  </button>
                ))}
              </div>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Street name, landmark, or Bengaluru neighborhood"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-900"
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold mb-1 block">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude ?? ''}
                    onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="12.9716"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold mb-1 block">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude ?? ''}
                    onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="77.5946"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Optional Photo Attachment */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Attach Photo (Optional)
              </label>

              {!previewUrl ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <Camera className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Click to upload photo from camera or files</span>
                  <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden max-w-sm">
                  <img src={previewUrl} alt="Preview" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing with AI Engine...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Complaint to CivicSense AI</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Demonstration platform. All complaints persist in backend database and generate real tracking credentials.
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
