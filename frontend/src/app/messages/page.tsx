"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Search, Send } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { messagesData, conversationsData, ConversationData } from "@/utils/mock-all-data-used";

export default function MessagesPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationData[]>(conversationsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedMsg = messagesData.find((m) => m.id === selectedId);
  const conversation = conversations.find((c) => c.id === selectedId);

  // Filter messages based on search
  const filteredMessages = messagesData.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(query) || m.message.toLowerCase().includes(query);
  });

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (conversation) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [conversation, conversation?.messages.length]);

  // Add product message when selecting a conversation with a product
  useEffect(() => {
    if (!selectedId) return;
    const msg = messagesData.find((m) => m.id === selectedId);
    if (!msg?.product) return;

    setConversations((prev) => {
      const existing = prev.find((c) => c.id === selectedId);
      const productMsgId = `prod-${selectedId}`;

      if (existing) {
        if (existing.messages.some((m) => m.id === productMsgId)) return prev;
        return prev.map((c) =>
          c.id === selectedId
            ? {
              ...c,
              messages: [
                {
                  id: productMsgId,
                  sender: "them" as const,
                  content: "",
                  timestamp: new Date().toLocaleTimeString(),
                  product: msg.product,
                },
                ...c.messages,
              ],
            }
            : c
        );
      }

      return [
        ...prev,
        {
          id: selectedId,
          messages: [
            {
              id: productMsgId,
              sender: "them" as const,
              content: "",
              timestamp: new Date().toLocaleTimeString(),
              product: msg.product,
            },
          ],
        },
      ];
    });
  }, [selectedId]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedId) return;

    setConversations((prev) => {
      const existing = prev.find((c) => c.id === selectedId);
      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: "me" as const,
        content: inputText.trim(),
        timestamp: new Date().toLocaleTimeString(),
      };

      if (existing) {
        return prev.map((c) => (c.id === selectedId ? { ...c, messages: [...c.messages, newMsg] } : c));
      }

      return [...prev, { id: selectedId, messages: [newMsg] }];
    });

    setInputText("");
  };

  return (
    <div className="flex h-full bg-neutral-white overflow-hidden px-0">
      {/* Sidebar - Conversations List */}
      <div
        className={`${selectedId ? "hidden lg:flex" : "flex"
          } w-full lg:w-80 flex-col bg-neutral-white border-r border-neutral-200`}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/threads')}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </button>
            <h1 className="text-xl font-bold text-neutral-900">Messages</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-sm">No conversations found</div>
          ) : (
            filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedId(msg.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${selectedId === msg.id ? "bg-secondary-50" : ""
                  }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                    {msg.name[0]}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${msg.status === "online"
                      ? "bg-success-500"
                      : msg.status === "always"
                        ? "bg-secondary-500"
                        : "bg-neutral-400"
                      }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900 truncate">{msg.name}</span>
                    <span className="text-xs text-neutral-500 ml-2 flex-shrink-0">{msg.time}</span>
                  </div>
                  <p className="text-sm text-neutral-600 truncate">{msg.message}</p>

                  {msg.product && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-white rounded-lg border border-neutral-200">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                        <Image src={msg.product.image} alt={msg.product.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-900 truncate">{msg.product.title}</p>
                        <p className="text-xs text-secondary-600 font-semibold">{msg.product.price}</p>
                      </div>
                    </div>
                  )}
                </div>

                {msg.unread > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-500 text-white text-xs font-bold flex items-center justify-center">
                    {msg.unread}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedId ? "flex" : "hidden lg:flex"} flex-1 flex-col bg-white`}>
        {!selectedMsg ? (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <Image
                src="/messages-placeholder.svg"
                alt="Select a conversation"
                width={250}
                height={250}
                className="mx-auto mb-4"
              />
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
              <button
                onClick={() => setSelectedId(null)}
                className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-700" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                {selectedMsg.name[0]}
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900">{selectedMsg.name}</h2>
                <p className="text-xs text-neutral-500">
                  {selectedMsg.status === "online" ? "Active now" : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation && conversation.messages.length > 0 ? (
                <>
                  {conversation.messages.map((m) => {
                    if (m.product) {
                      return (
                        <div key={m.id} className="flex justify-start">
                          <div className="max-w-xs bg-neutral-100 rounded-2xl p-3">
                            <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2">
                              <Image src={m.product.image} alt={m.product.title} fill className="object-cover" />
                            </div>
                            <p className="font-semibold text-neutral-900">{m.product.title}</p>
                            <p className="text-sm text-secondary-600 font-semibold">{m.product.price}</p>
                            <p className="text-xs text-neutral-500 mt-1">{m.timestamp}</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${m.sender === "me"
                            ? "bg-secondary-500 text-accent-700 rounded-br-sm"
                            : "bg-neutral-100 text-neutral-900 rounded-bl-sm"
                            }`}
                        >
                          <p className="text-sm">{m.content}</p>
                          <p
                            className={`text-xs mt-1 ${m.sender === "me" ? "text-accent-700/70" : "text-neutral-500"
                              }`}
                          >
                            {m.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500">
                  <div className="text-center">
                    <Image
                      src="/sent-message.svg"
                      alt="No messages"
                      width={200}
                      height={200}
                      className="mx-auto mb-4"
                    />
                    <p className="text-sm mb-2">No messages yet</p>
                    <p className="text-xs">Type something to start the conversation</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neutral-200 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-3 bg-secondary-500 text-accent-700 rounded-lg hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
