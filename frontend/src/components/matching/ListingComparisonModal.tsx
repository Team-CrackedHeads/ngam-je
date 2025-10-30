import React, { useState } from "react";
import Image from "next/image";
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
  userListing: MatchedListing;
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
          <Card className="w-full max-w-6xl max-h-[90vh] bg-white flex flex-col overflow-hidden border-neutral-200 shadow-2xl py-2 gap-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-2 shrink-0 border-b border-neutral-200">
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

            {/* Comparison Grid - 3 columns: Your Listing | Separator | Matched Listings */}
            <div className="flex-1 overflow-y-auto touch-scroll">
              <div className="p-4 grid gap-4" style={{ gridTemplateColumns: `1fr 2px ${listings.length}fr` }}>
                {/* Column 1: Your Listing */}
                <div className="space-y-4">
                  {/* Image */}
                  <div className="aspect-[4/3] rounded-xl overflow-hidden relative bg-primary-100">
                    <Image
                      src={userListing.images[0]}
                      alt={userListing.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-secondary-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      Your Listing
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="line-clamp-2 text-base font-bold text-accent-700 min-h-[3rem] flex items-center">
                    {userListing.title}
                  </h3>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 min-h-[28px]">
                    {(expandedTags.has(userListing.id) ? userListing.tags : userListing.tags.slice(0, 3)).map((tag, i) => (
                      <Badge key={i} className="bg-primary-200 text-accent-700 border-0 text-xs hover:bg-primary-300">
                        {tag}
                      </Badge>
                    ))}
                    {userListing.tags.length > 3 && (
                      <button
                        onClick={() => toggleTags(userListing.id)}
                        className="inline-flex items-center"
                      >
                        <Badge className="bg-neutral-200 text-accent-600 border-0 text-xs hover:bg-neutral-300 cursor-pointer transition-colors">
                          {expandedTags.has(userListing.id) ? 'Show less' : `+${userListing.tags.length - 3} more`}
                        </Badge>
                      </button>
                    )}
                  </div>

                  {/* Comparison Fields */}
                  {comparisonFields.map((field) => {
                    const Icon = field.icon;
                    const value = userListing[field.key as keyof MatchedListing];
                    return (
                      <div key={field.key}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4 text-accent-500" />
                          <span className="text-xs font-semibold text-accent-600">{field.label}</span>
                        </div>
                        <div className="p-3 rounded-lg min-h-[3.5rem] flex items-center bg-secondary-50 border-2 border-secondary-200">
                          <span className="text-accent-700 font-semibold text-sm">
                            {field.key === "price" || field.key === "originalAsk"
                              ? value ? `RM ${value.toLocaleString()}` : "N/A"
                              : field.key === "matchScore"
                                ? "Your Match"
                                : value}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Match Reasons */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-accent-500" />
                      <span className="text-xs font-semibold text-accent-600">Match Reasons</span>
                    </div>
                    <div className="p-3 rounded-lg min-h-[6rem] bg-secondary-50 border-2 border-secondary-200">
                      <p className="text-sm text-accent-500 italic">Your original listing</p>
                    </div>
                  </div>

                  {/* Empty space for action buttons */}
                  <div className="min-h-[8rem]"></div>
                </div>

                {/* Column 2: Vertical Separator */}
                <div className="w-full bg-neutral-300 rounded-full"></div>

                {/* Column 3: Matched Listings */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${listings.length}, minmax(0, 1fr))` }}>
                  {/* Images Row */}
                  {listings.map((listing) => (
                    <div key={`img-${listing.id}`} className="aspect-[4/3] rounded-xl overflow-hidden relative bg-primary-100">
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

                  {/* Titles Row */}
                  {listings.map((listing) => (
                    <h3 key={`title-${listing.id}`} className="line-clamp-2 text-base font-bold text-accent-700 min-h-[3rem] flex items-center">
                      {listing.title}
                    </h3>
                  ))}

                  {/* Tags Row */}
                  {listings.map((listing) => (
                    <div key={`tags-${listing.id}`} className="flex flex-wrap gap-2 min-h-[28px]">
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

                  {/* Comparison Fields - Each field creates a row of values */}
                  {comparisonFields.map((field) => {
                    const Icon = field.icon;
                    return (
                      <React.Fragment key={field.key}>
                        {listings.map((listing) => {
                          const value = listing[field.key as keyof MatchedListing];
                          const isBest = isBestValue(listing, field.key);
                          return (
                            <div key={`${field.key}-${listing.id}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Icon className="h-4 w-4 text-accent-500" />
                                <span className="text-xs font-semibold text-accent-600">{field.label}</span>
                              </div>
                              <div
                                className={`p-3 rounded-lg min-h-[3.5rem] flex items-center ${isBest
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
                                        ? `${value}%`
                                        : value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}

                  {/* Match Reasons Row */}
                  {listings.map((listing) => (
                    <div key={`reasons-${listing.id}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-accent-500" />
                        <span className="text-xs font-semibold text-accent-600">Match Reasons</span>
                      </div>
                      <div className="p-3 rounded-lg min-h-[6rem] bg-white border border-neutral-200">
                        <div className="space-y-2">
                          {listing.matchReasons.slice(0, 3).map((reason, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-success-500 mt-1.5 shrink-0" />
                              <span className="text-accent-600">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Action Buttons Row */}
                  {listings.map((listing) => (
                    <div key={`actions-${listing.id}`} className="space-y-2">
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
                      <button
                        onClick={() => {
                          onSelectListing(listing);
                          onClose();
                        }}
                        className="w-full text-accent-600 hover:text-accent-700 font-medium underline text-sm text-center"
                      >
                        View Details
                      </button>
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
