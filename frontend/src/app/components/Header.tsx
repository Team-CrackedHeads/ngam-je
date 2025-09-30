"use client";

import Link from "next/link";
import { Puzzle, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COLORS } from "../theme";

type HeaderProps = {
  username?: string;
  notifications?: number;
};

const Header = ({ username, notifications = 0 }: HeaderProps) => {
  return (
    <header
      className="w-full flex justify-between items-center px-4 sm:px-6 py-3"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Left Logo / App Name */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl"
          style={{ backgroundColor: COLORS.accentTo }}
        >
          <Puzzle style={{ color: "black" }} />
        </div>
        <div className="flex flex-col">
          <span
            className="font-bold text-lg sm:text-xl"
            style={{ color: COLORS.accentActive }}
          >
            Ngam.je
          </span>
          <span className="text-xs sm:text-sm" style={{ color: COLORS.text }}>
            {username ? `Welcome, ${username}!` : "Welcome!"}
          </span>
        </div>
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-3 relative">
        {/* Notifications Button */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative"
          style={{ color: COLORS.text }}
        >
          <Link href="/notifications">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            {notifications > 0 && (
              <Badge
                className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs font-bold"
                style={{ backgroundColor: "red", color: "white" }}
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
          style={{ color: COLORS.text }}
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
