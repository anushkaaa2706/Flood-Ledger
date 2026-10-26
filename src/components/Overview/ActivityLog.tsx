// ─── Overview: Activity Log ───────────────────────────────────────────────────
// Shows a chronological list of recent actions across all operational categories.

import type { ActivityEntry } from '../../types';
import { SampleDataBadge } from '../shared/SampleDataBadge';

interface Props {
  entries: ActivityEntry[];
}

const CAT_LABELS: Record<ActivityEntry['category'], string> = {
  preparedness: 'Preparedness',
  report:       'Report',
  evacuation:   'Evacuation',
  relief:       'Relief',
  system:       'System',
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function ActivityLog({ entries }: Props) {
  return (
    <div className="activity-panel" role="region" aria-label="Recent activity log">
      <div className="activity-panel-header">
        <span className="section-title">Recent Activity</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SampleDataBadge />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {entries.length} entries
          </span>
        </div>
      </div>

      <ul className="activity-list">
        {entries.map((entry) => (
          <li key={entry.id} className="activity-item">
            <div className={`activity-cat-bar ${entry.category}`} aria-hidden="true" />
            <div className="activity-body">
              <div className="activity-action">{entry.action}</div>
              <div className="activity-meta">
                <span className="activity-actor">{entry.actor}</span>
                <span className="activity-time">{formatTimestamp(entry.timestamp)}</span>
                {entry.wardId && (
                  <span className="activity-ward-tag">{entry.wardId}</span>
                )}
                <span className="activity-cat-label">{CAT_LABELS[entry.category]}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
