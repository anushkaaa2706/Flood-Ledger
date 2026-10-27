
import { useState } from 'react';
import type { NavItem } from './types';

import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { SOSMeshPage } from './components/SOSMeshPage';
import { AccountabilityPage } from './components/AccountabilityPage';
import { ReliefLedgerPage } from './components/ReliefLedgerPage';
import { EvacuationPage } from './components/EvacuationPage';
import { CitizenReportsPage } from './components/CitizenReportsPage';
import { PreparednessPage } from './components/PreparednessPage';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './components/Overview/OverviewPage';
import { WardMapPage } from './components/WardMap/WardMapPage';

type UserRole = 'citizen' | 'authority';

const PAGE_TITLES: Record<NavItem, string> = {
  overview: 'Overview',
  'ward-map': 'Ward Risk Map',
  preparedness: 'Preparedness',
  'citizen-reports': 'Citizen Reports',
  evacuation: 'Evacuation Centres',
  'relief-ledger': 'Relief Ledger',
  accountability: 'Accountability',
  'sos-mesh': 'SOS Mesh',
};

const AUTHORITY_ONLY_PAGES: NavItem[] = [
  'overview',
  'relief-ledger',
  'accountability',
];

const PHASE = 'PRE-FLOOD MONITORING';

function formatNow(): string {
  return (
    new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' IST'
  );
}

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [activePage, setActivePage] = useState<NavItem>('overview');

  function allowedPage(page: NavItem, role: UserRole | null): boolean {
    return role === 'authority' || !AUTHORITY_ONLY_PAGES.includes(page);
  }

  function handleNavigate(page: NavItem) {
    if (allowedPage(page, userRole)) {
      setActivePage(page);
    }
  }

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
      case 'sos-mesh':
        return <SOSMeshPage />;
      default:
        return null;
    }
  }

  if (showLanding && !showLogin) {
    return (
      <LandingPage
        onLogin={() => setShowLogin(true)}
        onExploreDemo={() => {
          setShowLanding(false);
          setShowLogin(false);
          setUserRole(null);
          setActivePage('ward-map');
        }}
      />
    );
  }

  if (showLogin) {
    return (
      <LoginPage
        onBack={() => setShowLogin(false)}
        onLoginSuccess={(role) => {
          setUserRole(role);
          setActivePage(role === 'authority' ? 'overview' : 'ward-map');
          setShowLogin(false);
          setShowLanding(false);
        }}
      />
    );
  }

  // Keep Citizens away from Authority-only pages.
  if (!allowedPage(activePage, userRole)) {
    setActivePage('ward-map');
    return null;
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={activePage}
        onNavigate={handleNavigate}
        userRole={userRole}
      />

      <div className="main-content">
        <header className="topbar">
          <button
            className="back-to-landing"
            type="button"
            onClick={() => {
              setShowLanding(true);
              setShowLogin(false);
              setUserRole(null);
            }}
          >
            ← Flood Ledger
          </button>

          <span className="topbar-title">
            {PAGE_TITLES[activePage]}
            {userRole &&
              ` · ${userRole === 'authority' ? 'Authority' : 'Citizen'}`}
          </span>

          <span className="topbar-meta">
            {PHASE} · {formatNow()}
          </span>
        </header>

        <main className="page-scroll" id="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}