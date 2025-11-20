import { useEffect, useState } from "react";
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
  const [isResponding, setIsResponding] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getChatSession = useChatSessionStore(s => s.getSession);

  const loadMessages = async (chatID: number) => {
    try {
      const msgs = await getMessagesForChat(chatID);
      setMessages(msgs);

    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!chatID) return;

    setIsResponding(true);
    setIsError(false);

    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString()
    };

    try {
      const chatSession = await getChatSession(chatID)
      const response = await chatSession!.prompt(content);

      await saveMessageToDB( userMessage, chatID);
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };
      await saveMessageToDB( assistantMessage, chatID);

      // Update local state
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setIsResponding(false);

    } catch (error) {
      setIsError(true);
      setError("Failed to send message.");
      console.error("Error sending message:", error);
      setIsResponding(false);
      throw error.message

    } finally {
      setIsResponding(false);
    }
  };

  useEffect(() => {
    if (chatID){
      setMessages([]);
      setError(null);
      setIsLoading(true);
      
      loadMessages(chatID)
      .then(() => {
        setIsLoading(false)
      });
    }
  }, [chatID]);

  return {
    messages,
    sendMessage,
    isLoading,
    isResponding,
    isError
  };
}


async function saveMessageToDB(messageObj, chatID){
  const db = await initDB();
  const transaction = db.transaction(["messages"], "readwrite");
  const store = transaction.objectStore("messages");
  return await IDBPromise(
    store.add({ ...messageObj, chatID })
  );
}

export function getMessagesForChat(chatID: number): Promise<Message[]> {

  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction(["messages"], "readonly");
      const store = transaction.objectStore("messages");
      const index = store.index("chatID");
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
      const index = store.index("chatID");
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
  hasMessages?: boolean;
}

// Hook for chats
export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

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
          setLoaded(true)
        }
      };

    } catch (error) {
      console.error("Error loading chats:", error);
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
      const index = messagesStore.index("chatID");
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
    setLoading(true);

    loadChats()
    .then(() => {
      setLoading(false);
    })
  }, []);

  return { chats, loaded, loading, addChat, deleteChat, updateChatTimestamp, refreshChats: loadChats };
};
