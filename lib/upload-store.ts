const DB_NAME = "iaas_uploads";
const STORE_NAME = "zip_files";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "name" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveZipFile(name: string, data: ArrayBuffer): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Keep only the 2 most recent: clear all then write back won't work easily,
    // so we just put the new one. Pruning happens via getAllKeys.
    const getAllReq = store.getAllKeys();
    getAllReq.onsuccess = () => {
      const keys = getAllReq.result as string[];
      // If we already have 2 entries and this is a new one, delete the oldest
      if (keys.length >= 2 && !keys.includes(name)) {
        // Delete all existing, we'll rely on localStorage history for ordering
        // Just delete keys that aren't the current one
        for (const key of keys) {
          if (key !== name) {
            store.delete(key);
            break; // only delete one to keep at most 2
          }
        }
      }
      store.put({ name, data });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    getAllReq.onerror = () => reject(getAllReq.error);
  });
}

export async function loadZipFile(name: string): Promise<ArrayBuffer | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(name);
    req.onsuccess = () => {
      const result = req.result;
      resolve(result ? result.data : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteZipFile(name: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
