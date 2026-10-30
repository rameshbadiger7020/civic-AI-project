import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  Cpu, 
  Activity, 
  BarChart3, 
  FileCheck2, 
  Layers, 
  Sliders, 
  Users, 
  ExternalLink,
  Search,
  PlusCircle,
  Navigation
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Pilot Prototype Announcement Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-navy-900 text-white text-xs py-2 px-4 border-b border-blue-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 font-bold uppercase tracking-wider text-[10px]">
              PromptWars x ASTRA Hackathon
            </span>
            <span>CivicSense AI: Enterprise Civic Intelligence &amp; Autonomous Complaint Resolution</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span>Demonstration Pilot: Bengaluru Municipal Corporation</span>
            <Link to="/admin" className="text-teal-400 hover:text-teal-300 font-semibold underline flex items-center gap-1">
              Command Center &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-10 sm:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Next-Generation Civic Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Smarter Cities Begin With{' '}
                <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-blue-700 bg-clip-text text-transparent">
                  Smarter Action.
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Transforming unstructured community complaints into prioritized, transparent, and trackable municipal solutions through explainable AI triaging and autonomous geospatial intelligence.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusCircle className="w-5 h-5" />
                  Report a Civic Issue
                </Link>
                <Link
                  to="/track"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-sm transition-all hover:border-slate-400"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  Track Existing Complaint
                </Link>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
                >
                  <Activity className="w-4 h-4 text-teal-400" />
                  Command Center
                </Link>
              </div>

              {/* Quick Trust Pillars */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>No Login Required for Citizens</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Explainable AI 0–100 Priority</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Sub-Meter Duplicate Detection</span>
                </div>
              </div>
            </div>

            {/* Right Live Command Center Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-slate-900 p-6 text-white shadow-2xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
                      Live Command Telemetry
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2 py-0.5 rounded">
                    BENGALURU CENTRAL
                  </span>
                </div>

                {/* Real Live Database Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 font-semibold block">Total Ingested</span>
                    <span className="text-2xl font-black text-white font-mono">
                      {stats?.kpis.total_complaints ?? 39}
                    </span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">&uarr; 100% Persisted</span>
                  </div>
                  <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 font-semibold block">Active Triage</span>
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {stats?.kpis.pending_complaints ?? 33}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Under Field Execution</span>
                  </div>
                  <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 font-semibold block">Critical Urgency</span>
                    <span className="text-2xl font-black text-red-400 font-mono">
                      {stats?.kpis.critical_complaints ?? 1}
                    </span>
                    <span className="text-[10px] text-red-400 block mt-0.5">High Safety Impact</span>
                  </div>
                  <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 font-semibold block">Spatial Hotspots</span>
                    <span className="text-2xl font-black text-teal-400 font-mono">
                      {stats?.kpis.active_hotspots ?? 5}
                    </span>
                    <span className="text-[10px] text-teal-400 block mt-0.5">Autonomous Clusters</span>
                  </div>
                </div>

                {/* Live Demonstration Snippet */}
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-200">Latest Autonomous Triage:</span>
                    <span className="font-mono text-teal-400">CS-2026-SAF01</span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs italic">
                    "Live electric wire hanging into standing water near Victoria Hospital &rarr; Classified: Public Safety, Priority: Critical (88/100)."
                  </p>
                </div>

                <Link
                  to="/admin"
                  className="block w-full text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Enter Operational Command Center &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-STAGE ARCHITECTURAL PROCESS: CAPTURE -> UNDERSTAND -> REVEAL -> ACT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-full border border-teal-200">
            End-to-End Operational Lifecycle
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How CivicSense AI Resolves Urban Problems
          </h2>
          <p className="text-slate-600 text-sm">
            A continuous loop bridging citizens, machine intelligence, geospatial clustering, and field engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Stage 1: CAPTURE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border border-blue-200">
              01
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Stage One</span>
              <h3 className="text-lg font-bold text-slate-900">CAPTURE</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fast, frictionless mobile citizen reporting with geocoded coordinates, camera photo uploads, and zero required app install or login.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
              Generates unique tracking ID instantly.
            </div>
          </div>

          {/* Stage 2: UNDERSTAND */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-lg border border-teal-200">
              02
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">Stage Two</span>
              <h3 className="text-lg font-bold text-slate-900">UNDERSTAND</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hybrid AI engine performs category prediction, synthesizes factual administrative briefs, detects duplicate reports, and scores urgency (0–100).
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
              Explainable 5-factor scoring weights.
            </div>
          </div>

          {/* Stage 3: REVEAL */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg border border-amber-200">
              03
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Stage Three</span>
              <h3 className="text-lg font-bold text-slate-900">REVEAL</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Geospatial OpenStreetMap intelligence clusters recurrent issues into actionable hotspots, exposing hidden infrastructure systemic failures.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
              Multi-category spatial clustering.
            </div>
          </div>

          {/* Stage 4: ACT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-lg border border-purple-200">
              04
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Stage Four</span>
              <h3 className="text-lg font-bold text-slate-900">ACT</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Administrative workflow routes work orders to municipal departments, records audit trails, and updates transparent citizen progress timelines.
            </p>
            <div className="text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
              Public safe status synchronization.
            </div>
          </div>
        </div>
      </section>

      {/* CORE PLATFORM CAPABILITY CARDS */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Civic Intelligence Engine
            </h2>
            <p className="text-slate-600 text-sm">
              Engineered with production algorithms for resilience, privacy, and full explainability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Multi-Factor Duplicate Detection
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Combines lexical TF-IDF cosine similarity with sub-kilometer Haversine geographic distance thresholding. Alerts administrators to redundant reports without deleting original citizen submissions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Explainable 5-Factor Priority (0–100)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent rubric factoring Safety Risk (35), Urgency (25), Community Impact (20), Repeat Density (10), and Sensitive Corridor Proximity (10). Allows administrators to record reasoned overrides.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Autonomous Hotspot Clustering
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spatial radius clustering identifies localized infrastructure failures across correlated categories (e.g. 3 waterlogging + 2 drainage + 1 road damage) and synthesizes field investigation briefs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-teal-600 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              Ready to Evaluate
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Test the Complete Civic Operations Lifecycle
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Submit a test complaint, watch AI categorize and score it in real time, view it on the geospatial command center, and track it through to resolution.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/report"
              className="px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-md transition-transform hover:scale-105 text-center"
            >
              Submit Test Report
            </Link>
            <Link
              to="/admin"
              className="px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-transform hover:scale-105 text-center"
            >
              Open Command Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
