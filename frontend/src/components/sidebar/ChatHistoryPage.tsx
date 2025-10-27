"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  mockFullChatHistory,
  ChatHistoryItem,
  Message,
} from "@/utils/mock-search-history";
import ReactMarkdown from "react-markdown";
import { Clock, User, Sparkles, ArrowLeft, Search, Send } from "lucide-react";

type ChatHistoryDisplayProps = {
  initialChatId?: number; // Optional prop for direct access to a specific chat
};

export default function ChatHistoryDisplay({
  initialChatId,
}: ChatHistoryDisplayProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(mockFullChatHistory);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle chat selection from URL query param or initialChatId
  useEffect(() => {
    const idFromQuery = searchParams.get("id");
    const chatId = initialChatId || (idFromQuery ? Number(idFromQuery) : null);

    if (chatId) {
      const chat = chatHistory.find((c) => c.id === chatId);
      setSelectedChat(chat || null);
    } else {
      setSelectedChat(null);
    }
  }, [searchParams, initialChatId, chatHistory]);

  // Auto-scroll to bottom when chat changes
  useEffect(() => {
    if (selectedChat) {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    }
  }, [selectedChat?.id]);

  // Filter chats based on search
  const filteredChats = chatHistory.filter((chat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return chat.title.toLowerCase().includes(query);
  });

  // Handle sending messages
  const handleSend = () => {
    if (!inputText.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...(chat.messages || []), newMessage],
            }
          : chat
      )
    );

    setInputText("");
  };

  const handleChatSelect = (chatId: number) => {
    router.push(`/chat/history?id=${chatId}`);
  };

  const handleBackToHistory = () => {
    router.push("/chat/history");
  };

  // Helper to format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-full bg-neutral-white overflow-hidden">
      {/* Sidebar - Chat History List */}
      <div
        className={`${
          selectedChat ? "hidden lg:flex" : "flex"
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
            <h1 className="text-xl font-bold text-neutral-900">Chat History</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-sm">
              No chats found
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${
                  selectedChat?.id === chat.id ? "bg-secondary-50" : ""
                }`}
              >
                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900 truncate">
                      {chat.title}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">{chat.timestamp}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`${
          selectedChat ? "flex" : "hidden lg:flex"
        } flex-1 flex-col bg-white`}
      >
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <Clock className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
              <p className="text-sm">Select a chat to view conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
              <button
                onClick={handleBackToHistory}
                className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-700" />
              </button>
              <div className="w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center text-accent-700 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900">
                  {selectedChat.title}
                </h2>
                <p className="text-xs text-neutral-500">AI Assistant</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages && selectedChat.messages.length > 0 ? (
                <>
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-primary-500"
                            : "bg-secondary-500"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-accent-700" />
                        )}
                      </div>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          message.role === "user"
                            ? "bg-secondary-500 text-accent-700 rounded-br-sm"
                            : "bg-neutral-100 text-neutral-900 rounded-bl-sm"
                        }`}
                      >
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-accent-700/70"
                              : "text-neutral-500"
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p className="text-sm mb-2">No messages yet</p>
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
