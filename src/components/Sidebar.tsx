
import type { NavItem } from '../types';

type UserRole = 'citizen' | 'authority';

interface Props {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
  userRole: UserRole | null;
}

interface NavEntry {
  id: NavItem;
  label: string;
  icon: string;
  section: 'MONITOR' | 'OPERATIONS' | 'REVIEW';
  authorityOnly?: boolean;
}

const NAV_ENTRIES: NavEntry[] = [
  { id: 'overview', label: 'Overview', icon: '▣', section: 'MONITOR', authorityOnly: true },
  { id: 'ward-map', label: 'Ward Risk Map', icon: '◈', section: 'MONITOR' },
  { id: 'preparedness', label: 'Preparedness', icon: '✓', section: 'OPERATIONS' },
  { id: 'citizen-reports', label: 'Citizen Reports', icon: '◎', section: 'OPERATIONS' },
  { id: 'evacuation', label: 'Evacuation Centres', icon: '⌂', section: 'OPERATIONS' },
  { id: 'relief-ledger', label: 'Relief Ledger', icon: '≡', section: 'OPERATIONS', authorityOnly: true },
  { id: 'sos-mesh', label: 'SOS Mesh', icon: '⌁', section: 'OPERATIONS' },
  { id: 'accountability', label: 'Accountability', icon: '◐', section: 'REVIEW', authorityOnly: true },
];

const SECTIONS = ['MONITOR', 'OPERATIONS', 'REVIEW'] as const;

function getNow(): string {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function Sidebar({ active, onNavigate, userRole }: Props) {
  const visibleEntries = NAV_ENTRIES.filter(
    (entry) => !entry.authorityOnly || userRole === 'authority'
  );

  return (
    <aside className="sidebar" role="navigation" aria-label="Primary navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">Flood Ledger</div>
        <div className="sidebar-brand-sub">Flood Operations Dashboard</div>
      </div>

      <div className="sidebar-status">
        <div className="sidebar-status-dot" />
        <span className="sidebar-status-text">Pre-flood monitoring active</span>
      </div>

      {SECTIONS.map((section) => {
        const entries = visibleEntries.filter((entry) => entry.section === section);

        if (entries.length === 0) return null;

        return (
          <div key={section} className="sidebar-nav-section">
            <div className="sidebar-nav-section-label">{section}</div>

            {entries.map((entry) => (
              <button
                key={entry.id}
                className={`sidebar-nav-item${active === entry.id ? ' active' : ''}`}
                onClick={() => onNavigate(entry.id)}
                aria-current={active === entry.id ? 'page' : undefined}
              >
                <span className="sidebar-nav-icon" aria-hidden="true">
                  {entry.icon}
                </span>
                {entry.label}
              </button>
            ))}
          </div>
        );
      })}

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          Milestone 1 — Foundation<br />
          {getNow()} IST
        </div>
      </div>
    </aside>
  );

}
