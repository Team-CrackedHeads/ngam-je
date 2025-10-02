"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageCircle, User, Settings, ArrowLeft, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
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

function CustomSidebarTrigger() {
  const { state, toggleSidebar } = useSidebar()
  const isOpen = state === "expanded"

  return (
    <button
      onClick={toggleSidebar}
      className="absolute -right-4 top-2 z-10 w-8 h-8 rounded-full bg-sidebar border border-sidebar-border shadow-md flex items-center justify-center hover:bg-sidebar-accent transition-colors"
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

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="!relative !h-full [&>[data-slot=sidebar-container]]:!relative [&>[data-slot=sidebar-container]]:!h-full [&>[data-slot=sidebar-container]]:!inset-y-auto"
    >
      <SidebarHeader className="relative p-2">
        <CustomSidebarTrigger />
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
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

