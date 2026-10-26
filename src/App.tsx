// ─── App Root ─────────────────────────────────────────────────────────────────
// Manages navigation state and renders the appropriate page.
import { AccountabilityPage } from './components/AccountabilityPage';
import { ReliefLedgerPage } from './components/ReliefLedgerPage';
import { EvacuationPage } from './components/EvacuationPage';
import { CitizenReportsPage } from './components/CitizenReportsPage';
import { PreparednessPage } from './components/PreparednessPage';
import { useState } from 'react';
import type { NavItem } from './types';
import { Sidebar }         from './components/Sidebar';
import { OverviewPage }    from './components/Overview/OverviewPage';
import { WardMapPage }     from './components/WardMap/WardMapPage';
import { PlaceholderPage } from './components/shared/PlaceholderPage';

// Page titles shown in the topbar
const PAGE_TITLES: Record<NavItem, string> = {
  'overview':         'Overview',
  'ward-map':         'Ward Risk Map',
  'preparedness':     'Preparedness',
  'citizen-reports':  'Citizen Reports',
  'evacuation':       'Evacuation Centres',
  'relief-ledger':    'Relief Ledger',
  'accountability':   'Accountability',
};

// Current operational phase label
const PHASE = 'PRE-FLOOD MONITORING';

function formatNow(): string {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' IST';
}

export default function App() {
  const [activePage, setActivePage] = useState<NavItem>('overview');

  function renderPage() {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;

      case 'ward-map':
        return <WardMapPage />;

      case 'preparedness':
  return <PreparednessPage />;
       

            case 'citizen-reports':
        return <CitizenReportsPage />;

            case 'evacuation':
        return <EvacuationPage />;

      case 'relief-ledger':
  return <ReliefLedgerPage />;

      case 'accountability':
  return <AccountabilityPage />;

      default:
        return null;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar active={activePage} onNavigate={setActivePage} />

      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <span className="topbar-title">{PAGE_TITLES[activePage]}</span>
          <span className="topbar-meta">{PHASE} · {formatNow()}</span>
        </header>

        {/* Scrollable page content */}
        <main className="page-scroll" id="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
