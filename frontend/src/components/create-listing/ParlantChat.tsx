"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import ChatTodoList, { TodoItem } from "./ChatTodoList";

interface Message {
  role: "user" | "agent" | "checklist" | "product_research";
  content: string;
  todoList?: TodoItem[];
  productResearch?: {
    productName: string;
    research: string;
  };
}

interface ParlantChatProps {
  listingType: "buy" | "sell";
  onComplete?: (gatheredInfo: any) => void;
  onFieldUpdate?: (field: string, value: any) => void;
}

const PARLANT_SERVER_URL = "http://localhost:8800";

export default function ParlantChat({
  listingType,
  onComplete,
  onFieldUpdate,
}: ParlantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastOffset, setLastOffset] = useState<number>(0);
  const [agentStatus, setAgentStatus] = useState<string>("");
  const [agentId, setAgentId] = useState<string | null>(null);
  const [pendingChecklistUpdate, setPendingChecklistUpdate] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Todo list state
  const [todoItems, setTodoItems] = useState<TodoItem[]>([
    { id: "title", label: "Title", completed: false },
    { id: "description", label: "Description", completed: false },
    { id: "images", label: "Images", completed: false },
    { id: "tags", label: "Tags", completed: false },
  ]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentStatus]);

  // Fetch the correct agent based on listing type
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await axios.get(`${PARLANT_SERVER_URL}/agents`);
        const agents = response.data;

        // Select agent based on listing type
        const agentName = listingType === "buy" ? "Buy Listing Assistant" : "Sell Listing Assistant";
        const agent = agents.find((a: any) => a.name === agentName);

        if (agent) {
          setAgentId(agent.id);
        } else {
          setMessages([{
            role: "agent",
            content: `${agentName} not found. Please restart the Parlant server.`,
          }]);
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        setMessages([{
          role: "agent",
          content: "Failed to connect to Parlant server.",
        }]);
      }
    };

    fetchAgent();
  }, [listingType]);

  // Initialize session when agent ID is available
  useEffect(() => {
    if (!agentId) return;

    const initializeSession = async () => {
      try {
        const response = await axios.post(`${PARLANT_SERVER_URL}/sessions`, {
          agent_id: agentId,
          title: `${listingType} Listing - ${new Date().toLocaleString()}`,
        });

        const newSessionId = response.data.id;
        setSessionId(newSessionId);

        // Agent is already selected based on listing type - no context registration needed
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
    const isAgentReady = lastStatusEvent?.data?.status === "ready";

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

    let shouldShowChecklist = false;

    // Filter and add agent messages
    eventsData.forEach((event: any) => {
      if (event.kind === "message" && event.source === "ai_agent") {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(m => m.content === event.data.message);
          if (exists) return prev;

          // Clear status when message arrives
          setAgentStatus("");

          const message = event.data.message;

          return [
            ...prev,
            {
              role: "agent",
              content: message,
            },
          ];
        });
      }

      // Handle tool events (Parlant uses "tool" not "tool_execution")
      if (event.kind === "tool") {
        // Check for tool_calls array
        if (event.data?.tool_calls && Array.isArray(event.data.tool_calls)) {
          event.data.tool_calls.forEach((toolCall: any) => {
            // Check if there's a result
            if (toolCall.result) {
              // Parse result if it's a string
              let resultData = toolCall.result;
              if (typeof resultData === 'string') {
                try {
                  resultData = JSON.parse(resultData);
                } catch (e) {
                  return;
                }
              }

              // Parlant wraps the actual data in result.data
              if (resultData && typeof resultData === 'object' && resultData.data) {
                resultData = resultData.data;
              }

              // Check if it's a dict/object with action field
              if (typeof resultData === 'object' && resultData !== null && resultData.action) {
                // Don't immediately handle show_checklist, just mark it
                if (resultData.action === 'show_checklist') {
                  shouldShowChecklist = true;
                } else {
                  handleToolResult(resultData);
                  shouldShowChecklist = true;
                }
              }
            }
          });
        }
      }
    });

    // Set pending state if tools were called
    if (shouldShowChecklist) {
      setPendingChecklistUpdate(true);
    }

    // Only update checklist when agent is ready (done sending all messages)
    console.log("Checklist update check:", { pendingChecklistUpdate, isAgentReady, lastStatus: lastStatusEvent?.data?.status });
    if (pendingChecklistUpdate && isAgentReady) {
      console.log("✅ Updating checklist!");
      updateChecklistInMessages();
      setPendingChecklistUpdate(false);
    }
  }, [eventsData, todoItems, pendingChecklistUpdate]);

  // Handle tool results to update form and checklist
  const handleToolResult = (result: any) => {
    const { action } = result;

    switch (action) {
      case "show_checklist":
        // Add checklist message to chat
        setMessages(prev => [
          ...prev,
          {
            role: "checklist",
            content: "",
            todoList: [...todoItems],
          }
        ]);
        break;

      case "set_title":
        if (result.title && onFieldUpdate) {
          onFieldUpdate("title", result.title);
          markTodoComplete("title");
        }
        break;

      case "set_description":
        if (result.description && onFieldUpdate) {
          onFieldUpdate("description", result.description);
          markTodoComplete("description");
        }
        break;

      case "add_images":
        if (result.images && onFieldUpdate) {
          onFieldUpdate("images", result.images);
          markTodoComplete("images");
        }
        break;

      case "set_tags":
        if (result.tags && onFieldUpdate) {
          onFieldUpdate("tags", result.tags);
          markTodoComplete("tags");
        }
        break;

      case "show_product_research":
        if (result.found && result.research) {
          setMessages(prev => [
            ...prev,
            {
              role: "product_research",
              content: "",
              productResearch: {
                productName: result.product_name,
                research: result.research,
              }
            }
          ]);
        }
        break;
    }
  };

  // Mark a todo item as complete and update checklist
  const markTodoComplete = (id: string) => {
    setTodoItems(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, completed: true } : item
      );

      // Update checklist in messages with the new state
      setMessages(msgs => {
        // Remove any existing checklist
        const withoutChecklist = msgs.filter(msg => msg.role !== "checklist");

        // Add updated checklist at the end
        return [
          ...withoutChecklist,
          {
            role: "checklist",
            content: "",
            todoList: updated,
          }
        ];
      });

      return updated;
    });
  };

  // Update checklist in messages - removes old checklist and adds new one after last agent message
  const updateChecklistInMessages = () => {
    setMessages(prev => {
      // Remove any existing checklist
      const withoutChecklist = prev.filter(msg => msg.role !== "checklist");

      // Add updated checklist at the end
      return [
        ...withoutChecklist,
        {
          role: "checklist",
          content: "",
          todoList: [...todoItems],
        }
      ];
    });
  };

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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <img
              src="/listing-chat-placeholder.svg"
              alt="Chat placeholder"
              className="w-48 h-48 mb-6"
            />
            <h3 className="text-xl font-semibold text-[var(--color-accent-700)] mb-2">
              Say Hi to Our Listing Assistant! 👋
            </h3>
            <p className="text-sm text-gray-600 max-w-md">
              Tell me what you're looking for or selling!
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "checklist"
                  ? "bg-[var(--color-accent-700)]"
                  : message.role === "product_research"
                  ? "bg-[var(--color-primary-600)]"
                  : message.role === "agent"
                  ? "bg-[var(--color-secondary-500)]"
                  : "bg-[var(--color-primary-500)]"
              }`}
            >
              {message.role === "checklist" ? (
                <ClipboardList className="w-5 h-5 text-[var(--color-secondary-500)]" />
              ) : message.role === "product_research" ? (
                <Bot className="w-5 h-5 text-white" />
              ) : message.role === "agent" ? (
                <Bot className="w-5 h-5 text-black" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Message Content */}
            {message.role === "checklist" ? (
              /* Checklist message - just show the checklist */
              message.todoList && <ChatTodoList items={message.todoList} />
            ) : message.role === "product_research" ? (
              /* Product Research Card */
              message.productResearch && (
                <div className="max-w-[80%] bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] border-2 border-[var(--color-primary-300)] rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-primary-300)]">
                    <Bot className="w-5 h-5 text-[var(--color-primary-700)]" />
                    <h3 className="font-semibold text-[var(--color-primary-900)]">
                      {message.productResearch.productName} Research
                    </h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-[var(--color-accent-700)]">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 {...props} className="text-lg font-bold text-[var(--color-primary-900)] mt-3 mb-2" />,
                        h2: ({ node, ...props }) => <h2 {...props} className="text-base font-semibold text-[var(--color-primary-800)] mt-3 mb-2" />,
                        h3: ({ node, ...props }) => <h3 {...props} className="text-sm font-semibold text-[var(--color-primary-700)] mt-2 mb-1" />,
                        p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0 text-sm leading-relaxed" />,
                        ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 mb-3 space-y-1" />,
                        ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 mb-3 space-y-1" />,
                        li: ({ node, ...props }) => <li {...props} className="text-sm" />,
                        strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-[var(--color-primary-900)]" />,
                      }}
                    >
                      {message.productResearch.research}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            ) : (
              /* Regular message bubble */
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === "agent"
                    ? "bg-white text-gray-900 border border-gray-200"
                    : "bg-[var(--color-primary-600)] text-white"
                }`}
              >
              {message.role === "agent" ? (
                <div className="text-sm prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      img: ({ node, ...props }) => (
                        <img
                          {...props}
                          className="rounded-lg my-2 max-w-full h-auto"
                          style={{ maxHeight: "200px", objectFit: "cover" }}
                        />
                      ),
                      p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
              </div>
            )}
          </div>
        )))}

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
        <div className="flex gap-2 items-stretch">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)] disabled:bg-gray-100 disabled:cursor-not-allowed h-10"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black px-4 h-10"
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
