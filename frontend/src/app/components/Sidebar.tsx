"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageCircle, User, Settings, ArrowLeft, ArrowRight, Bot, Plus, ChevronDown, ChevronRight, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { COLORS } from "../theme"
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

// Mock chat history data
const mockChatHistory = [
  { id: 1, title: "Help with React hooks", timestamp: "2 hours ago" },
  { id: 2, title: "Explain TypeScript types", timestamp: "1 day ago" },
  { id: 3, title: "CSS Grid layout question", timestamp: "3 days ago" },
  { id: 4, title: "Next.js routing help", timestamp: "1 week ago" },
  { id: 5, title: "Database design advice", timestamp: "2 weeks ago" },
]

function AIChatMenuItem() {
  const [isOpen, setIsOpen] = useState(false)

  const handleNewChat = () => {
    // Future implementation for creating new chat
    console.log("Creating new AI chat...")
  }

  const handleChatClick = (chatId: number) => {
    // Future implementation for opening existing chat
    console.log("Opening chat:", chatId)
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => setIsOpen(!isOpen)}
        className="group/menu-item"
      >
        <Bot className="w-4 h-4" />
        <span>AI Assistant</span>
        {isOpen ? (
          <ChevronDown className="ml-auto h-4 w-4 transition-transform" />
        ) : (
          <ChevronRight className="ml-auto h-4 w-4 transition-transform" />
        )}
      </SidebarMenuButton>

      {isOpen && (
        <SidebarMenuSub>
          {/* Chat History */}
          <div className="max-h-32 overflow-y-auto">
            {mockChatHistory.map((chat) => (
              <SidebarMenuSubItem key={chat.id}>
                <SidebarMenuSubButton
                  onClick={() => handleChatClick(chat.id)}
                  className="w-full justify-start gap-2 text-xs transition-colors"
                  style={{
                    color: COLORS.text
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.hoverBg
                    e.currentTarget.style.color = COLORS.textActive
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = COLORS.text
                  }}
                >
                  <Clock
                    className="w-3 h-3 flex-shrink-0"
                    style={{ color: COLORS.text + '80' }} // 50% opacity
                  />
                  <div className="flex-1 text-left">
                    <div className="truncate font-medium">{chat.title}</div>
                    <div
                      className="text-[10px]"
                      style={{ color: COLORS.text + '80' }} // 50% opacity for timestamp
                    >
                      {chat.timestamp}
                    </div>
                  </div>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </div>

        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

function CustomSidebarTrigger({ onManualToggle }: { onManualToggle: () => void }) {
  const { state } = useSidebar()
  const isOpen = state === "expanded"

  return (
    <button
      onClick={onManualToggle}
      className="absolute -right-4 top-2 z-10 w-8 h-8 rounded-full flex items-center justify-center border-0 outline-none"
      style={{
        backgroundColor: 'var(--sidebar-background, #f8f9fa)',
        color: COLORS.textActive,
        borderRight: `2px solid ${COLORS.accentActive}`,
        borderRadius: '50%'
      }}
    >
      {isOpen ? (
        <ArrowLeft className="w-4 h-4" />
      ) : (
        <ArrowRight className="w-4 h-4" />
      )}
    </button>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { state, setOpen } = useSidebar()
  const [isManuallyToggled, setIsManuallyToggled] = useState(state === "expanded")

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

  const handleNewChat = () => {
    // Future implementation for creating new chat
    console.log("Creating new AI chat...")
  }

  if (!mounted) {
    return null
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="!relative"
    >
        <SidebarHeader className="relative p-2">
          <CustomSidebarTrigger onManualToggle={handleManualToggle} />
        </SidebarHeader>
        <SidebarContent
          className="pt-4 flex-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
        <SidebarGroup>
          <SidebarGroupLabel>Ngam-je Assistant</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <AIChatMenuItem />
              <SidebarMenuItem className="mt-2">
                <SidebarMenuButton
                  onClick={handleNewChat}
                  className="w-full justify-start gap-2 transition-all duration-200 border shadow-sm"
                  style={{
                    backgroundColor: COLORS.activeBg,
                    color: COLORS.textActive,
                    borderColor: COLORS.accentActive,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.accentActive
                    e.currentTarget.style.color = COLORS.textActive
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.activeBg
                    e.currentTarget.style.color = COLORS.textActive
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(0.98)'
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px) scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>New AI Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    style={pathname === item.href ? {
                      backgroundColor: COLORS.activeBg,
                      color: COLORS.textActive
                    } : {}}
                  >
                    <Link
                      href={item.href}
                      style={{
                        color: pathname === item.href ? COLORS.textActive : COLORS.text
                      }}
                      onMouseEnter={(e) => {
                        if (pathname !== item.href) {
                          e.currentTarget.style.backgroundColor = COLORS.hoverBg
                          e.currentTarget.style.color = COLORS.textActive
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (pathname !== item.href) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = COLORS.text
                        }
                      }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

