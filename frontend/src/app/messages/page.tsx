"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, ArrowLeft } from "lucide-react";
import "@/app/globals.css";

type ProductInfo = { title: string; price: string; image: string };
type MessagePreview = {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  status: "online" | "offline" | "always";
  product?: ProductInfo;
};
type ConversationMessage = {
  id: string;
  sender: "me" | "them";
  content: string;
  timestamp: string;
};
type ConversationData = { id: string; messages: ConversationMessage[] };

/* ---------- Placeholder data (swap with backend later) ---------- */
const messagesData: MessagePreview[] = [
  {
    id: "1",
    name: "SneakerHead99",
    message: "Hey! Is the Nike Air Max still available? I'm very intereste...",
    time: "2 min ago",
    unread: 2,
    status: "online",
    product: { title: "Nike Air Max - Blue/Orange", price: "$299.9", image: "/shoe.png" },
  },
  {
    id: "2",
    name: "AI Assistant",
    message: "I found 3 MacBook Pro listings that match your criteria...",
    time: "5 min ago",
    unread: 1,
    status: "always",
  },
  {
    id: "3",
    name: "VintageVibes",
    message: "You: Perfect! I'll take it. When can we meet?",
    time: "1 hour ago",
    unread: 0,
    status: "offline",
    product: { title: "Vintage Leather Jacket", price: "$200", image: "/jacket.png" },
  },
];

const conversationsData: ConversationData[] = [
  {
    id: "1",
    messages: [
      { id: "m1", sender: "them", content: "Hey! Is the Nike Air Max still available?", timestamp: "10:00 AM" },
      { id: "m2", sender: "me", content: "Yes, it's still available!", timestamp: "10:01 AM" },
      { id: "m3", sender: "them", content: "Awesome, can you hold it for me until tomorrow?", timestamp: "10:02 AM" },
    ],
  },
  {
    id: "2",
    messages: [{ id: "m1", sender: "them", content: "I found 3 MacBook Pro listings that match your criteria.", timestamp: "9:30 AM" }],
  },
  {
    id: "3",
    messages: [
      { id: "m1", sender: "me", content: "Perfect! I'll take it. When can we meet?", timestamp: "Yesterday" },
      { id: "m2", sender: "them", content: "Tomorrow evening works for me.", timestamp: "Yesterday" },
    ],
  },
];

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<"all" | "marketplace" | "ai">("all");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationData[]>(conversationsData);
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Filtering logic (search + tabs)
  const normalizedSearch = search.trim().toLowerCase();
  const filteredMessages = messagesData.filter((m) => {
    // Tab filter
    if (activeTab === "marketplace" && !m.product) return false;
    if (activeTab === "ai" && !((m.name || "").toLowerCase().includes("ai") || m.status === "always"))
      return false;
    // Search filter
    if (!normalizedSearch) return true;
    const hay = `${m.name} ${m.message}`.toLowerCase();
    return hay.includes(normalizedSearch);
  });

  // Get currently selected conversation
  const conversation = conversations.find((c) => c.id === selectedMessageId ?? "");

  // auto-scroll to bottom when conversation changes or new message appended
  useEffect(() => {
    if (!conversation) return;
    // small timeout to ensure DOM updated
    const t = setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    return () => clearTimeout(t);
  }, [conversation?.messages.length, selectedMessageId]);

  // Send message (local state)
  function handleSend() {
    const text = inputText.trim();
    if (!text || !selectedMessageId) return;
    setConversations((prev) => {
      const found = prev.find((p) => p.id === selectedMessageId);
      if (found) {
        return prev.map((p) =>
          p.id === selectedMessageId
            ? {
                ...p,
                messages: [
                  ...p.messages,
                  { id: `m${Date.now()}`, sender: "me", content: text, timestamp: new Date().toLocaleTimeString() },
                ],
              }
            : p
        );
      }
      // conversation doesn't exist yet -> create
      return [
        ...prev,
        { id: selectedMessageId, messages: [{ id: `m${Date.now()}`, sender: "me", content: text, timestamp: new Date().toLocaleTimeString() }] },
      ];
    });
    setInputText("");
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* LEFT PANEL (Conversation List) */}
      <div
        className={`w-full md:w-1/3 lg:w-1/4 border-r border-border bg-card ${
          selectedMessageId ? "hidden md:flex" : "flex md:flex"
        } flex-col`}
      >
        {/* Search & Tabs */}
        <div className="p-4 border-b border-border bg-card sticky top-0 z-10">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-ring outline-none"
            />
          </div>

          <div className="flex gap-2 text-sm font-medium">
            {[
              { key: "all", label: `All (${messagesData.length})` },
              { key: "marketplace", label: "Marketplace" },
              { key: "ai", label: "AI" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  activeTab === tab.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border pb-28">
          {filteredMessages.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No conversations found</div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 p-4 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setSelectedMessageId(msg.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedMessageId(msg.id)}
              >
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {msg.name[0]}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-card ${
                      msg.status === "online" ? "bg-green-500" : msg.status === "always" ? "bg-secondary-500" : "bg-neutral-400"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-semibold truncate">{msg.name}</p>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{msg.message}</p>

                  {msg.product && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                        <Image src={msg.product.image} alt={msg.product.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{msg.product.title}</p>
                        <p className="text-xs text-muted-foreground font-semibold">{msg.product.price}</p>
                      </div>
                    </div>
                  )}
                </div>

                {msg.unread > 0 && (
                  <div className="ml-2 flex items-center justify-center h-6 w-6 rounded-full bg-secondary-500 text-white text-xs font-bold">
                    {msg.unread}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL (Conversation View) */}
      <div className={`flex-1 flex-col bg-card ${selectedMessageId ? "flex" : "hidden md:flex"}`}>
        {/* Mobile Header (top-aligned) */}
        <div className="md:hidden p-4 border-b border-border bg-card sticky top-0 z-10 flex items-start gap-3">
          <button onClick={() => setSelectedMessageId(null)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col justify-center">
            <h2 className="font-semibold text-lg leading-tight">{selectedMessageId ? messagesData.find((m) => m.id === selectedMessageId)?.name : "Messages"}</h2>
          </div>
        </div>

        {/* Conversation body */}
        {conversation ? (
          <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-28">
            {conversation.messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.sender === "me" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"}`}>
                  <div>{m.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">{m.timestamp}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground pb-28">Select a conversation to view</div>
        )}

        {/* Input area */}
        {selectedMessageId && (
          <div className="p-4 border-t border-border bg-muted flex items-center gap-2 md:gap-3 sticky bottom-0">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-lg bg-card border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
