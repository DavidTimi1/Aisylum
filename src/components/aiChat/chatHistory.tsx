import { SidebarOpenIcon, MessageSquare, Trash2, X, SidebarCloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/use-chat";
import { useState } from "react";
import { formatDistanceToNow } from 'date-fns';


export const ChatHistory = ({ activeChat, setActiveChat }) => {
  const { chats, loading, addChat, deleteChat } = useChats();
  const [isOpen, setIsOpen] = useState(false);

  const timePast = (date: Date) => formatDistanceToNow(date, { addSuffix: true });

  const handleDeleteChat = (id, e) => {
    e.stopPropagation();
    if (activeChat === id) {
      setActiveChat(null);
    }
    deleteChat(id);
  };

  const handleNewChat = () => {
    const chatName = `Chat ${chats.length + 1}`;
    addChat(chatName);
  };

  return (
    <div className="h-full relative">

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden size-dvh z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`size-full absolute transition-transform duration-300 ease-in-out md:translate-x-0 w-[calc(100vw-50px)] md:w-full ${isOpen ? "translate-x-0 z-30" : "-translate-x-full"
          }`}
      >
        <div className="size-full flex flex-col gap-2 bg-zinc-200 rounded-lg p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Chat History</h2>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleNewChat}>
                New Chat
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No conversations yet. Start a new chat to begin.
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat.id);
                    setIsOpen(false);
                  }}
                  className={`group flex items-start justify-between gap-2 p-3 rounded-md cursor-pointer transition-colors ${activeChat === chat.id
                      ? "bg-white shadow-sm"
                      : "bg-zinc-100 hover:bg-white"
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {chat.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {timePast(chat.lastModified)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile toggle button */}
        <Button
          size="icon"
          className="absolute md:hidden top-2 left-[calc(100%+10px)]"
          onClick={() => setIsOpen(!isOpen)}
        >
          {
            isOpen ? <SidebarCloseIcon /> : <SidebarOpenIcon />
          }
          <span className="sr-only"> {isOpen ? 'close' : 'open'} </span>
        </Button>
      </div>

    </div>
  );
};