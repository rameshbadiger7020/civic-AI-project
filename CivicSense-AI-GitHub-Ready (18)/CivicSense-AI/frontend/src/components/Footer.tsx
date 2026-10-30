import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, Heart, ExternalLink, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                CivicSense<span className="text-blue-400">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous civic intelligence platform transforming community grievances into prioritized, transparent, and trackable municipal actions.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs text-teal-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>PromptWars x ASTRA Civic Impact</span>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Citizens
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/report" className="hover:text-white transition-colors">
                  Report a Civic Issue
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  Track Resolution Timeline
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Service Level Agendas (SLAs)</span>
              </li>
              <li>
                <span className="text-slate-500">Public Grievance Redressal</span>
              </li>
            </ul>
          </div>

          {/* Administration */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Authorities & Ops
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Command Center Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Geospatial Hotspots
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Duplicate Deduplication Engine
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Department Workload
                </Link>
              </li>
            </ul>
          </div>

          {/* Prototype Disclosure */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Pilot Prototype Status
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This application is an autonomous hackathon demonstration prototype evaluated on synthetic civic data in Karnataka (Bengaluru). It demonstrates operational AI triage without live municipal system coupling.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 CivicSense AI. Built for Smart Cities & Transparent Civic Governance.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Inter-operable REST API v1.0.0</span>
            <span>•</span>
            <span className="text-teal-400 font-medium">Explainable AI Scoring Pipeline</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
