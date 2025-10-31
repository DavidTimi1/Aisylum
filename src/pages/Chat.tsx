import { useEffect, useRef, useState } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changeChatName, useMessages } from "@/hooks/use-chat";
import { MessageList } from "@/components/aiChat/messageList";
import { ChatHistory } from "@/components/aiChat/chatHistory";
import { generateConversationTitle } from "@/lib/built-in-ai";

export default function Chat() {
  const [input, setInput] = useState("");
  const [chatID, setChatID] = useState<number>();
  const [newMessage, setSentNewMessage] = useState(false);
  const { messages, sendMessage, isLoading } = useMessages(chatID);
  const childRef = useRef<{ refreshChats: () => void }>(null);

  // set a chat name
  const isFirstConvo = messages.filter(msg => msg.role === 'assistant').length === 1;
  useEffect(() => {
    if (isFirstConvo && newMessage) {
      const contextIndex = messages.findIndex(msg => msg.role === 'assistant');
      updateChatName(messages.slice(0, contextIndex));
    }
  }, [isFirstConvo, newMessage]);



  return (
    <div className="h-[calc(100vh-5rem)] w-full relative">
      <div className="grid grid-cols-[0fr_2fr] md:grid-cols-[1fr_2fr] h-full">
        <ChatHistory
          activeChat={chatID}
          setActiveChat={setChatID}
          ref={childRef}
        />

        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 lg:px-6 space-y-4">
            <MessageList messages={messages} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-border bg-card px-4 py-2 lg:px-6">
            <div className="flex gap-2 items-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Mic className="h-5 w-5" />
              </Button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isLoading}
                className="min-h-10 max-h-32 flex-grow resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0"
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput("");
    setSentNewMessage(true);
  };

  async function updateChatName(messages) {
    const chatTitle = await generateConversationTitle(messages);
    await changeChatName(chatID!, chatTitle);
    childRef.current?.refreshChats();
  }
}
