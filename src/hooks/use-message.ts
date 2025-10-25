import { initDB } from "@/lib/db";
import { useEffect, useState } from "react";

export const useMessages = (chatId: number) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const loadMessages = async () => {
      if (!chatId) {
        setMessages([]);
        setLoading(false);
        return;
      }
  
      try {
        const db = await initDB();
        const transaction = db.transaction(["messages"], "readonly");
        const store = transaction.objectStore("messages");
        const index = store.index("chatId");
        const request = index.getAll(chatId);
  
        request.onsuccess = () => {
          setMessages(request.result);
          setLoading(false);
        };
      } catch (error) {
        console.error("Error loading messages:", error);
        setLoading(false);
      }
    };
  
    const addMessage = async (text, role = "user") => {
      if (!chatId) return;
  
      try {
        const db = await initDB();
        const transaction = db.transaction(["messages"], "readwrite");
        const store = transaction.objectStore("messages");
        const message = {
          chatId,
          text,
          role,
          timestamp: Date.now()
        };
        
        store.add(message);
        transaction.oncomplete = () => {
          loadMessages();
        };
      } catch (error) {
        console.error("Error adding message:", error);
      }
    };
  
    useEffect(() => {
      loadMessages();
    }, [chatId]);
  
    return { messages, loading, addMessage, refreshMessages: loadMessages };
  };