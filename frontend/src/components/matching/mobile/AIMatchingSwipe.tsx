"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "motion/react";
import { X, Heart, Info, Layers, Search, GitCompare, Sparkles, MapPin, Clock, RotateCcw, Maximize2, Minimize2, Undo, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { AIMatchingProps, MatchedListing, ColumnType } from "../types";
import { ListingComparisonModal } from "../ListingComparisonModal";
import { mockAIMatchings, userAIListing } from "@/utils/mock-ai-matching-data";

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
  const [selectMode, setSelectMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showReaction, setShowReaction] = useState<'like' | 'pass' | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showGalleryView, setShowGalleryView] = useState(false);

  // Card organization by column - stores listing IDs instead of indices
  const [cardsByColumn, setCardsByColumn] = useState<Record<ColumnType, string[]>>({
    passed: [],
    queue: mockAIMatchings.map(listing => listing.id), // All listings start in queue
    liked: [],
  });

  // Get listing by ID from mockAIMatchings
  const getListingById = (id: string): MatchedListing | undefined => {
    return mockAIMatchings.find(listing => listing.id === id);
  };

  // Get user's listing
  const getUserListing = (): MatchedListing => userAIListing;

  // Get listings for comparison from selected IDs
  const getListingsForComparison = (): MatchedListing[] => {
    return selectedForCompare
      .map(id => getListingById(id))
      .filter((listing): listing is MatchedListing => listing !== undefined);
  };

  // Get cards (listings) for current tab
  const getCardsForTab = (tab: TabType): MatchedListing[] => {
    const listingIds = cardsByColumn[tab];
    return listingIds
      .map(id => getListingById(id))
      .filter((listing): listing is MatchedListing => listing !== undefined);
  };

  const cards = getCardsForTab(activeTab);

  // Swipeable Card Component for Queue
  const SwipeableCard = ({
    listing,
    index,
    totalCards,
    isSelected,
    onSwipe,
    onCycle
  }: {
    listing: MatchedListing;
    index: number;
    totalCards: number;
    isSelected: boolean;
    onSwipe: (direction: 'left' | 'right') => void;
    onCycle: (direction: 'left' | 'right') => void;
  }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100;
      const velocity = info.velocity.x;

      if (Math.abs(velocity) >= 500 || Math.abs(info.offset.x) >= threshold) {
        const direction = info.offset.x > 0 ? 'right' : 'left';
        if (selectMode) {
          onCycle(direction);
        } else {
          onSwipe(direction);
        }
      }
    };

    const isTopCard = index === 0;
    const matchScore = listing.matchScore || 85;
    const getMatchColor = (score: number) => {
      if (score >= 75) return { bg: 'from-green-100 to-green-200', text: 'text-green-700', border: 'border-green-300' };
      if (score >= 50) return { bg: 'from-secondary-100 to-secondary-200', text: 'text-secondary-700', border: 'border-secondary-300' };
      return { bg: 'from-red-100 to-red-200', text: 'text-red-700', border: 'border-red-300' };
    };
    const colors = getMatchColor(matchScore);

    return (
      <motion.div
        className="absolute inset-0"
        style={{
          x: isTopCard ? x : 0,
          y: isTopCard ? y : 0,
          rotate: isTopCard ? rotate : 0,
          opacity: isTopCard ? opacity : 1,
          zIndex: totalCards - index,
        }}
        animate={{
          scale: isTopCard ? 1 : 1 - (index * 0.05),
          y: isTopCard ? 0 : index * 10,
        }}
        exit={{
          x: 0,
          opacity: 0,
          scale: 0.8,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        drag={isTopCard ? true : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        onDragEnd={handleDragEnd}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >

        <div
          onClick={() => {
            if (!isTopCard) return;
            if (selectMode) {
              if (isSelected) {
                setSelectedForCompare(prev => prev.filter(id => id !== listing.id));
              } else {
                setSelectedForCompare(prev => [...prev, listing.id]);
              }
            } else {
              onViewDetails(listing);
            }
          }}
          className={`h-full bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col ${
            isTopCard ? 'cursor-pointer' : ''
          } ${isSelected ? 'border-4 border-secondary-500' : 'border-neutral-300'}`}
        >
          {/* Card Image */}
          <div className="relative flex-[3] bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-accent-400">Image</span>

            {/* Selection Checkbox for Select Mode */}
            {selectMode && isTopCard && (
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

            {/* Match Score Badge */}
            {isTopCard && activeTab === "queue" && !selectMode && (
              <div className={`absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}>
                <Sparkles size={14} />
                <span className="text-sm font-bold">{matchScore}%</span>
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-4 flex-[2] flex flex-col overflow-hidden">
            <h3 className="font-bold text-lg text-accent-700 mb-2 line-clamp-2">
              {listing.title}
            </h3>
            <div className="text-2xl font-bold text-secondary-600 mb-2">
              RM {listing.price?.toLocaleString() || '0'}
            </div>
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium mb-2 w-fit">
              {listing.category}
            </span>
            <div className="flex items-center gap-3 text-xs text-accent-500 mb-2">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>{listing.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{listing.timeAgo}</span>
              </div>
            </div>
            <p className="text-sm text-accent-500 line-clamp-2">
              {listing.description}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  // Swipeable Card Component for Liked/Passed (with undo)
  const UndoableCard = ({
    listing,
    index,
    totalCards,
    isSelected,
    onUndo,
    onCycle
  }: {
    listing: MatchedListing;
    index: number;
    totalCards: number;
    isSelected: boolean;
    onUndo: (id: string) => void;
    onCycle: (direction: 'left' | 'right') => void;
  }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 100;
      const velocity = info.velocity.x;

      if (Math.abs(velocity) >= 500 || Math.abs(info.offset.x) >= threshold) {
        const direction = info.offset.x > 0 ? 'right' : 'left';
        if (selectMode) {
          onCycle(direction);
        } else {
          // Any swipe direction triggers undo in normal mode
          onUndo(listing.id);
        }
      }
    };

    const isTopCard = index === 0;

    return (
      <motion.div
        className="absolute inset-0"
        style={{
          x: isTopCard ? x : 0,
          y: isTopCard ? y : 0,
          rotate: isTopCard ? rotate : 0,
          opacity: isTopCard ? opacity : 1,
          zIndex: totalCards - index,
        }}
        animate={{
          scale: isTopCard ? 1 : 1 - (index * 0.05),
          y: isTopCard ? 0 : index * 10,
        }}
        drag={isTopCard ? true : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        onDragEnd={handleDragEnd}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div
          onClick={() => {
            if (selectMode) {
              if (isSelected) {
                setSelectedForCompare(prev => prev.filter(id => id !== listing.id));
              } else {
                setSelectedForCompare(prev => [...prev, listing.id]);
              }
            } else if (index === 0) {
              onViewDetails(listing);
            }
          }}
          className={`h-full bg-white rounded-2xl shadow-xl border overflow-hidden ${
            isTopCard ? 'cursor-pointer' : ''
          } ${isSelected ? 'border-4 border-secondary-500' : 'border border-neutral-300'}`}
        >
          {/* Card Image */}
          <div className="relative h-1/2 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-accent-400">Image</span>

            {/* Selection Checkbox for Select Mode */}
            {selectMode && index === 0 && (
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
            <div className="flex items-center gap-3 text-xs text-accent-500 mb-2">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>{listing.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{listing.timeAgo}</span>
              </div>
            </div>
            <p className="text-sm text-accent-500 line-clamp-2">
              {listing.description}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  // Handle swipe action - move card between columns
  const handleSwipe = (direction: 'left' | 'right') => {
    const currentCard = cards[0];
    if (!currentCard) return;

    const targetColumn: ColumnType = direction === 'right' ? 'liked' : 'passed';

    // Show reaction animation
    setShowReaction(direction === 'right' ? 'like' : 'pass');

    // Hide reaction after animation
    setTimeout(() => {
      setShowReaction(null);
    }, 800);

    // Move card from queue to target column
    setCardsByColumn(prev => ({
      ...prev,
      queue: prev.queue.filter(id => id !== currentCard.id),
      [targetColumn]: [...prev[targetColumn], currentCard.id],
    }));

    // Call the onMatch callback
    if (direction === 'right') {
      onMatch(currentCard, 'like');
    } else {
      onMatch(currentCard, 'pass');
    }
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

  // Handle undo - move card back to queue
  const handleUndo = (listingId: string) => {
    setCardsByColumn(prev => ({
      ...prev,
      queue: [...prev.queue, listingId],
      liked: prev.liked.filter(id => id !== listingId),
      passed: prev.passed.filter(id => id !== listingId),
    }));
  };

  // Handle cycle - move card in select mode (loop through cards)
  const handleCycle = (direction: 'left' | 'right') => {
    setCardsByColumn(prev => {
      const currentColumn = prev[activeTab];
      if (currentColumn.length === 0) return prev;

      if (direction === 'left') {
        // Move top card to back
        const [first, ...rest] = currentColumn;
        return {
          ...prev,
          [activeTab]: [...rest, first],
        };
      } else {
        // Move bottom card to top
        const last = currentColumn[currentColumn.length - 1];
        const rest = currentColumn.slice(0, -1);
        return {
          ...prev,
          [activeTab]: [last, ...rest],
        };
      }
    });
  };

  // Handle select current card
  const handleSelectCurrent = () => {
    const currentCard = cards[0];
    if (!currentCard) return;

    if (selectedForCompare.includes(currentCard.id)) {
      setSelectedForCompare(prev => prev.filter(id => id !== currentCard.id));
    } else {
      setSelectedForCompare(prev => [...prev, currentCard.id]);
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
                      // Move all cards back to queue
                      setCardsByColumn({
                        passed: [],
                        queue: mockAIMatchings.map(listing => listing.id),
                        liked: [],
                      });
                      setShowResetConfirm(false);
                      setActiveTab("queue");
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
                <div className="flex items-center gap-2">
                  {/* Select Button */}
                  <button
                    onClick={() => {
                      const newSelectMode = !selectMode;
                      setSelectMode(newSelectMode);
                      if (!newSelectMode) {
                        setSelectedForCompare([]);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectMode
                        ? 'bg-secondary-500 text-accent-700'
                        : 'bg-primary-100 text-accent-700 hover:bg-primary-200'
                    }`}
                  >
                    {selectMode ? 'Done' : 'Select'}
                  </button>
                  <button
                    onClick={() => {
                      setShowGalleryView(false);
                      setSelectMode(false);
                      setSelectedForCompare([]);
                    }}
                    className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <X size={20} className="text-accent-600" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-neutral-200 shrink-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-accent-700'
                        : 'text-accent-400 hover:text-accent-600'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-100">
                      {cardsByColumn[tab.id].length}
                    </span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="galleryActiveTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary-500"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Select Mode Action Bar */}
              {selectMode && selectedForCompare.length >= 1 && (
                <div className="px-4 py-3 bg-secondary-100 border-b border-secondary-200 shrink-0">
                  <div className="flex flex-col gap-2">
                    {/* Selection count */}
                    <div className="text-sm font-medium text-accent-700 text-center">
                      {selectedForCompare.length} selected {selectedForCompare.length > 4 && <span className="text-red-600">(max 4)</span>}
                    </div>

                    {/* Batch movement buttons - all equal width */}
                    <div className="grid grid-cols-3 gap-2">
                      {activeTab !== "queue" && (
                        <button
                          onClick={() => {
                            setCardsByColumn(prev => ({
                              ...prev,
                              queue: [...prev.queue, ...selectedForCompare],
                              [activeTab]: prev[activeTab].filter(id => !selectedForCompare.includes(id)),
                            }));
                            setSelectedForCompare([]);
                          }}
                          className="text-xs px-3 py-2 bg-white hover:bg-neutral-50 text-accent-700 rounded-lg transition-colors font-medium border border-neutral-300"
                        >
                          To Queue
                        </button>
                      )}
                      {activeTab !== "liked" && (
                        <button
                          onClick={() => {
                            setCardsByColumn(prev => ({
                              ...prev,
                              liked: [...prev.liked, ...selectedForCompare],
                              [activeTab]: prev[activeTab].filter(id => !selectedForCompare.includes(id)),
                            }));
                            setSelectedForCompare([]);
                          }}
                          className="text-xs px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors font-medium"
                        >
                          To Liked
                        </button>
                      )}
                      {activeTab !== "passed" && (
                        <button
                          onClick={() => {
                            setCardsByColumn(prev => ({
                              ...prev,
                              passed: [...prev.passed, ...selectedForCompare],
                              [activeTab]: prev[activeTab].filter(id => !selectedForCompare.includes(id)),
                            }));
                            setSelectedForCompare([]);
                          }}
                          className="text-xs px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-medium"
                        >
                          To Passed
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (selectedForCompare.length <= 4) {
                            setShowGalleryView(false);
                            setShowCompareModal(true);
                          }
                        }}
                        disabled={selectedForCompare.length > 4}
                        className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                          selectedForCompare.length > 4
                            ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                            : 'bg-secondary-500 hover:bg-secondary-600 text-accent-700'
                        }`}
                      >
                        Compare
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {cardsByColumn[activeTab].length === 0 ? (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <div className="mb-3 text-accent-400">
                      <Layers size={48} />
                    </div>
                    <h3 className="text-lg font-semibold text-accent-700 mb-2">
                      {activeTab === "queue" && "No more matches!"}
                      {activeTab === "liked" && "No liked matches yet"}
                      {activeTab === "passed" && "No passed matches yet"}
                    </h3>
                    <p className="text-sm text-accent-500">
                      {activeTab === "queue" && "You've reviewed all potential matches"}
                      {activeTab === "liked" && "Start liking listings to see them here"}
                      {activeTab === "passed" && "Passed listings will appear here"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {cardsByColumn[activeTab].map((listingId) => {
                      const listing = getListingById(listingId);
                      if (!listing) return null;
                    const isSelected = selectedForCompare.includes(listing.id);
                    return (
                      <div
                        key={listing.id}
                        onClick={() => {
                          if (selectMode) {
                            if (isSelected) {
                              setSelectedForCompare(prev => prev.filter(id => id !== listing.id));
                            } else {
                              setSelectedForCompare(prev => [...prev, listing.id]);
                            }
                          } else {
                            setShowGalleryView(false);
                            onViewDetails(listing);
                          }
                        }}
                        className={`bg-white rounded-xl border overflow-hidden shadow-sm active:scale-95 transition-transform relative ${
                          isSelected ? 'border-4 border-secondary-500' : 'border border-neutral-200'
                        }`}
                      >
                        {/* Selection Checkbox */}
                        {selectMode && (
                          <div className="absolute top-2 left-2 z-10">
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
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
                          {/* Move Actions - Only show when not in select mode */}
                          {!selectMode && (
                            <div className="p-2 border-t border-neutral-200 flex gap-2">
                              {activeTab !== "queue" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCardsByColumn(prev => ({
                                      ...prev,
                                      queue: [...prev.queue, listing.id],
                                      [activeTab]: prev[activeTab].filter(id => id !== listing.id),
                                    }));
                                  }}
                                  className="flex-1 text-xs px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-accent-700 rounded transition-colors"
                                  title="Move to Queue"
                                >
                                  To Queue
                                </button>
                              )}
                              {activeTab !== "liked" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCardsByColumn(prev => ({
                                      ...prev,
                                      liked: [...prev.liked, listing.id],
                                      [activeTab]: prev[activeTab].filter(id => id !== listing.id),
                                    }));
                                  }}
                                  className="flex-1 text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                                  title="Move to Liked"
                                >
                                  Like
                                </button>
                              )}
                              {activeTab !== "passed" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCardsByColumn(prev => ({
                                      ...prev,
                                      passed: [...prev.passed, listing.id],
                                      [activeTab]: prev[activeTab].filter(id => id !== listing.id),
                                    }));
                                  }}
                                  className="flex-1 text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                                  title="Move to Passed"
                                >
                                  Pass
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <ListingComparisonModal
        isOpen={showCompareModal}
        listings={getListingsForComparison()}
        userListing={getUserListing()}
        onClose={() => {
          setShowCompareModal(false);
          setSelectedForCompare([]);
        }}
        onSelectListing={(listing) => {
          onViewDetails(listing);
        }}
        onMessage={(listing) => {
          onMessage(listing);
        }}
        onNegotiate={(listing) => {
          console.log('Negotiate:', listing);
        }}
      />

      <div className="mb-12 overflow-hidden">
      <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden h-full relative">
        {/* Toolbar */}
        <div className="flex flex-col border-b border-neutral-200 shrink-0">
          {/* Top Row - Main Controls */}
          <div className="flex items-center justify-between p-3 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-accent-600">
                {cards.length} {activeTab === "queue" ? "remaining" : "items"}
              </span>
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

              {/* Gallery View Toggle */}
              <button
                onClick={() => setShowGalleryView(!showGalleryView)}
                className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                title="Gallery View"
              >
                <Maximize2 size={18} className="text-accent-600" />
              </button>

              {/* Reset Button */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                title="Reset all cards"
              >
                <RotateCcw size={18} className="text-accent-600" />
              </button>

              {/* Select Mode Toggle */}
              <button
                onClick={() => {
                  const newSelectMode = !selectMode;
                  setSelectMode(newSelectMode);
                  if (!newSelectMode) {
                    setSelectedForCompare([]);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectMode
                    ? 'bg-secondary-500 text-accent-700'
                    : 'bg-primary-100 text-accent-700 hover:bg-primary-200'
                }`}
                title="Select Mode"
              >
                {selectMode ? 'Done' : 'Select'}
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

          {/* Select Mode Banner */}
          {selectMode && (
            <div className="p-3 bg-secondary-100 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare size={16} className="text-secondary-700" />
                  <span className="text-xs font-medium text-accent-700">
                    {selectedForCompare.length} selected
                    {selectedForCompare.length > 4 && <span className="text-red-600 ml-1">(max 4 to compare)</span>}
                  </span>
                </div>
                {selectedForCompare.length >= 1 && (
                  <button
                    onClick={() => {
                      if (selectedForCompare.length <= 4) {
                        setShowCompareModal(true);
                      }
                    }}
                    disabled={selectedForCompare.length > 4}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedForCompare.length > 4
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                        : 'bg-secondary-500 hover:bg-secondary-600 text-accent-700'
                    }`}
                  >
                    Compare {selectedForCompare.length}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

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
            /* Card Stack - Using SwipeableCard */
            <div className="relative w-full" style={{ height: '100%', minHeight: '500px' }}>
              <AnimatePresence mode="popLayout">
                {activeTab === "queue" ? (
                  // Swipeable cards for "For You" tab
                  cards.map((listing, index) => (
                    <SwipeableCard
                      key={listing.id}
                      listing={listing}
                      index={index}
                      totalCards={cards.length}
                      isSelected={selectedForCompare.includes(listing.id)}
                      onSwipe={handleSwipe}
                      onCycle={handleCycle}
                    />
                  ))
                ) : (
                // Undoable cards for liked/passed tabs
                cards.map((listing, index) => (
                  <UndoableCard
                    key={listing.id}
                    listing={listing}
                    index={index}
                    totalCards={cards.length}
                    isSelected={selectedForCompare.includes(listing.id)}
                    onUndo={handleUndo}
                    onCycle={handleCycle}
                  />
                ))
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Action Buttons - always shown when there are cards and not in gallery or comparison modal */}
        {cards.length > 0 && !showGalleryView && !showCompareModal && (
          <div className="p-4 pb-4 bg-white border-t border-neutral-200 shrink-0 relative z-[100]">
            {activeTab === "queue" ? (
              selectMode ? (
                /* Select Mode: Left Arrow | Checkmark | Right Arrow */
                <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
                  {/* Previous Card */}
                  <button
                    onClick={() => handleCycle('right')}
                    className="w-16 h-16 rounded-full bg-white border-2 border-neutral-300 flex items-center justify-center hover:bg-primary-50 transition-colors shadow-md active:scale-95"
                  >
                    <ChevronLeft size={28} className="text-accent-600" />
                  </button>

                  {/* Select Current Card */}
                  <button
                    onClick={handleSelectCurrent}
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-colors shadow-md active:scale-95 ${
                      cards[0] && selectedForCompare.includes(cards[0].id)
                        ? 'bg-secondary-500 border-secondary-500'
                        : 'bg-white border-secondary-300 hover:bg-secondary-50'
                    }`}
                  >
                    <Check size={28} className={cards[0] && selectedForCompare.includes(cards[0].id) ? 'text-accent-700' : 'text-secondary-600'} />
                  </button>

                  {/* Next Card */}
                  <button
                    onClick={() => handleCycle('left')}
                    className="w-16 h-16 rounded-full bg-white border-2 border-neutral-300 flex items-center justify-center hover:bg-primary-50 transition-colors shadow-md active:scale-95"
                  >
                    <ChevronRight size={28} className="text-accent-600" />
                  </button>
                </div>
              ) : (
                /* Normal Mode: Pass/Info/Like buttons */
                <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
                  {/* Pass */}
                  <button
                    onClick={handlePass}
                    className="w-16 h-16 rounded-full bg-white border-2 border-red-300 flex items-center justify-center hover:bg-red-50 transition-colors shadow-md active:scale-95"
                  >
                    <X size={28} className="text-red-500" />
                  </button>

                  {/* View Details */}
                  <button
                    onClick={handleInfo}
                    className="w-14 h-14 rounded-full bg-white border-2 border-accent-300 flex items-center justify-center hover:bg-primary-50 transition-colors shadow-sm active:scale-95"
                  >
                    <Info size={20} className="text-accent-600" />
                  </button>

                  {/* Like */}
                  <button
                    onClick={handleLike}
                    className="w-16 h-16 rounded-full bg-white border-2 border-green-300 flex items-center justify-center hover:bg-green-50 transition-colors shadow-md active:scale-95"
                  >
                    <Heart size={28} className="text-green-500" />
                  </button>
                </div>
              )
            ) : (
              /* Liked/Passed tabs */
              selectMode ? (
                /* Select Mode: Left Arrow | Checkmark | Right Arrow */
                <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
                  {/* Previous Card */}
                  <button
                    onClick={() => handleCycle('right')}
                    className="w-16 h-16 rounded-full bg-white border-2 border-neutral-300 flex items-center justify-center hover:bg-primary-50 transition-colors shadow-md active:scale-95"
                  >
                    <ChevronLeft size={28} className="text-accent-600" />
                  </button>

                  {/* Select Current Card */}
                  <button
                    onClick={handleSelectCurrent}
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-colors shadow-md active:scale-95 ${
                      cards[0] && selectedForCompare.includes(cards[0].id)
                        ? 'bg-secondary-500 border-secondary-500'
                        : 'bg-white border-secondary-300 hover:bg-secondary-50'
                    }`}
                  >
                    <Check size={28} className={cards[0] && selectedForCompare.includes(cards[0].id) ? 'text-accent-700' : 'text-secondary-600'} />
                  </button>

                  {/* Next Card */}
                  <button
                    onClick={() => handleCycle('left')}
                    className="w-16 h-16 rounded-full bg-white border-2 border-neutral-300 flex items-center justify-center hover:bg-primary-50 transition-colors shadow-md active:scale-95"
                  >
                    <ChevronRight size={28} className="text-accent-600" />
                  </button>
                </div>
              ) : (
                /* Normal Mode: Undo button */
                <div className="flex items-center justify-center max-w-md mx-auto">
                  <button
                    onClick={() => cards[0] && handleUndo(cards[0].id)}
                    className="w-16 h-16 rounded-full bg-white border-2 border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors shadow-md active:scale-95"
                  >
                    <Undo size={28} className="text-neutral-600" />
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
