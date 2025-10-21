"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

/* function to determine if the user is on a mobile (coarse pointer) device */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

/* responsive for desktop hover or mobile popover) */
function TierBadge({ tierLevel }: { tierLevel: number }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Tier colors
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 0:
        return { bg: "bg-neutral-300", text: "text-neutral-700" };
      case 1:
        return { bg: "bg-primary-400", text: "text-primary-900" };
      case 2:
        return { bg: "bg-secondary-400", text: "text-accent-700" };
      case 3:
        return { bg: "bg-accent-600", text: "text-white" };
      default:
        return { bg: "bg-neutral-300", text: "text-neutral-700" };
    }
  };

  const tierColor = getTierColor(tierLevel);

  const TierContent = (
    <div className="w-72 p-4 rounded-lg shadow-md border border-gray-100 bg-white">
      <h4 className="text-xs font-semibold text-gray-700 mb-3">Current Tier</h4>
      <div className="relative px-5 py-6 overflow-visible">
        {/* Base Line */}
        <div
          className="absolute left-5 right-5 h-[2px] bg-gray-300 z-0"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        />
        {/* Progress Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `calc(${(tierLevel / 3) * 100}%)` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute left-5 h-[2px] bg-[var(--color-secondary-500)] z-0"
          style={{
            maxWidth: "calc(100% - 40px)",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        {[0, 1, 2, 3].map((tier) => {
          const isActive = tier <= tierLevel;
          const isCurrent = tier === tierLevel;
          const position =
            tier === 0
              ? "20px"
              : tier === 3
              ? "calc(100% - 20px)"
              : `calc(20px + (100% - 40px) * ${tier / 3})`;

          return (
            <div
              key={tier}
              className="absolute z-10 overflow-visible"
              style={{
                left: position,
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                whileHover={{ scale: 1.3 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-secondary-500)]"
                    : "bg-gray-200"
                }`}
              >
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </motion.div>
              <span
                className={`absolute left-1/2 -translate-x-1/2 top-7 text-[11px] font-medium whitespace-nowrap ${
                  isActive ? "text-accent-700" : "text-gray-400"
                }`}
              >
                {tier}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Badge
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className={`${tierColor.bg} ${tierColor.text} font-semibold text-xs sm:text-sm px-2 py-1 rounded-md cursor-pointer`}
          >
            Tier {tierLevel}
          </Badge>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-72 p-0 rounded-lg shadow-md border border-gray-100 bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          {TierContent}
        </PopoverContent>
      </Popover>
    );
  }

  /* Desktop Hover Card */
  return (
    <HoverCard openDelay={150} closeDelay={150}>
      <HoverCardTrigger asChild>
        <Badge
          className={`${tierColor.bg} ${tierColor.text} font-semibold text-xs sm:text-sm px-2 py-1 rounded-md cursor-pointer`}
          onClick={(e) => e.stopPropagation()}
        >
          Tier {tierLevel}
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-72 p-0 rounded-lg shadow-md border border-gray-100 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {TierContent}
      </HoverCardContent>
    </HoverCard>
  );
}

export default TierBadge;