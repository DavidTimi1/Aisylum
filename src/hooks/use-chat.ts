import { useEffect, useState } from "react";
import { chatService } from "@/services/chatService";
import { IDBPromise, initDB } from "@/lib/db";
import { useChatSessionStore } from "@/stores/useChatSessionStore";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function useMessages(chatID: number | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChatSession = useChatSessionStore(s => s.getSession);

  const loadMessages = async (chatID: number) => {
    if ([undefined, null].includes(chatID)) {
      setMessages([]);
      return;
    }

    try {
      const msgs = await getMessagesForChat(chatID);
      setMessages(msgs);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!chatID) return;

    setIsLoading(true);
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString()
    };

    const chatSession = await getChatSession(chatID)
    try {
      const response = await chatSession!.prompt(content);

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };

      const db = await initDB();
      const transaction = db.transaction(["messages"], "readwrite");
      const store = transaction.objectStore("messages");

      await IDBPromise(store.add({ ...userMessage, chatId: chatID }));
      await IDBPromise(store.add({ ...assistantMessage, chatId: chatID }));

      // Update local state
      setMessages((prevMessages) => [...prevMessages, userMessage, assistantMessage]);

    } catch (error) {
      setIsError(true);
      setError("Failed to send message.");
      console.error("Error sending message:", error);

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatID && loadMessages(chatID);
  }, [chatID]);

  return {
    messages,
    sendMessage,
    isLoading
  };
}


export function getMessagesForChat(chatID: number): Promise<Message[]> {

  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["messages"], "readonly");
      const store = transaction.objectStore("messages");
      const index = store.index("chatId");
      const request = index.getAll(IDBKeyRange.only(chatID));

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}


export function chatHasMessages(chatID: number): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    if ([undefined, null].includes(chatID)) {
      resolve(false);
      return;
    }

    try {
      const db = await initDB();
      const transaction = db.transaction(["messages"], "readonly");
      const store = transaction.objectStore("messages");
      const index = store.index("chatId");
      const request = index.count(IDBKeyRange.only(chatID));

      request.onsuccess = () => {
        resolve(request.result > 0);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

export function changeChatName(chatID: number, newName: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["chats"], "readwrite");
      const store = transaction.objectStore("chats");
      const request = store.get(chatID);

      request.onsuccess = () => {
        const chat = request.result;
        if (chat) {
          chat.name = newName;
          store.put(chat);
          resolve();
        } else {
          reject(new Error("Chat not found"));
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}


interface Chat {
  id: number;
  name: string;
  lastModified: number;
}

// Hook for chats
export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
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

  const addChat = async (name: string) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["chats"], "readwrite");
      const store = transaction.objectStore("chats");
      const chat = {
        name,
        lastModified: Date.now()
      };

      const chatID = await IDBPromise(store.add(chat));
      loadChats();
      return chatID as number;

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
