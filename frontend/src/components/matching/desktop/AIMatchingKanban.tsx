"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Ban, Sparkles, Layers, X, Undo2, Search, GitCompare, Maximize2 } from "lucide-react";
import { AIMatchingProps, ColumnType, MatchedListing } from "../types";
import { ListingComparisonModal } from "../ListingComparisonModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ColumnData {
  id: ColumnType;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const columns: ColumnData[] = [
  {
    id: "passed",
    title: "Passed",
    icon: <Ban size={18} />,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "queue",
    title: "For You",
    icon: <Sparkles size={18} />,
    color: "text-secondary-600",
    bgColor: "bg-secondary-100",
  },
  {
    id: "liked",
    title: "Liked",
    icon: <Heart size={18} />,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

export function AIMatchingKanban({
  userMode,
  userListings,
  availableListings,
  onMatch,
  onMessage,
  onViewDetails,
  onClose,
}: AIMatchingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [expandedPopupColumn, setExpandedPopupColumn] = useState<ColumnType | null>(null);

  // Comparison Modal
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Card organization by column
  const [cardsByColumn, setCardsByColumn] = useState<Record<ColumnType, number[]>>({
    passed: [],
    queue: [0, 1, 2], // Start with first 3 listings in queue
    liked: [],
  });

  // Drag state
  const [draggedCard, setDraggedCard] = useState<{ listingIndex: number; sourceColumn: ColumnType } | null>(null);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Select mode for popup
  const [popupSelectMode, setPopupSelectMode] = useState(false);
  const [selectedPopupCards, setSelectedPopupCards] = useState<string[]>([]);

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

  // Mock data for comparison - convert selected card IDs to MatchedListing objects
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

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'arrowright':
          // Like top card in queue
          console.log('Keyboard: Like');
          break;
        case 'arrowleft':
          // Pass top card in queue
          console.log('Keyboard: Pass');
          break;
        case ' ':
          e.preventDefault();
          // View details of top card
          console.log('Keyboard: View details');
          break;
        case 'c':
          // Toggle compare mode
          setCompareMode(prev => !prev);
          setSelectedForCompare([]);
          break;
        case 's':
          // Toggle search
          setShowFilters(prev => !prev);
          break;
        case 'escape':
          // Close modals
          if (showCompareModal) {
            setShowCompareModal(false);
          } else if (expandedPopupColumn) {
            setExpandedPopupColumn(null);
          } else if (compareMode) {
            setCompareMode(false);
            setSelectedForCompare([]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showCompareModal, expandedPopupColumn, compareMode]);

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
                {/* Content */}
                <div className="p-6">
                  <h2 className="text-lg font-bold text-accent-700 mb-3">Reset All Cards?</h2>
                  <p className="text-sm text-accent-600 mb-2">
                    This will move all cards back to "For You". Cards in "Liked" and "Passed" will be reset.
                  </p>
                  <p className="text-xs text-accent-400">
                    This action cannot be undone.
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-primary-50 flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 bg-white text-accent-700 font-medium hover:bg-primary-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setCardsByColumn({
                        passed: [],
                        queue: [0, 1, 2],
                        liked: [],
                      });
                      setSelectedForCompare([]);
                      setCompareMode(false);
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
          // Handle negotiation - could open a negotiation modal
        }}
      />

      {/* Expanded Column Popup Modal */}
      <AnimatePresence>
        {expandedPopupColumn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setExpandedPopupColumn(null)}
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
                  <div className="flex items-center gap-3">
                    {columns.find(c => c.id === expandedPopupColumn)?.icon && (
                      <div className={columns.find(c => c.id === expandedPopupColumn)?.color}>
                        {columns.find(c => c.id === expandedPopupColumn)?.icon}
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-accent-700 mb-1">
                        {columns.find(c => c.id === expandedPopupColumn)?.title}
                      </h2>
                      <p className="text-sm text-accent-500">
                        3 listings in this column
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Select Button */}
                    <button
                      onClick={() => {
                        setPopupSelectMode(!popupSelectMode);
                        setSelectedPopupCards([]);
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        popupSelectMode
                          ? 'bg-secondary-500 text-accent-700'
                          : 'bg-primary-100 text-accent-700 hover:bg-primary-200'
                      }`}
                    >
                      {popupSelectMode ? 'Done' : 'Select'}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExpandedPopupColumn(null);
                        setPopupSelectMode(false);
                        setSelectedPopupCards([]);
                      }}
                      className="rounded-full hover:bg-primary-100 transition-colors"
                    >
                      <X className="h-5 w-5 text-accent-600" />
                    </Button>
                  </div>
                </div>

                {/* Action Bar - Shows when cards are selected */}
                {popupSelectMode && selectedPopupCards.length > 0 && (
                  <div className="px-6 py-3 bg-secondary-100 border-b border-neutral-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-accent-700">
                      {selectedPopupCards.length} selected
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Compare Button */}
                      <button
                        onClick={() => {
                          console.log('Compare selected cards:', selectedPopupCards);
                          setShowCompareModal(true);
                        }}
                        disabled={selectedPopupCards.length < 2 || selectedPopupCards.length > 4}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedPopupCards.length >= 2 && selectedPopupCards.length <= 4
                            ? 'bg-secondary-500 text-accent-700 hover:bg-secondary-600'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        Compare
                      </button>

                      {/* Pass Button */}
                      {expandedPopupColumn === 'queue' && (
                        <button
                          onClick={() => {
                            // Move selected cards to passed
                            const selectedIndices = selectedPopupCards.map(id => parseInt(id.split('-')[2]));
                            setCardsByColumn(prev => ({
                              ...prev,
                              queue: prev.queue.filter((_, idx) => !selectedIndices.includes(idx)),
                              passed: [...selectedIndices.map(idx => prev.queue[idx]), ...prev.passed].filter(Boolean),
                            }));
                            setSelectedPopupCards([]);
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 transition-colors"
                        >
                          Pass
                        </button>
                      )}

                      {/* Like Button */}
                      {expandedPopupColumn === 'queue' && (
                        <button
                          onClick={() => {
                            // Move selected cards to liked
                            const selectedIndices = selectedPopupCards.map(id => parseInt(id.split('-')[2]));
                            setCardsByColumn(prev => ({
                              ...prev,
                              queue: prev.queue.filter((_, idx) => !selectedIndices.includes(idx)),
                              liked: [...selectedIndices.map(idx => prev.queue[idx]), ...prev.liked].filter(Boolean),
                            }));
                            setSelectedPopupCards([]);
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 transition-colors"
                        >
                          Like
                        </button>
                      )}

                      {/* Undo Button (for Liked/Passed columns) */}
                      {(expandedPopupColumn === 'liked' || expandedPopupColumn === 'passed') && (
                        <button
                          onClick={() => {
                            // Move selected cards back to queue
                            const selectedIndices = selectedPopupCards.map(id => parseInt(id.split('-')[2]));
                            setCardsByColumn(prev => ({
                              ...prev,
                              [expandedPopupColumn]: prev[expandedPopupColumn].filter((_, idx) => !selectedIndices.includes(idx)),
                              queue: [...selectedIndices.map(idx => prev[expandedPopupColumn][idx]), ...prev.queue].filter(Boolean),
                            }));
                            setSelectedPopupCards([]);
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-200 text-accent-700 hover:bg-primary-300 border border-primary-300 transition-colors"
                        >
                          Move to Queue
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Grid of Cards - Scrollable */}
                <div className="flex-1 overflow-y-auto touch-scroll p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((index) => {
                      const matchScores = [85, 60, 30];
                      const matchScore = matchScores[index - 1];
                      const getMatchColor = (score: number) => {
                        if (score >= 75) return { bg: 'from-green-100 to-green-200', text: 'text-green-700', border: 'border-green-300' };
                        if (score >= 50) return { bg: 'from-secondary-100 to-secondary-200', text: 'text-secondary-700', border: 'border-secondary-300' };
                        return { bg: 'from-red-100 to-red-200', text: 'text-red-700', border: 'border-red-300' };
                      };
                      const colors = getMatchColor(matchScore);
                      const cardId = `${expandedPopupColumn}-card-${index}`;
                      const isSelected = compareMode
                        ? selectedForCompare.includes(cardId)
                        : popupSelectMode && selectedPopupCards.includes(cardId);

                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (popupSelectMode) {
                              // Select mode - toggle selection
                              if (isSelected) {
                                setSelectedPopupCards(prev => prev.filter(id => id !== cardId));
                              } else {
                                setSelectedPopupCards(prev => [...prev, cardId]);
                              }
                            } else if (compareMode) {
                              if (isSelected) {
                                setSelectedForCompare(prev => prev.filter(id => id !== cardId));
                              } else if (selectedForCompare.length < 4) {
                                setSelectedForCompare(prev => [...prev, cardId]);
                              }
                            } else {
                              // When not in select/compare mode, open the listing details
                              const listingIndex = index % availableListings.length;
                              if (availableListings.length > 0) {
                                onViewDetails(availableListings[listingIndex]);
                              }
                            }
                          }}
                          className={`bg-white rounded-xl shadow-lg border overflow-hidden transition-all cursor-pointer hover:shadow-xl ${
                            isSelected ? 'border-4 border-secondary-500' : 'border-neutral-300'
                          }`}
                        >
                          {/* Card Image */}
                          <div className="relative w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <span className="text-accent-400 text-sm">Image</span>
                            {/* Match Score Badge */}
                            <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}>
                              <Sparkles size={12} />
                              <span className="text-xs font-bold">{matchScore}%</span>
                            </div>
                            {/* Selection Checkbox for Select/Compare Mode */}
                            {(popupSelectMode || compareMode) && (
                              <div className="absolute top-2 left-2">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'bg-secondary-500 border-secondary-500' : 'bg-white/80 border-neutral-400'
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

                          {/* Card Content */}
                          <div className="p-4">
                            <h3 className="font-bold text-base text-accent-700 mb-2 line-clamp-2">
                              MacBook Pro M3 16-inch - Excellent Condition
                            </h3>
                            <div className="text-xl font-bold text-secondary-600 mb-3">
                              RM 8,500
                            </div>
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium mb-3">
                              Electronics
                            </span>
                            <p className="text-xs text-accent-500 line-clamp-2 mb-4">
                              Need for video editing work. Willing to pay good price for excellent condition.
                            </p>

                            {/* Action Buttons */}
                            {!compareMode && expandedPopupColumn === "queue" && (
                              <div className="flex gap-2">
                                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-50 border border-red-300 hover:bg-red-100 transition-colors">
                                  <X size={16} className="text-red-500" />
                                  <span className="text-sm font-medium text-red-600">Pass</span>
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-50 border border-green-300 hover:bg-green-100 transition-colors">
                                  <Heart size={16} className="text-green-500" />
                                  <span className="text-sm font-medium text-green-600">Like</span>
                                </button>
                              </div>
                            )}
                            {!compareMode && (expandedPopupColumn === "liked" || expandedPopupColumn === "passed") && (
                              <div className="mt-4">
                                <button className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary-50 border border-accent-300 hover:bg-primary-100 transition-colors">
                                  <Undo2 size={16} className="text-accent-600" />
                                  <span className="text-sm font-medium text-accent-700">Undo</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Kanban Interface */}
      <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col border-b border-neutral-200">
        {/* Top Row - Main Controls */}
        <div className="flex items-center justify-between p-3 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-accent-600">
              3 new matches
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

            {/* Compare Mode Toggle */}
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedForCompare([]);
              }}
              className={`p-2 rounded-lg transition-colors ${
                compareMode ? "bg-secondary-500 text-accent-700" : "hover:bg-primary-100"
              }`}
              title="Compare Mode"
            >
              <GitCompare size={18} className={compareMode ? "text-accent-700" : "text-accent-600"} />
            </button>

            {/* Reset Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
              title="Reset all cards"
            >
              <Undo2 size={18} className="text-accent-600" />
            </button>
          </div>
        </div>

        {/* Search Bar - Collapsible */}
        {showFilters && (
          <div className="p-4 bg-primary-50 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or tags..."
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

        {/* Compare Mode Banner */}
        {compareMode && (
          <div className="p-3 bg-secondary-100 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare size={16} className="text-secondary-700" />
                <span className="text-sm font-medium text-accent-700">
                  Compare Mode Active - Click cards to select (max 4)
                </span>
              </div>
              {selectedForCompare.length >= 2 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="px-3 py-1 bg-secondary-500 hover:bg-secondary-600 text-accent-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Compare {selectedForCompare.length} Items
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full grid grid-cols-3 gap-4">
          {columns.map((column) => {
            return (
              <div
                key={column.id}
                className={`flex flex-col rounded-xl border-2 overflow-hidden transition-colors ${
                  draggedCard && draggedCard.sourceColumn !== column.id
                    ? 'border-secondary-500 bg-secondary-50'
                    : 'border-neutral-200'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedCard && draggedCard.sourceColumn !== column.id) {
                    setCardsByColumn(prev => ({
                      ...prev,
                      [draggedCard.sourceColumn]: prev[draggedCard.sourceColumn].filter(i => i !== draggedCard.listingIndex),
                      [column.id]: [draggedCard.listingIndex, ...prev[column.id]],
                    }));
                  }
                  setDraggedCard(null);
                }}
                onDragLeave={() => {
                  // Optional: could add visual feedback here
                }}
              >
                {/* Column Header */}
                <div
                  className="p-4 bg-white border-b border-neutral-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={column.color}>{column.icon}</div>
                      <h3 className="font-semibold text-accent-700">
                        {column.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-accent-500" />
                      <span className="text-sm font-medium text-accent-500">
                        {cardsByColumn[column.id].length}
                      </span>
                      <button
                        onClick={() => setExpandedPopupColumn(column.id)}
                        className="p-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                        title="Expand to fullscreen"
                      >
                        <Maximize2 size={18} className="text-accent-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column Content - Container for stacked cards */}
                <div className={`flex-1 p-4 ${column.bgColor}`}>
                  <div className="relative w-full h-[420px]">
                    {/* Empty state */}
                    {cardsByColumn[column.id].length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center text-center text-accent-400">
                        <div className={`mb-3 ${column.color}`}>
                          <Layers size={48} />
                        </div>
                        <p className="text-sm">
                          {column.id === "queue" && "No more matches"}
                          {column.id === "liked" && "No liked matches yet"}
                          {column.id === "passed" && "No passed matches yet"}
                        </p>
                      </div>
                    </div>
                    )}

                    {/* Stacked cards - max 3 visible */}
                    {cardsByColumn[column.id].slice(0, 3).map((listingIndex, stackIndex) => {
                      const index = stackIndex + 1;
                      // Mock match scores for demo
                      const matchScores = [85, 60, 30];
                      const matchScore = matchScores[index - 1];

                      // Traffic light system
                      const getMatchColor = (score: number) => {
                        if (score >= 75) return { bg: 'from-green-100 to-green-200', text: 'text-green-700', border: 'border-green-300' };
                        if (score >= 50) return { bg: 'from-secondary-100 to-secondary-200', text: 'text-secondary-700', border: 'border-secondary-300' };
                        return { bg: 'from-red-100 to-red-200', text: 'text-red-700', border: 'border-red-300' };
                      };

                      const colors = getMatchColor(matchScore);
                      const cardId = `${column.id}-card-${index}`;
                      const isSelected = selectedForCompare.includes(cardId);

                      return (
                        <div
                          key={`${column.id}-${listingIndex}`}
                          draggable={!compareMode}
                          onDragStart={(e) => {
                            if (!compareMode) {
                              setDraggedCard({ listingIndex, sourceColumn: column.id });
                              e.dataTransfer.effectAllowed = 'move';

                              // Create a custom drag image centered at cursor
                              if (e.currentTarget instanceof HTMLElement) {
                                // Get the inner card element (the actual white card)
                                const cardElement = e.currentTarget.querySelector('.bg-white') as HTMLElement;
                                if (cardElement) {
                                  const rect = cardElement.getBoundingClientRect();

                                  // Clone the inner card for drag image
                                  const dragImage = cardElement.cloneNode(true) as HTMLElement;
                                  dragImage.style.position = 'fixed';
                                  dragImage.style.left = '-10000px';
                                  dragImage.style.top = '0px';
                                  dragImage.style.width = rect.width + 'px';
                                  dragImage.style.height = rect.height + 'px';
                                  dragImage.style.transform = 'none';
                                  dragImage.style.pointerEvents = 'none';
                                  dragImage.style.zIndex = '9999';
                                  document.body.appendChild(dragImage);

                                  // Center the drag image on the cursor
                                  const centerX = rect.width / 2;
                                  const centerY = rect.height / 2;

                                  e.dataTransfer.setDragImage(dragImage, centerX, centerY);

                                  // Clean up after drag starts
                                  setTimeout(() => {
                                    if (document.body.contains(dragImage)) {
                                      document.body.removeChild(dragImage);
                                    }
                                  }, 0);
                                }

                                e.currentTarget.style.opacity = '0.5';
                              }
                            }
                          }}
                          onDragEnd={(e) => {
                            if (e.currentTarget instanceof HTMLElement) {
                              e.currentTarget.style.opacity = '1';
                            }
                            setDraggedCard(null);
                          }}
                          onClick={(e) => {
                            if (compareMode) {
                              e.stopPropagation();
                              if (isSelected) {
                                setSelectedForCompare(prev => prev.filter(id => id !== cardId));
                              } else if (selectedForCompare.length < 4) {
                                setSelectedForCompare(prev => [...prev, cardId]);
                              }
                            } else {
                              // When not in compare mode, open the listing details
                              e.stopPropagation();
                              const listingIndex = index % availableListings.length;
                              if (availableListings.length > 0) {
                                onViewDetails(availableListings[listingIndex]);
                              }
                            }
                          }}
                          className={`absolute top-0 left-0 right-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                            compareMode ? 'cursor-pointer' : 'cursor-move'
                          }`}
                          style={{
                            transform: `translateY(${(index - 1) * 12}px) scale(${1 - (index - 1) * 0.04}) rotateZ(${(index - 1) * 1}deg)`,
                            zIndex: 10 - index,
                          }}
                        >
                          <div className={`bg-white rounded-xl shadow-xl border overflow-hidden ${
                            isSelected ? 'border-4 border-secondary-500' : 'border border-neutral-300'
                          }`}>
                            {/* Card Image */}
                            <div className="relative w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                              <span className="text-accent-400 text-sm">Image</span>
                              {/* Match Score Badge - only show on top card */}
                              {index === 1 && (
                                <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}>
                                  <Sparkles size={12} />
                                  <span className="text-xs font-bold">{matchScore}%</span>
                                </div>
                              )}
                              {/* Selection Checkbox for Compare Mode - only show on top card */}
                              {compareMode && index === 1 && (
                                <div className="absolute top-2 left-2">
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
                            </div>

                            {/* Card Content */}
                            <div className="p-4">
                              <h3 className="font-bold text-base text-accent-700 mb-2 line-clamp-2">
                                MacBook Pro M3 16-inch - Excellent Condition
                              </h3>
                              <div className="text-xl font-bold text-secondary-600 mb-3">
                                RM 8,500
                              </div>
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium mb-3">
                                Electronics
                              </span>
                              <p className="text-xs text-accent-500 line-clamp-2">
                                Need for video editing work. Willing to pay good price for excellent condition.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Floating Action Buttons */}
                    {column.id === "queue" && cardsByColumn.queue.length > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Move top card to passed
                            const topCard = cardsByColumn.queue[0];
                            if (topCard !== undefined) {
                              setCardsByColumn(prev => ({
                                ...prev,
                                queue: prev.queue.slice(1),
                                passed: [topCard, ...prev.passed],
                              }));
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-red-300 hover:bg-red-50 transition-colors shadow-lg"
                        >
                          <X size={18} className="text-red-500" />
                          <span className="text-sm font-medium text-red-600">Pass</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Move top card to liked
                            const topCard = cardsByColumn.queue[0];
                            if (topCard !== undefined) {
                              setCardsByColumn(prev => ({
                                ...prev,
                                queue: prev.queue.slice(1),
                                liked: [topCard, ...prev.liked],
                              }));
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-green-300 hover:bg-green-50 transition-colors shadow-lg"
                        >
                          <Heart size={18} className="text-green-500" />
                          <span className="text-sm font-medium text-green-600">Like</span>
                        </button>
                      </div>
                    )}

                    {/* Undo Button - for Liked and Passed columns */}
                    {(column.id === "liked" || column.id === "passed") && cardsByColumn[column.id].length > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Move top card back to queue
                            const topCard = cardsByColumn[column.id][0];
                            if (topCard !== undefined) {
                              setCardsByColumn(prev => ({
                                ...prev,
                                [column.id]: prev[column.id].slice(1),
                                queue: [topCard, ...prev.queue],
                              }));
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-accent-300 hover:bg-primary-50 transition-colors shadow-lg"
                        >
                          <Undo2 size={18} className="text-accent-600" />
                          <span className="text-sm font-medium text-accent-700">Undo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
