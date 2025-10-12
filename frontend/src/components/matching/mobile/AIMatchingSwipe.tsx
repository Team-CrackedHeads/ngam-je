"use client";

import { useState } from "react";
import { X, Heart, Info, Layers } from "lucide-react";
import { AIMatchingProps } from "../types";

export function AIMatchingSwipe({
  userMode,
  userListings,
  availableListings,
  onMatch,
  onMessage,
  onViewDetails,
  onClose,
}: AIMatchingProps) {
  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-200">
        <span className="text-sm font-medium text-accent-600">
          0 remaining
        </span>
      </div>

      {/* Card Stack Area */}
      <div className="flex-1 relative overflow-hidden p-4">
        {/* Empty state */}
        <div className="h-full flex flex-col items-center justify-center text-center px-8">
          <div className="mb-3 text-accent-400">
            <Layers size={48} />
          </div>
          <h3 className="text-lg font-semibold text-accent-700 mb-2">
            No more matches!
          </h3>
          <p className="text-sm text-accent-500 mb-4">
            You&apos;ve reviewed all potential matches. Check back later for new listings.
          </p>
        </div>
      </div>

      {/* Action Buttons - only shown when there are cards */}
      {false && (
        <div className="p-4 bg-white border-t border-neutral-200">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            {/* Pass */}
            <button
              className="w-14 h-14 rounded-full bg-white border-2 border-red-300 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md"
            >
              <X size={24} className="text-red-500" />
            </button>

            {/* View Details */}
            <button
              className="w-12 h-12 rounded-full bg-white border-2 border-accent-300 flex items-center justify-center hover:bg-primary-50 transition-colors shadow-sm"
            >
              <Info size={18} className="text-accent-600" />
            </button>

            {/* Like */}
            <button
              className="w-14 h-14 rounded-full bg-white border-2 border-green-300 flex items-center justify-center hover:bg-green-50 transition-colors shadow-md"
            >
              <Heart size={24} className="text-green-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
