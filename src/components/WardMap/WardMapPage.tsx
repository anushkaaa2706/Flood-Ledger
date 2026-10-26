// ─── Ward Map Page ────────────────────────────────────────────────────────────
// Full-page interactive ward risk map with:
//  - Risk category filter bar
//  - Leaflet map filling the main area
//  - Side panel showing selected ward details and recommended actions
//  - Map legend
// All data comes from the shared SAMPLE_WARDS array.

import { useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import type { Ward, RiskLevel } from '../../types';
import { SAMPLE_WARDS } from '../../data/sampleData';
import { LeafletMap } from '../shared/LeafletMap';
import { RiskChip } from '../shared/RiskChip';
import { SampleDataBadge } from '../shared/SampleDataBadge';
import {
  RISK_COLOURS,
  RISK_LABELS,
  buildPopupHtml,
} from '../../data/mapUtils';

const ALL_RISK_LEVELS: RiskLevel[] = ['HIGH', 'MEDIUM_HIGH', 'MEDIUM', 'LOW'];

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatPopulation(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)} k` : String(n);
}

export function WardMapPage() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [activeFilters, setActiveFilters] = useState<Set<RiskLevel>>(
    () => new Set(ALL_RISK_LEVELS),
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

  // Keep references to markers so we can show/hide them when filters change
  const markersRef = useRef<Map<string, L.Circle>>(new Map());
  const mapInstanceRef = useRef<L.Map | null>(null);

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredWards = SAMPLE_WARDS.filter((w) =>
    activeFilters.has(w.riskLevel),
  );

  // ── Filter toggle ─────────────────────────────────────────────────────────

  // Sync marker visibility with filters
  function syncMarkerVisibility(filters: Set<RiskLevel>) {
    markersRef.current.forEach((circle, wardId) => {
      const ward = SAMPLE_WARDS.find((w) => w.id === wardId);
      if (!ward) return;
      if (filters.has(ward.riskLevel)) {
        if (!mapInstanceRef.current?.hasLayer(circle)) {
          circle.addTo(mapInstanceRef.current!);
        }
      } else {
        circle.remove();
      }
    });
  }

  // Wrap toggleFilter to also sync map
  function handleFilterToggle(level: RiskLevel) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        if (next.size > 1) next.delete(level);
      } else {
        next.add(level);
      }
      // Sync markers after state is computed
      setTimeout(() => syncMarkerVisibility(next), 0);
      return next;
    });
  }

  // ── Ward selection ────────────────────────────────────────────────────────
  function selectWard(wardId: string) {
    const ward = SAMPLE_WARDS.find((w) => w.id === wardId) ?? null;
    setSelectedWard(ward);

    // Pan to the selected ward
    if (ward && mapInstanceRef.current) {
      mapInstanceRef.current.setView([ward.lat, ward.lng], 14, {
        animate: true,
        duration: 0.5,
      });
      // Open its popup
      const marker = markersRef.current.get(wardId);
      marker?.openPopup();
    }
  }

  function clearSelection() {
    setSelectedWard(null);
    // Reset zoom to default view
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([19.076, 72.877], 12, {
        animate: true,
        duration: 0.5,
      });
    }
  }

  // ── Map ready callback ────────────────────────────────────────────────────
  const handleMapReady = useCallback((map: L.Map) => {
    mapInstanceRef.current = map;
    markersRef.current.clear();

    SAMPLE_WARDS.forEach((ward) => {
      const colours = RISK_COLOURS[ward.riskLevel];

      const circle = L.circle([ward.lat, ward.lng], {
        radius: 900,
        color: colours.border,
        fillColor: colours.fill,
        fillOpacity: 0.35,
        weight: 1.5,
      });

      circle.bindPopup(
        buildPopupHtml(
          ward.id,
          ward.name,
          ward.riskLevel,
          ward.rainfallMm,
          ward.populationAtRisk,
          ward.lastUpdated,
        ),
        { maxWidth: 280, className: 'fl-popup' },
      );

      circle.bindTooltip(`${ward.id} · ${ward.name}`, {
        permanent: false,
        direction: 'top',
        className: 'fl-tooltip',
      });

      circle.on('click', () => {
        selectWard(ward.id);
      });

      circle.addTo(map);
      markersRef.current.set(ward.id, circle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="wmp-layout">
      {/* ── Left: map area ─────────────────────────────────────────────────── */}
      <div className="wmp-main">
        {/* Filter bar */}
        <div className="wmp-filterbar">
          <span className="wmp-filterbar-label">Show risk levels:</span>
          <div className="wmp-filter-chips">
            {ALL_RISK_LEVELS.map((level) => {
              const active = activeFilters.has(level);
              const colours = RISK_COLOURS[level];
              return (
                <button
                  key={level}
                  className={`wmp-filter-chip${active ? ' active' : ''}`}
                  style={{
                    '--chip-color': colours.fill,
                    '--chip-border': colours.border,
                  } as React.CSSProperties}
                  onClick={() => handleFilterToggle(level)}
                  aria-pressed={active}
                >
                  <span className="wmp-filter-dot" />
                  {RISK_LABELS[level]}
                </button>
              );
            })}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SampleDataBadge />
            <span className="wmp-filterbar-meta">
              {filteredWards.length} of {SAMPLE_WARDS.length} wards shown
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="wmp-map-wrap" role="region" aria-label="Interactive ward risk map">
          <LeafletMap
            className="wmp-leaflet"
            onMapReady={handleMapReady}
          />
        </div>

        {/* Legend */}
        <div className="map-legend">
          <span className="map-legend-label">Risk level</span>
          {ALL_RISK_LEVELS.map((level) => (
            <div key={level} className="map-legend-item">
              <div className="map-legend-swatch" style={{ background: RISK_COLOURS[level].fill }} />
              {RISK_LABELS[level]}
            </div>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Circles are approx. centroids — not official ward boundaries
          </span>
        </div>
      </div>

      {/* ── Right: ward list + detail panel ─────────────────────────────────── */}
      <div className="wmp-sidebar">
        {/* Ward list */}
        <div className="wmp-ward-list-panel">
          <div className="wmp-panel-header">
            <span className="section-title">Wards</span>
            <span className="wmp-panel-count">{filteredWards.length}</span>
          </div>
          <ul className="wmp-ward-list">
            {filteredWards.map((ward) => (
              <li key={ward.id}>
                <button
                  className={`wmp-ward-row${selectedWard?.id === ward.id ? ' selected' : ''}`}
                  onClick={() => selectWard(ward.id)}
                  aria-current={selectedWard?.id === ward.id ? 'true' : undefined}
                >
                  <div className="wmp-ward-row-left">
                    <span className="ward-id">{ward.id}</span>
                    <span className="wmp-ward-row-name">{ward.name}</span>
                  </div>
                  <RiskChip level={ward.riskLevel} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Detail panel */}
        <div className="wmp-detail-panel">
          {selectedWard ? (
            <WardDetail ward={selectedWard} onClose={clearSelection} />
          ) : (
            <div className="wmp-detail-empty">
              <span className="wmp-detail-empty-icon">◈</span>
              <span className="wmp-detail-empty-text">
                Select a ward from the list or click a marker on the map to view details
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ward Detail Sub-component ──────────────────────────────────────────────

interface WardDetailProps {
  ward: Ward;
  onClose: () => void;
}

function WardDetail({ ward, onClose }: WardDetailProps) {
  const colours = RISK_COLOURS[ward.riskLevel];

  return (
    <div className="wd">
      {/* Header */}
      <div className="wd-header">
        <div className="wd-header-left">
          <span className="ward-id">{ward.id}</span>
          <span className="wd-name">{ward.name}</span>
        </div>
        <button
          className="wd-close"
          onClick={onClose}
          aria-label="Close ward detail"
        >
          ✕
        </button>
      </div>

      {/* Risk indicator */}
      <div className="wd-risk-bar" style={{ borderLeftColor: colours.fill }}>
        <RiskChip level={ward.riskLevel} />
        <span className="wd-risk-label">
          {ward.riskLevel === 'HIGH' && 'Immediate action required'}
          {ward.riskLevel === 'MEDIUM_HIGH' && 'Heightened vigilance'}
          {ward.riskLevel === 'MEDIUM' && 'Standard monitoring'}
          {ward.riskLevel === 'LOW' && 'Routine posture'}
        </span>
      </div>

      {/* Key metrics */}
      <table className="wd-table">
        <tbody>
          <tr>
            <td className="wd-table-label">Rainfall (24 hr est.)</td>
            <td className="wd-table-value">{ward.rainfallMm} mm</td>
          </tr>
          <tr>
            <td className="wd-table-label">Population at risk</td>
            <td className="wd-table-value">{formatPopulation(ward.populationAtRisk)}</td>
          </tr>
          <tr>
            <td className="wd-table-label">Last updated</td>
            <td className="wd-table-value">{formatTimestamp(ward.lastUpdated)}</td>
          </tr>
          <tr>
            <td className="wd-table-label">Data source</td>
            <td className="wd-table-value wd-table-source">{ward.dataSource}</td>
          </tr>
          <tr>
            <td className="wd-table-label">Coordinates</td>
            <td className="wd-table-value wd-table-mono">
              {ward.lat.toFixed(4)}, {ward.lng.toFixed(4)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Recommended actions */}
      <div className="wd-actions-section">
        <div className="wd-actions-header">
          <span className="section-title">Recommended Actions</span>
          <SampleDataBadge />
        </div>
        <ol className="wd-actions-list">
          {ward.recommendedActions.map((action, i) => (
            <li key={i} className="wd-action-item">
              <span className="wd-action-num">{i + 1}</span>
              <span className="wd-action-text">{action}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Footer disclaimer */}
      <div className="wd-disclaimer">
        ⚠ All information shown is demonstration data and does not represent
        live forecasts or official advisories.
      </div>
    </div>
  );
}
