import { useEffect, useState } from "react";
import { chatService } from "@/services/chatService";
import { initDB } from "@/lib/db";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(content);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading
  };
}


// Hook for chats
export const useChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["chats"], "readonly");
      const store = transaction.objectStore("chats");
      const index = store.index("lastModified");
      const request = index.openCursor(null, "prev"); // Get in descending order

      const results = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          setChats(results);
          setLoading(false);
        }
      };
    } catch (error) {
      console.error("Error loading chats:", error);
      setLoading(false);
    }
  };

  const addChat = async (name) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["chats"], "readwrite");
      const store = transaction.objectStore("chats");
      const chat = {
        name,
        lastModified: Date.now()
      };
      const request = store.add(chat);
      
      request.onsuccess = () => {
        loadChats();
      };
    } catch (error) {
      console.error("Error adding chat:", error);
    }
  };

  const deleteChat = async (id) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["chats", "messages"], "readwrite");
      
      // Delete chat
      transaction.objectStore("chats").delete(id);
      
      // Delete associated messages
      const messagesStore = transaction.objectStore("messages");
      const index = messagesStore.index("chatId");
      const request = index.openCursor(IDBKeyRange.only(id));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => {
        loadChats();
      };
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const updateChatTimestamp = async (id) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["chats"], "readwrite");
      const store = transaction.objectStore("chats");
      const request = store.get(id);

      request.onsuccess = () => {
        const chat = request.result;
        if (chat) {
          chat.lastModified = Date.now();
          store.put(chat);
          loadChats();
        }
      };
    } catch (error) {
      console.error("Error updating chat timestamp:", error);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  return { chats, loading, addChat, deleteChat, updateChatTimestamp, refreshChats: loadChats };
};
