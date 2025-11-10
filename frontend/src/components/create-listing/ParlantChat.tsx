"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Message {
  role: "user" | "agent";
  content: string;
}

interface ParlantChatProps {
  listingType: "buy" | "sell";
  agentId: string;
  onComplete?: (gatheredInfo: any) => void;
}

const PARLANT_SERVER_URL = "http://localhost:8800";

export default function ParlantChat({
  listingType,
  agentId,
  onComplete,
}: ParlantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastOffset, setLastOffset] = useState<number>(0);
  const [agentStatus, setAgentStatus] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session when component mounts
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const response = await axios.post(`${PARLANT_SERVER_URL}/sessions`, {
          agent_id: agentId,
          title: `${listingType} Listing - ${new Date().toLocaleString()}`,
        });

        setSessionId(response.data.id);
      } catch (error) {
        console.error("Failed to create session:", error);
        setMessages([{
          role: "agent",
          content: "Failed to connect to chat. Please try again.",
        }]);
      }
    };

    initializeSession();
  }, [agentId, listingType]);

  // Use React Query for polling events (like parlant-chat-react does)
  const { data: eventsData } = useQuery({
    queryKey: ['events', sessionId, lastOffset],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await axios.get(`${PARLANT_SERVER_URL}/sessions/${sessionId}/events`, {
        params: {
          min_offset: lastOffset,
          wait_for_data: 60, // Long polling like parlant-chat-react
        },
      });
      return response.data;
    },
    enabled: !!sessionId,
    refetchInterval: 2000, // Poll every 2 seconds
  });

  // Process new events
  useEffect(() => {
    if (!eventsData || eventsData.length === 0) return;

    const lastEvent = eventsData[eventsData.length - 1];
    if (lastEvent?.offset !== undefined) {
      setLastOffset(lastEvent.offset + 1);
    }

    // Find the last status event
    const lastStatusEvent = eventsData.findLast((e: any) => e.kind === "status");
    if (lastStatusEvent) {
      const status = lastStatusEvent.data?.status;
      if (status === "processing") {
        const stage = lastStatusEvent.data?.data?.stage || "Thinking";
        setAgentStatus(`${stage}...`);
      } else if (status === "typing") {
        setAgentStatus("Typing...");
      } else if (status === "ready") {
        setAgentStatus("");
      }
    }

    // Filter and add agent messages
    eventsData.forEach((event: any) => {
      if (event.kind === "message" && event.source === "ai_agent") {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(m => m.content === event.data.message);
          if (exists) return prev;

          // Clear status when message arrives
          setAgentStatus("");

          return [
            ...prev,
            {
              role: "agent",
              content: event.data.message,
            },
          ];
        });
      }
    });
  }, [eventsData]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !sessionId) return;

    // Add user message to chat immediately
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    try {
      // Send message event to Parlant (using their exact format)
      await axios.post(`${PARLANT_SERVER_URL}/sessions/${sessionId}/events`, {
        kind: "message",
        source: "customer",
        message: text, // They use "message" directly, not "data.message"
      });
    } catch (error) {
      console.error("Failed to send message:", error);
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

        {/* Agent status indicator */}
        {agentStatus && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-secondary-500)]">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">{agentStatus}</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-2">
          <input
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
