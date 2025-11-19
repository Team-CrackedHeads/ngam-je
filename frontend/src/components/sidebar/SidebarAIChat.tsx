"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { sendChatMessage } from "@/lib/api/ai-chat";
import {
  X,
  Send,
  Sparkles,
  User,
  MessageSquare,
  Clock,
  Search,
  DollarSign,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

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
  links?: Array<{
    text: string;
    url: string;
  }>;
};

type Tab = "chat" | "history";

export type ChatHistoryItem = {
  id: number;
  title: string;
  date: string;
  path: string;
};

type SidebarAIChatProps = {
  isOpen: boolean;
  onClose: () => void;
  // NOTE: chatId is now the unique path/identifier for the chat thread
  chatId: number | null;
  initialMessages?: Message[];
  // New prop to handle navigation when a history item is clicked
  onHistoryClick?: (chatId: string) => void;
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "**Ngam AI** activated!\n\nI'm your intelligent marketplace assistant. I can:\n\n• **Search & Compare**: Find best deals across listings\n\n• **Verify Sellers**: Check ratings and authenticity\n\n• **Personal Insights**: Analyze your listings and marketplace activity\n\n• **Smart Analysis**: Break down complex marketplace tasks\n\nWhat can I help you find today?",
  timestamp: new Date(),
};

// Loading messages for AI thinking
const LOADING_MESSAGES = [
  "Ngam is warming up...",
  "Ngam is thinking...",
  "Ngam is crawling...",
  "Almost there...",
];

// Mock data (renamed from mockHistoryChats for consistency with SearchHistory.tsx)
const mockHistory: ChatHistoryItem[] = [
  {
    id: 1,
    title: "iPhone 14 Pro price comparison",
    date: "2 hours ago",
    path: "/chat/history?id=1",
  },
  {
    id: 2,
    title: "Gaming PC under RM4000",
    date: "5 hours ago",
    path: "/chat/history?id=2",
  },
  {
    id: 3,
    title: "Verify Nintendo Switch seller",
    date: "1 day ago",
    path: "/chat/history?id=3",
  },
  {
    id: 4,
    title: "Gaming PC parts compatibility",
    date: "1 day ago",
    path: "/chat/history?id=4",
  },
  {
    id: 5,
    title: "Vintage watch authenticity verification",
    date: "2 days ago",
    path: "/chat/history?id=5",
  },
  {
    id: 6,
    title: "Camera lens condition assessment",
    date: "3 days ago",
    path: "/chat/history?id=6",
  },
  {
    id: 7,
    title: "Furniture quality vs price analysis",
    date: "4 days ago",
    path: "/chat/history?id=7",
  },
  {
    id: 8,
    title: "Electric bike safety standards",
    date: "5 days ago",
    path: "/chat/history?id=8",
  },
  {
    id: 9,
    title: "Designer handbag authentication tips",
    date: "1 week ago",
    path: "/chat/history?id=9",
  },
  {
    id: 10,
    title: "Motorcycle maintenance costs Honda",
    date: "1 week ago",
    path: "/chat/history?id=10",
  },
  {
    id: 11,
    title: "Smartphone trade-in value check",
    date: "1 week ago",
    path: "/chat/history?id=11",
  },
  {
    id: 12,
    title: "Laptop performance benchmarks",
    date: "1 week ago",
    path: "/chat/history?id=12",
  },
  {
    id: 13,
    title: "Art print value estimation",
    date: "2 weeks ago",
    path: "/chat/history?id=13",
  },
  {
    id: 14,
    title: "Kitchen appliance energy ratings",
    date: "2 weeks ago",
    path: "/chat/history?id=14",
  },
  {
    id: 15,
    title: "Exercise equipment durability test",
    date: "2 weeks ago",
    path: "/chat/history?id=15",
  },
  {
    id: 16,
    title: "Board game condition grading",
    date: "3 weeks ago",
    path: "/chat/history?id=16",
  },
  {
    id: 17,
    title: "Power tools safety inspection",
    date: "3 weeks ago",
    path: "/chat/history?id=17",
  },
  {
    id: 18,
    title: "Sneaker authenticity red flags",
    date: "3 weeks ago",
    path: "/chat/history?id=18",
  },
  {
    id: 19,
    title: "Home theater setup compatibility",
    date: "1 month ago",
    path: "/chat/history?id=19",
  },
  {
    id: 20,
    title: "Musical instrument condition check",
    date: "1 month ago",
    path: "/chat/history?id=20",
  },
];

export default function SidebarAIChat({
  isOpen,
  onClose,
  chatId,
  initialMessages = [],
}: SidebarAIChatProps) {
  const router = useRouter(); // Initialize useRouter
  const { getToken } = useAuth(); // Add Clerk auth
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 ? initialMessages : [WELCOME_MESSAGE]
  );
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // When the sidebar opens or the chat ID changes, reset/load messages
  useEffect(() => {
    if (!isOpen) return;

    if (chatId === null) {
      setMessages([WELCOME_MESSAGE]);
    } else if (initialMessages.length > 0) {
      // Load the initial messages if provided (simulating history load)
      setMessages(initialMessages);
    } else {
      // Fallback or loading state for a new chat
      setMessages([WELCOME_MESSAGE]);
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

  // Send message to real AI backend
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    const messageText = inputValue;
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Get auth token
      const token = await getToken();

      // Show a loading message with cycling text
      const loadingMessageId = (Date.now() + 1).toString();
      const randomLoadingMessage =
        LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
      const loadingMessage: Message = {
        id: loadingMessageId,
        role: "assistant",
        content: randomLoadingMessage,
        timestamp: new Date(),
        // No toolCalls - we just want to show the loading text
      };
      setMessages((prev) => [...prev, loadingMessage]);

      // Build conversation history (excluding the current user message and loading message)
      const conversationHistory = messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .filter((msg) => !msg.toolCalls) // Exclude loading messages with tool calls
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call the real API with conversation history
      const response = await sendChatMessage(token, messageText, conversationHistory);

      // Update with real response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                content: response.content,
                // No toolCalls - we don't want to show "[search_marketplace] Done"
                links: response.links,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("AI chat error:", error);
      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again or visit [all threads](/threads) to browse manually.",
        timestamp: new Date(),
        toolCalls: [{ name: "search_marketplace", status: "failed" }],
      };
      setMessages((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  // MODIFIED: This function now uses router.push to navigate to /chat/history
  const handleHistoryClick = (path: string) => {
    onClose(); // Close the sidebar
    router.push(path); // Navigate to the specified URL
    // The original onHistoryClick prop is no longer directly used for navigation here,
    // but it remains part of the component's interface.
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="w-full h-full md:w-full md:max-w-2xl md:h-[90vh] md:rounded-2xl bg-gradient-to-br from-primary-50 via-primary-100 to-secondary-50 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
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
                  {chatId === null
                    ? "New conversation"
                    : `Viewing thread ${chatId}`}
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
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                          <ReactMarkdown
                            components={{
                              a: ({ node, ...props }) => (
                                <a
                                  {...props}
                                  style={{
                                    color: "#F5CB5C",
                                    fontWeight: "bold",
                                    textDecoration: "none",
                                  }}
                                  className="hover:underline"
                                />
                              ),
                              strong: ({ node, ...props }) => (
                                <strong
                                  {...props}
                                  style={{
                                    fontWeight: "bold",
                                    color: "#1D1C1A",
                                  }}
                                />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Actionable Links */}
                        {message.links && message.links.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-primary-100 space-y-2">
                            {message.links.map((link, idx) => {
                              if (!link || !link.url) return null;
                              return (
                                <a
                                  key={idx}
                                  href={link.url}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    router.push(link.url);
                                  }}
                                  className="flex items-center gap-2 text-xs font-bold transition-colors group"
                                  style={{ color: "#F5CB5C" }}
                                >
                                  <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                  <span className="underline decoration-dotted underline-offset-2 hover:no-underline">
                                    {link.text}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        )}

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
                                ? "bg-red-50 border border-red-200"
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
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                            {tool.status === "pending" && (
                              <div className="w-3 h-3 text-accent-400">
                                {getToolIcon(tool.name)}
                              </div>
                            )}

                            <span className="text-accent-700 font-semibold">
                              [{getToolLabel(tool.name)}]
                            </span>

                            <span className="text-accent-600 flex-1">
                              {tool.status === "pending" && "Queued"}
                              {tool.status === "running" && "Executing tool..."}
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
                {mockHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleHistoryClick(chat.path)}
                    className="w-full p-3 flex justify-between items-center text-left bg-white rounded-lg border border-primary-200 hover:border-secondary-500 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="font-medium text-sm text-accent-700 mb-1">
                        {chat.title}
                      </div>
                      <div className="text-xs text-accent-400">{chat.date}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-accent-400 group-hover:text-secondary-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 bg-white/80 backdrop-blur-sm border-t border-primary-200">
          {activeTab === "chat" && (
            <>
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
