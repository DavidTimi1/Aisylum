import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changeChatName, useMessages } from "@/hooks/use-chat";
import { MessageList } from "@/components/aiChat/messageList";
import { ChatHistory } from "@/components/aiChat/chatHistory";
import { errorToast } from "@/hooks/use-toast";
import { generateConversationTitle } from "@/stores/summarizerStore";

export default function Chat() {
  const [input, setInput] = useState("");
  const [chatID, setChatID] = useState<number>();
  const [newMessage, setSentNewMessage] = useState(false);
  const { messages, sendMessage, isLoading, isResponding, isError } = useMessages(chatID);

  const childRef = useRef<{
    refreshChats: () => void,
    sentMessageCallback: () => void
  }>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // set a chat name
  const isFirstConvo = messages.filter(msg => msg.role === 'assistant').length === 1;
  useEffect(() => {
    if (isFirstConvo && newMessage) {
      const contextIndex = messages.findIndex(msg => msg.role === 'assistant');
      updateChatName(messages.slice(0, contextIndex));
    }
  }, [isFirstConvo, newMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isResponding, isError]);

  return (
    <div className="h-[calc(100vh-70px)] w-full relative">
      <div className="grid grid-cols-[0fr_2fr] md:grid-cols-[1fr_2fr] h-full">
        <ChatHistory
          activeChat={chatID}
          setActiveChat={setChatID}
          ref={childRef}
        />

        <div className="h-full flex flex-col overflow-hidden pb-1">
          <div className="flex-1 flex-grow overflow-y-auto p-4 lg:px-6 space-y-4">
            <MessageList messages={messages} noPlaceholder={isResponding || isError} />

            {
              isResponding && (
                <>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-md px-4 py-3 bg-accent text-accent-foreground">
                      <p className="text-sm">{input}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-lg p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </>
              )
            }

            {
              isError && (
                <>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-md px-4 py-3 bg-accent text-accent-foreground">
                      <p className="text-sm">{input}</p>
                    </div>
                  </div>

                  <div className="border-red-500 bg-red-200 text-red-500 p-2 text-sm flex gap-2 items-center rounded-lg">
                    <p>There was an error processing your message.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resendMessage}
                    >
                      Retry
                    </Button>
                  </div>
                </>
              )
            }

            {
              messages.length > 0 && (
                <div ref={messagesEndRef} />
              )
            }

          </div>

          <form onSubmit={handleSubmit} className="border-t border-border bg-card px-4 py-2 lg:px-6">
            <div className="flex gap-2 items-end">
              {/* <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Mic className="h-5 w-5" />
              </Button> */}

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
                disabled={!input.trim() || isLoading || isResponding}
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
    if (!input.trim() || isLoading || isResponding) return;

    dispatchMessage();
  };

  async function resendMessage() {
    dispatchMessage();
  }

  async function dispatchMessage() {
    try {
      await sendMessage(input);
      setInput("");
      setSentNewMessage(true);
      childRef.current?.sentMessageCallback();
      scrollToBottom();

    } catch (error) {
      errorToast("Error Sending Message", error.message)
    }
  }

  function scrollToBottom() {
    const scrollHeight = messagesEndRef.current?.parentElement?.scrollHeight;
    if (scrollHeight !== undefined) {
      messagesEndRef.current?.parentElement?.scrollTo({ top: scrollHeight, behavior: "smooth" });
    }
  }

  async function updateChatName(messages) {
    const chatTitle = await generateConversationTitle(messages);
    await changeChatName(chatID!, chatTitle);
    childRef.current?.refreshChats();
  }
}
