import { useState, useEffect } from "react";
import { storageService } from "@/services/storageService";

interface Document {
  title: string;
  content: string;
}

export function useDocument() {
  const [document, setDocument] = useState<Document>({
    title: "Untitled Document",
    content: ""
  });
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    // Load document from IndexedDB on mount
    const loadDocument = async () => {
      const saved = await storageService.getDocument("current");
      if (saved) {
        setDocument(saved);
      }
    };
    loadDocument();
  }, []);

  const updateTitle = (title: string) => {
    setDocument((prev) => ({ ...prev, title }));
    setIsSaved(false);
  };

  const updateContent = (content: string) => {
    setDocument((prev) => ({ ...prev, content }));
    setIsSaved(false);
  };

  const saveDocument = async () => {
    await storageService.saveDocument("current", document);
    setIsSaved(true);
  };

  return {
    document,
    updateTitle,
    updateContent,
    saveDocument,
    isSaved
  };
}


// Hook for documents
export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);

  const loadDocuments = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["documents"], "readonly");
      const store = transaction.objectStore("documents");
      const request = store.getAll();

      request.onsuccess = () => {
        setDocuments(request.result);
      };
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const addDocument = async (original, edited = "") => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      
      store.add({ original, edited, timestamp: Date.now() });
      transaction.oncomplete = () => {
        loadDocuments();
      };
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const updateDocument = async (id, edited) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["documents"], "readwrite");
      const store = transaction.objectStore("documents");
      const request = store.get(id);

      request.onsuccess = () => {
        const doc = request.result;
        if (doc) {
          doc.edited = edited;
          store.put(doc);
          loadDocuments();
        }
      };
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const deleteDocument = async (id) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["documents"], "readwrite");
      transaction.objectStore("documents").delete(id);
      transaction.oncomplete = () => {
        loadDocuments();
      };
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return { documents, addDocument, updateDocument, deleteDocument, refreshDocuments: loadDocuments };
};
