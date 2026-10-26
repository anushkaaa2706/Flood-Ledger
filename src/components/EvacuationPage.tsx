
import { useEffect, useState } from 'react';

type CentreStatus = 'Open' | 'Full' | 'Closed';

interface EvacuationCentre {
  id: string;
  name: string;
  ward: string;
  address: string;
  capacity: number;
  occupancy: number;
  evacuated: number;
  status: CentreStatus;
}

const STORAGE_KEY = 'flood-ledger-evacuation-centres';

const INITIAL_CENTRES: EvacuationCentre[] = [
  {
    id: 'EC-001',
    name: 'MVR Shinde Marg Municipal School',
    ward: 'Bhandup West',
    address: 'Eshwar Nagar, Bhandup West, Mumbai',
    capacity: 300,
    occupancy: 120,
    evacuated: 120,
    status: 'Open',
  },
  {
    id: 'EC-002',
    name: 'Chembur Station Upper Marathi School',
    ward: 'Chembur',
    address: 'Chembur, Mumbai',
    capacity: 250,
    occupancy: 250,
    evacuated: 250,
    status: 'Full',
  },
  {
    id: 'EC-003',
    name: 'Gawanpada Municipal School',
    ward: 'Mulund East',
    address: 'Mahatma Phule Road, Gawanpada, Mumbai',
    capacity: 200,
    occupancy: 0,
    evacuated: 0,
    status: 'Open',
  },
];

function loadCentres(): EvacuationCentre[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed as EvacuationCentre[];
    }
  } catch {
    // Use the initial demo data if storage cannot be read.
  }

  return INITIAL_CENTRES;
}

export function EvacuationPage() {
  const [centres, setCentres] =
    useState<EvacuationCentre[]>(loadCentres);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [occupancyInput, setOccupancyInput] = useState('0');
  const [evacuatedInput, setEvacuatedInput] = useState('0');
  const [statusInput, setStatusInput] =
    useState<CentreStatus>('Open');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(centres));
    } catch {
      // The page remains usable if browser storage is unavailable.
    }
  }, [centres]);

  const openCount = centres.filter(
    (centre) => centre.status === 'Open',
  ).length;

  const totalCapacity = centres.reduce(
    (total, centre) => total + centre.capacity,
    0,
  );

  const totalOccupancy = centres.reduce(
    (total, centre) => total + centre.occupancy,
    0,
  );

  const availableSpaces = centres.reduce(
    (total, centre) =>
      total +
      (centre.status === 'Closed'
        ? 0
        : Math.max(0, centre.capacity - centre.occupancy)),
    0,
  );

  function startEditing(centre: EvacuationCentre) {
    setEditingId(centre.id);
    setOccupancyInput(String(centre.occupancy));
    setEvacuatedInput(String(centre.evacuated));
    setStatusInput(centre.status);
  }

  function saveChanges(id: string) {
    const occupancy = Number(occupancyInput);
    const evacuated = Number(evacuatedInput);

    if (
      !Number.isInteger(occupancy) ||
      !Number.isInteger(evacuated) ||
      occupancy < 0 ||
      evacuated < 0
    ) {
      window.alert('Enter valid whole numbers of people.');
      return;
    }

    setCentres((current) =>
      current.map((centre) => {
        if (centre.id !== id) return centre;

        const safeOccupancy = Math.min(
          occupancy,
          centre.capacity,
        );

        let nextStatus = statusInput;

        if (nextStatus !== 'Closed' &&
            safeOccupancy >= centre.capacity) {
          nextStatus = 'Full';
        } else if (nextStatus === 'Full') {
          nextStatus = 'Open';
        }

        return {
          ...centre,
          occupancy: safeOccupancy,
          evacuated,
          status: nextStatus,
        };
      }),
    );

    setEditingId(null);
  }

  function updateStatus(
    id: string,
    status: CentreStatus,
  ) {
    setCentres((current) =>
      current.map((centre) => {
        if (centre.id !== id) return centre;

        if (status === 'Full') {
          return {
            ...centre,
            occupancy: centre.capacity,
            status,
          };
        }

        return { ...centre, status };
      }),
    );
  }

  return (
    <section className="ev-page">
      <div className="ev-heading">
        <div>
          <p className="ev-eyebrow">FLOOD RESPONSE / FIELD OPERATIONS</p>
          <h1>Evacuation Centres</h1>
          <p className="ev-subtitle">
            Monitor shelter capacity and manually record evacuation
            progress across flood-affected areas.
          </p>
        </div>
      </div>

      

      <div className="ev-stats">
        <article className="ev-stat">
          <span>REGISTERED CENTRES</span>
          <strong>{centres.length}</strong>
        </article>
        <article className="ev-stat">
          <span>OPEN CENTRES</span>
          <strong>{openCount}</strong>
        </article>
        <article className="ev-stat">
          <span>RECORDED OCCUPANCY</span>
          <strong>{totalOccupancy.toLocaleString('en-IN')}</strong>
          <small>People recorded at centres</small>
        </article>
        <article className="ev-stat">
          <span>AVAILABLE SPACES</span>
          <strong>{availableSpaces.toLocaleString('en-IN')}</strong>
          <small>Excludes closed centres</small>
        </article>
      </div>

      <div className="ev-register">
        <div className="ev-register-heading">
          <div>
            <p className="ev-eyebrow">SHELTER DIRECTORY</p>
            <h2>Centre register</h2>
          </div>
          <span>{centres.length} centres listed</span>
        </div>

        <div className="ev-centre-list">
          {centres.map((centre) => {
            const percentage = Math.min(
              100,
              Math.round((centre.occupancy / centre.capacity) * 100),
            );

            const atCapacity =
              centre.occupancy >= centre.capacity;

            return (
              <article className="ev-centre" key={centre.id}>
                <div className="ev-centre-top">
                  <div>
                    <span className="ev-centre-id">{centre.id}</span>
                    <h3>{centre.name}</h3>
                    <p className="ev-address">{centre.address}</p>
                    <p className="ev-ward">Ward / area: {centre.ward}</p>
                    <a
                      className="ev-map-link"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        centre.name + ', ' + centre.address,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Find on map ↗
                    </a>
                  </div>

                  <span
                    className={`ev-status ev-status-${centre.status.toLowerCase()}`}
                  >
                    {centre.status}
                  </span>
                </div>

                <div className="ev-capacity-row">
                  <div>
                    <span>Recorded occupancy</span>
                    <strong>
                      {centre.occupancy} / {centre.capacity}
                    </strong>
                  </div>
                  <div className="ev-available">
                    <span>Available spaces</span>
                    <strong>
                      {centre.status === 'Closed'
                        ? 'Unavailable'
                        : Math.max(
                            0,
                            centre.capacity - centre.occupancy,
                          )}
                    </strong>
                  </div>
                </div>

                <div className="ev-progress-track">
                  <div
                    className={`ev-progress-fill ${
                      atCapacity ? 'ev-progress-full' : ''
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {atCapacity && centre.status !== 'Closed' && (
                  <p className="ev-capacity-alert">
                    Capacity reached — no recorded spaces remain.
                  </p>
                )}

                <p className="ev-evacuated">
                  People recorded as evacuated: {centre.evacuated}
                </p>

                {editingId === centre.id ? (
                  <div className="ev-edit-panel">
                    <label>
                      Current occupancy
                      <input
                        type="number"
                        min="0"
                        max={centre.capacity}
                        value={occupancyInput}
                        onChange={(event) =>
                          setOccupancyInput(event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      People evacuated
                      <input
                        type="number"
                        min="0"
                        value={evacuatedInput}
                        onChange={(event) =>
                          setEvacuatedInput(event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Centre status
                      <select
                        value={statusInput}
                        onChange={(event) =>
                          setStatusInput(
                            event.target.value as CentreStatus,
                          )
                        }
                      >
                        <option>Open</option>
                        <option>Full</option>
                        <option>Closed</option>
                      </select>
                    </label>

                    <div className="ev-actions">
                      <button
                        type="button"
                        className="ev-button ev-button-secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="ev-button ev-button-primary"
                        onClick={() => saveChanges(centre.id)}
                      >
                        Save changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="ev-actions">
                    <button
                      type="button"
                      className="ev-button ev-button-primary"
                      onClick={() => startEditing(centre)}
                    >
                      Update records
                    </button>

                    <label className="ev-quick-status">
                      Quick status
                      <select
                        aria-label={`Status for ${centre.name}`}
                        value={centre.status}
                        onChange={(event) =>
                          updateStatus(
                            centre.id,
                            event.target.value as CentreStatus,
                          )
                        }
                      >
                        <option>Open</option>
                        <option>Full</option>
                        <option>Closed</option>
                      </select>
                    </label>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <p className="ev-footer-note">
          Updates are saved in this browser only. They are not shared
          with other devices or emergency-response teams.
        </p>
      </div>
    </section>
  );
}
