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

/* Helper Functions */
function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

function getProgressPercentage(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min((current / goal) * 100, 100);
}

/* Props Type */
type ThreadCardProps = {
  thread: ThreadData;
};

/* Main Component */
export default function ThreadCard({ thread }: ThreadCardProps) {
  const router = useRouter();
  const progressPercent = getProgressPercentage(
    thread.currentTokens,
    thread.goalTokens
  );

  const handleViewThread = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/threads/${thread.category}`);
  };

  return (
    <Card
      className="flex flex-col h-full border border-gray-100 overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
      onClick={() => router.push(`/threads/${thread.category}`)}
    >
      {/* Header with Image */}
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

          {/* Top-left Badges (Pinned and Hot) */}
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

          {/* Popover Button */}
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

            {/* Thread Stats & Icons */}
            <PopoverContent
              side="bottom"
              align="end"
              className="w-52 p-2.5 rounded-lg shadow-xl border border-gray-100 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-[13px] font-semibold text-gray-800 pb-1 mb- border-b border-gray-100">
                Thread Stats
              </h4>

              <div className="flex flex-col gap-0.5">
                <Stat
                  icon={<Users className="w-3 h-3 text-black-500" />}
                  label="Contributors"
                  value={thread.contributions}
                />
                <Stat
                  icon={<Eye className="w-3 h-3 text-black-500" />}
                  label="Views"
                  value={thread.views}
                />
                <Stat
                  icon={<ArrowUp className="w-3 h-3 text-black-500" />}
                  label="Upvotes"
                  value={thread.upvotes}
                />
                <Stat
                  icon={<Clock className="w-3 h-3 text-black-500" />}
                  label="Posted"
                  value={thread.timeAgo}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="flex flex-col flex-grow p-4 sm:p-5">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-accent-700 line-clamp-2 mb-1">
          {thread.title}
        </h2>

        <p className="text-sm sm:text-base text-gray-500 line-clamp-2 flex-grow mb-3">
          {thread.description}
        </p>

        {/* Tag Badges */}
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

        {/* Progress Bar */}
        <div className="mt-1">
          <div className="flex justify-between text-xs sm:text-sm mb-1 font-medium">
            <span className="text-accent-500">Boost Progress</span>
            <span className="text-accent-500 font-semibold">
              {formatNumber(thread.currentTokens)} /{" "}
              {formatNumber(thread.goalTokens)} tokens
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

/* Stat */
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <div className="flex justify-between items-center py-0.5 px-1 hover:bg-gray-100 rounded-md transition-colors">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-gray-600 text-[11px] font-normal">{label}</span>
      </div>
      <span className="font-semibold text-gray-900 text-[11px]">
        {displayValue}
      </span>
    </div>
  );
}