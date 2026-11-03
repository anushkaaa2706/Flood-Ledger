
import { useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Ward, RiskLevel } from '../../types';
import { LeafletMap } from '../shared/LeafletMap';
import {
  RISK_COLOURS,
  buildPopupHtml,
  RISK_LABELS,
} from '../../data/mapUtils';

interface Props {
  wards: Ward[];
  selectedWardId?: string | null;
  onSelectWard?: (wardId: string) => void;
}

export function WardMap({
  wards,
  selectedWardId: _selectedWardId,
  onSelectWard,
}: Props) {
  const markersRef = useRef<Map<string, L.Circle>>(new Map());
  const mapRef = useRef<L.Map | null>(null);
  const wardsRef = useRef(wards);

  // Keep the latest ward data available to the map callback.
  useEffect(() => {
    wardsRef.current = wards;
  }, [wards]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    markersRef.current.clear();

    wardsRef.current.forEach((ward) => {
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
        { maxWidth: 260, className: 'fl-popup' },
      );

      circle.on('click', () => {
        onSelectWard?.(ward.id);
      });

      circle.bindTooltip(`${ward.id} · ${ward.name}`, {
        permanent: false,
        direction: 'top',
        className: 'fl-tooltip',
      });

      circle.addTo(map);
      markersRef.current.set(ward.id, circle);
    });
  }, [onSelectWard]);

  // Update existing circles and popups when new weather data arrives.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    wards.forEach((ward) => {
      const circle = markersRef.current.get(ward.id);
      if (!circle) return;

      const colours = RISK_COLOURS[ward.riskLevel];

      circle.setStyle({
        color: colours.border,
        fillColor: colours.fill,
      });

      circle.setPopupContent(
        buildPopupHtml(
          ward.id,
          ward.name,
          ward.riskLevel,
          ward.rainfallMm,
          ward.populationAtRisk,
          ward.lastUpdated,
        ),
      );

      circle.setTooltipContent(`${ward.id} · ${ward.name}`);
    });
  }, [wards]);

  return (
    <div className="map-panel" role="region" aria-label="Ward risk map">
      <div className="map-panel-header">
        <span className="map-panel-title">Ward Risk Map</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Approx. centroids · Rainfall estimates from Open-Meteo
          </span>
        </div>
      </div>

      <LeafletMap
        className="ward-map-container"
        onMapReady={handleMapReady}
      />

      <div className="map-legend">
        <span className="map-legend-label">Risk level</span>
        {(Object.entries(RISK_COLOURS) as [
          RiskLevel,
          { fill: string },
        ][]).map(([level, { fill }]) => (
          <div key={level} className="map-legend-item">
            <div
              className="map-legend-swatch"
              style={{ background: fill }}
            />
            {RISK_LABELS[level]}
          </div>
        ))}

        <span
          style={{
            marginLeft: 'auto',
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
          }}
        >
        </span>
      </div>
    </div>
  );
}
