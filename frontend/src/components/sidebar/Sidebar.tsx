"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  User,
  // Settings,
  Menu,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Navigation as NavIcon,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MOCK_THREADS, SIDEBAR_CHAT_HISTORY } from "@/utils/mock-all-data-used";
import SidebarAIChat from "@/components/sidebar/SidebarAIChat";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

import SearchHistory from "@/components/sidebar/SearchHistory";
import BuyListingsMenuItem from "@/components/sidebar/menu-items/BuyListingsMenuItem";
import SellListingsMenuItem from "@/components/sidebar/menu-items/SellListingsMenuItem";
import MatchedListingsMenuItem from "@/components/sidebar/menu-items/MatchedListingsMenuItem";
const navItems = [
  { href: "/threads", label: "Threads", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageCircle, isLoginRequired: true },
  { href: "/profile", label: "Profile", icon: User, isLoginRequired: true },
  // { href: "/settings", label: "Settings", icon: Settings },
];

import { useAuth, useClerk } from "@clerk/nextjs";

// Mock chat history data - 2nd hand marketplace purchase decisions
// Use centralized chat history data
const mockChatHistory = SIDEBAR_CHAT_HISTORY;

function FollowingMenuItem() {
  const [isOpen, setIsOpen] = useState(false);

  const mostVisitedThreads = MOCK_THREADS.sort(
    (a, b) => b.views - a.views
  ).slice(0, 5);

  useEffect(() => {
    const ids = MOCK_THREADS.map(t => t.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length > 0) {
      console.warn("Duplicate thread IDs found:", duplicates);
    }
  }, []);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setIsOpen(!isOpen)}
        className="group/menu-item text-accent-700 font-semibold"
      >
        <TrendingUp className="w-5 h-5" />
        <span>Following</span>
        {isOpen ? (
          <ChevronDown className="ml-auto h-4 w-4 transition-transform" />
        ) : (
          <ChevronRight className="ml-auto h-4 w-4 transition-transform" />
        )}
      </SidebarMenuButton>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <SidebarMenuSub>
          {mostVisitedThreads.map((thread) => (
            <SidebarMenuSubItem key={thread.id}>
              <SidebarMenuSubButton
                asChild
              >
                <Link
                  href={`/threads/${thread.category}`}
                  className="flex items-center gap-3 text-accent-500 hover:bg-primary-200 hover:text-accent-700"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-200 border border-primary-300 flex-shrink-0 overflow-hidden">
                    <Image
                      src={thread.imageUrl}
                      alt={thread.title}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement?.style.setProperty(
                          "background",
                          "linear-gradient(45deg, var(--color-primary-300), var(--color-secondary-300))"
                        );
                      }}
                    />
                  </div>
                  <span className="truncate text-xs font-medium flex-1 min-w-0">
                    {thread.title}
                  </span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </div>
    </SidebarMenuItem>
  );
}

function NgamJeAssistantMenuItem({
  onNewChat,
}: {
  onNewChat: () => void;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [visibleChats, setVisibleChats] = useState(5);
  const [loading, setLoading] = useState(false);
  const KEEP_RECENT_COUNT = 10;
  const MAX_LOADED_COUNT = 25;
  const DELOAD_TO_COUNT = 15;
  const { has } = useAuth();

  const handleNewChat = () => {
    const isAllowed = has ? has({feature: 'ngam_assistant'}) : false;
    if (!isAllowed) {
      showFeatureDisabledMessage();
      return;
    }
    onNewChat();
  };

  const handleChatClick = (chatId: number) => {
    const isAllowed = has ? has({feature: 'ngam_assistant'}) : false;
    if (!isAllowed) {
      showFeatureDisabledMessage();
      return;
    }
    router.push(`/chat/history?id=${chatId}`);
  };

  const handleChatHistoryClick = () => {
    const isAllowed = has ? has({feature: 'ngam_assistant'}) : false;
    if (!isAllowed) {
      showFeatureDisabledMessage();
      return;
    }
    router.push('/chat/history');
  };

  const loadMoreChats = () => {
    if (loading || visibleChats >= mockChatHistory.length) return;

    setLoading(true);
    setTimeout(() => {
      const newCount = Math.min(visibleChats + 5, mockChatHistory.length);

      if (newCount > MAX_LOADED_COUNT) {
        setVisibleChats(Math.max(DELOAD_TO_COUNT, KEEP_RECENT_COUNT));
      } else {
        setVisibleChats(newCount);
      }

      setLoading(false);
    }, 300);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 5) {
      loadMoreChats();
    }

    if (scrollTop === 0 && visibleChats > KEEP_RECENT_COUNT) {
      const currentTarget = e.currentTarget;
      setTimeout(() => {
        if (currentTarget && currentTarget.scrollTop === 0) {
          setVisibleChats(KEEP_RECENT_COUNT);
        }
      }, 500);
    }
  };

  const showFeatureDisabledMessage = () => {
    alert("Your current plan does not support Ngam-je Assistant. Please upgrade your plan to access this feature.");
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setIsOpen(!isOpen)}
        className="group/menu-item text-accent-700 font-semibold"
      >
        <Sparkles className="w-5 h-5" />
        <span>Ngam-je Assistant</span>
        {isOpen ? (
          <ChevronDown className="ml-auto h-4 w-4 transition-transform" />
        ) : (
          <ChevronRight className="ml-auto h-4 w-4 transition-transform" />
        )}
      </SidebarMenuButton>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton
              asChild
              className="text-accent-500 hover:bg-primary-200 hover:text-accent-700"
            >
              <SidebarMenuButton onClick={handleChatHistoryClick} className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Chat History</span>
              </SidebarMenuButton>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>

          <SidebarMenuSubItem>
            <div
              className="max-h-32 overflow-y-auto space-y-1 px-2"
              onScroll={handleScroll}
            >
              {mockChatHistory.slice(0, visibleChats).map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  className="p-2 rounded cursor-pointer transition-colors text-xs text-accent-500 hover:bg-primary-200 hover:text-accent-700"
                >
                  <div className="truncate font-medium">{chat.title}</div>
                  <div className="text-[10px] text-accent-400">
                    {chat.timestamp}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-center py-2">
                  <div className="text-xs text-accent-400">Loading...</div>
                </div>
              )}

              {visibleChats >= mockChatHistory.length &&
                mockChatHistory.length > 5 && (
                  <div className="flex justify-center py-2">
                    <div className="text-xs text-accent-400">No more chats</div>
                  </div>
                )}

              {visibleChats < mockChatHistory.length &&
                visibleChats >= MAX_LOADED_COUNT && (
                  <div className="flex justify-center py-2">
                    <div className="text-xs text-accent-300">
                      {mockChatHistory.length - visibleChats} older chats hidden
                    </div>
                  </div>
                )}
            </div>
          </SidebarMenuSubItem>

          <SidebarMenuSubItem>
            <button
              onClick={handleNewChat}
              className="w-full mx-2 p-2 rounded-md flex items-center justify-center gap-2 text-xs font-medium transition-all duration-200 border bg-secondary-500 text-accent-700 border-secondary-600 hover:bg-secondary-600 hover:-translate-y-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>New Chat</span>
            </button>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </div>
    </SidebarMenuItem>
  );
}

function SignInMenuItem() {
  const { openSignIn } = useClerk();

  const handleClick = () => {
    openSignIn();
  }

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleClick}
          className="group/menu-item text-accent-700 font-semibold"
        >
          <Sparkles className="w-5 h-5" />
          <span>Ngam-je Assistant</span>
          <ChevronDown className="ml-auto h-4 w-4 transition-transform" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    
      <div>
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <div className="flex justify-center py-2" onClick={handleClick}>
              <div className="text-xs text-black">Don't miss out! <span className="underline">Login</span> now to get access to all the features!</div>
            </div>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      </div>
    </>
  );
}

function NavigationMenuItem() {
  const [isOpen, setIsOpen] = useState(true);
  const { state } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";
  const { isSignedIn } = useAuth();

  if (isCollapsed) {
    return (
      <>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          if (!isSignedIn && item.isLoginRequired) {
            return (<></>);
          }
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
              >
                <Link
                  href={item.href}
                  className={isActive ? "bg-primary-200 text-accent-700 font-semibold" : "text-accent-500 hover:bg-primary-200 hover:text-accent-700"}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setIsOpen(!isOpen)}
        className="group/menu-item text-accent-700 font-semibold"
      >
        <NavIcon className="w-5 h-5" />
        <span>Navigation</span>
        {isOpen ? (
          <ChevronDown className="ml-auto h-4 w-4 transition-transform" />
        ) : (
          <ChevronRight className="ml-auto h-4 w-4 transition-transform" />
        )}
      </SidebarMenuButton>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <SidebarMenuSub>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            if (!isSignedIn && item.isLoginRequired) {
              return (<></>);
            }
            return (
              <SidebarMenuSubItem key={item.href}>
                <SidebarMenuSubButton
                  asChild
                  isActive={isActive}
                >
                  <Link
                    href={item.href}
                    className={isActive ? "bg-primary-200 text-accent-700 font-semibold" : "text-accent-500 hover:bg-primary-200 hover:text-accent-700"}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </div>
    </SidebarMenuItem>
  );
}

function CustomSidebarTrigger({
  onManualToggle,
}: {
  onManualToggle: () => void;
}) {
  return (
    <button
      onClick={onManualToggle}
      className="absolute -right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center outline-none bg-neutral-50 text-accent-700 border-2 border-accent-700 hover:bg-primary-200 transition-colors"
      title="Toggle sidebar"
      style={{ top: "50%", transform: "translateY(-50%)" }}
    >
      <Menu className="w-4 h-4" />
    </button>
  );
}

export function AppSidebar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { state, setOpen, isMobile } = useSidebar();
  const [isManuallyToggled, setIsManuallyToggled] = useState(
    state === "expanded"
  );

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  
  const { isSignedIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    if (!isManuallyToggled) {
      setOpen(isHovered);
    }
  }, [isHovered, isManuallyToggled, setOpen, isMobile]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleManualToggle = () => {
    if (isMobile) return;
    const newState = !isManuallyToggled;
    setIsManuallyToggled(newState);
    setOpen(newState);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setIsChatOpen(true);
  };

  const handleOpenExistingChat = (chatId: number) => {
    setCurrentChatId(chatId);
    setIsChatOpen(true);
  };
  // New handler for search suggestions from SearchHistory.tsx
  const handleSearchSuggestionClick = (suggestionPath: string, suggestionType: string) => {
    if (suggestionType === 'ai-chat') {
      const chatId = parseInt(suggestionPath.split('/').pop() || '', 10);
      if (!isNaN(chatId)) {
        handleOpenExistingChat(chatId);
      } else {
        // Handle case where AI chat path is not a simple ID, e.g., a new AI interaction
        handleNewChat();
      }
    } else {
      router.push(suggestionPath);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className="!relative md:flex flex-col h-full group-data-[state=collapsing]:opacity-0 group-data-[state=expanding]:opacity-0 transition-opacity duration-300 min-h-0"
      >
        <SidebarHeader className="relative p-2">
          {!isMobile && (
            <CustomSidebarTrigger onManualToggle={handleManualToggle} />
          )}

          <div className="mt-2">
            {/* Integrate SearchHistory component here */}
            <div className="group-data-[collapsible=icon]:hidden">
              <SearchHistory onSuggestionClick={handleSearchSuggestionClick} />
            </div>
            {/* Placeholder for collapsed state if needed, or just hide */}
            <div className="group-data-[collapsible=icon]:block hidden">
              <div className="relative max-w-48 mx-auto">
                <div className="w-full pl-10 pr-3 py-2 text-xs opacity-0 pointer-events-none">
                  placeholder
                </div>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent
          className="pt-1.5 flex-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="ml-1 mr-5">
            <SidebarSeparator />
          </div>

          {isSignedIn ? (<>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <NgamJeAssistantMenuItem
                    onNewChat={handleNewChat}
                  />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>) : (<>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SignInMenuItem />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>)}

          <div className="ml-1 mr-5">
            <SidebarSeparator />
          </div>

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavigationMenuItem />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isSignedIn && (<>
            <div className="ml-1 mr-5">
              <SidebarSeparator />
            </div>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <FollowingMenuItem />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>)}

          <div className="ml-1 mr-5">
            <SidebarSeparator />
          </div>

          {isSignedIn && (<>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <BuyListingsMenuItem />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="ml-1 mr-5">
              <SidebarSeparator />
            </div>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SellListingsMenuItem />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="ml-1 mr-5">
              <SidebarSeparator />
            </div>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <MatchedListingsMenuItem />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>)}

        </SidebarContent>{" "}
        {/* <-- This closes SidebarContent */}
        <SidebarFooter className="group-data-[collapsible=icon]:hidden mt-auto">
          <div className="p-4 text-center w-56 mx-auto overflow-hidden">
            <p className="text-[10px] text-accent-500 leading-relaxed">
              Ngam-je by Team Cracked Heads™ © 2025
              <br />
              All rights reserved
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarAIChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatId={currentChatId}
      />
    </>
  );
}
