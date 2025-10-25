
// Hook for dictionary
export const useDictionary = () => {
    const [words, setWords] = useState([]);
  
    const loadWords = async () => {
      try {
        const db = await initDB();
        const transaction = db.transaction(["dictionary"], "readonly");
        const store = transaction.objectStore("dictionary");
        const request = store.getAll();
  
        request.onsuccess = () => {
          setWords(request.result);
        };
      } catch (error) {
        console.error("Error loading dictionary:", error);
      }
    };
  
    const addWord = async (word, fromLang, toLang, meaning) => {
      try {
        const db = await initDB();
        const transaction = db.transaction(["dictionary"], "readwrite");
        const store = transaction.objectStore("dictionary");
        
        store.add({ word, fromLang, toLang, meaning, timestamp: Date.now() });
        transaction.oncomplete = () => {
          loadWords();
        };
      } catch (error) {
        console.error("Error adding word:", error);
      }
    };
  
    const deleteWord = async (id) => {
      try {
        const db = await initDB();
        const transaction = db.transaction(["dictionary"], "readwrite");
        transaction.objectStore("dictionary").delete(id);
        transaction.oncomplete = () => {
          loadWords();
        };
      } catch (error) {
        console.error("Error deleting word:", error);
      }
    };
  
    useEffect(() => {
      loadWords();
    }, []);
  
    return { words, addWord, deleteWord, refreshWords: loadWords };
  };
  