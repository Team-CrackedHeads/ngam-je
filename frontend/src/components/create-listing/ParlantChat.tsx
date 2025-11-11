"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, ClipboardList, Check, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import ChatTodoList, { TodoItem } from "./ChatTodoList";

interface Message {
  role: "user" | "agent" | "checklist" | "product_research" | "images_preview" | "tags_preview" | "title_preview" | "description_preview" | "approval_confirmation";
  content: string;
  todoList?: TodoItem[];
  productResearch?: {
    productName: string;
    research: string;
  };
  imagesPreview?: string[];
  tagsPreview?: string[];
  titlePreview?: string;
  descriptionPreview?: string;
  approvalConfirmation?: {
    question: string;
    selectedOption: string;
    unselectedOption: string;
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
  const [pendingApprovalUpdate, setPendingApprovalUpdate] = useState(false);
  const [pendingTitlePreview, setPendingTitlePreview] = useState(false);
  const [pendingDescriptionPreview, setPendingDescriptionPreview] = useState(false);
  const [pendingProductResearch, setPendingProductResearch] = useState(false);
  const [pendingImagesPreview, setPendingImagesPreview] = useState(false);
  const [pendingTagsPreview, setPendingTagsPreview] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Approval state (stores the data to show when agent is ready)
  const pendingApprovalDataRef = useRef<{
    contentType: string;
    content: string;
    question: string;
  } | null>(null);

  // Preview data refs (store data until agent is ready)
  const pendingTitleDataRef = useRef<string | null>(null);
  const pendingDescriptionDataRef = useRef<string | null>(null);
  const pendingProductResearchDataRef = useRef<{ productName: string; research: string } | null>(null);
  const pendingImagesDataRef = useRef<string[] | null>(null);
  const pendingTagsDataRef = useRef<string[] | null>(null);

  const [pendingApproval, setPendingApproval] = useState<{
    contentType: string;
    content: string;
    question: string;
  } | null>(null);

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

          // Check if this is an approval question (contains [Y/n])
          const isApprovalQuestion = message.includes("[Y/n]");

          return [
            ...prev,
            {
              role: "agent",
              content: message,
              showApprovalButtons: isApprovalQuestion,
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

    // Only update UI elements when agent is ready (done sending all messages)
    if (isAgentReady) {
      handlePendingUIUpdates(isAgentReady);
    }

  }, [eventsData, todoItems, pendingChecklistUpdate, pendingApprovalUpdate, pendingTitlePreview, pendingDescriptionPreview, pendingProductResearch, pendingImagesPreview, pendingTagsPreview]);

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

      case "set_images":
        if (result.images && onFieldUpdate) {
          onFieldUpdate("images", result.images);
          markTodoComplete("images");
          // Store images preview data (wait for agent ready)
          pendingImagesDataRef.current = result.images;
          setPendingImagesPreview(true);
        }
        break;

      case "show_tags_preview":
        // Store tags preview without setting them yet (wait for agent ready)
        if (result.tags) {
          pendingTagsDataRef.current = result.tags;
          setPendingTagsPreview(true);
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
          pendingProductResearchDataRef.current = {
            productName: result.product_name,
            research: result.research,
          };
          setPendingProductResearch(true);
        }
        break;

      case "show_title_preview":
        if (result.title) {
          pendingTitleDataRef.current = result.title;
          setPendingTitlePreview(true);
        }
        break;

      case "show_description_preview":
        if (result.description) {
          pendingDescriptionDataRef.current = result.description;
          setPendingDescriptionPreview(true);
        }
        break;

      case "show_approval":
        // Store approval data but don't show yet (wait for agent to finish)
        if (result.content_type && result.content && result.question) {
          pendingApprovalDataRef.current = {
            contentType: result.content_type,
            content: result.content,
            question: result.question,
          };
          setPendingApprovalUpdate(true);
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

  // Handle all pending UI updates (checklist, previews, approval)
  const handlePendingUIUpdates = (isAgentReady: boolean) => {
    if (!isAgentReady) return;

    // Capture values immediately to avoid closure issues
    const titleData = pendingTitleDataRef.current;
    const descriptionData = pendingDescriptionDataRef.current;
    const productResearchData = pendingProductResearchDataRef.current;
    const imagesData = pendingImagesDataRef.current;
    const tagsData = pendingTagsDataRef.current;

    setMessages(prev => {
      // Find the last agent message index
      let lastAgentMessageIndex = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === "agent") {
          lastAgentMessageIndex = i;
          break;
        }
      }

      // If no agent message found, just append at the end
      if (lastAgentMessageIndex === -1) {
        return prev;
      }

      // Split messages: everything before last agent message, and the last agent message
      const messagesBeforeLast = prev.slice(0, lastAgentMessageIndex);
      const lastAgentMessage = prev[lastAgentMessageIndex];
      const messagesAfterLast = prev.slice(lastAgentMessageIndex + 1);

      // Build the UI elements to insert
      const uiElements: Message[] = [];

      // Checklist
      if (pendingChecklistUpdate) {
        console.log("✅ Updating checklist!");
        // Remove existing checklist from messages before last
        const withoutChecklist = messagesBeforeLast.filter(msg => msg.role !== "checklist");
        messagesBeforeLast.length = 0;
        messagesBeforeLast.push(...withoutChecklist);

        uiElements.push({
          role: "checklist",
          content: "",
          todoList: [...todoItems],
        });
      }

      // Title preview
      if (pendingTitlePreview && titleData) {
        uiElements.push({
          role: "title_preview",
          content: "",
          titlePreview: titleData,
        });
      }

      // Description preview
      if (pendingDescriptionPreview && descriptionData) {
        uiElements.push({
          role: "description_preview",
          content: "",
          descriptionPreview: descriptionData,
        });
      }

      // Product research
      if (pendingProductResearch && productResearchData) {
        uiElements.push({
          role: "product_research",
          content: "",
          productResearch: productResearchData,
        });
      }

      // Images preview
      if (pendingImagesPreview && imagesData) {
        uiElements.push({
          role: "images_preview",
          content: "",
          imagesPreview: imagesData,
        });
      }

      // Tags preview
      if (pendingTagsPreview && tagsData) {
        uiElements.push({
          role: "tags_preview",
          content: "",
          tagsPreview: tagsData,
        });
      }

      // Return reordered messages: before + UI elements + last message + after
      return [...messagesBeforeLast, ...uiElements, lastAgentMessage, ...messagesAfterLast];
    });

    // Clear all pending flags and refs
    if (pendingChecklistUpdate) {
      setPendingChecklistUpdate(false);
    }
    if (pendingTitlePreview && titleData) {
      pendingTitleDataRef.current = null;
      setPendingTitlePreview(false);
    }
    if (pendingDescriptionPreview && descriptionData) {
      pendingDescriptionDataRef.current = null;
      setPendingDescriptionPreview(false);
    }
    if (pendingProductResearch && productResearchData) {
      pendingProductResearchDataRef.current = null;
      setPendingProductResearch(false);
    }
    if (pendingImagesPreview && imagesData) {
      pendingImagesDataRef.current = null;
      setPendingImagesPreview(false);
    }
    if (pendingTagsPreview && tagsData) {
      pendingTagsDataRef.current = null;
      setPendingTagsPreview(false);
    }

    // Approval UI
    if (pendingApprovalUpdate) {
      console.log("✅ Showing approval UI!");
      if (pendingApprovalDataRef.current) {
        setPendingApproval(pendingApprovalDataRef.current);
        pendingApprovalDataRef.current = null;
      }
      setPendingApprovalUpdate(false);
    }
  };

  // Handle approval (Yes/No buttons)
  const handleApproval = async (approved: boolean) => {
    if (!sessionId || !pendingApproval) return;

    setIsLoading(true);

    // Determine button text based on content type
    let yesText = "Yes";
    let noText = "No";

    if (pendingApproval.contentType === "image_choice") {
      yesText = "Yes, do it for me";
      noText = "No, I'll upload";
    } else {
      yesText = `Yes, use this ${pendingApproval.contentType}`;
      noText = "No, do it differently";
    }

    // Add visual confirmation to chat showing question and user's choice
    setMessages((prev) => [
      ...prev,
      {
        role: "approval_confirmation",
        content: "",
        approvalConfirmation: {
          question: pendingApproval.question,
          selectedOption: approved ? yesText : noText,
          unselectedOption: approved ? noText : yesText,
        },
      },
    ]);

    // Clear pending approval (returns input to normal)
    setPendingApproval(null);

    try {
      // Send to Parlant via axios silently (no message added to chat)
      await axios.post(`${PARLANT_SERVER_URL}/sessions/${sessionId}/events`, {
        kind: "message",
        source: "customer",
        message: approved ? "yes" : "no",
      });
    } catch (error) {
      console.error("Failed to send approval:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || !sessionId) return;

    // Add user message to chat immediately
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    // Clear pending approval if user types custom response
    if (pendingApproval) {
      setPendingApproval(null);
    }

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
              message.role === "user" || message.role === "approval_confirmation" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "checklist"
                  ? "bg-[var(--color-accent-700)]"
                  : message.role === "product_research" || message.role === "images_preview" || message.role === "tags_preview" || message.role === "title_preview" || message.role === "description_preview"
                  ? "bg-[var(--color-secondary-600)]"
                  : message.role === "agent"
                  ? "bg-[var(--color-secondary-500)]"
                  : message.role === "approval_confirmation"
                  ? "bg-[var(--color-neutral-400)]"
                  : "bg-[var(--color-primary-500)]"
              }`}
            >
              {message.role === "checklist" ? (
                <ClipboardList className="w-5 h-5 text-[var(--color-secondary-500)]" />
              ) : message.role === "product_research" || message.role === "images_preview" || message.role === "tags_preview" || message.role === "title_preview" || message.role === "description_preview" ? (
                <Bot className="w-5 h-5 text-black" />
              ) : message.role === "agent" ? (
                <Bot className="w-5 h-5 text-black" />
              ) : message.role === "approval_confirmation" ? (
                <HelpCircle className="w-5 h-5 text-white" />
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
                <div className="max-w-[80%] bg-gradient-to-br from-[var(--color-secondary-50)] to-[var(--color-secondary-100)] border-2 border-[var(--color-secondary-300)] rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-secondary-300)]">
                    <Bot className="w-5 h-5 text-[var(--color-secondary-700)]" />
                    <h3 className="font-semibold text-[var(--color-accent-700)]">
                      {message.productResearch.productName} Research
                    </h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-[var(--color-accent-700)]">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 {...props} className="text-lg font-bold text-[var(--color-accent-700)] mt-3 mb-2" />,
                        h2: ({ node, ...props }) => <h2 {...props} className="text-base font-semibold text-[var(--color-accent-700)] mt-3 mb-2" />,
                        h3: ({ node, ...props }) => <h3 {...props} className="text-sm font-semibold text-[var(--color-secondary-700)] mt-2 mb-1" />,
                        p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0 text-sm leading-relaxed" />,
                        ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 mb-3 space-y-1" />,
                        ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 mb-3 space-y-1" />,
                        li: ({ node, ...props }) => <li {...props} className="text-sm" />,
                        strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-[var(--color-accent-700)]" />,
                      }}
                    >
                      {message.productResearch.research}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            ) : message.role === "title_preview" ? (
              /* Title Preview Card */
              message.titlePreview && (
                <div className="max-w-[80%] bg-gradient-to-br from-[var(--color-secondary-50)] to-[var(--color-secondary-100)] border-2 border-[var(--color-secondary-300)] rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--color-secondary-300)]">
                    <Bot className="w-5 h-5 text-[var(--color-secondary-700)]" />
                    <h3 className="font-semibold text-[var(--color-secondary-900)]">Generated Title</h3>
                  </div>
                  <p className="text-base font-medium text-[var(--color-accent-700)] leading-relaxed">
                    {message.titlePreview}
                  </p>
                </div>
              )
            ) : message.role === "description_preview" ? (
              /* Description Preview Card */
              message.descriptionPreview && (
                <div className="max-w-[80%] bg-gradient-to-br from-[var(--color-secondary-50)] to-[var(--color-secondary-100)] border-2 border-[var(--color-secondary-300)] rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--color-secondary-300)]">
                    <Bot className="w-5 h-5 text-[var(--color-secondary-700)]" />
                    <h3 className="font-semibold text-[var(--color-secondary-900)]">Generated Description</h3>
                  </div>
                  <p className="text-sm text-[var(--color-accent-700)] leading-relaxed">
                    {message.descriptionPreview}
                  </p>
                </div>
              )
            ) : message.role === "images_preview" ? (
              /* Images Preview Card */
              message.imagesPreview && message.imagesPreview.length > 0 && (
                <div className="max-w-[80%] bg-gradient-to-br from-[var(--color-secondary-50)] to-[var(--color-secondary-100)] border-2 border-[var(--color-secondary-300)] rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-secondary-300)]">
                    <Bot className="w-5 h-5 text-[var(--color-secondary-700)]" />
                    <h3 className="font-semibold text-[var(--color-accent-700)]">
                      Found {message.imagesPreview.length} Images
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {message.imagesPreview.slice(0, 6).map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-[var(--color-secondary-200)]"
                      />
                    ))}
                  </div>
                </div>
              )
            ) : message.role === "tags_preview" ? (
              /* Tags Preview Card */
              message.tagsPreview && (
                <div className="max-w-[80%] bg-gradient-to-br from-[var(--color-secondary-50)] to-[var(--color-secondary-100)] border-2 border-[var(--color-secondary-300)] rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--color-secondary-300)]">
                    <Bot className="w-5 h-5 text-[var(--color-secondary-700)]" />
                    <h3 className="font-semibold text-[var(--color-accent-700)]">
                      Generated Tags
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {message.tagsPreview.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[var(--color-secondary-200)] text-[var(--color-accent-700)] rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ) : message.role === "approval_confirmation" ? (
              /* Approval Confirmation - Shows question and user's answer */
              message.approvalConfirmation && (
                <div className="flex flex-col gap-2 max-w-[60%]">
                  <div className="bg-white border-2 border-[var(--color-neutral-300)] rounded-lg px-3 py-1.5">
                    <p className="text-xs text-[var(--color-neutral-700)]">{message.approvalConfirmation.question}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap opacity-60 pointer-events-none">
                    <div className="px-4 py-2 rounded-lg text-sm font-medium border-2 bg-[var(--color-secondary-500)] text-black border-[var(--color-secondary-600)]">
                      {message.approvalConfirmation.selectedOption}
                    </div>
                    <div className="px-4 py-2 rounded-lg text-sm font-medium border-2 bg-white text-[var(--color-neutral-600)] border-[var(--color-neutral-300)]">
                      {message.approvalConfirmation.unselectedOption}
                    </div>
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

      {/* Input Area - Transforms when approval is pending */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        {pendingApproval ? (
          /* Approval Mode - Only Yes/No buttons */
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600 mb-1">
              {pendingApproval.question}
            </p>
            <div className="flex gap-2">
              {pendingApproval.contentType === "image_choice" ? (
                /* Custom buttons for image choice */
                <>
                  <Button
                    onClick={() => handleApproval(true)}
                    disabled={isLoading}
                    className="flex-1 bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black font-medium h-12 text-sm"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Yes, do it for me
                  </Button>
                  <Button
                    onClick={() => handleApproval(false)}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-100 text-gray-700 font-medium h-12 text-sm"
                  >
                    <X className="w-5 h-5 mr-2" />
                    No, I'll upload
                  </Button>
                </>
              ) : (
                /* Standard Yes/No buttons for other approvals */
                <>
                  <Button
                    onClick={() => handleApproval(true)}
                    disabled={isLoading}
                    className="flex-1 bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)] text-black font-medium h-12 text-sm"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Yes, use this {pendingApproval.contentType}
                  </Button>
                  <Button
                    onClick={() => handleApproval(false)}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-100 text-gray-700 font-medium h-12 text-sm"
                  >
                    <X className="w-5 h-5 mr-2" />
                    No, do it differently
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Normal Mode - Regular input */
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
        )}
      </div>
    </div>
  );
}
