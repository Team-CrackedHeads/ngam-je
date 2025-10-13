import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  Star,
  User,
  Tag,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface MatchedListing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalAsk?: number;
  images: string[];
  tags: string[];
  location: string;
  timeAgo: string;
  seller: string;
  type: "sell" | "buy";
  category: string;
  matchScore: number;
  matchReasons: string[];
}

interface ListingComparisonModalProps {
  isOpen: boolean;
  listings: MatchedListing[];
  userListing: MatchedListing; // The poster's original listing
  onClose: () => void;
  onSelectListing: (listing: MatchedListing) => void;
  onMessage: (listing: MatchedListing) => void;
  onNegotiate: (listing: MatchedListing) => void;
}

export function ListingComparisonModal({
  isOpen,
  listings,
  userListing,
  onClose,
  onSelectListing,
  onMessage,
  onNegotiate,
}: ListingComparisonModalProps) {
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  const toggleTags = (id: string) => {
    setExpandedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (!isOpen || listings.length === 0) return null;

  const allListings = [userListing, ...listings];

  const comparisonFields = [
    { label: "Match Score", key: "matchScore", icon: Star },
    { label: "Category", key: "category", icon: Tag },
    { label: "Original Ask", key: "originalAsk", icon: DollarSign },
    { label: "Current Price", key: "price", icon: DollarSign },
    { label: "Location", key: "location", icon: MapPin },
    { label: "Posted", key: "timeAgo", icon: Clock },
    { label: "Seller", key: "seller", icon: User },
  ];

  const getBestValue = (key: string) => {
    if (key === "price") {
      return Math.min(...listings.map((l) => l.price));
    }
    if (key === "matchScore") {
      return Math.max(...listings.map((l) => l.matchScore));
    }
    return null;
  };

  const isBestValue = (listing: MatchedListing, key: string) => {
    const bestValue = getBestValue(key);
    if (bestValue === null) return false;
    return listing[key as keyof MatchedListing] === bestValue;
  };

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
        >
          <Card className="w-full max-w-6xl max-h-[90vh] bg-white flex flex-col overflow-hidden border-neutral-200 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-accent-700 mb-1">Compare Listings</h2>
                <p className="text-sm text-accent-500">
                  Comparing {listings.length} listings side by side
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full hover:bg-primary-100 transition-colors"
              >
                <X className="h-5 w-5 text-accent-600" />
              </Button>
            </div>

            {/* Comparison Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto touch-scroll">
              <div className="p-4 space-y-4 relative">
                {/* Vertical Separator Line - Overlaid */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-neutral-300 pointer-events-none z-10"
                  style={{
                    left: `calc(${100 / allListings.length}% + 0.5rem)`
                  }}
                ></div>
                {/* Images Row */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${allListings.length}, minmax(0, 1fr))` }}>
                  {allListings.map((listing, index) => (
                    <div key={listing.id} className="aspect-[4/3] rounded-xl overflow-hidden relative bg-primary-100">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 right-2 bg-secondary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          Your Listing
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Titles Row */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${allListings.length}, minmax(0, 1fr))` }}>
                  {allListings.map((listing) => (
                    <h3 key={listing.id} className="line-clamp-2 text-base font-bold text-accent-700 min-h-[3rem] flex items-center">
                      {listing.title}
                    </h3>
                  ))}
                </div>

                {/* Tags Row */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${allListings.length}, minmax(0, 1fr))` }}>
                  {allListings.map((listing) => (
                    <div key={listing.id} className="flex flex-wrap gap-2 min-h-[28px]">
                      {(expandedTags.has(listing.id) ? listing.tags : listing.tags.slice(0, 3)).map((tag, i) => (
                        <Badge key={i} className="bg-primary-200 text-accent-700 border-0 text-xs hover:bg-primary-300">
                          {tag}
                        </Badge>
                      ))}
                      {listing.tags.length > 3 && (
                        <button
                          onClick={() => toggleTags(listing.id)}
                          className="inline-flex items-center"
                        >
                          <Badge className="bg-neutral-200 text-accent-600 border-0 text-xs hover:bg-neutral-300 cursor-pointer transition-colors">
                            {expandedTags.has(listing.id) ? 'Show less' : `+${listing.tags.length - 3} more`}
                          </Badge>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Comparison Fields - Each field is a row */}
                {comparisonFields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.key}>
                      {/* Field Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-4 w-4 text-accent-500" />
                        <span className="text-xs font-semibold text-accent-600">{field.label}</span>
                      </div>
                      {/* Field Values Row */}
                      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${allListings.length}, minmax(0, 1fr))` }}>
                        {allListings.map((listing, index) => {
                          const value = listing[field.key as keyof MatchedListing];
                          const isBest = index > 0 && isBestValue(listing, field.key);
                          const isUserListing = index === 0;

                          return (
                            <div
                              key={listing.id}
                              className={`p-3 rounded-lg min-h-[3.5rem] flex items-center ${
                                isUserListing
                                  ? "bg-secondary-50 border-2 border-secondary-200"
                                  : isBest
                                    ? "bg-success-50 border-2 border-success-500"
                                    : "bg-white border border-neutral-200"
                              }`}
                            >
                              <div className="flex items-center gap-2 w-full">
                                {isBest && (
                                  <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                                )}
                                <span className={`${isBest ? "font-bold text-accent-700" : "text-accent-600"} text-sm`}>
                                  {field.key === "price" || field.key === "originalAsk"
                                    ? value ? `RM ${value.toLocaleString()}` : "N/A"
                                    : field.key === "matchScore"
                                      ? isUserListing ? "Your Match" : `${value}%`
                                      : value}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Match Reasons Row */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-accent-500" />
                    <span className="text-xs font-semibold text-accent-600">Match Reasons</span>
                  </div>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${allListings.length}, minmax(0, 1fr))` }}>
                    {allListings.map((listing, index) => (
                      <div
                        key={listing.id}
                        className={`p-3 rounded-lg min-h-[6rem] ${
                          index === 0
                            ? "bg-secondary-50 border-2 border-secondary-200"
                            : "bg-white border border-neutral-200"
                        }`}
                      >
                        {index === 0 ? (
                          <p className="text-sm text-accent-500 italic">Your original listing</p>
                        ) : (
                          <div className="space-y-2">
                            {listing.matchReasons.slice(0, 3).map((reason, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-success-500 mt-1.5 shrink-0" />
                                <span className="text-accent-600">{reason}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${allListings.length}, minmax(0, 1fr))` }}>
                  {allListings.map((listing, index) => (
                    <div key={listing.id}>
                      {index === 0 ? (
                        <div className="min-h-[8rem]"></div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            onClick={() => {
                              onNegotiate(listing);
                              onClose();
                            }}
                            className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-medium shadow-md transition-all"
                          >
                            Negotiate Price
                          </Button>
                          <Button
                            onClick={() => {
                              onMessage(listing);
                              onClose();
                            }}
                            variant="outline"
                            className="w-full border-neutral-300 hover:bg-primary-50 text-accent-700 font-medium"
                          >
                            Send Message
                          </Button>
                          <Button
                            onClick={() => {
                              onSelectListing(listing);
                              onClose();
                            }}
                            variant="ghost"
                            className="w-full hover:bg-primary-100 text-accent-600 font-medium"
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
