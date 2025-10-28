"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Ban,
  Sparkles,
  Layers,
  X,
  Undo2,
  Search,
  Maximize2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  AIMatchingProps,
  ColumnType,
  MatchedListing,
} from "@/components/matching/types";
import { ListingComparisonModal } from "@/components/matching/ListingComparisonModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/components/matching/contexts/CompareContext";
import {
  mockAIMatchings,
  userAIListing,
  KANBAN_COLUMNS,
} from "@/utils/mock-all-data-used";

// Use centralized column configuration and add icons
const columns = KANBAN_COLUMNS.map((col) => ({
  ...col,
  icon:
    col.iconName === "Ban" ? (
      <Ban size={18} />
    ) : col.iconName === "Sparkles" ? (
      <Sparkles size={18} />
    ) : col.iconName === "Heart" ? (
      <Heart size={18} />
    ) : null,
}));

export function AIMatchingKanban({
  onMessage,
  onViewDetails,
}: AIMatchingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedPopupColumn, setExpandedPopupColumn] =
    useState<ColumnType | null>(null);

  // Use global selection state for comparison
  const { selectedForCompare, setSelectedForCompare } = useCompare();

  // Comparison Modal
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Card organization by column - stores listing IDs instead of indices
  const [cardsByColumn, setCardsByColumn] = useState<
    Record<ColumnType, string[]>
  >({
    passed: [],
    queue: mockAIMatchings.map((listing) => listing.id), // All listings start in queue
    liked: [],
  });

  // Drag state
  const [draggedCard, setDraggedCard] = useState<{
    listingId: string;
    sourceColumn: ColumnType;
  } | null>(null);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Select mode - unified for both main view and popup
  const [selectMode, setSelectMode] = useState(false);

  // Get user's listing
  const getUserListing = (): MatchedListing => userAIListing;

  // Get listings for comparison from selected IDs
  const getListingsForComparison = (): MatchedListing[] => {
    return selectedForCompare
      .map((listingId) =>
        mockAIMatchings.find((listing) => listing.id === listingId)
      )
      .filter(Boolean) as MatchedListing[];
  };

  // Helper function to get listing by ID
  const getListingById = (id: string): MatchedListing | undefined => {
    return mockAIMatchings.find((listing) => listing.id === id);
  };

  // Handle cycling cards in a column
  const handleCycle = (column: ColumnType, direction: "up" | "down") => {
    setCardsByColumn((prev) => {
      const currentColumn = prev[column];
      if (currentColumn.length === 0) return prev;

      if (direction === "up") {
        // Move top card to back
        const [first, ...rest] = currentColumn;
        return {
          ...prev,
          [column]: [...rest, first],
        };
      } else {
        // Move bottom card to top
        const last = currentColumn[currentColumn.length - 1];
        const rest = currentColumn.slice(0, -1);
        return {
          ...prev,
          [column]: [last, ...rest],
        };
      }
    });
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "arrowright":
          // Like top card in queue
          console.log("Keyboard: Like");
          break;
        case "arrowleft":
          // Pass top card in queue
          console.log("Keyboard: Pass");
          break;
        case " ":
          e.preventDefault();
          // View details of top card
          console.log("Keyboard: View details");
          break;
        case "c":
          // Toggle select mode
          setSelectMode((prev) => {
            if (prev) {
              setSelectedForCompare([]);
            }
            return !prev;
          });
          break;
        case "s":
          // Toggle search
          setShowFilters((prev) => !prev);
          break;
        case "escape":
          // Close modals
          if (showCompareModal) {
            setShowCompareModal(false);
          } else if (expandedPopupColumn) {
            setExpandedPopupColumn(null);
          } else if (selectMode) {
            setSelectMode(false);
            setSelectedForCompare([]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    showCompareModal,
    expandedPopupColumn,
    selectMode,
    setSelectedForCompare,
  ]);

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
                  <h2 className="text-lg font-bold text-accent-700 mb-3">
                    Reset All Cards?
                  </h2>
                  <p className="text-sm text-accent-600 mb-2">
                    This will move all cards back to &quot;For You&quot;. Cards
                    in &quot;Liked&quot; and &quot;Passed&quot; will be reset.
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
                        queue: mockAIMatchings.map((listing) => listing.id),
                        liked: [],
                      });
                      setSelectedForCompare([]);
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
        listings={getListingsForComparison()}
        userListing={getUserListing()}
        onClose={() => {
          setShowCompareModal(false);
          setSelectedForCompare([]);
          setSelectMode(false);
        }}
        onSelectListing={(listing) => {
          console.log("View details:", listing);
          onViewDetails(listing);
        }}
        onMessage={(listing) => {
          console.log("Message:", listing);
          onMessage(listing);
        }}
        onNegotiate={(listing) => {
          console.log("Negotiate:", listing);
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
            onClick={() => {
              setExpandedPopupColumn(null);
              setSelectMode(false);
              setSelectedForCompare([]);
            }}
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
                <div className="flex items-start justify-between px-6 shrink-0">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {columns.find((c) => c.id === expandedPopupColumn)
                        ?.icon && (
                        <div
                          className={
                            columns.find((c) => c.id === expandedPopupColumn)
                              ?.color
                          }
                        >
                          {
                            columns.find((c) => c.id === expandedPopupColumn)
                              ?.icon
                          }
                        </div>
                      )}
                      <h2 className="text-2xl font-bold text-accent-700">
                        {
                          columns.find((c) => c.id === expandedPopupColumn)
                            ?.title
                        }
                      </h2>
                    </div>
                    <p className="text-sm text-accent-500">
                      {cardsByColumn[expandedPopupColumn]?.length || 0} listings
                      in this column
                    </p>
                    {selectMode && selectedForCompare.length > 0 && (
                      <p className="text-xs text-secondary-600 font-medium">
                        {selectedForCompare.length}/4 selected
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Select Button - Only show if column has items */}
                    {cardsByColumn[expandedPopupColumn]?.length > 0 && (
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
                            ? "bg-secondary-500 text-accent-700"
                            : "bg-primary-100 text-accent-700 hover:bg-primary-200"
                        }`}
                      >
                        {selectMode ? "Done" : "Edit"}
                      </button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExpandedPopupColumn(null);
                        setSelectMode(false);
                        setSelectedForCompare([]);
                      }}
                      className="rounded-full hover:bg-primary-100 transition-colors"
                    >
                      <X className="h-5 w-5 text-accent-600" />
                    </Button>
                  </div>
                </div>

                {/* Action Bar - Shows when cards are selected in Select Mode and column has items */}
                {selectMode &&
                  selectedForCompare.length > 0 &&
                  cardsByColumn[expandedPopupColumn]?.length > 0 && (
                    <div className="px-6 py-3 bg-secondary-100 border-b border-neutral-200 flex items-center justify-between">
                      <span className="text-sm font-medium text-accent-700">
                        {selectedForCompare.length} selected
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Compare Button */}
                        <button
                          onClick={() => {
                            setExpandedPopupColumn(null);
                            setShowCompareModal(true);
                          }}
                          disabled={
                            selectedForCompare.length < 1 ||
                            selectedForCompare.length > 5
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            selectedForCompare.length >= 1 &&
                            selectedForCompare.length <= 5
                              ? "bg-secondary-500 text-accent-700 hover:bg-secondary-600"
                              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                          }`}
                        >
                          Compare
                        </button>

                        {/* Pass Button */}
                        {expandedPopupColumn === "queue" && (
                          <button
                            onClick={() => {
                              // Move selected cards to passed
                              setCardsByColumn((prev) => ({
                                ...prev,
                                queue: prev.queue.filter(
                                  (id) => !selectedForCompare.includes(id)
                                ),
                                passed: [...selectedForCompare, ...prev.passed],
                              }));
                              setSelectedForCompare([]);
                            }}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 transition-colors"
                          >
                            Pass
                          </button>
                        )}

                        {/* Like Button */}
                        {expandedPopupColumn === "queue" && (
                          <button
                            onClick={() => {
                              // Move selected cards to liked
                              setCardsByColumn((prev) => ({
                                ...prev,
                                queue: prev.queue.filter(
                                  (id) => !selectedForCompare.includes(id)
                                ),
                                liked: [...selectedForCompare, ...prev.liked],
                              }));
                              setSelectedForCompare([]);
                            }}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 transition-colors"
                          >
                            Like
                          </button>
                        )}

                        {/* Undo Button (for Liked/Passed columns) */}
                        {(expandedPopupColumn === "liked" ||
                          expandedPopupColumn === "passed") && (
                          <button
                            onClick={() => {
                              // Move selected cards back to queue
                              setCardsByColumn((prev) => ({
                                ...prev,
                                [expandedPopupColumn]: prev[
                                  expandedPopupColumn
                                ].filter(
                                  (id) => !selectedForCompare.includes(id)
                                ),
                                queue: [...selectedForCompare, ...prev.queue],
                              }));
                              setSelectedForCompare([]);
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
                  {/* Empty state */}
                  {cardsByColumn[expandedPopupColumn]?.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex flex-col items-center text-center text-accent-400">
                        <div
                          className={`mb-3 ${
                            columns.find((c) => c.id === expandedPopupColumn)
                              ?.color || "text-neutral-400"
                          }`}
                        >
                          <Layers size={64} />
                        </div>
                        <p className="text-lg font-medium">
                          {expandedPopupColumn === "queue" && "No more matches"}
                          {expandedPopupColumn === "liked" &&
                            "No liked matches yet"}
                          {expandedPopupColumn === "passed" &&
                            "No passed matches yet"}
                        </p>
                        <p className="text-sm mt-2">
                          {expandedPopupColumn === "queue" &&
                            "All listings have been reviewed"}
                          {expandedPopupColumn === "liked" &&
                            "Start liking listings to see them here"}
                          {expandedPopupColumn === "passed" &&
                            "Passed listings will appear here"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {cardsByColumn[expandedPopupColumn]?.map((listingId) => {
                        const listing = getListingById(listingId);
                        if (!listing) return null;

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
                        const colors = getMatchColor(listing.matchScore);
                        const isSelected =
                          selectMode && selectedForCompare.includes(listingId);

                        return (
                          <div
                            key={listingId}
                            onClick={() => {
                              if (selectMode) {
                                // Select mode - toggle selection
                                if (isSelected) {
                                  setSelectedForCompare((prev) =>
                                    prev.filter((id) => id !== listingId)
                                  );
                                } else {
                                  setSelectedForCompare((prev) => [
                                    ...prev,
                                    listingId,
                                  ]);
                                }
                              } else {
                                // When not in select mode, open the listing details
                                setExpandedPopupColumn(null);
                                onViewDetails(listing);
                              }
                            }}
                            className={`flex flex-col bg-white rounded-xl shadow-lg border overflow-hidden transition-all cursor-pointer hover:shadow-xl ${
                              isSelected
                                ? "border-4 border-secondary-500"
                                : "border-neutral-300"
                            }`}
                          >
                            {/* Card Image */}
                            <div className="relative w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                              <span className="text-accent-400 text-sm">
                                Image
                              </span>
                              {/* Match Score Badge */}
                              <div
                                className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}
                              >
                                <Sparkles size={12} />
                                <span className="text-xs font-bold">
                                  {listing.matchScore}%
                                </span>
                              </div>
                              {/* Selection Checkbox for Select Mode */}
                              {selectMode && (
                                <div className="absolute top-2 left-2">
                                  <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                      isSelected
                                        ? "bg-secondary-500 border-secondary-500"
                                        : "bg-white/80 border-neutral-400"
                                    }`}
                                  >
                                    {isSelected && (
                                      <svg
                                        className="w-4 h-4 text-accent-700"
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
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="flex flex-col p-4 h-full">
                              <h3 className="font-bold text-base text-accent-700 mb-2 line-clamp-2">
                                {listing.title}
                              </h3>
                              <div className="text-xl font-bold text-secondary-600 mb-3">
                                RM {listing.price?.toLocaleString()}
                              </div>
                              <span className="w-fit inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium mb-3">
                                {listing.category}
                              </span>
                              <p className="text-xs text-accent-500 line-clamp-2 mb-4">
                                {listing.description}
                              </p>

                              {/* Action Buttons */}
                              <div className="mt-auto">
                                {!selectMode &&
                                  expandedPopupColumn === "queue" && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardsByColumn((prev) => ({
                                            ...prev,
                                            queue: prev.queue.filter(
                                              (id) => id !== listingId
                                            ),
                                            passed: [listingId, ...prev.passed],
                                          }));
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-50 border border-red-300 hover:bg-red-100 transition-colors"
                                      >
                                        <X size={16} className="text-red-500" />
                                        <span className="text-sm font-medium text-red-600">
                                          Pass
                                        </span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardsByColumn((prev) => ({
                                            ...prev,
                                            queue: prev.queue.filter(
                                              (id) => id !== listingId
                                            ),
                                            liked: [listingId, ...prev.liked],
                                          }));
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-50 border border-green-300 hover:bg-green-100 transition-colors"
                                      >
                                        <Heart
                                          size={16}
                                          className="text-green-500"
                                        />
                                        <span className="text-sm font-medium text-green-600">
                                          Like
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                {!selectMode &&
                                  expandedPopupColumn === "liked" && (
                                    <div className="flex gap-2 mt-4">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardsByColumn((prev) => ({
                                            ...prev,
                                            liked: prev.liked.filter(
                                              (id) => id !== listingId
                                            ),
                                            queue: [listingId, ...prev.queue],
                                          }));
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary-50 border border-accent-300 hover:bg-primary-100 transition-colors"
                                      >
                                        <Undo2
                                          size={16}
                                          className="text-accent-600"
                                        />
                                        <span className="text-sm font-medium text-accent-700">
                                          To Queue
                                        </span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardsByColumn((prev) => ({
                                            ...prev,
                                            liked: prev.liked.filter(
                                              (id) => id !== listingId
                                            ),
                                            passed: [listingId, ...prev.passed],
                                          }));
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-50 border border-red-300 hover:bg-red-100 transition-colors"
                                      >
                                        <X size={16} className="text-red-500" />
                                        <span className="text-sm font-medium text-red-600">
                                          Pass
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                {!selectMode &&
                                  expandedPopupColumn === "passed" && (
                                    <div className="flex gap-2 mt-4">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardsByColumn((prev) => ({
                                            ...prev,
                                            passed: prev.passed.filter(
                                              (id) => id !== listingId
                                            ),
                                            queue: [listingId, ...prev.queue],
                                          }));
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-primary-50 border border-accent-300 hover:bg-primary-100 transition-colors"
                                      >
                                        <Undo2
                                          size={16}
                                          className="text-accent-600"
                                        />
                                        <span className="text-sm font-medium text-accent-700">
                                          To Queue
                                        </span>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardsByColumn((prev) => ({
                                            ...prev,
                                            passed: prev.passed.filter(
                                              (id) => id !== listingId
                                            ),
                                            liked: [listingId, ...prev.liked],
                                          }));
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-green-50 border border-green-300 hover:bg-green-100 transition-colors"
                                      >
                                        <Heart
                                          size={16}
                                          className="text-green-500"
                                        />
                                        <span className="text-sm font-medium text-green-600">
                                          Like
                                        </span>
                                      </button>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                {mockAIMatchings.length} new matches
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-secondary-500 text-white"
                    : "hover:bg-primary-100"
                }`}
                title="Search & Filters"
              >
                <Search
                  size={18}
                  className={showFilters ? "text-white" : "text-accent-600"}
                />
              </button>

              {/* Reset Button */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 rounded-lg hover:bg-primary-100 transition-colors"
                title="Reset all cards"
              >
                <Undo2 size={18} className="text-accent-600" />
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
                    ? "bg-secondary-500 text-accent-700"
                    : "bg-primary-100 text-accent-700 hover:bg-primary-200"
                }`}
                title="Edit Mode"
              >
                {selectMode ? "Done" : "Edit"}
              </button>
            </div>
          </div>

          {/* Search Bar - Collapsible */}
          {showFilters && (
            <div className="p-4 bg-primary-50 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-400"
                  />
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

          {/* Select Mode Banner with Compare Button */}
          {selectMode && selectedForCompare.length > 0 && (
            <div className="p-3 bg-secondary-100 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-accent-700">
                    {selectedForCompare.length} selected
                    {selectedForCompare.length > 5 && (
                      <span className="text-red-600 ml-1">(max 5)</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedForCompare.length >= 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedForCompare.length <= 5) {
                          setShowCompareModal(true);
                        }
                      }}
                      disabled={selectedForCompare.length > 5}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors relative z-10 ${
                        selectedForCompare.length > 5
                          ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                          : "bg-secondary-500 hover:bg-secondary-600 text-accent-700 cursor-pointer"
                      }`}
                    >
                      Compare {selectedForCompare.length}{" "}
                      {selectedForCompare.length === 1 ? "Item" : "Items"}
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedForCompare([])}
                    className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-accent-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
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
                      ? "border-secondary-500 bg-secondary-50"
                      : "border-neutral-200"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedCard && draggedCard.sourceColumn !== column.id) {
                      setCardsByColumn((prev) => ({
                        ...prev,
                        [draggedCard.sourceColumn]: prev[
                          draggedCard.sourceColumn
                        ].filter((id) => id !== draggedCard.listingId),
                        [column.id]: [
                          draggedCard.listingId,
                          ...prev[column.id],
                        ],
                      }));
                    }
                    setDraggedCard(null);
                  }}
                  onDragLeave={() => {
                    // Optional: could add visual feedback here
                  }}
                >
                  {/* Column Header */}
                  <div className="p-4 bg-white border-b border-neutral-200">
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
                              {column.id === "passed" &&
                                "No passed matches yet"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Stacked cards - max 3 visible */}
                      {cardsByColumn[column.id]
                        .slice(0, 3)
                        .map((listingId, stackIndex) => {
                          const index = stackIndex + 1;
                          // Only get actual listing data for the top card
                          const listing =
                            index === 1 ? getListingById(listingId) : null;
                          const topListing = getListingById(
                            cardsByColumn[column.id][0]
                          );

                          // For visual stacking effect, use top card's data for all
                          const displayListing = topListing || listing;
                          if (!displayListing) return null;

                          const matchScore = displayListing.matchScore;

                          // Traffic light system
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

                          const colors = getMatchColor(matchScore);
                          // Only the top card can be selected
                          const topCardId = cardsByColumn[column.id][0];
                          const isSelected =
                            selectedForCompare.includes(topCardId);
                          const isTopCard = index === 1;

                          return (
                            <div
                              key={`${column.id}-${listingId}-${stackIndex}`}
                              draggable={!selectMode && isTopCard}
                              onDragStart={(e) => {
                                if (!selectMode && isTopCard) {
                                  setDraggedCard({
                                    listingId: topCardId,
                                    sourceColumn: column.id,
                                  });
                                  e.dataTransfer.effectAllowed = "move";

                                  // Create a custom drag image centered at cursor
                                  if (e.currentTarget instanceof HTMLElement) {
                                    // Get the inner card element (the actual white card)
                                    const cardElement =
                                      e.currentTarget.querySelector(
                                        ".bg-white"
                                      ) as HTMLElement;
                                    if (cardElement) {
                                      const rect =
                                        cardElement.getBoundingClientRect();

                                      // Clone the inner card for drag image
                                      const dragImage = cardElement.cloneNode(
                                        true
                                      ) as HTMLElement;
                                      dragImage.style.position = "fixed";
                                      dragImage.style.left = "-10000px";
                                      dragImage.style.top = "0px";
                                      dragImage.style.width = rect.width + "px";
                                      dragImage.style.height =
                                        rect.height + "px";
                                      dragImage.style.transform = "none";
                                      dragImage.style.pointerEvents = "none";
                                      dragImage.style.zIndex = "9999";
                                      document.body.appendChild(dragImage);

                                      // Center the drag image on the cursor
                                      const centerX = rect.width / 2;
                                      const centerY = rect.height / 2;

                                      e.dataTransfer.setDragImage(
                                        dragImage,
                                        centerX,
                                        centerY
                                      );

                                      // Clean up after drag starts
                                      setTimeout(() => {
                                        if (document.body.contains(dragImage)) {
                                          document.body.removeChild(dragImage);
                                        }
                                      }, 0);
                                    }

                                    e.currentTarget.style.opacity = "0.5";
                                  }
                                }
                              }}
                              onDragEnd={(e) => {
                                if (e.currentTarget instanceof HTMLElement) {
                                  e.currentTarget.style.opacity = "1";
                                }
                                setDraggedCard(null);
                              }}
                              onClick={(e) => {
                                // Only the top card is clickable
                                if (!isTopCard) return;

                                if (selectMode) {
                                  e.stopPropagation();
                                  if (isSelected) {
                                    setSelectedForCompare((prev) =>
                                      prev.filter((id) => id !== topCardId)
                                    );
                                  } else {
                                    setSelectedForCompare((prev) => [
                                      ...prev,
                                      topCardId,
                                    ]);
                                  }
                                } else {
                                  // When not in select mode, open the listing details
                                  e.stopPropagation();
                                  onViewDetails(displayListing);
                                }
                              }}
                              className={`absolute top-0 left-0 right-0 transition-all duration-300 ${
                                isTopCard
                                  ? `hover:scale-[1.02] hover:shadow-2xl ${
                                      selectMode
                                        ? "cursor-pointer"
                                        : "cursor-move"
                                    }`
                                  : "pointer-events-none"
                              }`}
                              style={{
                                transform: `translateY(${
                                  (index - 1) * 12
                                }px) scale(${1 - (index - 1) * 0.04}) rotateZ(${
                                  (index - 1) * 1
                                }deg)`,
                                zIndex: 10 - index,
                              }}
                            >
                              <div
                                className={`bg-white rounded-xl shadow-xl border overflow-hidden ${
                                  isSelected && isTopCard
                                    ? "border-4 border-secondary-500"
                                    : "border border-neutral-300"
                                }`}
                              >
                                {/* Card Image */}
                                <div className="relative w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                  <span className="text-accent-400 text-sm">
                                    Image
                                  </span>
                                  {/* Match Score Badge - only show on top card */}
                                  {index === 1 && (
                                    <div
                                      className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}
                                    >
                                      <Sparkles size={12} />
                                      <span className="text-xs font-bold">
                                        {matchScore}%
                                      </span>
                                    </div>
                                  )}
                                  {/* Selection Checkbox for Select Mode - only show on top card */}
                                  {selectMode && index === 1 && (
                                    <div className="absolute top-2 left-2">
                                      <div
                                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                          isSelected
                                            ? "bg-secondary-500 border-secondary-500"
                                            : "bg-white border-neutral-400"
                                        }`}
                                      >
                                        {isSelected && (
                                          <svg
                                            className="w-4 h-4 text-accent-700"
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
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Card Content */}
                                <div className="p-4">
                                  <h3 className="font-bold text-base text-accent-700 mb-2 line-clamp-2">
                                    {displayListing.title}
                                  </h3>
                                  <div className="text-xl font-bold text-secondary-600 mb-3">
                                    RM {displayListing.price?.toLocaleString()}
                                  </div>
                                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium mb-3">
                                    {displayListing.category}
                                  </span>
                                  <p className="text-xs text-accent-500 line-clamp-2">
                                    {displayListing.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {/* Combined Action and Scroll Buttons (not in selectMode) */}
                      {cardsByColumn[column.id].length > 0 && !selectMode && (
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 z-20">
                          {/* Scroll Buttons (Up) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCycle(column.id, "up");
                            }}
                            className="p-2 rounded-full bg-white border-2 border-neutral-300 hover:bg-primary-50 transition-colors shadow-lg"
                          >
                            <ChevronUp size={18} className="text-accent-600" />
                          </button>

                          {/* Action Buttons for Queue Column (Pass/Like) */}
                          {column.id === "queue" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Move top card to passed
                                  const topCard = cardsByColumn.queue[0];
                                  if (topCard !== undefined) {
                                    setCardsByColumn((prev) => ({
                                      ...prev,
                                      queue: prev.queue.slice(1),
                                      passed: [topCard, ...prev.passed],
                                    }));
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-red-300 hover:bg-red-50 transition-colors shadow-lg"
                              >
                                <X size={18} className="text-red-500" />
                                <span className="text-sm font-medium text-red-600">
                                  Pass
                                </span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Move top card to liked
                                  const topCard = cardsByColumn.queue[0];
                                  if (topCard !== undefined) {
                                    setCardsByColumn((prev) => ({
                                      ...prev,
                                      queue: prev.queue.slice(1),
                                      liked: [topCard, ...prev.liked],
                                    }));
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-green-300 hover:bg-green-50 transition-colors shadow-lg"
                              >
                                <Heart size={18} className="text-green-500" />
                                <span className="text-sm font-medium text-green-600">
                                  Like
                                </span>
                              </button>
                            </>
                          )}

                          {/* Action Buttons for Liked/Passed Columns (Undo) */}
                          {(column.id === "liked" ||
                            column.id === "passed") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Move top card back to queue
                                const topCard = cardsByColumn[column.id][0];
                                if (topCard !== undefined) {
                                  setCardsByColumn((prev) => ({
                                    ...prev,
                                    [column.id]: prev[column.id].slice(1),
                                    queue: [topCard, ...prev.queue],
                                  }));
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-accent-300 hover:bg-primary-50 transition-colors shadow-lg"
                            >
                              <Undo2 size={18} className="text-accent-600" />
                              <span className="text-sm font-medium text-accent-700">
                                Undo
                              </span>
                            </button>
                          )}

                          {/* Scroll Buttons (Down) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCycle(column.id, "down");
                            }}
                            className="p-2 rounded-full bg-white border-2 border-neutral-300 hover:bg-primary-50 transition-colors shadow-lg"
                          >
                            <ChevronDown
                              size={18}
                              className="text-accent-600"
                            />
                          </button>
                        </div>
                      )}

                      {/* Cycle Navigation Buttons - Show in select mode for all columns */}
                      {selectMode && cardsByColumn[column.id].length > 1 && (
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCycle(column.id, "down");
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-neutral-300 hover:bg-primary-50 transition-colors shadow-lg"
                            title="Previous card"
                          >
                            <ChevronDown
                              size={18}
                              className="text-accent-600"
                            />
                            <span className="text-sm font-medium text-accent-600">
                              Previous
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCycle(column.id, "up");
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-neutral-300 hover:bg-primary-50 transition-colors shadow-lg"
                            title="Next card"
                          >
                            <ChevronUp size={18} className="text-accent-600" />
                            <span className="text-sm font-medium text-accent-600">
                              Next
                            </span>
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
