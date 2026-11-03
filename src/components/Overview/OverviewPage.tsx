
import { useEffect, useState } from 'react';
import { useWardWeather } from '../../hooks/useWardWeather';
import { SummaryStrip } from './SummaryStrip';
import { WardMap } from './WardMap';
import { WardRiskList } from './WardRiskList';
import { PreparednessChecklist } from './PreparednessChecklist';
import { WardForecastPanel } from './WardForecastPanel';







const EVACUATION_STORAGE_KEY = 'flood-ledger-evacuation-centres';

function calculateEvacuationCapacity(): number | null {
  try {
    const saved = localStorage.getItem(EVACUATION_STORAGE_KEY);

    if (saved === null) return null;

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    let totalOccupancy = 0;
    let totalCapacity = 0;

    for (const centre of parsed) {
      if (
        !centre ||
        typeof centre !== 'object' ||
        !('capacity' in centre) ||
        !('occupancy' in centre) ||
        typeof centre.capacity !== 'number' ||
        typeof centre.occupancy !== 'number' ||
        !Number.isFinite(centre.capacity) ||
        !Number.isFinite(centre.occupancy) ||
        centre.capacity <= 0 ||
        centre.occupancy < 0
      ) {
        return null;
      }

      totalCapacity += centre.capacity;
      totalOccupancy += centre.occupancy;
    }

    if (totalCapacity <= 0) return null;

    return Math.round((totalOccupancy / totalCapacity) * 1000) / 10;
  } catch {
    return null;
  }
}
interface OverviewPageProps {
  userRole: 'citizen' | 'authority' | null;
  isDemoMode: boolean;
}

export function OverviewPage({
  userRole,
  isDemoMode,
}: OverviewPageProps) {
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [pendingReports, setPendingReports] = useState<number | null>(() => {
  try {
    const saved = localStorage.getItem('flood-ledger-citizen-reports');

    if (saved === null) return null;

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return null;

    return parsed.filter(
      (report) =>
        report &&
        typeof report === 'object' &&
        'status' in report &&
        report.status === 'Pending verification',
    ).length;
  } catch {
    return null;
  }
});

const [evacuationCapacityPct, setEvacuationCapacityPct] =
  useState<number | null>(calculateEvacuationCapacity);
  const [reliefGapPct, setReliefGapPct] = useState<number | null>(() => {
  try {
    const saved = localStorage.getItem('flood-ledger-relief-gap');
    if (saved === null) return null;

    const value = Number(saved);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
});

useEffect(() => {
  function updateReliefGap() {
    try {
      const saved = localStorage.getItem('flood-ledger-relief-gap');

      if (saved === null) {
        setReliefGapPct(null);
        return;
      }

      const value = Number(saved);
      setReliefGapPct(
        Number.isFinite(value) ? value : null,
      );
    } catch {
      setReliefGapPct(null);
    }
  }

  updateReliefGap();

  window.addEventListener('storage', updateReliefGap);
  window.addEventListener(
    'flood-ledger-relief-gap-updated',
    updateReliefGap,
  );

  return () => {
    window.removeEventListener('storage', updateReliefGap);
    window.removeEventListener(
      'flood-ledger-relief-gap-updated',
      updateReliefGap,
    );
  };
}, []);
useEffect(() => {
  function updatePendingReports() {
    try {
      const saved = localStorage.getItem('flood-ledger-citizen-reports');

      if (saved === null) {
        setPendingReports(null);
        return;
      }

      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        setPendingReports(null);
        return;
      }

      setPendingReports(
        parsed.filter(
          (report) =>
            report &&
            typeof report === 'object' &&
            'status' in report &&
            report.status === 'Pending verification',
        ).length,
      );
    } catch {
      setPendingReports(null);
    }
  }

  window.addEventListener('storage', updatePendingReports);

  return () => {
    window.removeEventListener('storage', updatePendingReports);
  };
}, []);
useEffect(() => {
  function refreshEvacuationCapacity() {
    setEvacuationCapacityPct(calculateEvacuationCapacity());
  }

  window.addEventListener('storage', refreshEvacuationCapacity);

  return () => {
    window.removeEventListener('storage', refreshEvacuationCapacity);
  };
}, []);

const {
  wards,
  loading: weatherLoading,
  error: weatherError,
} = useWardWeather();
  return (
    <>
      <SummaryStrip
  metrics={{
    highRiskWards: wards.filter((ward) => ward.riskLevel === 'HIGH').length,
    pendingReports,
    evacuationCapacityPct,
    reliefGapPct,
  }}
/>
      
<div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  }}
>
  <div
    style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #e5e7eb)',
      borderRadius: '8px',
      padding: '16px',
    }}
  >
    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
      PAST 24 HOURS
    </div>
    <div style={{ fontSize: '26px', fontWeight: 700, margin: '8px 0' }}>
      {wards.length > 0 &&
      wards.every((ward) => ward.weatherSource === 'Open-Meteo')
        ? `${wards.reduce((sum, ward) => sum + ward.rainfallMm, 0).toFixed(1)} mm`
        : '—'}
    </div>
    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
      Sum across monitored locations · model estimates
    </div>
  </div>

  <div
    style={{
      background: 'var(--surface, #fff)',
      border: '1px solid var(--border, #e5e7eb)',
      borderRadius: '8px',
      padding: '16px',
    }}
  >
    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
      NEXT 24 HOURS
    </div>
    <div style={{ fontSize: '26px', fontWeight: 700, margin: '8px 0' }}>
      {wards.length > 0 &&
      wards.every(
        (ward) =>
          ward.weatherSource === 'Open-Meteo' &&
          ward.forecastRainfallMm !== undefined
      )
        ? `${wards.reduce((sum, ward) => sum + (ward.forecastRainfallMm ?? 0), 0).toFixed(1)} mm`
        : '—'}
    </div>
    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
      Sum across monitored locations · forecast estimates
    </div>
  </div>
</div>


      <div
        role="status"
        aria-live="polite"
        style={{
          margin: '0 0 12px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
       {weatherLoading &&
  'Loading estimated weather data from Open-Meteo…'}

{!weatherLoading && !weatherError &&
  'Rainfall and rainfall-severity indicators use Open-Meteo model data. Population figures remain sample data.'}

{weatherError && <div>{weatherError}</div>}
      </div>

      <div className="overview-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WardMap
            wards={wards}
            selectedWardId={selectedWardId}
            onSelectWard={setSelectedWardId}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WardRiskList
            wards={wards}
            selectedWardId={selectedWardId}
            onSelectWard={setSelectedWardId}
          />
        </div>

        <div className="bottom-row">
  <PreparednessChecklist
    canManageTasks={userRole === 'authority' || isDemoMode}
  />

  <WardForecastPanel wards={wards} />
</div>
      </div>
    </>
  );
}
