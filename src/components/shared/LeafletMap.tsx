// ─── Shared: LeafletMap ───────────────────────────────────────────────────────
// Reusable Leaflet map container component.
// Renders a Leaflet map inside the given container div, then hands the map
// instance to the parent via onMapReady so the parent can add layers.
// This component owns nothing except the DOM mount/unmount lifecycle.

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MAP_CONFIG } from '../../data/mapUtils';

interface Props {
  /** Called once when the Leaflet map is initialised. Parent adds markers/layers here. */
  onMapReady: (map: L.Map) => void;
  /** Optional CSS class to apply to the container div. */
  className?: string;
  /** Initial centre; defaults to MAP_CONFIG.defaultCenter */
  center?: [number, number];
  /** Initial zoom; defaults to MAP_CONFIG.defaultZoom */
  zoom?: number;
}

export function LeafletMap({ onMapReady, className, center, zoom }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: center ?? MAP_CONFIG.defaultCenter,
      zoom:   zoom   ?? MAP_CONFIG.defaultZoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(MAP_CONFIG.tileUrl, {
      attribution: MAP_CONFIG.tileAttribution,
      maxZoom: MAP_CONFIG.maxZoom,
    }).addTo(map);

    mapRef.current = map;
    onMapReady(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // onMapReady is intentionally excluded from deps — it must only fire once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={className ?? ''}
      // aria-label set by the parent panel
    />
  );
}
