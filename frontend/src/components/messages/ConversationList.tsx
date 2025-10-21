import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem } from "./ConversationItem";

interface MessageData {
  id: string;
  name: string;
  message: string;
  time: string;
  status: "online" | "offline" | "always";
  unread: number;
  type?: string;
  product?: {
    image: string;
    title: string;
    price: string;
  };
}

interface ConversationListProps {
  messages: MessageData[];
  activeTab: "all" | "general" | "market" | "ai";
  searchQuery: string;
  selectedMessageId: string | null;
  onTabChange: (tab: "all" | "general" | "market" | "ai") => void;
  onSearchChange: (query: string) => void;
  onSelectMessage: (id: string) => void;
}

export function ConversationList({
  messages,
  activeTab,
  searchQuery,
  selectedMessageId,
  onTabChange,
  onSearchChange,
  onSelectMessage,
}: ConversationListProps) {
  // Filter logic
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredMessages = messages.filter((m) => {
    let messageConversationType: "general" | "product" | "ai";
    if (m.product) {
      messageConversationType = "product";
    } else if ((m.type || "").toLowerCase().includes("ai")) {
      messageConversationType = "ai";
    } else {
      messageConversationType = "general";
    }

    if (activeTab === "general" && messageConversationType !== "general") {
      return false;
    }
    if (activeTab === "market" && messageConversationType !== "product") {
      return false;
    }
    if (activeTab === "ai" && messageConversationType !== "ai") {
      return false;
    }

    if (normalizedSearch) {
      const hay = `${m.name} ${m.message}`.toLowerCase();
      return hay.includes(normalizedSearch);
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search & Tabs */}
      <div className="p-4 border-b border-border bg-card flex-shrink-0 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            type="text"
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "all" | "general" | "market" | "ai")}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({messages.length})</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {filteredMessages.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground text-center">
            No conversations found
          </div>
        ) : (
          <div>
            {filteredMessages.map((msg) => (
              <ConversationItem
                key={msg.id}
                {...msg}
                isActive={selectedMessageId === msg.id}
                onClick={() => onSelectMessage(msg.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
