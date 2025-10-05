"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageCircle, User, Settings, Menu, Plus, ChevronDown, ChevronRight, Clock, Sparkles, Navigation as NavIcon, TrendingUp, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { MOCK_THREADS } from "@/utils/mock-threads-data"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"

const navItems = [
  { href: "/", label: "Threads", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
]

// Mock chat history data - 2nd hand marketplace purchase decisions
const mockChatHistory = [
  { id: 1, title: "iPhone 14 Pro price comparison", timestamp: "2 hours ago", created_at: "2025-10-03T14:00:00Z" },
  { id: 2, title: "MacBook Air M2 battery health check", timestamp: "5 hours ago", created_at: "2025-10-03T11:00:00Z" },
  { id: 3, title: "Used car inspection checklist Toyota", timestamp: "1 day ago", created_at: "2025-10-02T16:00:00Z" },
  { id: 4, title: "Gaming PC parts compatibility", timestamp: "1 day ago", created_at: "2025-10-02T13:30:00Z" },
  { id: 5, title: "Vintage watch authenticity verification", timestamp: "2 days ago", created_at: "2025-10-01T19:45:00Z" },
  { id: 6, title: "Camera lens condition assessment", timestamp: "3 days ago", created_at: "2025-09-30T10:30:00Z" },
  { id: 7, title: "Furniture quality vs price analysis", timestamp: "4 days ago", created_at: "2025-09-29T14:20:00Z" },
  { id: 8, title: "Electric bike safety standards", timestamp: "5 days ago", created_at: "2025-09-28T08:15:00Z" },
  { id: 9, title: "Designer handbag authentication tips", timestamp: "1 week ago", created_at: "2025-09-26T16:40:00Z" },
  { id: 10, title: "Motorcycle maintenance costs Honda", timestamp: "1 week ago", created_at: "2025-09-26T09:15:00Z" },
  { id: 11, title: "Smartphone trade-in value check", timestamp: "1 week ago", created_at: "2025-09-25T12:30:00Z" },
  { id: 12, title: "Laptop performance benchmarks", timestamp: "1 week ago", created_at: "2025-09-24T15:45:00Z" },
  { id: 13, title: "Art print value estimation", timestamp: "2 weeks ago", created_at: "2025-09-19T14:45:00Z" },
  { id: 14, title: "Kitchen appliance energy ratings", timestamp: "2 weeks ago", created_at: "2025-09-18T11:20:00Z" },
  { id: 15, title: "Exercise equipment durability test", timestamp: "2 weeks ago", created_at: "2025-09-17T18:30:00Z" },
  { id: 16, title: "Board game condition grading", timestamp: "3 weeks ago", created_at: "2025-09-12T15:30:00Z" },
  { id: 17, title: "Power tools safety inspection", timestamp: "3 weeks ago", created_at: "2025-09-11T08:45:00Z" },
  { id: 18, title: "Sneaker authenticity red flags", timestamp: "3 weeks ago", created_at: "2025-09-10T20:15:00Z" },
  { id: 19, title: "Home theater setup compatibility", timestamp: "1 month ago", created_at: "2025-09-03T13:20:00Z" },
  { id: 20, title: "Musical instrument condition check", timestamp: "1 month ago", created_at: "2025-08-28T16:10:00Z" },
  { id: 21, title: "Collectible toy market trends", timestamp: "1 month ago", created_at: "2025-08-25T12:00:00Z" },
  { id: 22, title: "Textbook edition differences", timestamp: "1 month ago", created_at: "2025-08-22T09:30:00Z" },
  { id: 23, title: "Garden equipment seasonal pricing", timestamp: "2 months ago", created_at: "2025-08-15T10:30:00Z" },
  { id: 24, title: "Sports gear quality indicators", timestamp: "2 months ago", created_at: "2025-08-10T14:15:00Z" },
  { id: 25, title: "Vintage clothing sizing guide", timestamp: "2 months ago", created_at: "2025-08-05T09:45:00Z" },
  { id: 26, title: "Electronic component lifespan", timestamp: "2 months ago", created_at: "2025-07-30T17:20:00Z" },
  { id: 27, title: "Jewelry appraisal process", timestamp: "3 months ago", created_at: "2025-07-20T11:30:00Z" },
  { id: 28, title: "Car parts compatibility matrix", timestamp: "3 months ago", created_at: "2025-07-15T14:45:00Z" },
  { id: 29, title: "Antique furniture restoration cost", timestamp: "3 months ago", created_at: "2025-07-10T16:20:00Z" },
  { id: 30, title: "Tech gadget depreciation rates", timestamp: "4 months ago", created_at: "2025-06-25T13:10:00Z" }
]

function AIAssistantCard() {
  const [visibleChats, setVisibleChats] = useState(5)
  const [loading, setLoading] = useState(false)
  const KEEP_RECENT_COUNT = 10 // Always keep first 10 items loaded
  const MAX_LOADED_COUNT = 25 // Start deloading after this many items
  const DELOAD_TO_COUNT = 15 // Deload back to this count

  const handleNewChat = () => {
    // Future implementation for creating new chat
    console.log("Creating new AI chat...")
  }

  const handleChatClick = (chatId: number) => {
    // Future implementation for opening existing chat
    console.log("Opening chat:", chatId)
  }

  const loadMoreChats = () => {
    if (loading || visibleChats >= mockChatHistory.length) return

    setLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      const newCount = Math.min(visibleChats + 5, mockChatHistory.length)

      // Hybrid deloading: if we exceed MAX_LOADED_COUNT, deload older items
      if (newCount > MAX_LOADED_COUNT) {
        setVisibleChats(Math.max(DELOAD_TO_COUNT, KEEP_RECENT_COUNT))
      } else {
        setVisibleChats(newCount)
      }

      setLoading(false)
    }, 300)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

    // Load more when near bottom
    if (scrollHeight - scrollTop <= clientHeight + 5) {
      loadMoreChats()
    }

    // Optional: Reset to recent items when scrolled back to top
    if (scrollTop === 0 && visibleChats > KEEP_RECENT_COUNT) {
      // Small delay to avoid flickering during fast scrolling
      const currentTarget = e.currentTarget
      setTimeout(() => {
        if (currentTarget && currentTarget.scrollTop === 0) {
          setVisibleChats(KEEP_RECENT_COUNT)
        }
      }, 500)
    }
  }

  return (
    <div className="p-3 mx-2 rounded-lg border bg-neutral-50 border-primary-200">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-accent-700" />
        <span className="text-sm font-medium text-accent-700">
          Chat History
        </span>
      </div>

      {/* Chat History */}
      <div
        className="max-h-32 overflow-y-auto mb-3 space-y-1"
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
            <div className="text-xs text-accent-400">
              Loading...
            </div>
          </div>
        )}

        {visibleChats >= mockChatHistory.length && mockChatHistory.length > 5 && (
          <div className="flex justify-center py-2">
            <div className="text-xs text-accent-400">
              No more chats
            </div>
          </div>
        )}

        {visibleChats < mockChatHistory.length && visibleChats >= MAX_LOADED_COUNT && (
          <div className="flex justify-center py-2">
            <div className="text-xs text-accent-300">
              {mockChatHistory.length - visibleChats} older chats hidden
            </div>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="w-full p-2 rounded-md flex items-center justify-center gap-2 text-xs font-medium transition-all duration-200 border bg-secondary-100 text-accent-700 border-accent-600 hover:bg-accent-600 hover:-translate-y-0.5"
      >
        <Plus className="w-3 h-3" />
        <span>New Chat</span>
      </button>
    </div>
  )
}

function FollowingMenuItem() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Get most visited threads (sorted by views)
  const mostVisitedThreads = MOCK_THREADS
    .sort((a, b) => b.views - a.views)
    .slice(0, 5) // Top 5 most visited

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
        className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <SidebarMenuSub>
          {mostVisitedThreads.map((thread) => (
            <SidebarMenuSubItem key={thread.id}>
              <SidebarMenuSubButton
                asChild
                isActive={pathname === `/threads/${thread.category}`}
                className={pathname === `/threads/${thread.category}` ? 'bg-secondary-500 text-accent-700' : ''}
              >
                <Link
                  href={`/threads/${thread.category}`}
                  className={`flex items-center gap-3 ${pathname === `/threads/${thread.category}` ? 'text-accent-700 bg-secondary-500' : 'text-accent-500 hover:bg-primary-200 hover:text-accent-700'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary-200 border border-primary-300 flex-shrink-0 overflow-hidden">
                    <img
                      src={thread.imageUrl}
                      alt={thread.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.style.background = 'linear-gradient(45deg, var(--color-primary-300), var(--color-secondary-300))';
                      }}
                    />
                  </div>
                  <span className="truncate text-xs font-medium flex-1 min-w-0">{thread.title}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </div>
    </SidebarMenuItem>
  )
}

function NgamJeAssistantMenuItem() {
  const [isOpen, setIsOpen] = useState(false)
  const [visibleChats, setVisibleChats] = useState(5)
  const [loading, setLoading] = useState(false)
  const KEEP_RECENT_COUNT = 10 // Always keep first 10 items loaded
  const MAX_LOADED_COUNT = 25 // Start deloading after this many items
  const DELOAD_TO_COUNT = 15 // Deload back to this count

  const handleNewChat = () => {
    // Future implementation for creating new chat
    console.log("Creating new AI chat...")
  }

  const handleChatClick = (chatId: number) => {
    // Future implementation for opening existing chat
    console.log("Opening chat:", chatId)
  }

  const loadMoreChats = () => {
    if (loading || visibleChats >= mockChatHistory.length) return

    setLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      const newCount = Math.min(visibleChats + 5, mockChatHistory.length)

      // Hybrid deloading: if we exceed MAX_LOADED_COUNT, deload older items
      if (newCount > MAX_LOADED_COUNT) {
        setVisibleChats(Math.max(DELOAD_TO_COUNT, KEEP_RECENT_COUNT))
      } else {
        setVisibleChats(newCount)
      }

      setLoading(false)
    }, 300)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

    // Load more when near bottom
    if (scrollHeight - scrollTop <= clientHeight + 5) {
      loadMoreChats()
    }

    // Optional: Reset to recent items when scrolled back to top
    if (scrollTop === 0 && visibleChats > KEEP_RECENT_COUNT) {
      // Small delay to avoid flickering during fast scrolling
      const currentTarget = e.currentTarget
      setTimeout(() => {
        if (currentTarget && currentTarget.scrollTop === 0) {
          setVisibleChats(KEEP_RECENT_COUNT)
        }
      }, 500)
    }
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
        className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <SidebarMenuSub>

          {/* Chat History Header */}
          <SidebarMenuSubItem>
            <div className="flex items-center gap-2 px-2 py-1">
              <Clock className="w-4 h-4 text-accent-700" />
              <span className="text-sm font-medium text-accent-700">
                Chat History
              </span>
            </div>
          </SidebarMenuSubItem>

          {/* Chat History List */}
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
                  <div className="text-xs text-accent-400">
                    Loading...
                  </div>
                </div>
              )}

              {visibleChats >= mockChatHistory.length && mockChatHistory.length > 5 && (
                <div className="flex justify-center py-2">
                  <div className="text-xs text-accent-400">
                    No more chats
                  </div>
                </div>
              )}

              {visibleChats < mockChatHistory.length && visibleChats >= MAX_LOADED_COUNT && (
                <div className="flex justify-center py-2">
                  <div className="text-xs text-accent-300">
                    {mockChatHistory.length - visibleChats} older chats hidden
                  </div>
                </div>
              )}
            </div>
          </SidebarMenuSubItem>

          {/* New Chat Button */}
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
  )
}

function NavigationMenuItem() {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // When collapsed, render individual nav items directly
  if (isCollapsed) {
    return (
      <>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
              className={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? 'bg-secondary-500 text-accent-700' : ''}
            >
              <Link
                href={item.href}
                className={`${pathname === item.href ? 'text-accent-700 bg-secondary-500' : 'text-accent-500 hover:bg-primary-200 hover:text-accent-700'}`}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </>
    )
  }

  // When expanded, show grouped navigation with submenu
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
        className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <SidebarMenuSub>
          {navItems.map((item) => (
            <SidebarMenuSubItem key={item.href}>
              <SidebarMenuSubButton
                asChild
                isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                className={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? 'bg-secondary-500 text-accent-700' : ''}
              >
                <Link
                  href={item.href}
                  className={`${pathname === item.href ? 'text-accent-700 bg-secondary-500' : 'text-accent-500 hover:bg-primary-200 hover:text-accent-700'}`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </div>
    </SidebarMenuItem>
  )
}

function CustomSidebarTrigger({ onManualToggle }: { onManualToggle: () => void }) {
  return (
    <button
      onClick={onManualToggle}
      className="absolute -right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center border-0 outline-none bg-neutral-50 text-accent-700 border-2 border-accent-700 hover:bg-primary-200 transition-colors"
      title="Toggle sidebar"
      style={{ top: '50%', transform: 'translateY(-50%)' }}
    >
      <Menu className="w-4 h-4" />
    </button>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { state, setOpen } = useSidebar()
  const [isManuallyToggled, setIsManuallyToggled] = useState(state === "expanded")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle hover effects only if not manually toggled open
  useEffect(() => {
    if (!isManuallyToggled) {
      setOpen(isHovered)
    }
  }, [isHovered, isManuallyToggled, setOpen])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleManualToggle = () => {
    const newState = !isManuallyToggled
    setIsManuallyToggled(newState)
    setOpen(newState)
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    // Simulate AI-powered tool search
    console.log("AI searching for best tool based on:", query)

    // Mock delay for AI processing
    setTimeout(() => {
      // Future implementation: AI will analyze the query and suggest the best tool/action
      console.log("AI found best tool for:", query)
      setIsSearching(false)
    }, 1000)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  if (!mounted) {
    return null
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="!relative hidden md:flex flex-col h-full group-data-[state=collapsing]:opacity-0 group-data-[state=expanding]:opacity-0 transition-opacity duration-300"
    >
      <SidebarHeader className="relative p-2">
        <CustomSidebarTrigger onManualToggle={handleManualToggle} />

        {/* AI Search Bar in header - only show when expanded */}
        <div className="mt-2">
          <form onSubmit={handleSearchSubmit} className="group-data-[collapsible=icon]:hidden">
            <div className="relative max-w-48 mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-accent-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                className="w-full pl-10 pr-3 py-2 text-xs bg-neutral-100 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent placeholder-neutral-500"
                disabled={isSearching}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-secondary-500"></div>
                </div>
              )}
            </div>
          </form>
          {/* Invisible spacer when collapsed to maintain header height */}
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

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <NgamJeAssistantMenuItem />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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

      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden mt-auto">
        <div className="p-4 text-center w-56 mx-auto overflow-hidden">
          <p className="text-xs text-accent-500 leading-relaxed">
            Ngam-je by Team Cracked Heads™ <span className="text-[10px]">soon</span> 2025.
            <br />
            All rights reserved
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

