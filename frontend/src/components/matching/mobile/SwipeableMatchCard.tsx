"use client";

import React from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "motion/react";
import { Heart, MapPin, Sparkles, X } from "lucide-react";
import { MatchedListing } from "@/components/matching/types";

interface SwipeableMatchCardProps {
  listing: MatchedListing;
  onSwipe?: (direction: 'left' | 'right') => void;
  onCardClick?: () => void;
  isSelected?: boolean;
  showMatchScore?: boolean;
  enableSwipe?: boolean;
}

export function SwipeableMatchCard({
  listing,
  onSwipe,
  onCardClick,
  isSelected = false,
  showMatchScore = false,
  enableSwipe = true,
}: SwipeableMatchCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const horizontalSwipe = Math.abs(info.offset.x) > Math.abs(info.offset.y);

    if (horizontalSwipe && (Math.abs(info.velocity.x) >= 500 || Math.abs(info.offset.x) >= threshold)) {
      onSwipe?.(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  const matchScore = listing.matchScore || 85;
  const getMatchColor = (score: number) => {
    if (score >= 75) return { bg: 'from-green-100 to-green-200', text: 'text-green-700', border: 'border-green-300' };
    if (score >= 50) return { bg: 'from-secondary-100 to-secondary-200', text: 'text-secondary-700', border: 'border-secondary-300' };
    return { bg: 'from-red-100 to-red-200', text: 'text-red-700', border: 'border-red-300' };
  };
  const colors = getMatchColor(matchScore);

  return (
    <motion.div
      style={{
        x: enableSwipe ? x : 0,
        rotate: enableSwipe ? rotate : 0,
        opacity: enableSwipe ? opacity : 1,
      }}
      drag={enableSwipe ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      className="w-full h-full"
    >
      <div
        onClick={onCardClick}
        className={`w-full h-full bg-white rounded-2xl shadow-xl border flex flex-col ${
          isSelected ? 'border-4 border-secondary-500' : 'border border-neutral-300'
        } ${onCardClick ? 'cursor-pointer' : ''}`}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0 rounded-t-2xl overflow-hidden">
          <span className="text-accent-400">Image</span>

          {/* Match Score Badge */}
          {showMatchScore && (
            <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}>
              <Sparkles size={12} />
              <span className="text-xs font-bold">{matchScore}%</span>
            </div>
          )}

          {/* Selection Checkbox for Compare Mode */}
          {isSelected && (
            <div className="absolute top-3 left-3">
              <div className="w-7 h-7 rounded border-2 flex items-center justify-center bg-secondary-500 border-secondary-500">
                <svg className="w-4 h-4 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 flex flex-col gap-1.5 overflow-hidden">
          <h3 className="font-bold text-base text-accent-700 line-clamp-2">
            {listing.title}
          </h3>
          <div className="text-lg font-bold text-secondary-600">
            RM {listing.price?.toLocaleString() || '0'}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary-200 text-accent-600 font-medium">
              {listing.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-accent-500">
              <MapPin size={11} />
              <span className="line-clamp-1">{listing.location}</span>
            </div>
          </div>
          <p className="text-xs text-accent-500 line-clamp-2">
            {listing.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
