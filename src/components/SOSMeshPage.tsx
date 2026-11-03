
import { useEffect, useState } from 'react';
import {
  getSOSReports,
  saveSOSReport,
  type DistressReport,
} from '../sosStorage';

interface SOSCoordinates {
  latitude: number;
  longitude: number;
}

export function SOSMeshPage() {
  const [reports, setReports] = useState<DistressReport[]>([]);
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<SOSCoordinates | null>(null);
  const [capturingLocation, setCapturingLocation] = useState(false);
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

  function captureCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage('Your browser does not support location detection.');
      return;
    }

    setCapturingLocation(true);
    setMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({ latitude, longitude });

        // Store coordinates in the existing location field.
        // This avoids needing to change the DistressReport type.
        setLocation(
          `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} | https://www.google.com/maps?q=${latitude},${longitude}`
        );

        setCapturingLocation(false);
        setMessage('Current location captured successfully.');
      },
      (error) => {
        setCapturingLocation(false);

        if (error.code === error.PERMISSION_DENIED) {
          setMessage('Location permission denied. Please allow location access in your browser.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setMessage('Your current location is unavailable. Please try again.');
        } else if (error.code === error.TIMEOUT) {
          setMessage('Location request timed out. Please try again.');
        } else {
          setMessage('Unable to capture your current location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  async function saveSOS() {
    if (!coordinates || !location.trim()) {
      setMessage('Please capture your current location before saving the SOS.');
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
      setCoordinates(null);
      setPeople('1');
      setDetails('');
      setMessage(
        `SOS ${report.id.slice(0, 8)} saved on this device. It has not been sent to rescuers.`
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

          <label>Your Current Location *</label>

          <button
            type="button"
            className="sos-submit"
            onClick={captureCurrentLocation}
            disabled={capturingLocation || saving}
          >
            {capturingLocation
              ? 'Capturing Location...'
              : '📍 Capture Current Location'}
          </button>

          {coordinates && (
            <div className="sos-location-success">
              <strong>✓ Location Captured Successfully</strong>
              <p>
                Latitude: {coordinates.latitude.toFixed(6)}
              </p>
              <p>
                Longitude: {coordinates.longitude.toFixed(6)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View location on Google Maps ↗
              </a>
            </div>
          )}

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
            disabled={saving || loading || capturingLocation}
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
