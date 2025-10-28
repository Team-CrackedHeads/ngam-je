"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Puzzle, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth/AuthContext";
import { User } from "@/utils/mock-all-data-used";

type HeaderProps = {
  notifications?: number;
};

const Header = ({ notifications = 0 }: HeaderProps) => {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get current platform user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, [authUser]); // Re-check when auth user changes

  const displayName = currentUser?.name || authUser?.username || "Guest";


  return (
    <header className="w-full flex justify-between items-center px-4 sm:px-6 py-3 bg-primary-100 border-b-8 border-secondary-500">
      {/* Left Logo / App Name + Nav (desktop only) */}
      <div className="flex items-center gap-4 sm:gap-6">
        <SidebarTrigger className="md:hidden text-accent-700 hover:bg-primary-200" />
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-secondary-500">
            <Puzzle className="text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg sm:text-xl text-accent-700">
              Ngam-je
            </span>
            <span className="text-xs sm:text-sm text-accent-500">
              Welcome, {displayName}!
            </span>
          </div>
        </div>
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-3 relative">

        {/* Notifications Button */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative text-accent-500"
        >
          <Link href="/notifications">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            {notifications > 0 && (
              <Badge
                className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-bold bg-error-500 text-white"
              >
                {notifications}
              </Badge>
            )}
          </Link>
        </Button>

        {/* Logout Button */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-accent-500"
        >
          <Link href="/logout">
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;
