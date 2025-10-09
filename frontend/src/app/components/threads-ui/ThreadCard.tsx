"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Pin,
  Flame,
  MoreVertical,
  Users,
  Eye,
  ArrowUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ThreadData } from "../../../utils/mock-threads-data";

// --- helpers ---
function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function getProgressPercentage(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min((current / goal) * 100, 100);
}

// --- component ---
type ThreadCardProps = {
  thread: ThreadData;
};

export default function ThreadCard({ thread }: ThreadCardProps) {
  const router = useRouter();
  const progressPercent = getProgressPercentage(
    thread.currentTokens,
    thread.goalTokens
  );

  if (!thread) return null;

  const handleViewThread = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/threads/${thread.category}`);
  };

  return (
    <Card
      className="flex flex-col h-full border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
      onClick={() => router.push(`/threads/${thread.category}`)}
    >
      {/* --- Image Header --- */}
      <CardHeader className="p-0 relative flex-shrink-0">
        <div className="relative w-full h-40 sm:h-44 md:h-48 lg:h-52">
          <img
            src={thread.imageUrl}
            alt={thread.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://placehold.co/800x400/cccccc/333333?text=No+Image";
            }}
          />

          {/* badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {thread.isPinned && (
              <Badge className="bg-secondary-500 text-accent-700 border border-secondary-600">
                <Pin className="w-3 h-3 mr-1" /> Pinned
              </Badge>
            )}
            {thread.isHot && (
              <Badge className="bg-orange-500 text-white">
                <Flame className="w-3 h-3 mr-1" /> Hot
              </Badge>
            )}
          </div>

          {/* popover */}
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
              className="w-64 p-4 rounded-xl shadow-lg border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-semibold text-sm mb-2 text-gray-700">
                Thread Stats
              </h4>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <Stat icon={<Users />} label="Contributors" value={thread.contributions} />
                <Stat icon={<Eye />} label="Views" value={thread.views} />
                <Stat icon={<ArrowUp className="text-green-500" />} label="Upvotes" value={thread.upvotes} />
                <Stat icon={<Clock />} label="Posted" value={thread.timeAgo} />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      {/* --- Main Body --- */}
      <CardContent className="flex flex-col flex-grow p-4 sm:p-5">
        {/* Title */}
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-accent-700 line-clamp-2 mb-1">
          {thread.title}
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-500 line-clamp-2 flex-grow mb-3">
          {thread.description}
        </p>

        {/* --- Tags (scrollable and above progress) --- */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 mb-3">
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

        {/* --- Progress Bar --- */}
        <div className="mt-1">
          <div className="flex justify-between text-xs sm:text-sm mb-1 font-medium">
            <span className="text-accent-500">Boost Progress</span>
            <span className="text-accent-500 font-semibold">
              {formatNumber(thread.currentTokens)} / {formatNumber(thread.goalTokens)} tokens
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="flex items-center text-gray-500">
        <span className="w-4 h-4 mr-2 text-gray-400">{icon}</span>
        {label}
      </span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}