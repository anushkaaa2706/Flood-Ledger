// ─── Sidebar ──────────────────────────────────────────────────────────────────

import type { NavItem } from '../types';

interface Props {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

interface NavEntry {
  id: NavItem;
  label: string;
  icon: string;  // Unicode symbol — not emoji
  section: 'MONITOR' | 'OPERATIONS' | 'REVIEW';
}

const NAV_ENTRIES: NavEntry[] = [
  { id: 'overview',          label: 'Overview',           icon: '▣', section: 'MONITOR' },
  { id: 'ward-map',          label: 'Ward Risk Map',      icon: '◈', section: 'MONITOR' },
  { id: 'preparedness',      label: 'Preparedness',       icon: '✓', section: 'OPERATIONS' },
  { id: 'citizen-reports',   label: 'Citizen Reports',    icon: '◎', section: 'OPERATIONS' },
  { id: 'evacuation',        label: 'Evacuation Centres', icon: '⌂', section: 'OPERATIONS' },
  { id: 'relief-ledger',     label: 'Relief Ledger',      icon: '≡', section: 'OPERATIONS' },
  { id: 'accountability',    label: 'Accountability',     icon: '◐', section: 'REVIEW' },
];

const SECTIONS = ['MONITOR', 'OPERATIONS', 'REVIEW'] as const;

// Get current datetime in a readable format
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

export function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside className="sidebar" role="navigation" aria-label="Primary navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">Flood Ledger</div>
        <div className="sidebar-brand-sub">Flood Operations Dashboard</div>
      </div>

      {/* Operational status */}
      <div className="sidebar-status">
        <div className="sidebar-status-dot" />
        <span className="sidebar-status-text">Pre-flood monitoring active</span>
      </div>

      {/* Navigation sections */}
      {SECTIONS.map((section) => (
        <div key={section} className="sidebar-nav-section">
          <div className="sidebar-nav-section-label">{section}</div>
          {NAV_ENTRIES
            .filter((e) => e.section === section)
            .map((entry) => (
              <button
                key={entry.id}
                className={`sidebar-nav-item${active === entry.id ? ' active' : ''}`}
                onClick={() => onNavigate(entry.id)}
                aria-current={active === entry.id ? 'page' : undefined}
              >
                <span className="sidebar-nav-icon" aria-hidden="true">{entry.icon}</span>
                {entry.label}
              </button>
            ))}
        </div>
      ))}

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          Milestone 1 — Foundation<br />
          {getNow()} IST
        </div>
      </div>
    </aside>
  );
}
