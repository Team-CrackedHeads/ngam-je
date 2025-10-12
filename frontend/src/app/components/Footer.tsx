"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COLORS } from "../theme";
import { House, MessageSquare, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      className="fixed bottom-0 left-0 right-0 shadow-md pb-[env(safe-area-inset-bottom)] block md:hidden"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="flex justify-around items-stretch relative h-16">
        {links.map((link, index) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

          return (
            <Button
              key={index}
              asChild
              variant="ghost"
              className="flex-1 h-full flex flex-col items-center justify-center rounded-xl font-medium px-4 py-2 transition"
              style={{
                backgroundColor: isActive ? COLORS.activeBg : "transparent",
                color: isActive ? COLORS.textActive : COLORS.text,
              }}
            >
              <Link href={link.href} className="flex flex-col items-center gap-1">
                <Icon
                  className={`${
                    isActive
                      ? "w-7 h-7"
                      : "w-5 h-5"
                  } transition-transform duration-200`}
                />
                <span className="text-[10px]">{link.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;
