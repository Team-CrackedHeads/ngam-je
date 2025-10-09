"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  X,
  Send,
  Sparkles,
  User,
  MessageSquare,
  Clock,
  Zap,
  Search,
  DollarSign,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type SidebarAIChatProps = {
  isOpen: boolean;
  onClose: () => void;
  chatId: number | null;
  initialMessages?: Message[];
};

type ToolCall = {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: string;
  duration?: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
};

type Tab = "chat" | "history";
type Mode = "reactive" | "proactive";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "**Ngam AI** activated!\n\nI'm your intelligent marketplace assistant. I can:\n\n• **Search & Compare**: Find best deals across listings\n\n• **Verify Sellers**: Check ratings and authenticity\n\n• **Price Tracking**: Monitor items and alert you to deals\n\n• **Smart Analysis**: Break down complex marketplace tasks\n\nSwitch between **Reactive** (I respond) and **Proactive** (I take initiative) modes using the toggle below.\n\nWhat can I help you find today?",
  timestamp: new Date(),
};

// Mock data for demo
const mockHistoryChats = [
  { id: 1, title: "iPhone 14 Pro price comparison", date: "2 hours ago" },
  { id: 2, title: "Gaming PC under RM4000", date: "5 hours ago" },
  { id: 3, title: "Verify Nintendo Switch seller", date: "1 day ago" },
];

export default function SidebarAIChat({
  isOpen,
  onClose,
  chatId,
  initialMessages = [],
}: SidebarAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [mode, setMode] = useState<Mode>("reactive");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (chatId === null) {
      setMessages([WELCOME_MESSAGE]);
    } else {
      if (initialMessages.length > 0) {
        setMessages(initialMessages);
      } else {
        setMessages([WELCOME_MESSAGE]);
      }
    }
    setActiveTab("chat");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      inputRef.current?.focus();
    }
  }, [isOpen, activeTab]);

  // Simulate AI with tool calls (Claude CLI style)
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking with tool execution
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Let me help you with that. I'll search our listings and analyze the best options...",
        timestamp: new Date(),
        toolCalls: [
          { name: "search_listings", status: "pending" },
          { name: "compare_prices", status: "pending" },
          { name: "verify_sellers", status: "pending" },
        ],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);

      // Simulate tool execution
      simulateToolExecution(aiMessage.id);
    }, 800);
  };

  const simulateToolExecution = (messageId: string) => {
    // Tool 1: Search
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                toolCalls: msg.toolCalls?.map((tool) =>
                  tool.name === "search_listings"
                    ? { ...tool, status: "running" }
                    : tool
                ),
              }
            : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                toolCalls: msg.toolCalls?.map((tool) =>
                  tool.name === "search_listings"
                    ? {
                        ...tool,
                        status: "completed",
                        result: "Found 12 listings",
                        duration: 1.2,
                      }
                    : tool
                ),
              }
            : msg
        )
      );
    }, 1700);

    // Tool 2: Compare
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                toolCalls: msg.toolCalls?.map((tool) =>
                  tool.name === "compare_prices"
                    ? { ...tool, status: "running" }
                    : tool
                ),
              }
            : msg
        )
      );
    }, 1800);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                toolCalls: msg.toolCalls?.map((tool) =>
                  tool.name === "compare_prices"
                    ? {
                        ...tool,
                        status: "completed",
                        result: "Best price: RM3,500",
                        duration: 0.8,
                      }
                    : tool
                ),
              }
            : msg
        )
      );
    }, 2600);

    // Tool 3: Verify
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                toolCalls: msg.toolCalls?.map((tool) =>
                  tool.name === "verify_sellers"
                    ? { ...tool, status: "running" }
                    : tool
                ),
              }
            : msg
        )
      );
    }, 2700);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                toolCalls: msg.toolCalls?.map((tool) =>
                  tool.name === "verify_sellers"
                    ? {
                        ...tool,
                        status: "completed",
                        result: "8 verified sellers",
                        duration: 1.0,
                      }
                    : tool
                ),
              }
            : msg
        )
      );

      // Final response
      const finalMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          "✅ **Analysis Complete!**\n\nI found **12 gaming PCs** under RM4000. Here are your best options:\n\n1. **RTX 4070 Gaming PC** - RM3,500 (Verified seller)\n2. **Custom Build RTX 4060 Ti** - RM3,200 (Top rated)\n3. **Pre-built Gaming Rig** - RM3,800 (Like new)\n\nAll sellers have 4.5+ ratings. Would you like me to track prices or get more details on any listing?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, finalMessage]);
    }, 3700);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMode = () => {
    const newMode = mode === "reactive" ? "proactive" : "reactive";
    setMode(newMode);

    // Show mode change message
    const modeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Switched to **${
        newMode === "proactive" ? "Proactive" : "Reactive"
      }** mode.\n\n${
        newMode === "proactive"
          ? "I'll now actively monitor listings, track prices, and alert you to opportunities automatically."
          : "I'll respond to your requests and questions as you ask them."
      }`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, modeMessage]);
  };

  // Tool icon helper
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case "search_listings":
        return <Search className="w-3 h-3" />;
      case "compare_prices":
        return <DollarSign className="w-3 h-3" />;
      case "verify_sellers":
        return <ShieldCheck className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  const getToolLabel = (toolName: string) => {
    switch (toolName) {
      case "search_listings":
        return "Searching Listings";
      case "compare_prices":
        return "Comparing Prices";
      case "verify_sellers":
        return "Verifying Sellers";
      default:
        return toolName;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-0 md:p-4">
      <div className="w-full h-full md:w-full md:max-w-2xl md:h-[90vh] md:rounded-2xl bg-gradient-to-br from-primary-50 via-primary-100 to-secondary-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col px-4 md:px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-accent-700">Ngam AI</h2>
                <p className="text-xs text-accent-500">
                  {chatId === null ? "New conversation" : "Continuing chat"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-primary-200 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-accent-600" />
            </button>
          </div>

          {/* Tabs - Only Chat & History */}
          <div className="flex gap-1 bg-primary-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "chat"
                  ? "bg-white text-accent-700 shadow-sm"
                  : "text-accent-500 hover:text-accent-700"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "history"
                  ? "bg-white text-accent-700 shadow-sm"
                  : "text-accent-500 hover:text-accent-700"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              History
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-accent-700"
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
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-secondary-500 text-accent-700"
                            : "bg-white text-accent-700 border border-primary-200"
                        }`}
                      >
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-accent-700 prose-strong:font-bold">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        <span className="text-[10px] opacity-60 mt-1 block">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Tool Calls (Claude CLI style) - Using your gold colors! */}
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="ml-11 mt-2 space-y-1.5">
                        {message.toolCalls.map((tool, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg font-mono transition-all ${
                              tool.status === "completed"
                                ? "bg-secondary-100 border border-secondary-300"
                                : tool.status === "running"
                                ? "bg-secondary-50 border border-secondary-200"
                                : tool.status === "failed"
                                ? "bg-error-50 border border-red-200"
                                : "bg-primary-50 border border-primary-200"
                            }`}
                          >
                            {tool.status === "running" && (
                              <Loader2 className="w-3 h-3 animate-spin text-secondary-600" />
                            )}
                            {tool.status === "completed" && (
                              <CheckCircle2 className="w-3 h-3 text-secondary-700" />
                            )}
                            {tool.status === "failed" && (
                              <XCircle className="w-3 h-3 text-error-500" />
                            )}
                            {tool.status === "pending" && (
                              <div className="w-3 h-3 text-accent-400">
                                {getToolIcon(tool.name)}
                              </div>
                            )}

                            <span className="text-accent-700 font-semibold">
                              [{tool.name}]
                            </span>

                            <span className="text-accent-600 flex-1">
                              {tool.status === "pending" && "Queued"}
                              {tool.status === "running" &&
                                getToolLabel(tool.name) + "..."}
                              {tool.status === "completed" && tool.result}
                              {tool.status === "failed" && "Failed"}
                            </span>

                            {tool.status === "completed" && tool.duration && (
                              <span className="text-secondary-600 font-medium text-[10px]">
                                {tool.duration}s
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-accent-700" />
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-3 border border-primary-200">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 rounded-full bg-accent-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-accent-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-accent-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="px-4 md:px-6 py-4">
              <h3 className="text-sm font-semibold text-accent-700 mb-3">
                Recent Conversations
              </h3>
              <div className="space-y-2">
                {mockHistoryChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-3 bg-white rounded-lg border border-primary-200 hover:border-secondary-500 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="font-medium text-sm text-accent-700 mb-1">
                      {chat.title}
                    </div>
                    <div className="text-xs text-accent-400">{chat.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 bg-white/80 backdrop-blur-sm border-t border-primary-200">
          {activeTab === "chat" && (
            <>
              {/* Mode Toggle (inside chat) */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs text-accent-500">AI Mode:</span>
                <button
                  onClick={toggleMode}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    mode === "proactive"
                      ? "bg-secondary-100 border-secondary-300 hover:bg-secondary-200"
                      : "bg-white border-primary-300 hover:bg-primary-50"
                  }`}
                >
                  <Zap
                    className={`w-3 h-3 ${
                      mode === "proactive"
                        ? "text-secondary-700"
                        : "text-accent-400"
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      mode === "proactive"
                        ? "text-secondary-700"
                        : "text-accent-700"
                    }`}
                  >
                    {mode === "proactive" ? "Proactive" : "Reactive"}
                  </span>
                </button>
              </div>

              {/* Input */}
              <div className="flex gap-3 items-end">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me to find, compare, or track items..."
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-primary-300 text-accent-700 placeholder-accent-400 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="w-12 h-12 rounded-xl bg-secondary-500 hover:bg-secondary-600 disabled:bg-primary-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5 text-accent-700" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
