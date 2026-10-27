
import { useEffect, useState } from 'react';
import {
  getSOSReports,
  saveSOSReport,
  type DistressReport,
} from '../sosStorage';

export function SOSMeshPage() {
  const [reports, setReports] = useState<DistressReport[]>([]);
  const [location, setLocation] = useState('');
  const [people, setPeople] = useState('1');
  const [emergency, setEmergency] = useState('Trapped by floodwater');
  const [details, setDetails] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refreshReports() {
    const savedReports = await getSOSReports();
    setReports(savedReports);
  }

  useEffect(() => {
    let cancelled = false;

    getSOSReports()
      .then((savedReports) => {
        if (!cancelled) {
          setReports(savedReports);
          setMessage('');
        }
      })
      .catch((error: unknown) => {
        console.error('Could not load SOS reports:', error);
        if (!cancelled) {
          setMessage('Could not load saved reports. Please check browser storage.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveSOS() {
    if (!location.trim()) {
      setMessage('Please describe your location before saving the SOS.');
      return;
    }

    const count = Number(people);

    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      setMessage('Enter a valid number of people between 1 and 1000.');
      return;
    }

    const report: DistressReport = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      location: location.trim(),
      people: count,
      emergency,
      details: details.trim(),
      status: 'Saved offline',
    };

    setSaving(true);
    setMessage('');

    try {
      await saveSOSReport(report);
      await refreshReports();

      setLocation('');
      setPeople('1');
      setDetails('');
      setMessage(
        `SOS ${report.id.slice(0, 8)} saved on this device. It has not been sent to rescuers.`,
      );
    } catch (error) {
      console.error('Could not save SOS:', error);
      setMessage('Could not save this SOS. Check browser storage and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-section sos-mesh-page">
      <div className="page-heading">
        <div>
          <p className="section-eyebrow">EMERGENCY COMMUNICATION</p>
          <h1>SOS Mesh</h1>
          <p>
            Create a distress report and keep it on this device until a
            delivery method becomes available.
          </p>
        </div>
      </div>

      <div className="sos-notice">
        <strong>Offline storage status</strong>
        <p>
          Reports are stored in this browser's local database.
          Saving a report does not send it to rescue services.
        </p>
      </div>

      <div className="sos-layout">
        <form
          className="sos-form"
          onSubmit={(event) => {
            event.preventDefault();
            void saveSOS();
          }}
        >
          <h2>Send a distress report</h2>

          <label htmlFor="sos-location">Your location *</label>
          <input
            id="sos-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Street, landmark, building, or area"
            required
          />

          <label htmlFor="sos-emergency">Emergency type</label>
          <select
            id="sos-emergency"
            value={emergency}
            onChange={(event) => setEmergency(event.target.value)}
          >
            <option>Trapped by floodwater</option>
            <option>Urgent medical emergency</option>
            <option>Person missing</option>
            <option>Building or road damage</option>
            <option>Food or drinking water needed</option>
            <option>Other emergency</option>
          </select>

          <label htmlFor="sos-people">People needing help</label>
          <input
            id="sos-people"
            type="number"
            min="1"
            max="1000"
            step="1"
            value={people}
            onChange={(event) => setPeople(event.target.value)}
            required
          />

          <label htmlFor="sos-details">Additional details</label>
          <textarea
            id="sos-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Medical needs, water depth, nearby landmarks..."
            rows={4}
          />

          <button
            type="submit"
            className="sos-submit"
            disabled={saving || loading}
          >
            {saving ? 'Saving SOS...' : 'Save SOS Offline'}
          </button>

          {message && <p role="status">{message}</p>}
        </form>

        <aside className="sos-report-list">
          <h2>Saved distress packets</h2>
          <p>
            {loading
              ? 'Loading saved reports...'
              : `${reports.length} report(s) stored on this device`}
          </p>

          {!loading && reports.length === 0 && (
            <p>No distress reports saved yet.</p>
          )}

          {reports.map((report) => (
            <article className="sos-report-card" key={report.id}>
              <div className="sos-report-topline">
                <strong>{report.emergency}</strong>
                <span>{report.status}</span>
              </div>
              <p>{report.location}</p>
              <p>People needing help: {report.people}</p>
              {report.details && <p>{report.details}</p>}
              <small>
                {new Date(report.createdAt).toLocaleString()}
              </small>
              <small>Packet ID: {report.id}</small>
            </article>
          ))}
        </aside>
      </div>
    </section>
  );
}
