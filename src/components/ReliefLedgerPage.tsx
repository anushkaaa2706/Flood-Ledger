
import { useEffect, useMemo, useState } from 'react';

type SupplyType =
  | 'Food packets'
  | 'Drinking water'
  | 'Blankets'
  | 'Medical kits';

interface SupplyRecord {
  id: string;
  item: SupplyType;
  ward: string;
  received: number;
  distributed: number;
  updatedAt: string;
}

interface DistributionRecord {
  id: string;
  item: SupplyType;
  ward: string;
  recipient: string;
  quantity: number;
  date: string;
}

const STORAGE_KEY = 'flood-ledger-relief-records';
const DISTRIBUTION_KEY = 'flood-ledger-relief-distributions';

const INITIAL_SUPPLIES: SupplyRecord[] = [
  {
    id: 'RL-001',
    item: 'Food packets',
    ward: 'Bhandup West',
    received: 1000,
    distributed: 600,
    updatedAt: '2026-10-25',
  },
  {
    id: 'RL-002',
    item: 'Drinking water',
    ward: 'Chembur',
    received: 800,
    distributed: 500,
    updatedAt: '2026-10-25',
  },
  {
    id: 'RL-003',
    item: 'Blankets',
    ward: 'Mulund East',
    received: 400,
    distributed: 200,
    updatedAt: '2026-10-25',
  },
  {
    id: 'RL-004',
    item: 'Medical kits',
    ward: 'Chembur',
    received: 300,
    distributed: 150,
    updatedAt: '2026-10-25',
  },
];

function loadRecords<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed as T[];
    }
  } catch {
    // Fall back to sample records if browser storage cannot be read.
  }
  return fallback;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}

export function ReliefLedgerPage() {
  const [supplies, setSupplies] = useState<SupplyRecord[]>(
    () => loadRecords(STORAGE_KEY, INITIAL_SUPPLIES),
  );
  const [distributions, setDistributions] = useState<DistributionRecord[]>(
    () => loadRecords<DistributionRecord>(DISTRIBUTION_KEY, []),
  );

  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [showDistributionForm, setShowDistributionForm] = useState(false);
  const [filterWard, setFilterWard] = useState('All wards');

  const [supplyItem, setSupplyItem] = useState<SupplyType>('Food packets');
  const [supplyWard, setSupplyWard] = useState('Bhandup West');
  const [supplyQuantity, setSupplyQuantity] = useState('');
  const [distributionItem, setDistributionItem] =
    useState<SupplyType>('Food packets');
  const [distributionWard, setDistributionWard] =
    useState('Bhandup West');
  const [recipient, setRecipient] = useState('');
  const [distributionQuantity, setDistributionQuantity] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(supplies));
    } catch {
      // Keep the page usable if storage is unavailable.
    }
  }, [supplies]);

  useEffect(() => {
    try {
      localStorage.setItem(DISTRIBUTION_KEY, JSON.stringify(distributions));
    } catch {
      // Keep the page usable if storage is unavailable.
    }
  }, [distributions]);

  const totalReceived = supplies.reduce(
    (sum, record) => sum + record.received,
    0,
  );
  const totalDistributed = supplies.reduce(
    (sum, record) => sum + record.distributed,
    0,
  );
  const totalRemaining = supplies.reduce(
    (sum, record) => sum + Math.max(0, record.received - record.distributed),
    0,
  );

  const wards = useMemo(
    () => ['All wards', ...new Set(supplies.map((record) => record.ward))],
    [supplies],
  );

  const filteredSupplies = supplies.filter(
    (record) => filterWard === 'All wards' || record.ward === filterWard,
  );

  function addSupply() {
    const quantity = Number(supplyQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      window.alert('Enter a valid quantity greater than zero.');
      return;
    }

    const existing = supplies.find(
      (record) => record.item === supplyItem && record.ward === supplyWard,
    );

    if (existing) {
      setSupplies((current) =>
        current.map((record) =>
          record.id === existing.id
            ? {
                ...record,
                received: record.received + quantity,
                updatedAt: today(),
              }
            : record,
        ),
      );
    } else {
      setSupplies((current) => [
        ...current,
        {
          id: `RL-${String(Date.now()).slice(-6)}`,
          item: supplyItem,
          ward: supplyWard,
          received: quantity,
          distributed: 0,
          updatedAt: today(),
        },
      ]);
    }

    setSupplyQuantity('');
    setShowSupplyForm(false);
  }

  function addDistribution() {
    const quantity = Number(distributionQuantity);
    if (!recipient.trim()) {
      window.alert('Enter a recipient or community.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      window.alert('Enter a valid distribution quantity greater than zero.');
      return;
    }

    const matchingSupply = supplies.find(
      (record) =>
        record.item === distributionItem && record.ward === distributionWard,
    );

    if (!matchingSupply) {
      window.alert('No stock record exists for this item and ward. Add supplies first.');
      return;
    }

    const remaining = matchingSupply.received - matchingSupply.distributed;
    if (quantity > remaining) {
      window.alert(`Only ${remaining} units remain in this ward's recorded stock.`);
      return;
    }

    setSupplies((current) =>
      current.map((record) =>
        record.id === matchingSupply.id
          ? {
              ...record,
              distributed: record.distributed + quantity,
              updatedAt: today(),
            }
          : record,
      ),
    );

    setDistributions((current) => [
      {
        id: `DIST-${String(Date.now()).slice(-6)}`,
        item: distributionItem,
        ward: distributionWard,
        recipient: recipient.trim(),
        quantity,
        date: today(),
      },
      ...current,
    ]);

    setRecipient('');
    setDistributionQuantity('');
    setShowDistributionForm(false);
  }

  return (
    <section className="rl-page">
      <div className="rl-heading">
        <div>
          <p className="rl-eyebrow">FLOOD RESPONSE / RESOURCE MANAGEMENT</p>
          <h1>Relief Ledger</h1>
          <p className="rl-subtitle">
            Record relief supplies received and distributed across wards.
          </p>
        </div>
        <div className="rl-heading-actions">
          <button
            className="rl-button rl-secondary"
            onClick={() => {
              setShowSupplyForm(!showSupplyForm);
              setShowDistributionForm(false);
            }}
          >
            + Record supplies
          </button>
          <button
            className="rl-button rl-primary"
            onClick={() => {
              setShowDistributionForm(!showDistributionForm);
              setShowSupplyForm(false);
            }}
          >
            + Record distribution
          </button>
        </div>
      </div>

      

      <div className="rl-stats">
        <article className="rl-stat">
          <span>TOTAL RECEIVED</span>
          <strong>{formatNumber(totalReceived)}</strong>
          <small>Recorded supply units</small>
        </article>
        <article className="rl-stat">
          <span>TOTAL DISTRIBUTED</span>
          <strong>{formatNumber(totalDistributed)}</strong>
          <small>Recorded supply units</small>
        </article>
        <article className="rl-stat">
          <span>REMAINING STOCK</span>
          <strong>{formatNumber(totalRemaining)}</strong>
          <small>Received minus distributed</small>
        </article>
        <article className="rl-stat">
          <span>SUPPLY RECORDS</span>
          <strong>{supplies.length}</strong>
          <small>Item and ward entries</small>
        </article>
      </div>

      {showSupplyForm && (
        <div className="rl-form-panel">
          <h2>Record incoming supplies</h2>
          <div className="rl-form-grid">
            <label>
              Supply type
              <select
                value={supplyItem}
                onChange={(event) => setSupplyItem(event.target.value as SupplyType)}
              >
                <option>Food packets</option>
                <option>Drinking water</option>
                <option>Blankets</option>
                <option>Medical kits</option>
              </select>
            </label>
            <label>
              Ward
              <select value={supplyWard} onChange={(event) => setSupplyWard(event.target.value)}>
                <option>Bhandup West</option>
                <option>Chembur</option>
                <option>Mulund East</option>
              </select>
            </label>
            <label>
              Quantity received
              <input
                type="number"
                min="1"
                step="1"
                value={supplyQuantity}
                onChange={(event) => setSupplyQuantity(event.target.value)}
                placeholder="Enter quantity"
              />
            </label>
          </div>
          <div className="rl-form-actions">
            <button className="rl-button rl-secondary" onClick={() => setShowSupplyForm(false)}>
              Cancel
            </button>
            <button className="rl-button rl-primary" onClick={addSupply}>
              Save supplies
            </button>
          </div>
        </div>
      )}

      {showDistributionForm && (
        <div className="rl-form-panel">
          <h2>Record relief distribution</h2>
          <div className="rl-form-grid">
            <label>
              Supply type
              <select
                value={distributionItem}
                onChange={(event) => setDistributionItem(event.target.value as SupplyType)}
              >
                <option>Food packets</option>
                <option>Drinking water</option>
                <option>Blankets</option>
                <option>Medical kits</option>
              </select>
            </label>
            <label>
              Ward
              <select
                value={distributionWard}
                onChange={(event) => setDistributionWard(event.target.value)}
              >
                <option>Bhandup West</option>
                <option>Chembur</option>
                <option>Mulund East</option>
              </select>
            </label>
            <label>
              Quantity distributed
              <input
                type="number"
                min="1"
                step="1"
                value={distributionQuantity}
                onChange={(event) => setDistributionQuantity(event.target.value)}
                placeholder="Enter quantity"
              />
            </label>
            <label className="rl-recipient-field">
              Recipient / community
              <input
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="e.g. Community shelter A"
              />
            </label>
          </div>
          <div className="rl-form-actions">
            <button className="rl-button rl-secondary" onClick={() => setShowDistributionForm(false)}>
              Cancel
            </button>
            <button className="rl-button rl-primary" onClick={addDistribution}>
              Save distribution
            </button>
          </div>
        </div>
      )}

      <div className="rl-panel">
        <div className="rl-panel-heading">
          <div>
            <p className="rl-eyebrow">INVENTORY</p>
            <h2>Stock by ward</h2>
          </div>
          <label className="rl-filter">
            Filter ward
            <select value={filterWard} onChange={(event) => setFilterWard(event.target.value)}>
              {wards.map((ward) => <option key={ward}>{ward}</option>)}
            </select>
          </label>
        </div>

        <div className="rl-table-wrap">
          <table className="rl-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Supply type</th>
                <th>Ward</th>
                <th>Received</th>
                <th>Distributed</th>
                <th>Remaining</th>
                <th>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupplies.map((record) => {
                const remaining = Math.max(0, record.received - record.distributed);
                return (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.item}</td>
                    <td>{record.ward}</td>
                    <td>{formatNumber(record.received)}</td>
                    <td>{formatNumber(record.distributed)}</td>
                    <td>
                      <strong className={remaining === 0 ? 'rl-empty-stock' : ''}>
                        {formatNumber(remaining)}
                      </strong>
                    </td>
                    <td>{record.updatedAt}</td>
                  </tr>
                );
              })}
              {filteredSupplies.length === 0 && (
                <tr>
                  <td colSpan={7}>No stock records for this ward yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rl-panel">
        <div className="rl-panel-heading">
          <div>
            <p className="rl-eyebrow">DISTRIBUTION HISTORY</p>
            <h2>Recent distributions</h2>
          </div>
          <span className="rl-muted">{distributions.length} entries recorded</span>
        </div>
        {distributions.length === 0 ? (
          <p className="rl-empty-message">
            No distributions recorded yet. Use “Record distribution” to add the first entry.
          </p>
        ) : (
          <div className="rl-table-wrap">
            <table className="rl-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Supply type</th>
                  <th>Ward</th>
                  <th>Recipient / community</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {distributions.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.date}</td>
                    <td>{record.item}</td>
                    <td>{record.ward}</td>
                    <td>{record.recipient}</td>
                    <td>{formatNumber(record.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      
    </section>
  );
}
