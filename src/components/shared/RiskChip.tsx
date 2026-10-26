// ─── Shared: Risk Chip ────────────────────────────────────────────────────────

import type { RiskLevel } from '../../types';

interface Props {
  level: RiskLevel;
}

const LABELS: Record<RiskLevel, string> = {
  HIGH: 'High',
  MEDIUM_HIGH: 'Med-High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export function RiskChip({ level }: Props) {
  return (
    <span className={`risk-chip ${level}`}>
      <span className="risk-chip-dot" />
      {LABELS[level]}
    </span>
  );
}
