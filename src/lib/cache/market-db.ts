// Public history only. No credentials, portfolios or pending commands belong here.
const DB = "fin-public-history-v1";
const STORE = "history";
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_AGE = 7 * 86_400_000;
type Entry<T> = { key: string; data: T; savedAt: number; accessedAt: number; bytes: number };
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB unavailable"));
    const request = indexedDB.open(DB, 1);
    let abandoned = false;
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "key" });
    request.onerror = () => reject(request.error);
    request.onblocked = () => { abandoned = true; reject(new Error("IndexedDB blocked")); };
    request.onsuccess = () => { if (abandoned) request.result.close(); else resolve(request.result); };
  });
}
function done(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
export function historyKey(ticker: string, timeframe: string, adjusted: boolean, limit: number, offset: number) {
  // Corporate-action version is unavailable upstream. Revalidate every read; this key never asserts an adjustment version.
  return JSON.stringify([1, `B3:${ticker.toUpperCase()}`, timeframe, "BRL", adjusted, "unversioned", limit, offset]);
}
export async function readPublicHistory<T>(key: string): Promise<T | null> {
  let db: IDBDatabase | undefined;
  try {
    db = await open();
    const tx = db.transaction(STORE, "readwrite");
    const completion = done(tx);
    const store = tx.objectStore(STORE);
    let data: T | null = null;
    const request = store.get(key);
    request.onsuccess = () => {
      const entry = request.result as Entry<T> | undefined;
      if (!entry) return;
      if (Date.now() - entry.savedAt > MAX_AGE) { store.delete(key); return; }
      data = entry.data;
      store.put({ ...entry, accessedAt: Date.now() });
    };
    await completion;
    return data;
  } catch { return null; }
  finally { db?.close(); }
}
export async function writePublicHistory<T>(key: string, data: T): Promise<void> {
  let db: IDBDatabase | undefined;
  try {
    const bytes = new TextEncoder().encode(JSON.stringify(data)).byteLength;
    if (bytes > MAX_BYTES) return;
    db = await open();
    const tx = db.transaction(STORE, "readwrite");
    const completion = done(tx);
    const store = tx.objectStore(STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const entries = (request.result as Entry<T>[]).filter(entry => entry.key !== key).sort((a, b) => a.accessedAt - b.accessedAt);
      let retained = entries.reduce((sum, entry) => sum + entry.bytes, 0) + bytes;
      for (const entry of entries) {
        if (retained <= MAX_BYTES && Date.now() - entry.savedAt <= MAX_AGE) continue;
        store.delete(entry.key);
        retained -= entry.bytes;
      }
      store.put({ key, data, bytes, savedAt: Date.now(), accessedAt: Date.now() });
    };
    await completion;
  } catch { /* Quota, blocked DB and private browsing must not block online reads. */ }
  finally { db?.close(); }
}
