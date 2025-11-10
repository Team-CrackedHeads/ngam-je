"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Message {
  role: "user" | "agent";
  content: string;
}

interface ParlantChatProps {
  listingType: "buy" | "sell";
  sessionId: string;
  onComplete: (gatheredInfo: any) => void;
}

export default function ParlantChat({
  listingType,
  sessionId,
  onComplete,
}: ParlantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      handleSendMessage("Hi");
    }
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text && !messageText) return;

    // Add user message to chat
    if (!messageText) {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setInput("");
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/parlant/chat`,
        {
          session_id: sessionId,
          message: text,
          listing_type: listingType,
        },
        {
          timeout: 30000,
        }
      );

      // Add agent response to chat
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: response.data.agent_response },
      ]);

      setCurrentStage(response.data.current_stage);

      // Check if conversation is complete
      if (response.data.is_complete) {
        onComplete(response.data.gathered_info);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "agent"
                  ? "bg-[var(--color-secondary-500)]"
                  : "bg-[var(--color-primary-500)]"
              }`}
            >
              {message.role === "agent" ? (
                <Bot className="w-5 h-5 text-black" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.role === "agent"
                  ? "bg-white text-gray-900 border border-gray-200"
                  : "bg-[var(--color-primary-600)] text-white"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-secondary-500)]">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Current Stage Indicator */}
      {currentStage && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 text-xs text-gray-600">
          Stage: {currentStage.replace("_", " ")}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)] disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black px-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
