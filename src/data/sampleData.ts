// ─── Flood Ledger — Sample Data ──────────────────────────────────────────────
// ALL data in this file is seeded sample data for demonstration purposes only.
// It does not represent real wards, official forecasts, or operational records.
// Coordinates are approximate centroids of real Mumbai neighbourhoods, used
// for map demonstration — they are NOT official ward boundary data.
// Replace each section with a real API call when the backend is connected.
// Integration points are marked with: // API:

import type {
  Ward,
  SummaryMetrics,
  ChecklistItem,
  ActivityEntry,
  EvacuationCentre,
} from '../types';

// ── Ward data ─────────────────────────────────────────────────────────────────
// Single source of truth. The map, risk list, and summary metrics all use this.
// Coordinates are approximate centroids of the named neighbourhoods in Mumbai.
// API: Replace with GET /api/v1/wards?include=risk,forecast
export const SAMPLE_WARDS: Ward[] = [
  {
    id: 'W-04',
    name: 'Kurla East',
    riskLevel: 'HIGH',
    rainfallMm: 187,
    populationAtRisk: 42300,
    lastUpdated: '2026-10-25T08:15:00+05:30',
    dataSource: 'IMD Forecast Model v2.1 (demo data)',
    lat: 19.0728,
    lng: 72.8826,
    recommendedActions: [
      'Pre-position rescue boats at low-lying street intersections',
      'Issue public advisory via emergency SMS broadcast',
      'Open all registered evacuation centres immediately',
      'Increase pump deployment at storm drain outlets',
      'Deploy mobile medical units to high-density zones',
    ],
  },
  {
    id: 'W-07',
    name: 'Dharavi North',
    riskLevel: 'HIGH',
    rainfallMm: 172,
    populationAtRisk: 38900,
    lastUpdated: '2026-10-25T08:15:00+05:30',
    dataSource: 'IMD Forecast Model v2.1 (demo data)',
    lat: 19.0414,
    lng: 72.8553,
    recommendedActions: [
      'Activate community flood wardens for door-to-door alerts',
      'Clear and inspect all main storm drains urgently',
      'Pre-position 3 emergency pump sets at drainage chokepoints',
      'Issue evacuation advisory for ground-floor residents',
      'Coordinate with NDRF unit on standby readiness',
    ],
  },
  {
    id: 'W-12',
    name: 'Mankhurd',
    riskLevel: 'MEDIUM_HIGH',
    rainfallMm: 134,
    populationAtRisk: 29100,
    lastUpdated: '2026-10-25T08:15:00+05:30',
    dataSource: 'IMD Forecast Model v2.1 (demo data)',
    lat: 19.0437,
    lng: 72.9152,
    recommendedActions: [
      'Increase monitoring frequency at low-lying areas to 2-hourly',
      'Confirm evacuation centre capacity and staffing',
      'Distribute flood safety leaflets to all households',
      'Alert health centres for potential waterborne disease response',
    ],
  },
  {
    id: 'W-03',
    name: 'Bhandup West',
    riskLevel: 'MEDIUM_HIGH',
    rainfallMm: 121,
    populationAtRisk: 22400,
    lastUpdated: '2026-10-25T08:15:00+05:30',
    dataSource: 'IMD Forecast Model v2.1 (demo data)',
    lat: 19.1440,
    lng: 72.9393,
    recommendedActions: [
      'Complete drain clearance inspection within 6 hours',
      'Verify pump station operational status',
      'Ensure relief supplies are stocked at Bhandup community centre',
      'Alert schools and institutions near floodplains',
    ],
  },
  {
    id: 'W-09',
    name: 'Chembur',
    riskLevel: 'MEDIUM',
    rainfallMm: 98,
    populationAtRisk: 17800,
    lastUpdated: '2026-10-25T08:15:00+05:30',
    dataSource: 'IMD Forecast Model v2.1 (demo data)',
    lat: 19.0624,
    lng: 72.9005,
    recommendedActions: [
      'Standard monsoon drain inspection protocol',
      'Maintain readiness of one relief camp',
      'Monitor rainfall accumulation — escalate if >120 mm in 24 hrs',
    ],
  },
  {
    id: 'W-11',
    name: 'Govandi',
    riskLevel: 'MEDIUM',
    rainfallMm: 89,
    populationAtRisk: 15200,
    lastUpdated: '2026-10-25T08:15:00+05:30',
    dataSource: 'IMD Forecast Model v2.1 (demo data)',
    lat: 19.0618,
    lng: 72.9255,
    recommendedActions: [
      'Routine monitoring — no immediate action required',
      'Confirm community flood warden contact list is current',
      'Inspect and log status of all ward pump stations',
    ],
  },
  {
    id: 'W-02',
    name: 'Vikhroli',
    riskLevel: 'LOW',
    rainfallMm: 54,
    populationAtRisk: 8700,
    lastUpdated: '2026-10-25T08:15:00+05:30',
    dataSource: 'IMD Forecast Model v2.1 (demo data)',
    lat: 19.1073,
    lng: 72.9261,
    recommendedActions: [
      'No immediate action required',
      'Maintain standard monsoon preparedness posture',
      'Next scheduled inspection: 26 Oct 2026',
    ],
  },
  {
    id: 'W-06',
    name: 'Mulund East',
    riskLevel: 'LOW',
    rainfallMm: 41,
    populationAtRisk: 6100,
    lastUpdated: '2026-10-25T08:15:00+05:30',
    dataSource: 'IMD Forecast Model v2.1 (demo data)',
    lat: 19.1726,
    lng: 72.9595,
    recommendedActions: [
      'No immediate action required',
      'Maintain standard monsoon preparedness posture',
      'Next scheduled inspection: 27 Oct 2026',
    ],
  },
];

// ── Summary metrics — derived from ward list ──────────────────────────────────
// Computed so they always match the ward table. Do not hard-code independently.
// API: These will come from GET /api/v1/dashboard/metrics in a future milestone.
function deriveMetrics(): SummaryMetrics {
  const highRiskWards = SAMPLE_WARDS.filter(
    (w) => w.riskLevel === 'HIGH'
  ).length;
  return {
    highRiskWards,
    pendingReports: 14,           // API: GET /api/v1/reports?status=pending
    evacuationCapacityPct: 68,    // API: GET /api/v1/evacuation/capacity-summary
    reliefGapPct: 31,             // API: GET /api/v1/relief/gap-summary
  };
}
export const SAMPLE_METRICS: SummaryMetrics = deriveMetrics();

// ── Preparedness checklist ────────────────────────────────────────────────────
// API: GET /api/v1/checklist?phase=pre-flood
export const SAMPLE_CHECKLIST: ChecklistItem[] = [
  {
    id: 'CL-01',
    action: 'Inspect and clear storm drains — Kurla East sector',
    assignedTo: 'Priya Mehta (Ward Officer)',
    dueDate: '2026-10-26',
    completed: true,
    completedAt: '2026-10-24T14:30:00+05:30',
    completedBy: 'Priya Mehta',
  },
  {
    id: 'CL-02',
    action: 'Pre-position emergency pumps at Dharavi low-lying zones',
    assignedTo: 'Rajan Kadam (MCGM Engineer)',
    dueDate: '2026-10-26',
    completed: true,
    completedAt: '2026-10-25T07:00:00+05:30',
    completedBy: 'Rajan Kadam',
  },
  {
    id: 'CL-03',
    action: 'Confirm evacuation centre capacity — Shivaji Nagar School',
    assignedTo: 'Anita Rodrigues (Centre Manager)',
    dueDate: '2026-10-25',
    completed: false,
  },
  {
    id: 'CL-04',
    action: 'Distribute flood safety leaflets — Mankhurd ward',
    assignedTo: 'Community Outreach Team',
    dueDate: '2026-10-26',
    completed: false,
  },
  {
    id: 'CL-05',
    action: 'Test emergency alert broadcast system',
    assignedTo: 'IT Cell (MCGM)',
    dueDate: '2026-10-25',
    completed: false,
  },
  {
    id: 'CL-06',
    action: 'Stock medical supplies at Chembur relief camp',
    assignedTo: 'Health Dept. Officer',
    dueDate: '2026-10-27',
    completed: false,
  },
];

// ── Recent activity log ───────────────────────────────────────────────────────
// API: GET /api/v1/activity?limit=20&sort=desc
export const SAMPLE_ACTIVITY: ActivityEntry[] = [
  {
    id: 'A-001',
    timestamp: '2026-10-25T08:47:00+05:30',
    actor: 'Rajan Kadam',
    action: 'Marked pumps pre-positioned at Dharavi sector 3',
    category: 'preparedness',
    wardId: 'W-07',
  },
  {
    id: 'A-002',
    timestamp: '2026-10-25T08:22:00+05:30',
    actor: 'System',
    action: 'Forecast update received — 3 wards upgraded to HIGH risk',
    category: 'system',
  },
  {
    id: 'A-003',
    timestamp: '2026-10-25T07:55:00+05:30',
    actor: 'Citizen (verified)',
    action: 'Waterlogging reported at Kurla station underpass',
    category: 'report',
    wardId: 'W-04',
  },
  {
    id: 'A-004',
    timestamp: '2026-10-25T07:31:00+05:30',
    actor: 'Priya Mehta',
    action: 'Drain inspection completed — 4 drains cleared in Kurla East',
    category: 'preparedness',
    wardId: 'W-04',
  },
  {
    id: 'A-005',
    timestamp: '2026-10-25T06:10:00+05:30',
    actor: 'Anita Rodrigues',
    action: 'Shivaji Nagar School centre opened — 200 beds ready',
    category: 'evacuation',
    wardId: 'W-07',
  },
  {
    id: 'A-006',
    timestamp: '2026-10-24T21:45:00+05:30',
    actor: 'Relief Coordinator',
    action: 'Food packets allocation logged — 500 units to Mankhurd camp',
    category: 'relief',
    wardId: 'W-12',
  },
];

// ── Evacuation centres ────────────────────────────────────────────────────────
// API: GET /api/v1/evacuation/centres
export const SAMPLE_EVACUATION_CENTRES: EvacuationCentre[] = [
  {
    id: 'EC-01',
    name: 'Shivaji Nagar School',
    wardId: 'W-07',
    capacity: 200,
    occupied: 134,
    status: 'OPEN',
    lastUpdated: '2026-10-25T08:00:00+05:30',
  },
  {
    id: 'EC-02',
    name: 'Kurla Sports Complex',
    wardId: 'W-04',
    capacity: 350,
    occupied: 298,
    status: 'OPEN',
    lastUpdated: '2026-10-25T07:45:00+05:30',
  },
  {
    id: 'EC-03',
    name: 'Mankhurd Community Hall',
    wardId: 'W-12',
    capacity: 150,
    occupied: 150,
    status: 'FULL',
    lastUpdated: '2026-10-25T08:10:00+05:30',
  },
];
