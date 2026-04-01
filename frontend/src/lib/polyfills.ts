if (typeof globalThis.indexedDB === "undefined") {
  globalThis.indexedDB = {
    open: () => ({ result: null, onupgradeneeded: null, onsuccess: null, onerror: null }),
    deleteDatabase: () => {},
    cmp: () => 0,
    databases: () => Promise.resolve([]),
  } as unknown as IDBFactory;
}