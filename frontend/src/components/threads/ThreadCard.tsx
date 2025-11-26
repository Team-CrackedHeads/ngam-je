"use client";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/ui/SafeImage";
import { MoreVertical, Bell, UserPlus, Circle, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ThreadDisplay } from "@/types/thread";
// import { motion } from "framer-motion";
import TierBadge from "@/components/threads/TierBadge";

/* ---------------- Props ---------------- */
type ThreadCardProps = {
  thread: ThreadDisplay;
};

/* ---------------- Component ---------------- */
export default function ThreadCard({ thread }: ThreadCardProps) {
  const router = useRouter();
  // Use tier directly from the API/database, default to 0 if not set
  const tierLevel: number = thread.tier ?? 0;

  return (
    <Card
      className="flex flex-col h-full border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg cursor-pointer p-0"
      onClick={() => router.push(`/threads/${thread.id}`)}
    >
      {/* Header Section */}
      <CardHeader className="p-0 m-0 relative flex-shrink-0">
        <div className="relative w-full h-40 sm:h-44 md:h-48 lg:h-52">
          <SafeImage
            src={thread.imageUrl}
            alt={thread.title}
            width={800}
            height={400}
            className="w-full h-full object-cover"
            maxRetries={3}
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
          <TierBadge tierLevel={tierLevel} category={thread.category} />
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
      </CardContent>
    </Card>
  );
}
