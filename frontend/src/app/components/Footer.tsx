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
    // { href: "/ask-ai", label: "Ask AI", icon: Bot, big: true },
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
          return link.big ? (
            // Big Center Button
            <div key={index} className="absolute -top-6 sm:-top-8">
              <Link
                href={link.href}
                className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg transition"
                style={{
                  background:
                    pathname === link.href
                      ? COLORS.accentActive
                      : `linear-gradient(to right, ${COLORS.accentFrom}, ${COLORS.accentTo})`,
                  color: COLORS.textActive,
                }}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="text-[10px] sm:text-xs">{link.label}</span>
              </Link>
            </div>
          ) : (
            // Normal Buttons
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
