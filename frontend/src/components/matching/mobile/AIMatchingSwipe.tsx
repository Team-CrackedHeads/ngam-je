"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "motion/react";
import { X, Heart, Info, Layers, Search, GitCompare, Sparkles, MapPin, Clock, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { AIMatchingProps, MatchedListing } from "@/components/matching/types";
import { ListingComparisonModal } from "@/components/matching/ListingComparisonModal";
import { mockAIMatchings, userAIListing } from "@/utils/mock-all-data-used";

type TabType = "queue" | "liked" | "passed";

const tabs: { id: TabType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "passed", label: "Passed", icon: <X size={18} />, color: "text-red-600" },
  { id: "queue", label: "For You", icon: <Sparkles size={18} />, color: "text-secondary-600" },
  { id: "liked", label: "Liked", icon: <Heart size={18} />, color: "text-green-600" },
];

export function AIMatchingSwipe({
  availableListings,
  onMatch,
  onMessage,
  onViewDetails,
}: AIMatchingProps) {
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showReaction, setShowReaction] = useState<'like' | 'pass' | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showGalleryView, setShowGalleryView] = useState(false);

  // Get user's original listing from centralized mock data
  const getUserListing = (): MatchedListing => userAIListing;

  // Get listings for comparison from selected IDs
  const getMockListingsForComparison = (): MatchedListing[] => {
    return selectedForCompare
      .map((listingId) =>
        mockAIMatchings.find((listing) => listing.id === listingId)
      )
      .filter(Boolean) as MatchedListing[];
  };

  // Use centralized mock data
  const allListings = mockAIMatchings;

  // Mock cards for each tab
  const getCardsForTab = (tab: TabType) => {
    if (tab === "queue") return allListings.slice(currentCardIndex, currentCardIndex + 3);
    if (tab === "liked") return [];
    if (tab === "passed") return [];
    return [];
  };

  const cards = getCardsForTab(activeTab);

  // Swipeable Card Component - Redesigned with proper sizing
  const SwipeableCard = ({
    listing,
    index,
    totalCards,
    onSwipe
  }: {
    listing: MatchedListing;
    index: number;
    totalCards: number;
    onSwipe: (direction: 'left' | 'right') => void;
  }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100;
      if (Math.abs(info.velocity.x) >= 500 || Math.abs(info.offset.x) >= threshold) {
        onSwipe(info.offset.x > 0 ? 'right' : 'left');
      }
    };

    const isTopCard = index === 0;
    const isSelected = selectedForCompare.includes(listing.id);
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
          x: isTopCard && !compareMode ? x : 0,
          rotate: isTopCard && !compareMode ? rotate : 0,
          opacity: isTopCard ? opacity : 1,
          zIndex: totalCards - index,
        }}
        animate={{
          scale: isTopCard ? 1 : 1 - (index * 0.05),
          y: isTopCard ? 0 : index * 10,
        }}
        drag={isTopCard && !compareMode}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        onDragEnd={handleDragEnd}
        className="absolute w-full h-full"
      >
        <div
          onClick={() => {
            if (compareMode && isTopCard) {
              if (isSelected) {
                setSelectedForCompare(prev => prev.filter(id => id !== listing.id));
              } else if (selectedForCompare.length < 4) {
                setSelectedForCompare(prev => [...prev, listing.id]);
              }
            } else if (isTopCard) {
              onViewDetails(listing);
            }
          }}
          className={`w-full h-full bg-white rounded-2xl shadow-xl border flex flex-col ${
            isSelected ? 'border-4 border-secondary-500' : 'border border-neutral-300'
          } ${isTopCard ? 'cursor-pointer' : ''}`}
        >
          {/* Image Section */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
            <span className="text-accent-400">Image</span>

            {/* Match Score Badge */}
            {isTopCard && activeTab === "queue" && !compareMode && (
              <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}>
                <Sparkles size={12} />
                <span className="text-xs font-bold">{matchScore}%</span>
              </div>
            )}

            {/* Selection Checkbox for Compare Mode */}
            {isTopCard && compareMode && (
              <div className="absolute top-3 left-3">
                <div className={`w-7 h-7 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'bg-secondary-500 border-secondary-500' : 'bg-white border-neutral-400'
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Content Section - Flexible */}
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
  };

  // Handle swipe action
  const handleSwipe = (direction: 'left' | 'right') => {
    const currentCard = cards[0];
    if (!currentCard) return;

    // Show reaction animation
    setShowReaction(direction === 'right' ? 'like' : 'pass');

    // Hide reaction after animation
    setTimeout(() => {
      setShowReaction(null);
    }, 800);

    if (direction === 'right') {
      // Liked
      onMatch(currentCard, 'like');
    } else {
      // Passed
      onMatch(currentCard, 'pass');
    }

    // Move to next card
    setCurrentCardIndex(prev => prev + 1);
  };

  // Handle button actions
  const handlePass = () => {
    if (cards.length === 0 || activeTab !== "queue") return;
    handleSwipe('left');
  };

  const handleLike = () => {
    if (cards.length === 0 || activeTab !== "queue") return;
    handleSwipe('right');
  };

  const handleInfo = () => {
    if (cards.length > 0 && cards[0]) {
      onViewDetails(cards[0]);
    }
  };

  return (
    <>
      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-accent-700 mb-3">Reset All Cards?</h2>
                  <p className="text-sm text-accent-600 mb-2">
                    This will move all cards back to &quot;For You&quot;. Cards in &quot;Liked&quot; and &quot;Passed&quot; will be reset.
                  </p>
                  <p className="text-xs text-accent-400">This action cannot be undone.</p>
                </div>
                <div className="px-6 py-4 bg-primary-50 flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 bg-white text-accent-700 font-medium hover:bg-primary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCardIndex(0);
                      setShowResetConfirm(false);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery View Modal */}
      <AnimatePresence>
        {showGalleryView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <div className="flex flex-col h-full">
              {/* Gallery Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 shrink-0">
                <h2 className="text-lg font-bold text-accent-700">All Matches</h2>
                <button
                  onClick={() => setShowGalleryView(false)}
                  className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Minimize2 size={20} className="text-accent-600" />
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-4">
                  {allListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => {
                        setShowGalleryView(false);
                        onViewDetails(listing);
                      }}
                      className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm active:scale-95 transition-transform"
                    >
                      <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
                        <span className="text-accent-400 text-xs">Image</span>
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-xs font-bold">
                          {listing.matchScore}%
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-sm text-accent-700 line-clamp-2 mb-1">
                          {listing.title}
                        </h3>
                        <div className="text-lg font-bold text-secondary-600">
                          RM {listing.price?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Line Separator with Compare Icon */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex-1 flex items-center justify-center px-3">
          <div className="h-0.5 bg-neutral-400 w-full rounded-full"></div>
        </div>
        <div className="flex items-center justify-center bg-white border-2 border-neutral-400 rounded-full p-1.5">
          <GitCompare size={16} className="text-neutral-600" />
        </div>
        <div className="flex-1 flex items-center justify-center px-3">
          <div className="h-0.5 bg-neutral-400 w-full rounded-full"></div>
        </div>
      </div>

      {/* Header and Action Buttons */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Left: Card count */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-accent-600">
            {cards.length} {activeTab === "queue" ? "remaining" : "items"}
          </span>
          {compareMode && selectedForCompare.length > 0 && (
            <span className="px-2 py-1 text-xs rounded-full bg-secondary-100 text-secondary-700 font-medium border border-secondary-300">
              {selectedForCompare.length} selected
            </span>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1 bg-white rounded-full p-1.5 border border-neutral-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-full transition-colors border ${
              showFilters ? "bg-secondary-500 text-white border-secondary-600" : "hover:bg-white border-neutral-300"
            }`}
            title="Search & Filters"
          >
            <Search size={16} className={showFilters ? "text-white" : "text-accent-600"} />
          </button>

          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedForCompare([]);
            }}
            className={`p-1.5 rounded-full transition-colors border ${
              compareMode ? "bg-secondary-500 text-accent-700 border-secondary-600" : "hover:bg-white border-neutral-300"
            }`}
            title="Compare Mode"
          >
            <GitCompare size={16} className={compareMode ? "text-accent-700" : "text-accent-600"} />
          </button>

          <button
            onClick={() => setShowGalleryView(!showGalleryView)}
            className="p-1.5 rounded-full hover:bg-white transition-colors border border-neutral-300"
            title="Gallery View"
          >
            <Maximize2 size={16} className="text-accent-600" />
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 rounded-full hover:bg-white transition-colors border border-neutral-300"
            title="Reset all cards"
          >
            <RotateCcw size={16} className="text-accent-600" />
          </button>
        </div>
      </div>

      {/* Search Bar - Collapsible */}
      {showFilters && (
        <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-neutral-200">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white"
              />
            </div>
            <select className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white">
              <option value="match-score">Sort: Best Match</option>
              <option value="price-low">Sort: Price Low to High</option>
              <option value="price-high">Sort: Price High to Low</option>
              <option value="recent">Sort: Recently Posted</option>
              <option value="location">Sort: Location</option>
            </select>
          </div>
        </div>
      )}

      {/* Single Column Card Container - Custom Div */}
      <div className="flex flex-col rounded-xl border-2 border-neutral-200 overflow-hidden bg-white shadow-sm h-[calc(100vh-180px)]">
        {/* Tabs Header */}
        <div className="flex border-b border-neutral-200 shrink-0">
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
          <div className="p-3 bg-secondary-100 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare size={16} className="text-secondary-700" />
                <span className="text-xs font-medium text-accent-700">
                  Tap cards to compare (max 4)
                </span>
              </div>
              {selectedForCompare.length >= 2 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="px-3 py-1 bg-secondary-500 hover:bg-secondary-600 text-accent-700 rounded-lg text-xs font-medium transition-colors border border-secondary-600"
                >
                  Compare {selectedForCompare.length}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reaction Overlay - Instagram-style pop animation */}
        <AnimatePresence>
          {showReaction && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {showReaction === 'like' ? (
                <div className="bg-secondary-500 rounded-full p-8 shadow-2xl">
                  <Heart size={80} className="text-accent-700 fill-accent-700" />
                </div>
              ) : (
                <div className="bg-red-100 border-4 border-red-300 rounded-full p-8 shadow-2xl">
                  <X size={80} className="text-red-700" strokeWidth={3} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Column Content - Card Stack Area */}
        <div className="bg-primary-50 relative flex-1 p-4">
          {cards.length === 0 ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center text-center">
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
            /* Card Stack - Using SwipeableCard */
            <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
              <AnimatePresence mode="popLayout">
                {activeTab === "queue" ? (
                  // Swipeable cards for "For You" tab
                  cards.map((listing, index) => (
                    <SwipeableCard
                      key={listing.id}
                      listing={listing}
                      index={index}
                      totalCards={cards.length}
                      onSwipe={handleSwipe}
                    />
                  ))
                ) : (
                // Static cards for liked/passed tabs
                cards.map((listing, index) => {
                  const isSelected = selectedForCompare.includes(listing.id);

                  return (
                    <motion.div
                      key={listing.id}
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
                              setSelectedForCompare(prev => prev.filter(id => id !== listing.id));
                            } else if (selectedForCompare.length < 4) {
                              setSelectedForCompare(prev => [...prev, listing.id]);
                            }
                          }
                        }}
                        className={`h-full bg-white rounded-2xl shadow-xl border overflow-hidden ${
                          isSelected ? 'border-4 border-secondary-500' : 'border border-neutral-300'
                        }`}
                      >
                        {/* Card Image */}
                        <div className="relative h-1/2 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <span className="text-accent-400">Image</span>

                          {/* Selection Checkbox for Compare Mode */}
                          {compareMode && index === 0 && (
                            <div className="absolute top-4 left-4">
                              <div className={`w-8 h-8 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'bg-secondary-500 border-secondary-500' : 'bg-white border-neutral-400'
                              }`}>
                                {isSelected && (
                                  <svg className="w-5 h-5 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            {listing.title}
                          </h3>
                          <div className="text-2xl font-bold text-secondary-600 mb-2">
                            RM {listing.price?.toLocaleString() || '0'}
                          </div>
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium mb-2 w-fit">
                            {listing.category}
                          </span>
                          <p className="text-sm text-accent-500 line-clamp-3 mb-4">
                            {listing.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Action Buttons Footer - only shown when there are cards and not in compare mode */}
        {cards.length > 0 && !compareMode && activeTab === "queue" && (
          <div className="bg-white border-t border-neutral-200 flex items-center justify-center gap-4 py-3 px-4 shrink-0">
            <button
              onClick={handlePass}
              className="w-14 h-14 rounded-full bg-white border-2 border-red-300 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-95"
            >
              <X size={24} className="text-red-500" strokeWidth={2.5} />
            </button>

            <button
              onClick={handleInfo}
              className="w-12 h-12 rounded-full bg-white border-2 border-neutral-300 flex items-center justify-center hover:bg-primary-50 transition-colors shadow-sm active:scale-95"
            >
              <Info size={18} className="text-accent-600" />
            </button>

            <button
              onClick={handleLike}
              className="w-14 h-14 rounded-full bg-white border-2 border-green-300 flex items-center justify-center hover:bg-green-50 transition-colors shadow-md active:scale-95"
            >
              <Heart size={24} className="text-green-500" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
