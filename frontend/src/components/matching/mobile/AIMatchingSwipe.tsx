"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { X, Heart, Info, Layers, Search, GitCompare, Sparkles } from "lucide-react";
import { AIMatchingProps, ColumnType, MatchedListing } from "../types";
import { ListingComparisonModal } from "../ListingComparisonModal";

type TabType = "queue" | "liked" | "passed";

const tabs: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "passed", label: "Passed", icon: <X size={18} />, color: "text-red-600" },
  { id: "queue", label: "For You", icon: <Sparkles size={18} />, color: "text-secondary-600" },
  { id: "liked", label: "Liked", icon: <Heart size={18} />, color: "text-green-600" },
];

export function AIMatchingSwipe({
  userMode,
  userListings,
  availableListings,
  onMatch,
  onMessage,
  onViewDetails,
  onClose,
}: AIMatchingProps) {
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Mock user's original listing
  const getUserListing = (): MatchedListing => ({
    id: "user-listing",
    title: "Looking for MacBook Pro M3 for Video Editing",
    description: "I need a MacBook Pro M3 for professional video editing work. Must be in excellent condition.",
    price: 8000,
    originalAsk: 8000,
    images: ["https://via.placeholder.com/400x300"],
    tags: ["Electronics", "Laptop", "Wanted", "MacBook"],
    location: "Kuala Lumpur",
    timeAgo: "1 day ago",
    seller: "You",
    type: "buy" as const,
    category: "Electronics",
    matchScore: 0,
    matchReasons: []
  });

  // Mock data for comparison
  const getMockListingsForComparison = (): MatchedListing[] => {
    return selectedForCompare.map((cardId, idx) => ({
      id: cardId,
      title: "MacBook Pro M3 16-inch - Excellent Condition",
      description: "Need for video editing work. Willing to pay good price for excellent condition.",
      price: 8500 - (idx * 500),
      originalAsk: 9000 - (idx * 500),
      images: ["https://via.placeholder.com/400x300"],
      tags: ["Electronics", "Laptop", "Apple", "M3"],
      location: "Kuala Lumpur",
      timeAgo: "2 hours ago",
      seller: "John Doe",
      type: "sell" as const,
      category: "Electronics",
      matchScore: [85, 60, 30, 45][idx] || 50,
      matchReasons: [
        "Price matches your budget range",
        "Located in your preferred area",
        "High seller rating and verified account"
      ]
    }));
  };

  // Mock cards for each tab
  const getCardsForTab = (tab: TabType) => {
    if (tab === "queue") return [1, 2, 3];
    if (tab === "liked") return [4, 5];
    if (tab === "passed") return [6];
    return [];
  };

  const cards = getCardsForTab(activeTab);

  return (
    <>
      {/* Comparison Modal */}
      <ListingComparisonModal
        isOpen={showCompareModal}
        listings={getMockListingsForComparison()}
        userListing={getUserListing()}
        onClose={() => setShowCompareModal(false)}
        onSelectListing={(listing) => {
          console.log('View details:', listing);
          onViewDetails(listing);
        }}
        onMessage={(listing) => {
          console.log('Message:', listing);
          onMessage(listing);
        }}
        onNegotiate={(listing) => {
          console.log('Negotiate:', listing);
        }}
      />

      <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden h-full">
        {/* Toolbar */}
        <div className="flex flex-col border-b border-neutral-200">
          {/* Top Row - Main Controls */}
          <div className="flex items-center justify-between p-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-accent-600">
                {cards.length} {activeTab === "queue" ? "remaining" : "items"}
              </span>
              {compareMode && selectedForCompare.length > 0 && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                  {selectedForCompare.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? "bg-secondary-500 text-white" : "hover:bg-primary-100"
                }`}
                title="Search & Filters"
              >
                <Search size={18} className={showFilters ? "text-white" : "text-accent-600"} />
              </button>

              {/* Compare Mode Toggle */}
              <button
                onClick={() => {
                  setCompareMode(!compareMode);
                  setSelectedForCompare([]);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  compareMode ? "bg-blue-500 text-white" : "hover:bg-primary-100"
                }`}
                title="Compare Mode"
              >
                <GitCompare size={18} className={compareMode ? "text-white" : "text-accent-600"} />
              </button>
            </div>
          </div>

          {/* Search Bar - Collapsible */}
          {showFilters && (
            <div className="p-3 bg-primary-50 border-b border-neutral-200">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                <select className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500">
                  <option value="match-score">Sort: Best Match</option>
                  <option value="price-low">Sort: Price Low to High</option>
                  <option value="price-high">Sort: Price High to Low</option>
                  <option value="recent">Sort: Recently Posted</option>
                  <option value="location">Sort: Location</option>
                </select>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-neutral-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-secondary-600 bg-secondary-50"
                    : "hover:bg-primary-50"
                }`}
              >
                <div className={activeTab === tab.id ? tab.color : "text-accent-500"}>
                  {tab.icon}
                </div>
                <span
                  className={`text-sm font-medium ${
                    activeTab === tab.id ? "text-accent-700" : "text-accent-500"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Compare Mode Banner */}
          {compareMode && (
            <div className="p-3 bg-blue-100 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare size={16} className="text-blue-700" />
                  <span className="text-xs font-medium text-blue-900">
                    Tap cards to compare (max 4)
                  </span>
                </div>
                {selectedForCompare.length >= 2 && (
                  <button
                    onClick={() => setShowCompareModal(true)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Compare {selectedForCompare.length}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card Stack Area */}
        <div className="flex-1 relative overflow-hidden p-4">
          {cards.length === 0 ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="mb-3 text-accent-400">
                <Layers size={48} />
              </div>
              <h3 className="text-lg font-semibold text-accent-700 mb-2">
                {activeTab === "queue" && "No more matches!"}
                {activeTab === "liked" && "No liked matches yet"}
                {activeTab === "passed" && "No passed matches yet"}
              </h3>
              <p className="text-sm text-accent-500 mb-4">
                {activeTab === "queue" && "You've reviewed all potential matches. Check back later for new listings."}
                {activeTab === "liked" && "Start swiping to find matches you like"}
                {activeTab === "passed" && "Cards you pass on will appear here"}
              </p>
            </div>
          ) : (
            /* Card Stack */
            <div className="relative h-full">
              {cards.map((cardIndex, index) => {
                const matchScores = [85, 60, 30];
                const matchScore = matchScores[index] || 50;
                const getMatchColor = (score: number) => {
                  if (score >= 75) return { bg: 'from-green-100 to-green-200', text: 'text-green-700', border: 'border-green-300' };
                  if (score >= 50) return { bg: 'from-secondary-100 to-secondary-200', text: 'text-secondary-700', border: 'border-secondary-300' };
                  return { bg: 'from-red-100 to-red-200', text: 'text-red-700', border: 'border-red-300' };
                };
                const colors = getMatchColor(matchScore);
                const cardId = `${activeTab}-card-${cardIndex}`;
                const isSelected = selectedForCompare.includes(cardId);

                return (
                  <motion.div
                    key={cardId}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      scale: 1 - index * 0.05,
                      y: index * 10,
                      zIndex: cards.length - index,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div
                      onClick={() => {
                        if (compareMode) {
                          if (isSelected) {
                            setSelectedForCompare(prev => prev.filter(id => id !== cardId));
                          } else if (selectedForCompare.length < 4) {
                            setSelectedForCompare(prev => [...prev, cardId]);
                          }
                        }
                      }}
                      className={`h-full bg-white rounded-2xl shadow-xl border overflow-hidden ${
                        isSelected ? 'border-4 border-blue-500' : 'border border-neutral-300'
                      }`}
                    >
                      {/* Card Image */}
                      <div className="relative h-1/2 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <span className="text-accent-400">Image</span>

                        {/* Match Score Badge - only show on For You tab */}
                        {activeTab === "queue" && index === 0 && (
                          <div className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}>
                            <Sparkles size={14} />
                            <span className="text-sm font-bold">{matchScore}%</span>
                          </div>
                        )}

                        {/* Selection Checkbox for Compare Mode */}
                        {compareMode && index === 0 && (
                          <div className="absolute top-4 left-4">
                            <div className={`w-8 h-8 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-neutral-400'
                            }`}>
                              {isSelected && (
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4 h-1/2 flex flex-col">
                        <h3 className="font-bold text-lg text-accent-700 mb-2 line-clamp-2">
                          MacBook Pro M3 16-inch - Excellent Condition
                        </h3>
                        <div className="text-2xl font-bold text-secondary-600 mb-2">
                          RM 8,500
                        </div>
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium mb-2 w-fit">
                          Electronics
                        </span>
                        <p className="text-sm text-accent-500 line-clamp-3 mb-4">
                          Need for video editing work. Willing to pay good price for excellent condition.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons - only shown when there are cards and not in compare mode */}
        {cards.length > 0 && !compareMode && activeTab === "queue" && (
          <div className="p-4 bg-white border-t border-neutral-200">
            <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
              {/* Pass */}
              <button
                className="w-16 h-16 rounded-full bg-white border-2 border-red-300 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-95"
              >
                <X size={28} className="text-red-500" />
              </button>

              {/* View Details */}
              <button
                className="w-14 h-14 rounded-full bg-white border-2 border-accent-300 flex items-center justify-center hover:bg-primary-50 transition-colors shadow-sm active:scale-95"
              >
                <Info size={20} className="text-accent-600" />
              </button>

              {/* Like */}
              <button
                className="w-16 h-16 rounded-full bg-white border-2 border-green-300 flex items-center justify-center hover:bg-green-50 transition-colors shadow-md active:scale-95"
              >
                <Heart size={28} className="text-green-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
