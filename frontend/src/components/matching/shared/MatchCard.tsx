"use client";

import SafeImage from "@/components/ui/SafeImage";
import { MapPin, Clock, Heart, Sparkles, X, Undo2 } from "lucide-react";
import { MatchedListing } from "@/components/matching/types";

interface MatchCardProps {
  listing: MatchedListing;
  showMatchScore?: boolean;
  compact?: boolean;
  onLike?: () => void;
  onPass?: () => void;
  showActions?: boolean;
  showUndo?: boolean;
  onUndo?: () => void;
}

export function MatchCard({ listing, showMatchScore = true, compact = false, onLike, onPass, showActions = false, showUndo = false, onUndo }: MatchCardProps) {
  if (compact) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-md border border-neutral-200 hover:shadow-lg transition-shadow">
        <div className="flex flex-col gap-3">
          {/* Image and Match Score Row */}
          <div className="flex gap-3">
            {/* Image */}
            <div className="flex-shrink-0 w-20 h-20 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-accent-400 text-xs">Img</span>
            </div>

            {/* Title and Score */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <h4 className="font-semibold text-sm text-accent-700 line-clamp-2 leading-tight">
                {listing.title}
              </h4>

              {/* Match Score Badge */}
              {showMatchScore && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 w-fit">
                  <Sparkles size={12} />
                  <span className="text-xs font-bold">{listing.matchScore}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-base font-bold text-secondary-600">
            {listing.price}
          </div>

          {/* Category Badge */}
          <div>
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium">
              {listing.category}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-accent-600 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>

          {/* Location and Seller */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-accent-400">
              <MapPin size={12} />
              <span className="truncate">{listing.location}</span>
            </div>
            <div className="text-xs text-accent-500">
              by {listing.seller}
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-neutral-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPass?.();
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-red-300 hover:bg-red-50 transition-colors"
              >
                <X size={20} className="text-red-500" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.();
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-green-300 hover:bg-green-50 transition-colors"
              >
                <Heart size={20} className="text-green-500" />
              </button>
            </div>
          )}

          {/* Undo Button */}
          {showUndo && (
            <div className="flex items-center justify-center pt-2 border-t border-neutral-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUndo?.();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-accent-300 hover:bg-primary-50 transition-colors"
              >
                <Undo2 size={16} className="text-accent-600" />
                <span className="text-sm font-medium text-accent-700">Undo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-neutral-200">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-primary-100">
        {listing.images && listing.images.length > 0 ? (
          <SafeImage
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-accent-400 text-sm">No Image</span>
          </div>
        )}

        {/* Match Score Badge - Positioned on Image */}
        {showMatchScore && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 shadow-md backdrop-blur-sm bg-opacity-90">
            <Sparkles size={14} />
            <span className="text-sm font-bold">{listing.matchScore}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-accent-700 line-clamp-2 flex-1 pr-2">
            {listing.title}
          </h3>
          <span className="font-bold text-xl text-secondary-600 whitespace-nowrap">
            {listing.price}
          </span>
        </div>

        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium">
            {listing.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-accent-600 mb-3 line-clamp-2">
          {listing.description}
        </p>

        {/* Match Reasons */}
        {listing.matchReasons && listing.matchReasons.length > 0 && (
          <div className="mb-3 space-y-1">
            {listing.matchReasons.slice(0, 2).map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-accent-500">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="space-y-1 text-xs text-accent-400">
          {/* Location */}
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{listing.location}</span>
          </div>

          {/* Time and Seller */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{listing.timeAgo}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-accent-500">by {listing.seller}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
