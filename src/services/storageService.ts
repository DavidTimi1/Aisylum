
class StorageService {
  private dbName = "TrustNavigatorDB";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("documents")) {
          db.createObjectStore("documents", { keyPath: "id" });
        }
      };
    });
  }

  async saveDocument(id: string, data: any) {
    if (!this.db) await this.init();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      const request = store.put({ id, ...data, updatedAt: new Date().toISOString() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDocument(id: string) {
    if (!this.db) await this.init();
    
    return new Promise<any>((resolve, reject) => {
      const transaction = this.db!.transaction(["documents"], "readonly");
      const store = transaction.objectStore("documents");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const storageService = new StorageService();
