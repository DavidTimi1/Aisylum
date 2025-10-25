import { useState } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/use-chat";
import { MessageList } from "@/components/aiChat/messageList";
import { ChatHistory } from "@/components/aiChat/chatHistory";

export default function Chat() {
  const [input, setInput] = useState("");
  const [chatID, setChatID] = useState()
  const { messages, sendMessage, isLoading } = useChat(chatID);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full relative">
      <div className="grid grid-cols-[0fr_2fr] md:grid-cols-[1fr_2fr] h-full">
        <ChatHistory activeChat={chatID} setActiveChat={setChatID} />

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
}
