"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown"; // Ensure this is imported

interface Message {
  role: "user" | "model";
  text: string;
}

interface AIChatbotProps {
  listingId: string;
  listingTitle: string; // Pass listing title for context in UI
}

const AIChatbot: React.FC<AIChatbotProps> = ({ listingId, listingTitle }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: `Hello! I'm an AI assistant for the listing "${listingTitle}". What would you like to know about it?` },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          userMessage: userMessage.text,
          // Pass only the relevant parts of the history for Gemini
          chatHistory: messages.map(msg => ({ role: msg.role, text: msg.text })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response.");
      }

      const data = await response.json();
      const aiResponse: Message = { role: "model", text: data.response };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      console.error("Chatbot error:", err);
      setError(err.message || "An unexpected error occurred while chatting.");
      setMessages((prev) => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-card backdrop-blur-md rounded-2xl shadow-lg border-2 border-border flex flex-col h-[500px] lg:h-[600px] mb-6">
      {/* Header */}
      <div className="w-full bg-secondary-subtle px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-secondary-500">
          <Bot className="w-4 h-4 md:w-5 md:h-5 text-accent-700" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-foreground">AI Chatbot</h3>
      </div>

      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg shadow-sm ${
                msg.role === "user"
                  ? "bg-primary-500 text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              <div className="flex items-center mb-1">
                {msg.role === "model" && <Bot className="w-4 h-4 mr-2 text-accent-700" />}
                {msg.role === "user" && <User className="w-4 h-4 mr-2 text-white" />}
                <span className="font-semibold text-sm">
                  {msg.role === "user" ? "You" : "Ngam AI"}
                </span>
              </div>
              {/* --- FIX APPLIED HERE --- */}
              <div className="prose prose-sm max-w-none text-inherit">
                <ReactMarkdown>
                  {msg.text}
                </ReactMarkdown>
              </div>
              {/* --- END FIX --- */}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg shadow-sm bg-muted text-foreground flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-accent-700" />
              <span className="font-semibold text-sm">Ngam AI is thinking...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200 text-sm">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t-2 border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this listing..."
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-lg bg-secondary-500 text-white hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground text-center">
          AI-generated content may contain inaccuracies.
        </p>
      </div>
    </div>
  );
};

export default AIChatbot;