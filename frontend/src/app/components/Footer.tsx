"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COLORS } from "../theme";
import { House, MessageSquare, Bot, User, Settings } from "lucide-react";

const Footer = () => {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Threads", icon: House },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 shadow-md pb-[env(safe-area-inset-bottom)]"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="flex justify-around items-center relative h-16 sm:h-20">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              key={index}
              href={link.href}
              className="flex flex-col items-center px-3 py-1 rounded-xl transition font-medium"
              style={{
                backgroundColor:
                  pathname === link.href ? COLORS.activeBg : "transparent",
                color:
                  pathname === link.href ? COLORS.textActive : COLORS.text,
              }}
              onMouseEnter={(e) => {
                if (pathname !== link.href) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    COLORS.hoverBg;
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== link.href) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                }
              }}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;
