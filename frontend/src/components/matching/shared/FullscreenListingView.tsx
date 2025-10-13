"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  X,
  MapPin,
  Clock,
  Heart,
  Ban,
  Sparkles,
  GitCompare,
  MessageCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Undo2,
} from "lucide-react";
import { MatchedListing } from "../types";
import { useCompare } from "../contexts/CompareContext";

interface FullscreenListingViewProps {
  isOpen: boolean;
  listings: MatchedListing[];
  initialIndex?: number;
  onClose: () => void;
  onLike?: (listing: MatchedListing) => void;
  onPass?: (listing: MatchedListing) => void;
  onUndo?: (listing: MatchedListing) => void;
  onMessage?: (listing: MatchedListing) => void;
  onViewDetails?: (listing: MatchedListing) => void;
  showActions?: boolean;
  columnType?: "queue" | "liked" | "passed";
}

export function FullscreenListingView({
  isOpen,
  listings,
  initialIndex = 0,
  onClose,
  onLike,
  onPass,
  onUndo,
  onMessage,
  onViewDetails,
  showActions = true,
  columnType = "queue",
}: FullscreenListingViewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const {
    compareMode,
    toggleCompareMode,
    isSelected,
    addToCompare,
    removeFromCompare,
    selectedForCompare,
  } = useCompare();

  const currentListing = listings[currentIndex];

  const toggleTags = (id: string) => {
    setExpandedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < listings.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleToggleSelect = () => {
    if (!currentListing) return;

    if (isSelected(currentListing.id)) {
      removeFromCompare(currentListing.id);
    } else {
      addToCompare(currentListing.id);
    }
  };

  if (!isOpen || !currentListing) return null;

  const getMatchColor = (score: number) => {
    if (score >= 75)
      return {
        bg: "from-green-100 to-green-200",
        text: "text-green-700",
        border: "border-green-300",
      };
    if (score >= 50)
      return {
        bg: "from-secondary-100 to-secondary-200",
        text: "text-secondary-700",
        border: "border-secondary-300",
      };
    return {
      bg: "from-red-100 to-red-200",
      text: "text-red-700",
      border: "border-red-300",
    };
  };

  const colors = getMatchColor(currentListing.matchScore);
  const cardSelected = isSelected(currentListing.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl"
        >
          <Card className="bg-white flex flex-col overflow-hidden border-neutral-200 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-accent-700">
                  {columnType === "queue" && "For You"}
                  {columnType === "liked" && "Liked"}
                  {columnType === "passed" && "Passed"}
                </h2>
                <span className="text-sm text-accent-500">
                  {currentIndex + 1} of {listings.length}
                </span>
                {compareMode && selectedForCompare.length > 0 && (
                  <Badge className="bg-secondary-100 text-secondary-700 border-0">
                    {selectedForCompare.length} selected
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Compare Mode Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCompareMode}
                  className={`rounded-lg transition-colors ${
                    compareMode
                      ? "bg-secondary-500 text-accent-700"
                      : "hover:bg-primary-100"
                  }`}
                  title="Toggle Compare Mode"
                >
                  <GitCompare
                    className={`h-5 w-5 ${
                      compareMode ? "text-accent-700" : "text-accent-600"
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="rounded-full hover:bg-primary-100 transition-colors"
                >
                  <X className="h-5 w-5 text-accent-600" />
                </Button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto touch-scroll">
              <div className="p-6">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Image and Match Info */}
                  <div className="space-y-4">
                    {/* Image */}
                    <div
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-primary-100 ${
                        cardSelected ? "ring-4 ring-secondary-500" : ""
                      }`}
                    >
                      <img
                        src={currentListing.images[0]}
                        alt={currentListing.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Match Score Badge */}
                      <div
                        className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}
                      >
                        <Sparkles size={16} />
                        <span className="text-sm font-bold">
                          {currentListing.matchScore}% Match
                        </span>
                      </div>
                      {/* Selection Checkbox for Compare Mode */}
                      {compareMode && (
                        <div className="absolute top-4 left-4">
                          <button
                            onClick={handleToggleSelect}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                              cardSelected
                                ? "bg-secondary-500 border-secondary-500"
                                : "bg-white/80 border-neutral-400 hover:bg-white"
                            }`}
                          >
                            {cardSelected && (
                              <svg
                                className="w-6 h-6 text-accent-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Match Reasons */}
                    {currentListing.matchReasons &&
                      currentListing.matchReasons.length > 0 && (
                        <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className="text-success-600" />
                            <h3 className="font-semibold text-accent-700">
                              Why this matches
                            </h3>
                          </div>
                          <div className="space-y-2">
                            {currentListing.matchReasons.map((reason, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-sm"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-success-500 mt-1.5 shrink-0" />
                                <span className="text-accent-600">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Right Column - Details */}
                  <div className="space-y-4">
                    {/* Title and Price */}
                    <div>
                      <h3 className="text-2xl font-bold text-accent-700 mb-2">
                        {currentListing.title}
                      </h3>
                      <div className="text-3xl font-bold text-secondary-600">
                        RM {currentListing.price?.toLocaleString()}
                      </div>
                      {currentListing.originalAsk &&
                        currentListing.originalAsk !== currentListing.price && (
                          <div className="text-sm text-accent-400 line-through">
                            RM {currentListing.originalAsk.toLocaleString()}
                          </div>
                        )}
                    </div>

                    {/* Category Badge */}
                    <div>
                      <Badge className="bg-primary-200 text-accent-700 border-0 text-sm">
                        {currentListing.category}
                      </Badge>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-semibold text-accent-700 mb-2">
                        Description
                      </h4>
                      <p className="text-accent-600 leading-relaxed">
                        {currentListing.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {currentListing.tags && currentListing.tags.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-accent-700 mb-2">
                          Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(expandedTags.has(currentListing.id)
                            ? currentListing.tags
                            : currentListing.tags.slice(0, 5)
                          ).map((tag, i) => (
                            <Badge
                              key={i}
                              className="bg-primary-100 text-accent-700 border border-primary-300 hover:bg-primary-200"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {currentListing.tags.length > 5 && (
                            <button onClick={() => toggleTags(currentListing.id)}>
                              <Badge className="bg-neutral-200 text-accent-600 border-0 hover:bg-neutral-300 cursor-pointer transition-colors">
                                {expandedTags.has(currentListing.id)
                                  ? "Show less"
                                  : `+${currentListing.tags.length - 5} more`}
                              </Badge>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location and Time */}
                    <div className="space-y-2 text-sm text-accent-500">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{currentListing.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{currentListing.timeAgo}</span>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                      <div className="text-sm text-accent-500 mb-1">Seller</div>
                      <div className="font-semibold text-accent-700">
                        {currentListing.seller}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-primary-50 border-t border-neutral-200 shrink-0">
              <div className="flex items-center justify-between">
                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="border-neutral-300"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentIndex === listings.length - 1}
                    className="border-neutral-300"
                  >
                    Next
                    <ChevronRight size={18} />
                  </Button>
                </div>

                {/* Actions */}
                {showActions && !compareMode && (
                  <div className="flex items-center gap-2">
                    {columnType === "queue" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => onPass?.(currentListing)}
                          className="border-red-300 hover:bg-red-50 text-red-600"
                        >
                          <Ban size={18} className="mr-2" />
                          Pass
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onMessage?.(currentListing)}
                          className="border-neutral-300 hover:bg-primary-50"
                        >
                          <MessageCircle size={18} className="mr-2" />
                          Message
                        </Button>
                        <Button
                          onClick={() => onLike?.(currentListing)}
                          className="bg-secondary-500 hover:bg-secondary-600 text-accent-700"
                        >
                          <Heart size={18} className="mr-2" />
                          Like
                        </Button>
                      </>
                    )}
                    {(columnType === "liked" || columnType === "passed") && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => onMessage?.(currentListing)}
                          className="border-neutral-300 hover:bg-primary-50"
                        >
                          <MessageCircle size={18} className="mr-2" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onUndo?.(currentListing)}
                          className="border-accent-300 hover:bg-primary-50"
                        >
                          <Undo2 size={18} className="mr-2" />
                          Move to Queue
                        </Button>
                        <Button
                          onClick={() => onViewDetails?.(currentListing)}
                          className="bg-secondary-500 hover:bg-secondary-600 text-accent-700"
                        >
                          <Eye size={18} className="mr-2" />
                          View Full Details
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
