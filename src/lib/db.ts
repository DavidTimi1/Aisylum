import type { Document } from "@/pages/Documents";

// IndexedDB setup and hooks
const DB_NAME = "Aisylum DB";
const DB_VERSION = 1.0000001;

// Initialize IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create chats store
      if (!db.objectStoreNames.contains("chats")) {
        const chatsStore = db.createObjectStore("chats", { keyPath: "id", autoIncrement: true });
        chatsStore.createIndex("lastModified", "lastModified", { unique: false });
      }

      // Create messages store
      if (!db.objectStoreNames.contains("messages")) {
        const messagesStore = db.createObjectStore("messages", { keyPath: "id", autoIncrement: true });
        messagesStore.createIndex("chatId", "chatId", { unique: false });
      }

      if (!db.objectStoreNames.contains("vocabulary")) {
        const vocabStore = db.createObjectStore("vocabulary", {
          keyPath: "id",
          autoIncrement: true,
        });

        // Indexes to speed up searches and filters
        vocabStore.createIndex("word", "word", { unique: false });
        vocabStore.createIndex("language", "language", { unique: false });
        vocabStore.createIndex("dateAdded", "dateAdded", { unique: false });
      }

      // Create documents store
      if (!db.objectStoreNames.contains("documents")) {
        const documentsStore = db.createObjectStore("documents", { keyPath: "id", autoIncrement: true });
        documentsStore.createIndex("lastModified", "lastModified", { unique: false });
        documentsStore.createIndex("uploadedAt", "uploadedAt", { unique: false });
        documentsStore.createIndex("type", "type", { unique: false });
      }
    };
  });
};


// Wrap any IDBRequest into a Promise
export function IDBPromise<T = any>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}



export const getAllDocuments = async (): Promise<Document[]> => {
  const db = await initDB();

  const tx = db.transaction('documents', 'readonly');
  const store = tx.objectStore('documents');
  return await IDBPromise(store.getAll()) as Document[];
};

export const saveDocument = async (doc: Document) => {
  const db = await initDB();

  const tx = db.transaction('documents', 'readwrite');
  const store = tx.objectStore('documents');
  return await IDBPromise(store.put(doc));
};

export const deleteDocument = async (id: number) => {
  const db = await initDB();

  const tx = db.transaction('documents', 'readwrite');
  const store = tx.objectStore('documents');
  return await IDBPromise(store.delete(id));
};
