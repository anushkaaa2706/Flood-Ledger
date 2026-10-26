
import { useEffect, useMemo, useState } from 'react';

type ActivityType =
  | 'Citizen report'
  | 'Preparedness'
  | 'Evacuation centre'
  | 'Relief distribution';

type AuditEntry = {
  id: string;
  date: string;
  type: ActivityType;
  ward: string;
  description: string;
  status: 'Recorded' | 'Reviewed' | 'Follow-up required';
  reference: string;
};

const STORAGE_KEY = 'flood-ledger-accountability';

const INITIAL_ENTRIES: AuditEntry[] = [
  {
    id: 'AUD-001',
    date: '2026-10-25',
    type: 'Citizen report',
    ward: 'Bhandup West',
    description: 'Waterlogging report recorded for review.',
    status: 'Reviewed',
    reference: 'CR-1001',
  },
  {
    id: 'AUD-002',
    date: '2026-10-25',
    type: 'Preparedness',
    ward: 'Chembur',
    description: 'Local preparedness task recorded.',
    status: 'Recorded',
    reference: 'PREP-001',
  },
  {
    id: 'AUD-003',
    date: '2026-10-25',
    type: 'Evacuation centre',
    ward: 'Mulund East',
    description: 'Centre register entry reviewed.',
    status: 'Follow-up required',
    reference: 'EC-003',
  },
  {
    id: 'AUD-004',
    date: '2026-10-25',
    type: 'Relief distribution',
    ward: 'Chembur',
    description: 'Relief distribution record entered.',
    status: 'Recorded',
    reference: 'DIST-DEMO',
  },
];

function loadEntries(): AuditEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed as AuditEntry[];
    }
  } catch {
    // Use sample entries if browser storage is unavailable.
  }
  return INITIAL_ENTRIES;
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

export function AccountabilityPage() {
  const [entries, setEntries] = useState<AuditEntry[]>(loadEntries);
  const [filterType, setFilterType] = useState('All types');
  const [filterWard, setFilterWard] = useState('All wards');
  const [filterStatus, setFilterStatus] = useState('All statuses');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [newType, setNewType] = useState<ActivityType>('Citizen report');
  const [newWard, setNewWard] = useState('Bhandup West');
  const [newDescription, setNewDescription] = useState('');
  const [newReference, setNewReference] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // The page remains usable if browser storage is unavailable.
    }
  }, [entries]);

  const wards = useMemo(
    () => ['All wards', ...new Set(entries.map((entry) => entry.ward))],
    [entries],
  );

  const filteredEntries = entries.filter((entry) => {
    const matchesType = filterType === 'All types' || entry.type === filterType;
    const matchesWard = filterWard === 'All wards' || entry.ward === filterWard;
    const matchesStatus =
      filterStatus === 'All statuses' || entry.status === filterStatus;
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      entry.description.toLowerCase().includes(term) ||
      entry.reference.toLowerCase().includes(term) ||
      entry.ward.toLowerCase().includes(term);

    return matchesType && matchesWard && matchesStatus && matchesSearch;
  });

  const reviewedCount = entries.filter(
    (entry) => entry.status === 'Reviewed',
  ).length;
  const followUpCount = entries.filter(
    (entry) => entry.status === 'Follow-up required',
  ).length;

  function addEntry() {
    if (!newDescription.trim() || !newReference.trim()) {
      window.alert('Enter an activity description and a reference.');
      return;
    }

    const entry: AuditEntry = {
      id: `AUD-${String(Date.now()).slice(-6)}`,
      date: currentDate(),
      type: newType,
      ward: newWard,
      description: newDescription.trim(),
      status: 'Recorded',
      reference: newReference.trim(),
    };

    setEntries((current) => [entry, ...current]);
    setNewDescription('');
    setNewReference('');
    setShowForm(false);
  }

  function updateStatus(id: string, status: AuditEntry['status']) {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, status } : entry,
      ),
    );
  }

  return (
    <section className="au-page">
      <div className="au-heading">
        <div>
          <p className="au-eyebrow">FLOOD RESPONSE / RECORD REVIEW</p>
          <h1>Accountability &amp; Audit</h1>
          <p className="au-subtitle">
            Review recorded response activities and flag entries that need follow-up.
          </p>
        </div>
        <button
          className="au-button au-primary"
          onClick={() => setShowForm(!showForm)}
        >
          + Add audit entry
        </button>
      </div>

      <div className="au-stats">
        <article className="au-stat">
          <span>TOTAL ENTRIES</span>
          <strong>{entries.length}</strong>
        </article>
        <article className="au-stat">
          <span>REVIEWED</span>
          <strong>{reviewedCount}</strong>
        </article>
        <article className="au-stat">
          <span>FOLLOW-UP REQUIRED</span>
          <strong>{followUpCount}</strong>
        </article>
        <article className="au-stat">
          <span>SHOWN AFTER FILTERS</span>
          <strong>{filteredEntries.length}</strong>
        </article>
      </div>

      {showForm && (
        <div className="au-panel au-form-panel">
          <h2>Add audit entry</h2>
          <div className="au-form-grid">
            <label>
              Activity type
              <select
                value={newType}
                onChange={(event) => setNewType(event.target.value as ActivityType)}
              >
                <option>Citizen report</option>
                <option>Preparedness</option>
                <option>Evacuation centre</option>
                <option>Relief distribution</option>
              </select>
            </label>
            <label>
              Ward / area
              <select value={newWard} onChange={(event) => setNewWard(event.target.value)}>
                <option>Bhandup West</option>
                <option>Chembur</option>
                <option>Mulund East</option>
              </select>
            </label>
            <label>
              Reference ID
              <input
                value={newReference}
                onChange={(event) => setNewReference(event.target.value)}
                placeholder="e.g. CR-1004"
              />
            </label>
            <label className="au-description-field">
              Activity description
              <input
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Describe the recorded activity"
              />
            </label>
          </div>
          <div className="au-form-actions">
            <button className="au-button au-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="au-button au-primary" onClick={addEntry}>
              Save entry
            </button>
          </div>
        </div>
      )}

      <div className="au-panel">
        <div className="au-panel-heading">
          <div>
            <p className="au-eyebrow">AUDIT REGISTER</p>
            <h2>Recorded activities</h2>
          </div>
          <span className="au-muted">{filteredEntries.length} entries</span>
        </div>

        <div className="au-filters">
          <label>
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search description, ward or reference"
            />
          </label>
          <label>
            Activity type
            <select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
              <option>All types</option>
              <option>Citizen report</option>
              <option>Preparedness</option>
              <option>Evacuation centre</option>
              <option>Relief distribution</option>
            </select>
          </label>
          <label>
            Ward
            <select value={filterWard} onChange={(event) => setFilterWard(event.target.value)}>
              {wards.map((ward) => <option key={ward}>{ward}</option>)}
            </select>
          </label>
          <label>
            Review status
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option>All statuses</option>
              <option>Recorded</option>
              <option>Reviewed</option>
              <option>Follow-up required</option>
            </select>
          </label>
        </div>

        <div className="au-table-wrap">
          <table className="au-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Activity</th>
                <th>Ward</th>
                <th>Description</th>
                <th>Review status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.reference}</td>
                  <td>{entry.type}</td>
                  <td>{entry.ward}</td>
                  <td>{entry.description}</td>
                  <td>
                    <select
                      aria-label={`Review status for ${entry.reference}`}
                      className={`au-status au-status-${entry.status.toLowerCase().replace(/ /g, '-')}`}
                      value={entry.status}
                      onChange={(event) =>
                        updateStatus(entry.id, event.target.value as AuditEntry['status'])
                      }
                    >
                      <option>Recorded</option>
                      <option>Reviewed</option>
                      <option>Follow-up required</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6}>No entries match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="au-footer">
        This register stores manually entered review records in this browser. It does not independently
        verify events or automatically collect activity from other pages.
      </p>
    </section>
  );
}
