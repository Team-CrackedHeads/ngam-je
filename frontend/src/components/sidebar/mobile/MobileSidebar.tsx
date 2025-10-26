"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  MessageCircle,
  User,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Navigation as NavIcon,
  TrendingUp,
  X,
} from "lucide-react";
import { MOCK_THREADS } from "@/utils/mock-threads-data";
import SidebarAIChat from "@/components/sidebar/SidebarAIChat";
import SearchHistory from "@/components/sidebar/SearchHistory";
import { mockBuyListings, mockSaleListings, mockMatchedListings } from "@/utils/mock-listings-data";
import { MOCK_CHAT_HISTORY } from "@/utils/mock-chat-history-data";

const navItems = [
  { href: "/threads", label: "Threads", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

const mockChatHistory = MOCK_CHAT_HISTORY.slice(0, 3);

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function FollowingMenuItem({ onItemClick }: { onItemClick: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const mostVisitedThreads = MOCK_THREADS.sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-accent-700 font-semibold hover:bg-primary-100 rounded-md"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <span>Following</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {mostVisitedThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/threads/${thread.category}`}
              onClick={onItemClick}
              className="flex items-center gap-2 px-3 py-2 text-sm text-accent-500 hover:bg-primary-100 rounded-md"
            >
              <div className="w-6 h-6 rounded-full bg-primary-200 flex-shrink-0 overflow-hidden">
                <Image
                  src={thread.imageUrl}
                  alt={thread.title}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="truncate">{thread.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NgamJeAssistantMenuItem({ onNewChat, onItemClick }: { onNewChat: () => void; onItemClick: () => void }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleChatClick = (chatId: number) => {
    router.push(`/chat/history?id=${chatId}`);
    onItemClick();
  };

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-accent-700 font-semibold hover:bg-primary-100 rounded-md"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span>Ngam-je Assistant</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          <Link
            href="/chat/history"
            onClick={onItemClick}
            className="flex items-center gap-2 px-3 py-2 text-sm text-accent-500 hover:bg-primary-100 rounded-md"
          >
            <Clock className="w-4 h-4" />
            <span>Chat History</span>
          </Link>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {mockChatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className="px-3 py-2 rounded-md cursor-pointer text-xs text-accent-500 hover:bg-primary-100"
              >
                <div className="truncate font-medium">{chat.title}</div>
                <div className="text-[10px] text-accent-400">{chat.timestamp}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => { onNewChat(); onItemClick(); }}
            className="w-full p-2 rounded-md flex items-center justify-center gap-2 text-xs font-medium border bg-secondary-500 text-accent-700 border-secondary-600 hover:bg-secondary-600"
          >
            <Plus className="w-3 h-3" />
            <span>New Chat</span>
          </button>
        </div>
      )}
    </div>
  );
}

function NavigationMenuItem({ onItemClick }: { onItemClick: () => void }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-accent-700 font-semibold hover:bg-primary-100 rounded-md"
      >
        <div className="flex items-center gap-2">
          <NavIcon className="w-5 h-5" />
          <span>Navigation</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className="flex items-center gap-2 px-3 py-2 text-sm text-accent-500 hover:bg-primary-100 rounded-md"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setIsChatOpen(true);
  };

  const handleSearchSuggestionClick = (suggestionPath: string, suggestionType: string) => {
    if (suggestionType === 'ai-chat') {
      const chatId = parseInt(suggestionPath.split('/').pop() || '', 10);
      if (!isNaN(chatId)) {
        setCurrentChatId(chatId);
        setIsChatOpen(true);
      } else {
        handleNewChat();
      }
    } else {
      router.push(suggestionPath);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 left-0 h-full
          w-[75vw] max-w-sm
          bg-white shadow-2xl
          z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
          md:hidden
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-accent-700">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search History */}
        <div className="px-4 py-3 border-b border-gray-200">
          <SearchHistory onSuggestionClick={handleSearchSuggestionClick} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <NgamJeAssistantMenuItem onNewChat={handleNewChat} onItemClick={onClose} />
          <div className="border-t border-gray-200 my-2" />
          <NavigationMenuItem onItemClick={onClose} />
          <div className="border-t border-gray-200 my-2" />
          <FollowingMenuItem onItemClick={onClose} />
          <div className="border-t border-gray-200 my-2" />
          <div onClick={onClose}>
            <BuyListingsMenuItem />
          </div>
          <div className="border-t border-gray-200 my-2" />
          <div onClick={onClose}>
            <SellListingsMenuItem />
          </div>
          <div className="border-t border-gray-200 my-2" />
          <div onClick={onClose}>
            <MatchedListingsMenuItem />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-[10px] text-accent-500 leading-relaxed">
            Ngam-je by Team Cracked Heads™ © 2025
            <br />
            All rights reserved
          </p>
        </div>
      </div>

      <SidebarAIChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatId={currentChatId}
      />
    </>
  );
}
