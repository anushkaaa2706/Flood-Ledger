// ─── Flood Ledger — Data Models ──────────────────────────────────────────────
// These types define the shape of all data used in the application.
// When real APIs are connected, the same types will be used with live data.

export type RiskLevel = 'HIGH' | 'MEDIUM_HIGH' | 'MEDIUM' | 'LOW';

export type NavItem =
  | 'overview'
  | 'ward-map'
  | 'preparedness'
  | 'citizen-reports'
  | 'evacuation'
  | 'relief-ledger'
  | 'accountability';

// ── Ward ──────────────────────────────────────────────────────────────────────
// Single source of truth for ward data used by the map, risk list, and metrics.
export interface Ward {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  rainfallMm: number;         // estimated 24-hr rainfall in mm
  populationAtRisk: number;
  lastUpdated: string;        // ISO 8601 timestamp
  dataSource: string;

  // Geographic location — approximate centroid for map markers.
  // Replace with real ward boundary GeoJSON when available.
  // Integration point: src/data/api/wardBoundaries.ts
  lat: number;
  lng: number;

  // Recommended preparedness/response actions for this ward's risk level.
  // Will be driven by a rules engine in future milestones.
  recommendedActions: string[];
}

// ── Derived metrics ───────────────────────────────────────────────────────────
// SummaryMetrics are computed from SAMPLE_WARDS in sampleData.ts so that
// the card numbers always match the ward list. Never hard-code separately.
export interface SummaryMetrics {
  highRiskWards: number;
  pendingReports: number;
  evacuationCapacityPct: number;  // 0–100
  reliefGapPct: number;           // 0–100, higher = bigger gap
}

export interface ChecklistItem {
  id: string;
  action: string;
  assignedTo: string;
  dueDate: string;            // ISO 8601 date
  completed: boolean;
  completedAt?: string;       // ISO 8601 timestamp
  completedBy?: string;
}

export interface ActivityEntry {
  id: string;
  timestamp: string;          // ISO 8601 timestamp
  actor: string;
  action: string;
  category: 'preparedness' | 'report' | 'evacuation' | 'relief' | 'system';
  wardId?: string;
}

export interface EvacuationCentre {
  id: string;
  name: string;
  wardId: string;
  capacity: number;
  occupied: number;
  status: 'OPEN' | 'FULL' | 'CLOSED';
  lastUpdated: string;
}

// ── Map API integration point ─────────────────────────────────────────────────
// When real GeoJSON boundaries are available, replace WardLocation with a
// GeoJSON FeatureCollection keyed by ward ID and load it from this interface.
export interface WardGeoFeature {
  wardId: string;
  // geojson: GeoJSON.Feature;  // uncomment when boundary data is available
}
