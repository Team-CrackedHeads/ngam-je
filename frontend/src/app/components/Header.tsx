"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Puzzle, Bell, LogOut, Home, MessageCircle, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type HeaderProps = {
  username?: string;
  notifications?: number;
};

const Header = ({ username, notifications = 0 }: HeaderProps) => {
  const pathname = usePathname();


  return (
    <header className="w-full flex justify-between items-center px-4 sm:px-6 py-3 bg-primary-100 border-b-8 border-secondary-500">
      {/* Left Logo / App Name + Nav (desktop only) */}
      <div className="flex items-center gap-6">
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
              {username ? `Welcome, ${username}!` : "Welcome!"}
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
