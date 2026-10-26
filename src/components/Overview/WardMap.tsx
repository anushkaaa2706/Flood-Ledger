// ─── Overview: Ward Map ───────────────────────────────────────────────────────
// Real Leaflet map showing approximate ward locations with risk-coded markers.
// OpenStreetMap tiles — no API key required.
// Coordinates are approximate neighbourhood centroids, NOT official ward boundaries.
//
// Integration point (Milestone 2+):
//   Replace circle markers with L.geoJSON(wardBoundaryData) loaded from
//   src/data/api/wardBoundaries.ts when official GeoJSON is available.

import { useCallback, useRef } from 'react';
import L from 'leaflet';
import type { Ward } from '../../types';
import { LeafletMap } from '../shared/LeafletMap';
import { SampleDataBadge } from '../shared/SampleDataBadge';
import { RISK_COLOURS, buildPopupHtml, RISK_LABELS } from '../../data/mapUtils';
import type { RiskLevel } from '../../types';

interface Props {
  wards: Ward[];
  selectedWardId?: string | null;
  onSelectWard?: (wardId: string) => void;
}

export function WardMap({ wards, selectedWardId: _selectedWardId, onSelectWard }: Props) {
  // Keep references to the markers so we can update styles on selection change
  const markersRef = useRef<Map<string, L.Circle>>(new Map());

  const handleMapReady = useCallback(
    (map: L.Map) => {
      markersRef.current.clear();

      wards.forEach((ward) => {
        const colours = RISK_COLOURS[ward.riskLevel];

        const circle = L.circle([ward.lat, ward.lng], {
          radius: 900,              // metres — approximate ward-scale circle
          color:       colours.border,
          fillColor:   colours.fill,
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
          { maxWidth: 260, className: 'fl-popup' }
        );

        circle.on('click', () => {
          onSelectWard?.(ward.id);
        });

        // Ward ID tooltip — always visible at zoom ≥ 13
        circle.bindTooltip(`${ward.id} · ${ward.name}`, {
          permanent: false,
          direction: 'top',
          className: 'fl-tooltip',
        });

        circle.addTo(map);
        markersRef.current.set(ward.id, circle);
      });
    },
    // wards and onSelectWard are stable references from parent; map fires once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="map-panel" role="region" aria-label="Ward risk map">
      {/* Header */}
      <div className="map-panel-header">
        <span className="map-panel-title">Ward Risk Map</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SampleDataBadge />
          <span style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}>
            Approx. centroids · Forecast: 25 Oct 2026, 08:15 IST
          </span>
        </div>
      </div>

      {/* Map */}
      <LeafletMap
        className="ward-map-container"
        onMapReady={handleMapReady}
      />

      {/* Legend */}
      <div className="map-legend">
        <span className="map-legend-label">Risk level</span>
        {(Object.entries(RISK_COLOURS) as [RiskLevel, { fill: string }][]).map(
          ([level, { fill }]) => (
            <div key={level} className="map-legend-item">
              <div className="map-legend-swatch" style={{ background: fill }} />
              {RISK_LABELS[level]}
            </div>
          )
        )}
        <span style={{
          marginLeft: 'auto',
          fontSize: '10px',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
        }}>
          Circles are approx. centroids — not ward boundaries
        </span>
      </div>
    </div>
  );
}
