"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MoreVertical,
  Bell,
  UserPlus,
  Circle,
  User,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ThreadData } from "@/utils/mock-threads-data";
import { motion } from "framer-motion";
import TierBadge from "@/app/components/threads-ui/TierBadge";

/* ---------------- Helper Functions ---------------- */
function getTierLevel(current: number, goal: number): number {
  if (goal <= 0) return 0;
  const progress = (current / goal) * 100;
  if (progress >= 75) return 3;
  if (progress >= 50) return 2;
  if (progress >= 25) return 1;
  return 0;
}

/* ---------------- Props ---------------- */
type ThreadCardProps = {
  thread: ThreadData;
};

/* ---------------- Component ---------------- */
export default function ThreadCard({ thread }: ThreadCardProps) {
  const router = useRouter();
  const tierLevel = getTierLevel(thread.currentTokens, thread.goalTokens);
  const [showTierDetails, setShowTierDetails] = useState(false);

  return (
    <Card
      className="flex flex-col h-full border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg cursor-pointer p-0"
      onClick={() => router.push(`/threads/${thread.category}`)}
    >
      {/* Header Section */}
      <CardHeader className="p-0 m-0 relative flex-shrink-0">
        <div className="relative w-full h-40 sm:h-44 md:h-48 lg:h-52">
          <Image
            src={thread.imageUrl}
            alt={thread.title}
            width={800}
            height={400}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://placehold.co/800x400/cccccc/333333?text=No+Image";
            }}
          />


          {/* Menu for options */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              side="bottom"
              align="end"
              className="w-48 p-2 rounded-lg shadow-xl border border-gray-100 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1">
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add follow logic here
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  Follow Thread
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add mute logic here
                  }}
                >
                  <Bell className="w-4 h-4" />
                  Mute Notifications
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      {/* ---------- Card Body ---------- */}
      <CardContent className="flex flex-col flex-grow p-4 sm:p-5">
        {/* Tier Badge and User Stats */}
        <div className="flex items-center justify-between mb-2">
          <TierBadge tierLevel={tierLevel} />
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Circle className="w-2 h-2 fill-success-500 text-success-500" />
              <span>{thread.onlineUsers || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{thread.totalUsers || 0}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-accent-700 line-clamp-2 mb-2">
          {thread.title}
        </h2>

        <p className="text-sm sm:text-base text-gray-500 line-clamp-2 flex-grow mb-3">
          {thread.description}
        </p>

        {/* Tags */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {thread.tags.map((tag, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-xs sm:text-sm text-accent-500 bg-secondary-500 hover:bg-secondary-100 whitespace-nowrap flex-shrink-0"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* ---------- Tier Progress Section ---------- */}
        <div className="mt-3 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm font-medium text-accent-500">
              Current Tier: <span className="font-semibold">{tierLevel}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-accent-500 hover:text-accent-700 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowTierDetails(!showTierDetails);
              }}
            >
              {showTierDetails ? (
                <>
                  Hide Details <ChevronUp className="w-3 h-3 ml-1" />
                </>
              ) : (
                <>
                  See Details <ChevronDown className="w-3 h-3 ml-1" />
                </>
              )}
            </Button>
          </div>

          {showTierDetails && (
            <div
              className="relative px-5 py-6 mt-2 overflow-visible"
              style={{ minHeight: "80px" }} // Increased height to prevent cutoff
            >
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

              {/* Tier Nodes */}
              {[0, 1, 2, 3].map((tier, index) => {
                const isActive = tier <= tierLevel;
                const isCurrent = tier === tierLevel;
                const availableWidth = "calc(100% - 40px)";
                const position =
                  index === 0
                    ? "20px"
                    : index === 3
                    ? "calc(100% - 20px)"
                    : `calc(20px + (${availableWidth}) * ${index / 3})`;

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
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      }}
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

                    {/* Labels now have more spacing */}
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
