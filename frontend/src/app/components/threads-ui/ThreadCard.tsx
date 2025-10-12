"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Pin,
  Flame,
  MoreVertical,
  Users,
  MessageCircle,
  Eye,
  ArrowUp,
  Clock,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ThreadData } from "../../../utils/mock-threads-data";
import { COLORS } from "@/app/theme";

// tells typescript what data this component expects
type ThreadCardProps = {
  thread: ThreadData; // the thread info to show on the card
};

// makes numbers look nice with commas (1000 becomes 1,000)
function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

// figures out what percentage of the goal is reached (returns 0-100)
function getProgressPercentage(current: number, goal: number): number {
  if (goal <= 0) return 0; // don't divide by zero
  const percentage = (current / goal) * 100;
  return Math.min(percentage, 100); // never go over 100%
}

// the main card component that shows one thread
function ThreadCard({ thread }: ThreadCardProps) {
  const router = useRouter();

  // make sure we got valid thread data, don't crash if something's wrong
  if (!thread) {
    console.error("ThreadCard received undefined thread data.");
    return null;
  }

  // calculate how full the progress bar should be
  const progressPercent = getProgressPercentage(
    thread.currentTokens,
    thread.goalTokens
  );

  // when user clicks "view thread" button, go to that thread's page
  const handleViewThread = () => {
    router.push(`/threads/${thread.category}`);
  };

  // when user clicks anywhere on the card, go to that thread's page
  const handleCardClick = () => {
    router.push(`/threads/${thread.category}`);
  };

  return (
    // main card container - fixed height so all cards look the same size
    <Card
      className="overflow-hidden border border-gray-100 transition-shadow hover:shadow-xl cursor-pointer h-[650px] flex flex-col"
      onClick={handleCardClick}
    >
      {/* image section at the top - fixed height */}
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative w-full h-48">
          {/* thread image */}
          <img
            src={thread.imageUrl}
            alt={thread.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // if image fails to load, show a placeholder instead
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://placehold.co/800x400/cccccc/333333?text=Image+Missing";
            }}
          />
          {/* badges shown on top of the image */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {/* pinned badge (only shows if thread is pinned) */}
            {thread.isPinned && (
              <Badge
                variant="default"
                className="hover:opacity-90"
                style={{
                  backgroundColor: COLORS.activeBg,
                  color: COLORS.text,
                }}
              >
                <Pin className="w-3 h-3 mr-1" />
                Pinned
              </Badge>
            )}
            {/* hot badge (only shows if thread is trending) */}
            {thread.isHot && (
              <Badge variant="default" className="bg-orange-500 text-white">
                <Flame className="w-3 h-3 mr-1" />
                Hot
              </Badge>
            )}
          </div>
          {/* settings button in top right corner */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 rounded-full"
            onClick={(e) => {
              e.stopPropagation(); // don't trigger the card click when clicking this button
              console.log("Settings clicked");
            }}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      {/* main content area - takes up remaining space */}
      <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* thread title - bigger text on desktop */}
        <h2
          className="text-lg sm:text-xl lg:text-xl font-bold mb-2 line-clamp-2 h-14 flex-shrink-0"
          style={{ color: COLORS.textActive }}
        >
          {thread.title}
        </h2>

        {/* thread description - bigger text on desktop */}
        <p className="text-sm sm:text-base lg:text-sm text-gray-500 mb-4 line-clamp-2 h-10 flex-shrink-0">
          {thread.description}
        </p>

        {/* stats section with icons and numbers - bigger text on desktop */}
        <div className="flex items-center justify-between flex-wrap text-sm sm:text-base lg:text-lg text-gray-500 border-b pb-3 mb-3 flex-shrink-0 h-16">
          <div className="flex items-center space-x-3">
            {/* how many people contributed */}
            <span className="flex items-center">
              <Users
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
                style={{ color: COLORS.activeBg }}
              />
              {formatNumber(thread.contributions)}
            </span>
            {/* how many comments */}
            <span className="flex items-center">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-gray-400" />
              {formatNumber(thread.comments)}
            </span>
            {/* how many views */}
            <span className="flex items-center">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-gray-400" />
              {formatNumber(thread.views)}
            </span>
            {/* how many upvotes */}
            <span className="flex items-center">
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-green-500" />
              {formatNumber(thread.upvotes)}
            </span>
          </div>
          {/* when this thread was posted */}
          <span className="flex items-center mt-2 sm:mt-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-gray-400" />
            {thread.timeAgo}
          </span>
        </div>

        {/* progress bar section - bigger text on desktop */}
        <div className="mb-3 flex-shrink-0">
          {/* progress label and current numbers */}
          <div className="flex justify-between items-center mb-2 text-sm sm:text-base lg:text-lg font-medium">
            <span style={{ color: COLORS.text }}>Boost Progress</span>
            <span
              className="font-semibold text-xs sm:text-sm lg:text-base"
              style={{ color: COLORS.text }}
            >
              {formatNumber(thread.currentTokens)} /{" "}
              {formatNumber(thread.goalTokens)} tokens
            </span>
          </div>
          {/* actual progress bar */}
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* category tags - bigger text on desktop */}
        <div className="flex flex-wrap gap-1 mb-4 h-8 overflow-hidden flex-shrink-0">
          {thread.tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="hover:opacity-90 text-xs sm:text-sm lg:text-base"
              style={{
                color: COLORS.text,
                backgroundColor: COLORS.accentFrom,
              }}
              onMouseEnter={(e) => {
                // change color when hovering
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  COLORS.activeBg;
                (e.currentTarget as HTMLElement).style.color = COLORS.text;
              }}
              onMouseLeave={(e) => {
                // change back when not hovering
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  COLORS.accentFrom;
                (e.currentTarget as HTMLElement).style.color = COLORS.text;
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* action buttons at the bottom - bigger text on desktop */}
        <div className="flex space-x-3 mt-auto flex-shrink-0 ">
          {/* contribute button */}
          <Button
            variant="outline"
            className="flex-1 text-sm sm:text-base lg:text-lg"
            onClick={(e) => {
              e.stopPropagation(); // don't trigger card click
              console.log("Contribute clicked");
            }}
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            Contribute
          </Button>
          {/* view thread button */}
          <Button
            className="flex-1 hover:opacity-90 text-sm sm:text-base lg:text-lg"
            style={{
              backgroundColor: COLORS.activeBg,
              color: COLORS.text,
            }}
            onMouseEnter={(e) => {
              // darker color when hovering
              (e.currentTarget as HTMLElement).style.backgroundColor =
                COLORS.accentTo;
              (e.currentTarget as HTMLElement).style.color = COLORS.text;
            }}
            onMouseLeave={(e) => {
              // back to normal when not hovering
              (e.currentTarget as HTMLElement).style.backgroundColor =
                COLORS.activeBg;
              (e.currentTarget as HTMLElement).style.color = COLORS.text;
            }}
            onClick={(e) => {
              e.stopPropagation(); // don't trigger card click
              handleViewThread();
            }}
          >
            View Thread
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ThreadCard;
