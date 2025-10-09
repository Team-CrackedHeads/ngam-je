"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ShoppingCart, Package, Clock, MapPin, Eye, Heart, Grid, List, Timer, AlertTriangle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { mockBuyListings, mockSellListings, type Listing } from "@/utils/mock-listings-data";
import { getMatchCount } from "@/utils/mock-match-data";

// Helper functions for timer calculations
function getTimeRemaining(expiresAt: string) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) {
    return { expired: true, text: "Expired", urgent: false, days: 0, hours: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const urgent = days <= 3; // Mark as urgent if 3 days or less

  if (days > 0) {
    return {
      expired: false,
      text: `${days}d ${hours}h`,
      urgent,
      days,
      hours
    };
  } else {
    return {
      expired: false,
      text: `${hours}h`,
      urgent: true,
      days: 0,
      hours
    };
  }
}

function getExtensionPrice(subscriptionTier: string): string {
  switch (subscriptionTier) {
    case "basic":
      return "RM 4.25"; // $1 = ~RM 4.25
    case "pro":
      return "RM 2.15"; // $0.50 = ~RM 2.15
    case "enterprise":
      return "RM 1.70"; // Bulk discount
    default:
      return "RM 4.25";
  }
}


// Tabs configuration
const tabs = [
  { label: "Buy Listings", value: "buy", icon: ShoppingCart },
  { label: "Sell Listings", value: "sell", icon: Package },
];

function ProductCard({ listing, type, viewMode, isHighlighted }: { listing: Listing; type: "buy" | "sell"; viewMode: "grid" | "list"; isHighlighted?: boolean }) {
  const router = useRouter();
  const timeRemaining = getTimeRemaining(listing.expiresAt);
  const extensionPrice = getExtensionPrice(listing.subscriptionTier);
  const matchCount = getMatchCount(listing.id, type);

  const handleExtendListing = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Extending listing ${listing.id} for 7 days at ${extensionPrice}`);
    // Future implementation: API call to extend listing
  };

  const handleViewMatches = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/listings/${listing.id}/matches?type=${type}`);
  };

  const handleCardClick = () => {
    // Navigate to matches page for this listing
    router.push(`/listings/${listing.id}/matches?type=${type}`);
  };
  if (viewMode === "list") {
    return (
      <div>
        {/* Timer badge and Match badge above card */}
        <div className="mb-2 flex items-center gap-2">
          <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
            timeRemaining.expired
              ? 'bg-red-100 text-red-700'
              : timeRemaining.urgent
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
          }`}>
            {timeRemaining.expired ? (
              <AlertTriangle size={10} />
            ) : (
              <Timer size={10} />
            )}
            <span className="font-medium">{timeRemaining.text}</span>
          </div>

          {/* Match badge */}
          {matchCount > 0 && (
            <button
              onClick={handleViewMatches}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 transition-all font-medium border border-purple-200"
            >
              <Sparkles size={12} />
              <span>{matchCount} {matchCount === 1 ? 'match' : 'matches'}</span>
            </button>
          )}
        </div>

        <div onClick={handleCardClick} className={`rounded-2xl shadow p-4 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer h-48 ${isHighlighted ? 'ring-4 ring-secondary-500 bg-secondary-50' : ''}`}>
          <div className="flex gap-4 h-full">
          {/* Image Section */}
          <div className="flex-shrink-0">
            {/* Image - wider aspect ratio for better visual balance */}
            <div className="w-32 h-full bg-gray-200 rounded-xl flex items-center justify-center relative">
              <span className="text-gray-400 text-xs">Image</span>

              {/* Extension overlay for urgent/expired listings - row view only */}
              {(timeRemaining.urgent || timeRemaining.expired) && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-xl flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1 mb-2">
                    <AlertTriangle size={16} className="text-black" />
                  </div>
                  <button
                    onClick={handleExtendListing}
                    className="px-3 py-1 bg-secondary-500 text-accent-700 rounded text-xs font-medium hover:bg-secondary-600 transition-colors shadow-md"
                  >
                    {extensionPrice}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            {/* Top Section */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-accent-700 line-clamp-2 flex-1 text-sm leading-tight">
                  {listing.title}
                </h3>
                <span className="font-bold text-sm text-secondary-700 ml-2 whitespace-nowrap">
                  {type === "buy" ? listing.price : listing.budget}
                </span>
              </div>

              {/* Category badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600">
                  {listing.category}
                </span>
              </div>

              {/* Description */}
              <div className="mb-2">
                <p className="text-xs text-accent-500 line-clamp-2 leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>

            {/* Footer - always at bottom */}
            <div className="space-y-1 mt-auto">
              {/* Location */}
              <div className="flex items-center gap-1 text-xs text-accent-400">
                <MapPin size={12} />
                <span>{listing.location}</span>
              </div>

              {/* Post Time */}
              <div className="flex items-center gap-1 text-xs text-accent-400">
                <Clock size={12} />
                <span>{listing.timestamp}</span>
              </div>

              {/* Views and Likes */}
              <div className="flex items-center gap-4 text-xs text-accent-400">
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>{listing.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={12} />
                  <span>{listing.likes} likes</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Timer badge and Match badge above card */}
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
          timeRemaining.expired
            ? 'bg-red-100 text-red-700'
            : timeRemaining.urgent
              ? 'bg-orange-100 text-orange-700'
              : 'bg-green-100 text-green-700'
        }`}>
          {timeRemaining.expired ? (
            <AlertTriangle size={10} />
          ) : (
            <Timer size={10} />
          )}
          <span className="font-medium">{timeRemaining.text}</span>
        </div>

        {/* Match badge */}
        {matchCount > 0 && (
          <button
            onClick={handleViewMatches}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 transition-all font-medium border border-purple-200"
          >
            <Sparkles size={12} />
            <span>{matchCount} {matchCount === 1 ? 'match' : 'matches'}</span>
          </button>
        )}
      </div>

      <div onClick={handleCardClick} className={`rounded-2xl shadow p-4 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer h-96 flex flex-col ${isHighlighted ? 'ring-4 ring-secondary-500 bg-secondary-50' : ''}`}>

      {/* Image placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center relative">
        <span className="text-gray-400 text-sm">Image placeholder</span>

        {/* Extension overlay for urgent/expired listings */}
        {(timeRemaining.urgent || timeRemaining.expired) && (
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-xl flex flex-col items-center justify-center">
            <AlertTriangle size={16} className="mb-1 text-black" />
            <div className="text-center">
              <div className="font-medium mb-1 text-accent-700">
                {timeRemaining.expired ? "Expired" : "Expires Soon"}
              </div>
              <button
                onClick={handleExtendListing}
                className="px-2 py-1 bg-secondary-500 text-accent-700 rounded text-xs font-medium hover:bg-secondary-600 transition-colors shadow-md"
              >
                Extend {extensionPrice}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Area - flex-grow to fill remaining space */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-2">
          <h3 className="font-semibold text-accent-700 line-clamp-2 text-sm leading-tight">
            {listing.title}
          </h3>
        </div>

        {/* Category badge */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600">
            {listing.category}
          </span>
        </div>

        {/* Price/Budget */}
        <div className="mb-2">
          <span className="font-bold text-lg text-secondary-700">
            {type === "buy" ? listing.price : listing.budget}
          </span>
        </div>

        {/* Description - flex-grow to take available space */}
        <p className="text-xs text-accent-500 mb-3 line-clamp-3 leading-relaxed flex-1 overflow-hidden text-ellipsis">
          {listing.description}
        </p>

        {/* Footer - always at bottom */}
        <div className="space-y-1 mt-auto">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-accent-400">
            <MapPin size={12} />
            <span className="truncate">{listing.location}</span>
          </div>

          {/* Post Time */}
          <div className="flex items-center gap-1 text-xs text-accent-400">
            <Clock size={12} />
            <span>{listing.timestamp}</span>
          </div>

          {/* Views and Likes */}
          <div className="flex items-center gap-4 text-xs text-accent-400">
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{listing.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart size={12} />
              <span>{listing.likes} likes</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [highlightId, setHighlightId] = useState<number | null>(null);

  useEffect(() => {
    const type = searchParams.get("type") as "buy" | "sell";
    const highlight = searchParams.get("highlight");

    if (type && (type === "buy" || type === "sell")) {
      setActiveTab(type);
    }

    if (highlight) {
      const id = parseInt(highlight);
      setHighlightId(id);
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightId(null), 3000);
    }
  }, [searchParams]);

  // Filter to show only the user's own listings
  const allListings = activeTab === "buy" ? mockBuyListings : mockSellListings;
  const currentListings = allListings.filter(listing => listing.isOwner === true);
  const ActiveIcon = activeTab === "buy" ? ShoppingCart : Package;

  return (
    <div className="min-h-screen px-4 py-6 pb-24 bg-primary-100 text-accent-500 overflow-auto">
      <div className="max-w-6xl mx-auto">

        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b pb-2 space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as "buy" | "sell")}
                className={`flex items-center gap-2 pb-2 transition-colors ${
                  isActive
                    ? 'text-accent-700 border-b-2 border-accent-700'
                    : 'text-accent-500 hover:text-accent-700'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Listings Count and Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-accent-600">
              {currentListings.length} {activeTab === "buy" ? "items for sale" : "wanted items"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-secondary-500 text-accent-700"
                    : "bg-white text-accent-500 hover:bg-secondary-200"
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-secondary-500 text-accent-700"
                    : "bg-white text-accent-500 hover:bg-secondary-200"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
          <button className="px-4 py-2 bg-secondary-500 text-accent-700 rounded-lg font-medium hover:bg-secondary-600 transition-colors">
            + New {activeTab === "buy" ? "Request" : "Sale"}
          </button>
        </div>

        {/* Listings Grid */}
        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {currentListings.map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              type={activeTab}
              viewMode={viewMode}
              isHighlighted={highlightId === listing.id}
            />
          ))}
        </div>

        {/* Empty State */}
        {currentListings.length === 0 && (
          <div className="text-center py-12">
            <ActiveIcon className="w-16 h-16 text-accent-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-accent-600 mb-2">
              No {activeTab === "buy" ? "items for sale" : "wanted items"} yet
            </h3>
            <p className="text-accent-400 mb-4">
              Be the first to post a {activeTab === "buy" ? "sale listing" : "wanted request"}!
            </p>
            <button className="px-6 py-3 bg-secondary-500 text-accent-700 rounded-lg font-medium hover:bg-secondary-600 transition-colors">
              Create {activeTab === "buy" ? "Wanted Request" : "Sale Listing"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}