// ─── Map Utilities ────────────────────────────────────────────────────────────
// Shared constants and helper functions for Leaflet map rendering.
// Kept separate so the map layer can be swapped (e.g. Mapbox, Google Maps)
// without touching component files.

import type { RiskLevel } from '../types';

// ── Risk colour mapping ───────────────────────────────────────────────────────
// Match the CSS design tokens exactly so map markers are consistent with
// the rest of the UI.
export const RISK_COLOURS: Record<RiskLevel, { fill: string; border: string }> = {
  HIGH:        { fill: '#C0392B', border: '#8B1A12' },
  MEDIUM_HIGH: { fill: '#D4761A', border: '#9A5010' },
  MEDIUM:      { fill: '#C8A80A', border: '#8A7000' },
  LOW:         { fill: '#27AE60', border: '#1A7A42' },
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  HIGH:        'High',
  MEDIUM_HIGH: 'Med-High',
  MEDIUM:      'Medium',
  LOW:         'Low',
};

// ── Map configuration ─────────────────────────────────────────────────────────
// Central view for the Mumbai area.
// API: Replace with bounding box derived from real ward GeoJSON when available.
export const MAP_CONFIG = {
  defaultCenter: [19.076, 72.877] as [number, number],
  defaultZoom: 12,
  minZoom: 10,
  maxZoom: 18,
  // OpenStreetMap tile layer — no API key required.
  // For production, consider a hosted tile service or self-hosted tiles.
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · Flood risk indicators are demonstration data only',
};

// ── Marker radius by zoom ─────────────────────────────────────────────────────
export const MARKER_RADIUS = 900; // metres — approximate ward-scale circle

// ── Popup HTML builder ────────────────────────────────────────────────────────
// Returns an HTML string for the Leaflet popup so it stays consistent with
// the app's typography without needing a React portal.
export function buildPopupHtml(
  id: string,
  name: string,
  riskLevel: RiskLevel,
  rainfallMm: number,
  populationAtRisk: number,
  lastUpdated: string,
): string {
  const colours = RISK_COLOURS[riskLevel];
  const label   = RISK_LABELS[riskLevel];
  const updated = new Date(lastUpdated).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const pop = populationAtRisk >= 1000
    ? `${(populationAtRisk / 1000).toFixed(1)} k`
    : String(populationAtRisk);

  return `
    <div class="lf-popup">
      <div class="lf-popup-header">
        <span class="lf-popup-id">${id}</span>
        <span class="lf-popup-name">${name}</span>
        <span class="lf-popup-risk" style="color:${colours.fill}">● ${label} Risk</span>
      </div>
      <table class="lf-popup-table">
        <tr><td>Rainfall (24 hr est.)</td><td><strong>${rainfallMm} mm</strong></td></tr>
        <tr><td>Population at risk</td><td><strong>${pop}</strong></td></tr>
        <tr><td>Updated</td><td>${updated} IST</td></tr>
      </table>
      <div class="lf-popup-note">⚠ Demo data — not a live forecast</div>
    </div>
  `;
}
