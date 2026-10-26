// ─── Overview Page ────────────────────────────────────────────────────────────
// Assembles all overview components into the main dashboard layout.
// The map and ward list share a selectedWardId state so clicking either
// highlights the same ward in both.

import { useState } from 'react';
import { SummaryStrip }            from './SummaryStrip';
import { WardMap }                 from './WardMap';
import { WardRiskList }            from './WardRiskList';
import { PreparednessChecklist }   from './PreparednessChecklist';
import { ActivityLog }             from './ActivityLog';
import {
  SAMPLE_METRICS,
  SAMPLE_WARDS,
  SAMPLE_CHECKLIST,
  SAMPLE_ACTIVITY,
} from '../../data/sampleData';

export function OverviewPage() {
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);

  return (
    <>
      {/* Row 1: Four metric cards */}
      <SummaryStrip metrics={SAMPLE_METRICS} />

      {/* Row 2: Map (dominant) + Ward Risk Table */}
      <div className="overview-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WardMap
            wards={SAMPLE_WARDS}
            selectedWardId={selectedWardId}
            onSelectWard={setSelectedWardId}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WardRiskList
            wards={SAMPLE_WARDS}
            selectedWardId={selectedWardId}
            onSelectWard={setSelectedWardId}
          />
        </div>

        {/* Row 3: Checklist + Activity Log (full width) */}
        <div className="bottom-row">
          <PreparednessChecklist items={SAMPLE_CHECKLIST} />
          <ActivityLog entries={SAMPLE_ACTIVITY} />
        </div>
      </div>
    </>
  );
}
