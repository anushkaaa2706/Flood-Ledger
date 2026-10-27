
export type DistressReport = {
  id: string;
  createdAt: string;
  location: string;
  people: number;
  emergency: string;
  details: string;
  status: 'Saved offline';
};

const DB_NAME = 'flood-ledger-sos';
const STORE_NAME = 'distress-reports';
const LEGACY_KEY = 'flood-ledger-sos-reports';
const DB_VERSION = 1;

function openSOSDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });

        store.createIndex('createdAt', 'createdAt', {
          unique: false,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Could not open SOS database.'));
    request.onblocked = () =>
      reject(new Error('SOS database upgrade is blocked by another tab.'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('Database transaction failed.'));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('Database transaction was aborted.'));
  });
}

export async function saveSOSReport(
  report: DistressReport,
): Promise<void> {
  const db = await openSOSDatabase();

  try {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const done = transactionDone(transaction);

    transaction.objectStore(STORE_NAME).put(report);

    await done;
  } finally {
    db.close();
  }
}

export async function getSOSReports(): Promise<DistressReport[]> {
  const db = await openSOSDatabase();
  let reports: DistressReport[];

  try {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const done = transactionDone(transaction);
    const request = transaction.objectStore(STORE_NAME).getAll();

    reports = await new Promise((resolve, reject) => {
      request.onsuccess = () =>
        resolve(request.result as DistressReport[]);
      request.onerror = () =>
        reject(request.error ?? new Error('Could not read SOS reports.'));
    });

    await done;
  } finally {
    db.close();
  }

  // Preserve and import reports saved by the earlier prototype.
  if (reports.length === 0) {
    try {
      const legacyData = localStorage.getItem(LEGACY_KEY);

      if (legacyData) {
        const legacyReports = JSON.parse(legacyData) as DistressReport[];

        if (Array.isArray(legacyReports)) {
          for (const report of legacyReports) {
            if (
              report &&
              typeof report.id === 'string' &&
              typeof report.location === 'string' &&
              typeof report.createdAt === 'string'
            ) {
              await saveSOSReport({
                ...report,
                people: Math.max(1, Number(report.people) || 1),
                emergency: String(report.emergency || 'Other emergency'),
                details: String(report.details || ''),
                status: 'Saved offline',
              });
            }
          }

          reports = await getStoredReports();
        }
      }
    } catch (error) {
      console.error('SOS legacy-report migration failed:', error);
      throw error;
    }
  }

  return reports.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  );
}

async function getStoredReports(): Promise<DistressReport[]> {
  const db = await openSOSDatabase();

  try {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const done = transactionDone(transaction);
    const request = transaction.objectStore(STORE_NAME).getAll();

    const reports = await new Promise<DistressReport[]>(
      (resolve, reject) => {
        request.onsuccess = () =>
          resolve(request.result as DistressReport[]);
        request.onerror = () =>
          reject(request.error ?? new Error('Could not read SOS reports.'));
      },
    );

    await done;
    return reports;
  } finally {
    db.close();
  }
}
