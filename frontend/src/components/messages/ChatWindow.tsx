import React, { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";

interface Message {
  id: string;
  sender: "me" | "them";
  content: string;
  timestamp: string;
  product?: {
    image: string;
    title: string;
    price: string;
  };
}

interface ChatWindowProps {
  conversationName?: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onBack?: () => void;
}

export function ChatWindow({
  conversationName,
  messages,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages.length]);

  if (!conversationName) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-card">
        Select a conversation to view
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-card min-h-0">
      {/* Mobile Header */}
      {onBack && (
        <div className="lg:hidden p-4 border-b border-border bg-card flex items-center gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-lg">{conversationName}</h2>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              sender={m.sender}
              content={m.content}
              timestamp={m.timestamp}
              isCurrentUser={m.sender === "me"}
              product={m.product}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={onSendMessage} />
    </div>
  );
}
