import React, { useEffect, useRef } from 'react';
import { Complaint, HotspotBrief } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ComplaintMapProps {
  complaints: Complaint[];
  hotspots?: HotspotBrief[];
  onSelectComplaint?: (complaint: Complaint) => void;
  selectedCategory?: string;
  selectedPriority?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const PRIORITY_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  Critical: { bg: '#DC2626', border: '#991B1B', glow: 'rgba(220, 38, 38, 0.4)' },
  High: { bg: '#F97316', border: '#C2410C', glow: 'rgba(249, 115, 22, 0.4)' },
  Medium: { bg: '#F59E0B', border: '#B45309', glow: 'rgba(245, 158, 11, 0.3)' },
  Low: { bg: '#16A34A', border: '#15803D', glow: 'rgba(22, 163, 74, 0.3)' },
};

export const ComplaintMap: React.FC<ComplaintMapProps> = ({
  complaints,
  hotspots = [],
  onSelectComplaint,
  selectedCategory = 'All',
  selectedPriority = 'All',
  center = [12.9716, 77.5946], // Bengaluru center
  zoom = 12,
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // CartoDB Positron / OSM clean tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Hotspot Circles
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !hotspotsLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    hotspotsLayerRef.current.clearLayers();

    // 1. Draw Hotspot Zones (Buffer Circles)
    hotspots.forEach((hs) => {
      const circle = L.circle([hs.latitude, hs.longitude], {
        color: '#DC2626',
        fillColor: '#EF4444',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 6',
        radius: 800, // 800 meters radius
      });

      const popupContent = `
        <div style="font-family: Inter, sans-serif; min-width: 200px; padding: 2px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ACTIVE HOTSPOT
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #1E293B;">
              ${hs.id}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0F172A;">
            ${hs.location_name}
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #475569;">
            <strong>${hs.complaint_count} active complaints</strong> clustered (${hs.dominant_category})
          </p>
          <div style="font-size: 10px; color: #64748B; background: #F8FAFC; border-radius: 4px; padding: 6px; border: 1px solid #E2E8F0;">
            ${hs.action_brief}
          </div>
        </div>
      `;
      circle.bindPopup(popupContent);
      hotspotsLayerRef.current?.addLayer(circle);
    });

    // 2. Filter & Render Complaint Markers
    const filtered = complaints.filter((c) => {
      if (!c.latitude || !c.longitude) return false;
      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
      if (selectedPriority !== 'All' && c.priority !== selectedPriority) return false;
      return true;
    });

    filtered.forEach((c) => {
      const lat = c.latitude!;
      const lon = c.longitude!;
      const prio = c.priority || 'Medium';
      const color = PRIORITY_COLORS[prio] || PRIORITY_COLORS.Medium;

      // Custom DivIcon marker
      const markerHtml = `
        <div style="
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: ${color.bg};
          border: 2.5px solid white;
          box-shadow: 0 3px 8px ${color.glow};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.15s ease;
        ">
          ${prio[0]}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: markerHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([lat, lon], { icon: customIcon });

      const statusBadgeColor =
        c.status === 'Resolved'
          ? 'background: #DCFCE7; color: #15803D;'
          : c.status === 'In Progress'
          ? 'background: #DBEAFE; color: #1E40AF;'
          : 'background: #FEF3C7; color: #B45309;';

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; min-width: 220px; max-width: 260px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #64748B; font-family: monospace;">
              ${c.tracking_id}
            </span>
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; ${statusBadgeColor}">
              ${c.status}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0F172A; line-height: 1.3;">
            ${c.title}
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748B;">
            📍 ${c.address}
          </p>
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
            <span style="background: #F1F5F9; color: #334155; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">
              ${c.category}
            </span>
            <span style="background: ${color.bg}15; color: ${color.bg}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ${c.priority} (${c.priority_score.toFixed(0)}/100)
            </span>
          </div>
          <button id="view-complaint-${c.id}" style="
            width: 100%;
            background: #2563EB;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          ">
            Inspect Issue Action
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-complaint-${c.id}`);
        if (btn && onSelectComplaint) {
          btn.onclick = () => onSelectComplaint(c);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [complaints, hotspots, selectedCategory, selectedPriority, onSelectComplaint]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-lg border border-slate-200 shadow-md text-xs space-y-1.5 pointer-events-auto">
        <div className="font-bold text-[11px] text-slate-800 uppercase tracking-wider mb-1">
          Priority Severity
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span className="text-slate-600 font-medium">Critical (85–100)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span className="text-slate-600 font-medium">High (65–84)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-600 font-medium">Medium (40–64)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-slate-600 font-medium">Low (0–39)</span>
        </div>
        {hotspots.length > 0 && (
          <div className="pt-1 border-t border-slate-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-red-500 bg-red-100 border-dashed"></span>
            <span className="text-red-700 font-semibold">Active Hotspot Zone</span>
          </div>
        )}
      </div>
    </div>
  );
};
