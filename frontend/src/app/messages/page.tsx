"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { ArrowLeft, Search, Send, Loader2, Bot } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { useRouter, useSearchParams } from "next/navigation";
import { useClerkApiClient } from "@/lib/clerk-api-client";
import { useUser } from "@clerk/nextjs";
import type {
  ConversationResponse,
  MessageResponse,
  MessageListResponse,
  ConversationListResponse
} from "@/types/messages";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const apiClient = useClerkApiClient();

  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  // Fetch user's conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages]);

  // Handle recommendation query parameter - auto-select conversation
  useEffect(() => {
    const recommendationId = searchParams.get('recommendation');
    if (recommendationId && conversations.length > 0) {
      // Find conversation with this recommendation_id
      const conversation = conversations.find(c => c.recommendation_id === parseInt(recommendationId));
      if (conversation) {
        console.log('📧 Auto-selecting conversation for recommendation:', recommendationId, '-> conversation:', conversation.id);
        setSelectedConversationId(conversation.id);
      } else {
        console.warn('⚠️ No conversation found for recommendation:', recommendationId);
      }
    }
  }, [searchParams, conversations]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const client = await apiClient();
      const data = await client.get<ConversationListResponse>("/api/v1/conversations/user");
      setConversations(data.conversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true);
      setMessages([]); // Clear previous messages
      const client = await apiClient();
      const data = await client.get<MessageListResponse>(`/api/v1/messages/conversation/${conversationId}`);
      setMessages(data.messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedConversationId || sendingMessage) return;

    try {
      setSendingMessage(true);
      const client = await apiClient();

      const newMessage = await client.post<MessageResponse>("/api/v1/messages/", {
        conversation_id: selectedConversationId,
        content: inputText.trim(),
        message_type: "text"
      });

      // Add message to local state
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");

      // Update conversation's last_message_at in local state
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversationId
            ? { ...c, last_message_at: newMessage.created_at }
            : c
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Format timestamp to human-readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter conversations based on search (placeholder - will need enriched data)
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    // TODO: Search by other user name or listing title when we have that data
    return true;
  });

  return (
    <div className="flex h-full bg-neutral-white overflow-hidden px-0">
      {/* Sidebar - Conversations List */}
      <div
        className={`${
          selectedConversationId ? "hidden lg:flex" : "flex"
        } w-full lg:w-80 flex-col bg-neutral-white border-r border-neutral-200`}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push("/threads")}
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
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-secondary-500" />
              <span className="ml-2 text-sm text-neutral-500">Loading conversations...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-sm">
              No conversations yet. Match with someone to start chatting!
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${
                  selectedConversationId === conv.id ? "bg-secondary-50" : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                    {(conv.other_user_name || "?")[0].toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900 truncate">
                      {conv.other_user_name || "Unknown User"}
                    </span>
                    {conv.last_message_at && (
                      <span className="text-xs text-neutral-500 ml-2 flex-shrink-0">
                        {formatTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 truncate">
                    {conv.listing_title || "No listing"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConversationId ? "flex" : "hidden lg:flex"} flex-1 flex-col bg-white`}>
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <SafeImage
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
                onClick={() => setSelectedConversationId(null)}
                className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-700" />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                {(selectedConversation.other_user_name || "?")[0].toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900">
                  {selectedConversation.other_user_name || "Unknown User"}
                </h2>
                <p className="text-xs text-neutral-500">
                  {selectedConversation.listing_title || "No listing"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-secondary-500" />
                  <span className="ml-2 text-neutral-500">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-500">
                  <div className="text-center">
                    <SafeImage
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
              ) : (
                <>
                  {messages.map((msg) => {
                    // Determine message alignment based on type
                    let isCurrentUser: boolean;
                    let isSystemMessage = false;
                    let isAiMessage = false;
                    let aiLabel = "";

                    if (msg.message_type === "system") {
                      isSystemMessage = true;
                      isCurrentUser = false; // System messages show centered
                    } else if (msg.message_type === "ai_buyer") {
                      isCurrentUser = false; // AI buyer shows on left
                      isAiMessage = true;
                      aiLabel = "AI Buyer";
                    } else if (msg.message_type === "ai_seller") {
                      isCurrentUser = true; // AI seller shows on right
                      isAiMessage = true;
                      aiLabel = "AI Seller";
                    } else {
                      // Regular user messages: check sender_id
                      isCurrentUser = msg.sender_id !== selectedConversation.other_user_id;
                    }

                    // System messages (AI summary)
                    if (isSystemMessage) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <div className="max-w-md px-4 py-3 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200">
                            <p className="text-sm whitespace-pre-line">{msg.content}</p>
                            <p className="text-xs mt-1 text-amber-700">
                              {formatMessageTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    // AI messages with special styling
                    if (isAiMessage) {
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex flex-col items-start max-w-sm">
                            {/* AI Label */}
                            <div className={`flex items-center gap-1 mb-1 ${isCurrentUser ? "self-end" : "self-start"}`}>
                              <Bot className={`w-3 h-3 ${isCurrentUser ? "text-secondary-700" : "text-primary-700"}`} />
                              <span className={`text-xs font-medium ${isCurrentUser ? "text-secondary-700" : "text-primary-700"}`}>{aiLabel}</span>
                            </div>
                            {/* Message Bubble */}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isCurrentUser
                                  ? "bg-gradient-to-br from-secondary-400 to-secondary-600 text-accent-700 rounded-br-sm border border-secondary-300"
                                  : "bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-bl-sm border border-primary-300"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isCurrentUser ? "text-accent-700/70" : "text-white/80"}`}>
                                {formatMessageTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Regular user messages
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? "bg-secondary-500 text-accent-700 rounded-br-sm"
                              : "bg-neutral-100 text-neutral-900 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isCurrentUser ? "text-accent-700/70" : "text-neutral-500"
                            }`}
                          >
                            {formatMessageTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neutral-200 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !sendingMessage && handleSend()}
                disabled={sendingMessage}
                className="flex-1 px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || sendingMessage}
                className="p-3 bg-secondary-500 text-accent-700 rounded-lg hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingMessage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
