"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, ArrowLeft, Send } from "lucide-react";
import "@/app/globals.css";

import {
  messagesData,
  conversationsData,
  ConversationData,
} from "@/utils/mock-messages";

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "general" | "market" | "ai"
  >("all");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [conversations, setConversations] =
    useState<ConversationData[]>(conversationsData);
  const [search, setSearch] = useState("");
  const [inputText, setInputText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null); // 👈 new ref for conversation list

  // Filtering logic (search + tabs)
  const normalizedSearch = search.trim().toLowerCase();
  const filteredMessages = messagesData.filter((m) => {
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

  const conversation = conversations.find(
    (c) => c.id === selectedMessageId || ""
  );

  // ✅ Reset conversation list scroll when closing a conversation (mobile)
  useEffect(() => {
    if (selectedMessageId === null && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [selectedMessageId]);

  // ✅ Add product message if needed when selecting a conversation
  useEffect(() => {
    if (!selectedMessageId) return;

    const selectedMsgData = messagesData.find(
      (m) => m.id === selectedMessageId
    );
    if (selectedMsgData?.product) {
      setConversations((prev) => {
        const found = prev.find((p) => p.id === selectedMessageId);

        const productMsgId = `prod-${selectedMessageId}`;

        if (found) {
          const hasProductMessage = found.messages.some(
            (msg) => msg.id === productMsgId
          );
          if (hasProductMessage) {
            return prev;
          }

          return prev.map((p) =>
            p.id === selectedMessageId
              ? {
                  ...p,
                  messages: [
                    {
                      id: productMsgId,
                      sender: selectedMsgData.name,
                      type: "product",
                      product: selectedMsgData.product,
                      timestamp: new Date().toLocaleTimeString(),
                    } as any,
                    ...p.messages,
                  ],
                }
              : p
          );
        } else {
          return [
            ...prev,
            {
              id: selectedMessageId,
              messages: [
                {
                  id: productMsgId,
                  sender: selectedMsgData.name,
                  type: "product",
                  product: selectedMsgData.product,
                  timestamp: new Date().toLocaleTimeString(),
                } as any,
              ],
            },
          ];
        }
      });
    }
  }, [selectedMessageId]);

  // ✅ Auto-scroll to bottom when opening conversation or sending messages
  useEffect(() => {
    if (!conversation) return;
    const t = setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
    return () => clearTimeout(t);
  }, [conversation?.messages.length, selectedMessageId]);

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
                  {
                    id: `m${Date.now()}`,
                    sender: "me",
                    content: text,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ],
              }
            : p
        );
      }
      return [
        ...prev,
        {
          id: selectedMessageId,
          messages: [
            {
              id: `m${Date.now()}`,
              sender: "me",
              content: text,
              timestamp: new Date().toLocaleTimeString(),
            },
          ],
        },
      ];
    });
    setInputText("");
  }

  return (
    <div className="h-[var(--sidebar-height)] flex flex-col lg:flex-row bg-background text-foreground overflow-x-hidden">
      {/* LEFT PANEL */}
      <div
        className={`w-full lg:w-1/3 xl:w-1/4 border-r border-border bg-card ${
          selectedMessageId ? "hidden lg:flex" : "flex lg:flex"
        } flex-col`}
      >
        {/* Search & Tabs */}
        <div className="p-4 border-b border-border bg-card sticky top-0 z-1">
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
              { key: "general", label: "General" },
              { key: "market", label: "Market" },
              { key: "ai", label: "AI" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  activeTab === tab.key
                    ? "bg-secondary-600 text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto divide-y divide-border pb-28 scroll-mt-16"
        >
          {filteredMessages.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No conversations found
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 p-4 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setSelectedMessageId(msg.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && setSelectedMessageId(msg.id)
                }
              >
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {msg.name[0]}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-card ${
                      msg.status === "online"
                        ? "bg-success-500"
                        : msg.status === "always"
                        ? "bg-secondary-600"
                        : "bg-neutral-400"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-semibold truncate">{msg.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {msg.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {msg.message}
                  </p>

                  {msg.product && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-card p-2">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={msg.product.image}
                          alt={msg.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {msg.product.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-semibold">
                          {msg.product.price}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {msg.unread > 0 && (
                  <div className="ml-2 flex items-center justify-center h-6 w-6 rounded-full bg-secondary-500 text-neutral-white text-xs font-bold">
                    {msg.unread}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className={`flex-1 flex-col bg-card ${
          selectedMessageId ? "flex" : "hidden lg:flex"
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-border bg-card sticky top-0 flex items-start gap-3 z-1">
          <button
            onClick={() => setSelectedMessageId(null)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col justify-center">
            <h2 className="font-semibold text-lg leading-tight">
              {selectedMessageId
                ? messagesData.find((m) => m.id === selectedMessageId)?.name
                : "Messages"}
            </h2>
          </div>
        </div>

        {/* Conversation body */}
        {conversation ? (
          <div className="flex-1 p-4 overflow-y-auto space-y-3 pb-28">
            {conversation.messages.map((m) =>
              m.product ? (
                <div key={m.id} className="flex justify-start">
                  <div className="bg-muted rounded-2xl p-3 max-w-[75%]">
                    <div className="relative h-32 w-full rounded-lg overflow-hidden mb-2">
                      <Image
                        src={m.product.image}
                        alt={m.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="font-semibold">{m.product.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {m.product.price}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                      m.sender === "me"
                        ? "bg-secondary-600 text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    <div>{m.content}</div>
                    <div
                      className={`text-xs text-muted-foreground mt-1 ${
                        m.sender === "me"
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground pb-28">
            Select a conversation to view
          </div>
        )}

        {/* Input area */}
        {selectedMessageId && (
          <div className="p-4 border-t border-border bg-muted flex items-center gap-2 lg:gap-3 sticky bottom-15 lg:bottom-0">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-lg bg-card border border-border px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-lg bg-secondary-500 text-white hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
