"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { mockFullChatHistory, ChatHistoryItem } from '@/utils/mock-search-history';
import ReactMarkdown from 'react-markdown';
import { Clock, User, Sparkles, ArrowLeft } from 'lucide-react';

type ChatHistoryDisplayProps = {
  initialChatId?: number; // Optional prop for direct access to a specific chat
};

export default function ChatHistoryDisplay({ initialChatId }: ChatHistoryDisplayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null);

  // Determine if we're on a specific chat page (e.g., /chat/1)
  useEffect(() => {
    const pathSegments = pathname.split('/');
    const idFromPath = pathSegments[pathSegments.length - 1];
    const chatId = initialChatId || (idFromPath && !isNaN(Number(idFromPath)) ? Number(idFromPath) : null);

    if (chatId) {
      const chat = mockFullChatHistory.find(c => c.id === chatId);
      setSelectedChat(chat || null);
    } else {
      setSelectedChat(null); // No specific chat selected
    }
  }, [pathname, initialChatId]);

   const handleChatSelect = (chatId: number) => {
    const chat = mockFullChatHistory.find(c => c.id === chatId);
    setSelectedChat(chat || null);
    // No router.push() here, so the URL does not change.
  };

  const handleBackToHistory = () => {
    router.push('/chat/history');
  };

  // Helper to format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Chat History List (Left Panel) */}
      <div className={`w-full md:w-1/3 border-r border-primary-200 p-4 overflow-y-auto ${selectedChat ? 'hidden md:block' : 'block'}`}>
        <h2 className="text-lg font-bold text-accent-700 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Chat History
        </h2>
        <div className="space-y-2">
          {mockFullChatHistory.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleChatSelect(chat.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedChat?.id === chat.id
                  ? 'bg-secondary-100 border border-secondary-300 text-accent-700'
                  : 'bg-primary-50 hover:bg-primary-100 text-accent-600'
              }`}
            >
              <div className="font-medium text-sm truncate">{chat.title}</div>
              <div className="text-xs text-accent-400 mt-1">{chat.timestamp}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Display (Right Panel) */}
      <div className={`w-full md:w-2/3 flex flex-col ${selectedChat ? 'block' : 'hidden md:flex'}`}>
        {selectedChat ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-primary-200 bg-primary-50">
              <button onClick={handleBackToHistory} className="md:hidden p-1 rounded-full hover:bg-primary-100">
                <ArrowLeft className="w-5 h-5 text-accent-600" />
              </button>
              <h3 className="text-lg font-semibold text-accent-700 truncate flex-1">{selectedChat.title}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages?.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" ? "bg-accent-700" : "bg-secondary-500"
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
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-accent-500 text-center p-4">
            <p>Select a chat from the left to view its messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}