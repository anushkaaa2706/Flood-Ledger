// ─── Overview: Ward Risk List ─────────────────────────────────────────────────
// Compact data table listing all wards with their risk levels, rainfall
// estimates, population at risk, and data timestamps.
// Rows are clickable when onSelectWard is provided.

import type { Ward } from '../../types';
import { RiskChip } from '../shared/RiskChip';
import { SampleDataBadge } from '../shared/SampleDataBadge';

interface Props {
  wards: Ward[];
  selectedWardId?: string | null;
  onSelectWard?: (wardId: string) => void;
}

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

function formatPopulation(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)} k` : String(n);
}

export function WardRiskList({ wards, selectedWardId, onSelectWard }: Props) {
  return (
    <div className="risk-panel" role="region" aria-label="Ward risk list">
      <div className="risk-panel-header">
        <span className="section-title">Ward Risk Summary</span>
        <SampleDataBadge />
      </div>
            <div className="risk-table-scroll">
      <table className="risk-table" aria-label="Ward risk data">
        <thead>
          <tr>
            <th>Ward</th>
            <th>Risk</th>
            <th className="align-right">Rainfall (mm)</th>
            <th className="align-right">Pop. at Risk</th>
            <th className="align-right">Updated</th>
          </tr>
        </thead>
        <tbody>
          {wards.map((ward) => (
            <tr
              key={ward.id}
              className={`${onSelectWard ? 'risk-table-clickable' : ''}${selectedWardId === ward.id ? ' risk-table-selected' : ''}`}
              onClick={() => onSelectWard?.(ward.id)}
              style={onSelectWard ? { cursor: 'pointer' } : undefined}
              role={onSelectWard ? 'button' : undefined}
              tabIndex={onSelectWard ? 0 : undefined}
              onKeyDown={(e) => {
                if (onSelectWard && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectWard(ward.id);
                }
              }}
              aria-current={selectedWardId === ward.id ? 'true' : undefined}
            >
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span className="ward-id">{ward.id}</span>
                  <span className="ward-name">{ward.name}</span>
                </div>
              </td>
              <td>
                <RiskChip level={ward.riskLevel} />
              </td>
              <td className="rainfall-value">{ward.rainfallMm}</td>
              <td
                className="rainfall-value"
                title={`${ward.populationAtRisk.toLocaleString('en-IN')} people`}
              >
                {formatPopulation(ward.populationAtRisk)}
              </td>
              <td className="table-timestamp">{formatTimestamp(ward.lastUpdated)}</td>
            </tr>
          ))}
        </tbody>
      </table>
            </div>

      {/* Source attribution */}
      <div className="source-attr">
        Source: {wards[0]?.dataSource ?? 'Unknown'}
      </div>
    </div>
  );
}
