
import { useEffect, useState, type FormEvent } from 'react';


type ReportType =
  | 'Waterlogging'
  | 'Infrastructure damage'
  | 'Rescue request'
  | 'Food and essential supplies';


type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

type VerificationStatus =
  | 'Pending verification'
  | 'Verified'
  | 'Rejected';


interface CitizenReport {
  id: string;
  type: ReportType;
  ward: string;
  location: string;
  description: string;
  severity: Severity;
  submittedAt: string;
  status: VerificationStatus;
  reviewedAt?: string;

  // Optional GPS fields: older sample reports may not have them.
  latitude?: number;
  longitude?: number;
  gpsAccuracy?: number;
  locationSource?: 'Device location';
}


const STORAGE_KEY = 'flood-ledger-citizen-reports';

const SAMPLE_REPORTS: CitizenReport[] = [
  {
    id: 'CR-1001',
    type: 'Waterlogging',
    ward: 'Bhandup West',
    location: 'LBS Road, near station',
    description: 'Water accumulation reported on the service road.',
    severity: 'High',
    submittedAt: '2026-10-25T08:30:00+05:30',
    status: 'Pending verification',
  },
  {
    id: 'CR-1002',
    type: 'Infrastructure damage',
    ward: 'Chembur',
    location: 'Local market road',
    description: 'A damaged roadside drain cover needs inspection.',
    severity: 'Medium',
    submittedAt: '2026-10-25T07:45:00+05:30',
    status: 'Verified',
    reviewedAt: '2026-10-25T08:00:00+05:30',
  },
  {
    id: 'CR-1003',
    type: 'Rescue request',
    ward: 'Mulund East',
    location: 'Low-lying residential lane',
    description: 'Assistance requested because of rising water.',
    severity: 'Critical',
    submittedAt: '2026-10-25T09:10:00+05:30',
    status: 'Pending verification',
  },
];

const STATUS_OPTIONS = [
  'All reports',
  'Pending verification',
  'Verified',
  'Rejected',
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number];

function loadReports(): CitizenReport[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed as CitizenReport[];
    }
  } catch {
    // Use sample data if browser storage cannot be read.
  }

  return SAMPLE_REPORTS;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function CitizenReportsPage() {
  const [reports, setReports] = useState<CitizenReport[]>(loadReports);
  const [filter, setFilter] = useState<StatusFilter>('All reports');

  const [type, setType] = useState<ReportType>('Waterlogging');
  const [ward, setWard] = useState('Bhandup West');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('Medium');
  const [showForm, setShowForm] = useState(false);
  
  const [gps, setGps] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  const [gpsMessage, setGpsMessage] = useState('');
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);


  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // The page remains usable if browser storage is unavailable.
    }
  }, [reports]);

  const pendingCount = reports.filter(
    (report) => report.status === 'Pending verification',
  ).length;

  const verifiedCount = reports.filter(
    (report) => report.status === 'Verified',
  ).length;

  const criticalCount = reports.filter(
    (report) => report.severity === 'Critical',
  ).length;

  const filteredReports = reports.filter(
    (report) => filter === 'All reports' || report.status === filter,
  );

  function captureGPS() {
    if (!navigator.geolocation) {
      setGpsMessage('Location capture is not supported by this browser.');
      return;
    }

    setIsCapturingLocation(true);
    setGpsMessage('Requesting device location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const capturedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setGps(capturedLocation);
        setGpsMessage(
          `Location captured. Reported accuracy: approximately ${Math.round(
            capturedLocation.accuracy,
          )} metres.`,
        );
        setIsCapturingLocation(false);
      },
      (error) => {
        const messages: Record<number, string> = {
          1: 'Location permission was denied. Allow location access in your browser settings and try again.',
          2: 'Your device could not determine its location. Try again in a place with a better GPS signal.',
          3: 'Location request timed out. Please try again.',
        };

        setGpsMessage(
          messages[error.code] ??
            'Unable to capture location. Please try again.',
        );
        setIsCapturingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  }

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newReport: CitizenReport = {
      id: `CR-${Date.now()}`,
      type,
      ward,
      location: location.trim(),
      
      ...(gps
        ? {
            latitude: gps.latitude,
            longitude: gps.longitude,
            gpsAccuracy: gps.accuracy,
            locationSource: 'Device location' as const,
          }
        : {}),

      description: description.trim(),
      severity,
      submittedAt: new Date().toISOString(),
      status: 'Pending verification',
    };

    setReports((current) => [newReport, ...current]);
    setGps(null);
setGpsMessage('');
    setLocation('');
    setDescription('');
    setSeverity('Medium');
    setType('Waterlogging');
    setWard('Bhandup West');
    setShowForm(false);
    setFilter('All reports');
  }

  function reviewReport(
    id: string,
    status: 'Verified' | 'Rejected',
  ) {
    setReports((current) =>
      current.map((report) =>
        report.id === id
          ? {
              ...report,
              status,
              reviewedAt: new Date().toISOString(),
            }
          : report,
      ),
    );
  }

  return (
    <section className="citizen-reports-page">
      <div className="cr-page-heading">
        <div>
          <p className="cr-eyebrow">FIELD INTELLIGENCE / REPORT REGISTER</p>
          <h1>Citizen Reports</h1>
          <p className="cr-subtitle">
            Collect local observations, verify incoming reports, and
            identify urgent requests for action.
          </p>
        </div>

        <button
          className="cr-primary-button"
          type="button"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? 'Cancel report' : '+ New report'}
        </button>
</div>

      <div className="cr-notice">
      </div>

      <div className="cr-summary-grid">
        <article className="cr-stat-card">
          <span className="cr-stat-label">TOTAL REPORTS</span>
          <strong>{reports.length}</strong>
          <span className="cr-stat-note">All submitted reports</span>
        </article>

        <article className="cr-stat-card">
          <span className="cr-stat-label">AWAITING REVIEW</span>
          <strong>{pendingCount}</strong>
          <span className="cr-stat-note">Require verification</span>
        </article>

        <article className="cr-stat-card">
          <span className="cr-stat-label">VERIFIED</span>
          <strong>{verifiedCount}</strong>
          <span className="cr-stat-note">Reviewed and accepted</span>
        </article>

        <article className="cr-stat-card">
          <span className="cr-stat-label">CRITICAL SEVERITY</span>
          <strong>{criticalCount}</strong>
          <span className="cr-stat-note">Reports marked critical</span>
        </article>
      </div>

      {showForm && (
        <form className="cr-form-panel" onSubmit={submitReport}>
          <div className="cr-section-heading">
            <div>
              <p className="cr-eyebrow">NEW ENTRY</p>
              <h2>Submit a field report</h2>
            </div>
          </div>

          <div className="cr-form-grid">
            <label className="cr-field">
              <span>Report type</span>
              
<select
  value={type}
  onChange={(event) =>
    setType(event.target.value as ReportType)
  }
>
  <option>Waterlogging</option>
  <option>Infrastructure damage</option>
  <option>Rescue request</option>
  <option>Food and essential supplies</option>
</select>

            </label>

            <label className="cr-field">
              <span>Ward / area</span>
              <select
                value={ward}
                onChange={(event) => setWard(event.target.value)}
              >
                <option>Bhandup West</option>
                <option>Chembur</option>
                <option>Mulund East</option>
              </select>
            </label>

            <label className="cr-field">
              <span>Specific location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Street, landmark or locality"
                required
              />
            </label>
            
            <div className="cr-field cr-field-wide cr-gps-panel">
              <span>GPS coordinates</span>

              <div className="cr-gps-actions">
                <button
                  className="cr-secondary-button"
                  type="button"
                  onClick={captureGPS}
                  disabled={isCapturingLocation}
                >
                  {isCapturingLocation
                    ? 'Capturing location...'
                    : gps
                      ? 'Capture location again'
                      : 'Use my current location'}
                </button>

                {gps && (
                  <button
                    className="cr-text-button"
                    type="button"
                    onClick={() => {
                      setGps(null);
                      setGpsMessage('GPS coordinates cleared.');
                    }}
                  >
                    Clear GPS
                  </button>
                )}
              </div>

              {gps && (
                <div className="cr-gps-details">
                  <p>
                    <strong>Latitude:</strong> {gps.latitude.toFixed(6)}
                  </p>
                  <p>
                    <strong>Longitude:</strong> {gps.longitude.toFixed(6)}
                  </p>
                  <p>
                    <strong>Reported accuracy:</strong> ±
                    {Math.round(gps.accuracy)} metres
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Check location on Google Maps
                  </a>
                </div>
              )}

              {gpsMessage && (
                <p className="cr-gps-message" role="status">
                  {gpsMessage}
                </p>
              )}

              <small>
                GPS is optional if your device cannot provide a location.
                Check the pin before submitting the report.
              </small>
            </div>


            <label className="cr-field">
              <span>Severity</span>
              <select
                value={severity}
                onChange={(event) =>
                  setSeverity(event.target.value as Severity)
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>

            <label className="cr-field cr-field-wide">
              <span>What has been observed?</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the situation and any immediate concern..."
                rows={3}
                required
              />
            </label>
          </div>

          <div className="cr-form-actions">
            <button
              className="cr-secondary-button"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button className="cr-primary-button" type="submit">
              Submit report
            </button>
          </div>
        </form>
      )}

      <div className="cr-register-panel">
        <div className="cr-register-heading">
          <div>
            <p className="cr-eyebrow">INCOMING INCIDENTS</p>
            <h2>Report register</h2>
          </div>

          <label className="cr-filter">
            <span>Show</span>
            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as StatusFilter)
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredReports.length === 0 ? (
          <div className="cr-empty-state">
            <strong>No reports in this view</strong>
            <p>Try a different status filter or submit a new report.</p>
          </div>
        ) : (
          <div className="cr-table-wrap">
            <table className="cr-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Submitted</th>
                  <th>Verification</th>
                  <th>Officer action</th>
                </tr>
              </thead>
              <tbody>
                
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <span className="cr-report-id">{report.id}</span>
                      <strong className="cr-report-type">{report.type}</strong>
                      <span className="cr-report-description">
                        {report.description}
                      </span>
                    </td>

                    
<td>
  <strong>{report.ward}</strong>
  <span className="cr-table-muted">{report.location}</span>

  {report.latitude != null && report.longitude != null && (
    <div className="cr-gps-saved">
      <span>Device location captured</span>
      <span className="cr-table-muted">
        {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
      </span>
      {report.gpsAccuracy != null && (
        <span className="cr-table-muted">
          Accuracy: ±{Math.round(report.gpsAccuracy)} m
        </span>
      )}
      <a
        href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
        target="_blank"
        rel="noreferrer"
      >
        Open map
      </a>
    </div>
  )}
</td>


                    <td>
                      <span
                        className={`cr-severity cr-severity-${report.severity.toLowerCase()}`}
                      >
                        {report.severity}
                      </span>
                    </td>

                    <td className="cr-date-cell">
                      {formatDate(report.submittedAt)}
                    </td>

                    <td>
                      <span
                        className={`cr-status cr-status-${report.status.toLowerCase().replace(/ /g, '-')}`}
                      >
                        {report.status}
                      </span>
                      {report.reviewedAt && (
                        <span className="cr-table-muted">
                          Reviewed {formatDate(report.reviewedAt)}
                        </span>
                      )}
                    </td>

                    <td>
                      {report.status === 'Pending verification' ? (
                        <div className="cr-review-actions">
                          <button
                            type="button"
                            className="cr-review-button cr-verify-button"
                            onClick={() => reviewReport(report.id, 'Verified')}
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            className="cr-review-button cr-reject-button"
                            onClick={() => reviewReport(report.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="cr-table-muted">
                          Review complete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

        <div className="cr-register-footer">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      </div>
    </section>
  );
}
