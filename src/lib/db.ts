
// IndexedDB setup and hooks
const DB_NAME = "PrivateAssistanceDB";
const DB_VERSION = 1;

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

      // Create dictionary store
      if (!db.objectStoreNames.contains("dictionary")) {
        const dictionaryStore = db.createObjectStore("dictionary", { keyPath: "id", autoIncrement: true });
        dictionaryStore.createIndex("word", "word", { unique: false });
      }

      // Create documents store
      if (!db.objectStoreNames.contains("documents")) {
        db.createObjectStore("documents", { keyPath: "id", autoIncrement: true });
      }
    };
  });
};