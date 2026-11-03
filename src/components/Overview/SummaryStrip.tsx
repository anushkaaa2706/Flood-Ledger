// ─── Overview: Summary Strip ──────────────────────────────────────────────────
// Four compact metric cards at the top of the overview page.

import type { SummaryMetrics } from '../../types';

interface Props {
  metrics: SummaryMetrics;
}

export function SummaryStrip({ metrics }: Props) {
    const evac = metrics.evacuationCapacityPct;
  const gap = metrics.reliefGapPct;
  const pending = metrics.pendingReports;
  return (
    <div className="summary-strip" role="region" aria-label="Key metrics">
      <div
  style={{
    gridColumn: '1 / -1',
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  }}
  role="note"
>
</div>
      {/* High-risk wards */}
      <div className="summary-card">
        <div className="summary-card-label">High-Risk Wards</div>
        <div className="summary-card-value alert">{metrics.highRiskWards}</div>
        <div className="summary-card-desc">of 8 monitored wards</div>
        <div className="summary-card-indicator">
          <div
            className="summary-card-indicator-fill"
            style={{
              width: `${(metrics.highRiskWards / 8) * 100}%`,
              background: 'var(--risk-high-dot)',
            }}
          />
        </div>
      </div>

      {/* Pending reports */}
      <div className="summary-card">
        <div className="summary-card-label">Pending Reports</div>
        <div className="summary-card-value warning">
  {pending ?? '—'}
</div>
        <div className="summary-card-desc">citizen submissions to verify</div>
        <div className="summary-card-indicator">
          <div
            className="summary-card-indicator-fill"
           style={{
  width: `${Math.min(100, ((pending ?? 0) / 20) * 100)}%`,
  background: 'var(--risk-mh-dot)',
}}
          />
        </div>
      </div>

      {/* Evacuation capacity */}
      <div className="summary-card">
        <div className="summary-card-label">Evacuation Capacity</div>
        <div
          className="summary-card-value"
          style={{
  color:
    evac == null
      ? 'var(--text-primary)'
      : evac >= 90
        ? 'var(--risk-high-text)'
        : evac >= 75
          ? 'var(--risk-mh-text)'
          : 'var(--text-primary)',
}}
        >
          {evac == null ? '—' : `${evac}%`}
        </div>
        <div className="summary-card-desc">of registered centre capacity used</div>
        <div className="summary-card-indicator">
          <div
            className="summary-card-indicator-fill"
            style={{
  width: `${evac ?? 0}%`,
  background:
    evac == null
      ? 'transparent'
      : evac >= 90
        ? 'var(--risk-high-dot)'
        : evac >= 75
          ? 'var(--risk-mh-dot)'
          : 'var(--risk-low-dot)',
}}
          />
        </div>
      </div>

      {/* Relief gap */}
      <div className="summary-card">
        <div className="summary-card-label">Relief Gap</div>
        <div
          className="summary-card-value"
          style={{
  color:
    gap == null
      ? 'var(--text-primary)'
      : gap >= 40
        ? 'var(--risk-high-text)'
        : gap >= 20
          ? 'var(--risk-mh-text)'
          : 'var(--text-primary)',
}}
        >
         {gap == null ? '—' : `${gap}%`}
        </div>
        <div className="summary-card-desc">estimated unmet need vs. allocated</div>
        <div className="summary-card-indicator">
          <div
            className="summary-card-indicator-fill"
            style={{
  width: `${gap ?? 0}%`,
  background:
    gap == null
      ? 'transparent'
      : gap >= 40
        ? 'var(--risk-high-dot)'
        : gap >= 20
          ? 'var(--risk-mh-dot)'
          : 'var(--risk-low-dot)',
}}
          />
        </div>
      </div>
    </div>
  );
}
