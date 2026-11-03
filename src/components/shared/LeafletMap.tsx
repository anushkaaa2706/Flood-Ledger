
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MAP_CONFIG } from '../../data/mapUtils';

interface Props {
  onMapReady: (map: L.Map) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export function LeafletMap({ onMapReady, className, center, zoom }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: center ?? MAP_CONFIG.defaultCenter,
      zoom: zoom ?? MAP_CONFIG.defaultZoom,
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

    // Recalculate the map whenever its container changes size.
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });

    resizeObserver.observe(container);

    // Recalculate once after the initial layout.
    requestAnimationFrame(() => {
      map.invalidateSize({ pan: false });
    });

    onMapReady(map);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // Map is initialized once; parent handles changing ward data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={className ?? ''}
    />
  );
}
