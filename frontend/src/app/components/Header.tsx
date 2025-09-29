"use client";

import Link from "next/link";
import { COLORS } from "../theme";
import { Puzzle, Bell, LogOut } from "lucide-react";

type HeaderProps = {
  notifications?: number;
};

const Header = ({ notifications = 0 }: HeaderProps) => {
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
          <span
            className="text-xs sm:text-sm"
            style={{ color: COLORS.text }}
          >
            Reuse & Recycle
          </span>
        </div>
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <Link
          href="/notifications"
          className="p-2 rounded-lg transition"
          style={{ color: COLORS.text }}
        >
          <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          {notifications > 0 && (
            <span
              className="absolute -top-1 -right-1 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: "red",
                color: "white",
              }}
            >
              {notifications}
            </span>
          )}
        </Link>

        {/* Logout Button */}
        <Link
          href="/logout"
          className="p-2 rounded-lg transition"
          style={{ color: COLORS.text }}
        >
          <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
