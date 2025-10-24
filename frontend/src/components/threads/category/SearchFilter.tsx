"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Filter as FilterIcon, X, Search } from "lucide-react";

export interface FilterOptions {
  search: string;
  priceRange: number; // Represents MAX price (the upper bound set by the handle)
  minPriceRange: number; // Represents MIN price (the lower bound set by the handle)
  location: string;
  selectedTags: string[];
  sortBy: string;
  category?: string; // NEW: Added category filter
  listingType?: "sale" | "wanted" | "all"; // NEW: Added listing type filter
}

interface FilterProps {
  onApplyFilters?: (filters: FilterOptions) => void;
  onClearFilters?: () => void;
  onSearchChange?: (search: string) => void;
  initialFilters?: Partial<FilterOptions> & { minPriceRange?: number };
  maxPrice?: number;
  currency?: string;
  searchPlaceholder?: string;
}

function SearchFilter({
  onApplyFilters,
  onClearFilters,
  onSearchChange,
  initialFilters = {},
  maxPrice = 10000,
  currency = "RM",
  searchPlaceholder = "Search community listings...",
}: FilterProps) {
  // Refs for slider track dimensions
  const trackRef = useRef<HTMLDivElement>(null);

  // Define a reasonable step size for the slider
  const priceStep = maxPrice / 100;

  const [showFilterModal, setShowFilterModal] = useState(false);

  // State for the draggable price range [min, max]
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.minPriceRange || 0,
    initialFilters.priceRange || maxPrice,
  ]);
  const [minPrice, maxPriceValue] = priceRange;

  // Drag state
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);

  // Main filters state, synced with priceRange state
  const [filters, setFilters] = useState<
    Omit<FilterOptions, "priceRange" | "minPriceRange"> & {
      priceRange: number;
      minPriceRange: number;
    }
  >({
    search: initialFilters.search || "",
    priceRange: initialFilters.priceRange || maxPrice,
    minPriceRange: initialFilters.minPriceRange || 0,
    location: initialFilters.location || "",
    selectedTags: initialFilters.selectedTags || [],
    sortBy: initialFilters.sortBy || "Newest",

    listingType: initialFilters.listingType || "all", // NEW
  });

  // Sync filters and priceRange when initialFilters changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: initialFilters.search || "",
      location: initialFilters.location || "",
      selectedTags: initialFilters.selectedTags || [],
      sortBy: initialFilters.sortBy || "Newest",
      minPriceRange: initialFilters.minPriceRange || 0,
      priceRange: initialFilters.priceRange || maxPrice,

      listingType: initialFilters.listingType || "all", // NEW
    }));
    setPriceRange([
      initialFilters.minPriceRange || 0,
      initialFilters.priceRange || maxPrice,
    ]);
  }, [initialFilters, maxPrice]);

  // --- Custom Draggable Slider Logic (unchanged) ---
  const valueToPercent = (value: number): number => {
    return (value / maxPrice) * 100;
  };

  const percentToValue = useCallback((percent: number): number => {
    const rawValue = (percent / 100) * maxPrice;
    return Math.round(rawValue / priceStep) * priceStep;
  }, [maxPrice, priceStep]);

  const handleMouseDown = useCallback((handle: "min" | "max") => {
    setIsDragging(handle);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();

      const newPosition = e.clientX - trackRect.left;
      let newPercent = (newPosition / trackRect.width) * 100;
      newPercent = Math.max(0, Math.min(100, newPercent));

      let newValue = percentToValue(newPercent);

      setPriceRange((currentRange) => {
        const [currentMin, currentMax] = currentRange;

        if (isDragging === "min") {
          newValue = Math.min(newValue, currentMax);
          return [newValue, currentMax];
        } else {
          newValue = Math.max(newValue, currentMin);
          return [currentMin, newValue];
        }
      });
    },
    [isDragging, percentToValue]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(null);
      setFilters((prev) => ({
        ...prev,
        minPriceRange: priceRange[0],
        priceRange: priceRange[1],
      }));
    }
  }, [isDragging, priceRange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Updated tags to match your data structure
  const tags = [
    "gaming",
    "rtx-4070",
    "complete-setup",
    "vintage",
    "like-new",
    "rare",
    "collector",
    "handmade",
    "original",
    "designer",
    "eco-friendly",
  ];

  // Updated sort options to match UnifiedListingData structure
  const sortOptions = [
    "Newest",
    "Price: Low to High",
    "Price: High to Low",
    "Most Views", // NEW: Based on views field
    "Distance",
  ];

  // NEW: Listing type options
  const listingTypeOptions = [
    { value: "all", label: "All Listings" },
    { value: "sale", label: "For Sale" },
    { value: "wanted", label: "Want to Buy" },
  ];

  // Helper to format price for display
  const formatPrice = (price: number) => price.toLocaleString();

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    onSearchChange?.(value);
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter((t) => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  };

  const handleApplyFilters = () => {
    const finalFilters = {
      ...filters,
      minPriceRange: priceRange[0],
      priceRange: priceRange[1],
    };
    onApplyFilters?.(finalFilters);
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      search: "",
      priceRange: maxPrice,
      minPriceRange: 0,
      location: "",
      selectedTags: [],
      sortBy: "Newest",

      listingType: "all", // NEW
    };
    setFilters(clearedFilters);
    setPriceRange([0, maxPrice]);
    onClearFilters?.();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowFilterModal(false);
    }
  };

  // Handlers for manual input fields (unchanged)
  const handleMinPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let value = parseInt(rawValue) || 0;
    value = Math.min(value, maxPriceValue);
    value = Math.max(value, 0);

    setPriceRange([value, maxPriceValue]);
    setFilters((prev) => ({ ...prev, minPriceRange: value }));
  };

  const handleMaxPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let value = parseInt(rawValue) || maxPrice;

    value = Math.max(value, minPrice);
    value = Math.min(value, maxPrice);

    setPriceRange([minPrice, value]);
    setFilters((prev) => ({ ...prev, priceRange: value }));
  };

  // Calculate handle positions for slider rendering
  const minPercent = valueToPercent(minPrice);
  const maxPercent = valueToPercent(maxPriceValue);

  return (
    <>
<div className="flex items-center gap-2 mb-4"> 
  <div className="flex-1 flex items-center gap-2 bg-neutral-100 px-3 py-3 rounded-xl border border-neutral-200">
    <Search className="w-4 h-4 text-neutral-500" />
    <input
      type="text"
      placeholder={searchPlaceholder}
      value={filters.search}
      onChange={(e) => handleSearchChange(e.target.value)}
      className="flex-1 bg-transparent outline-none text-sm text-neutral-700"
    />
  </div>

  {/* Filter Icon Button */}
  <button
    onClick={() => setShowFilterModal(true)}
    className="p-3 bg-neutral-200 rounded-xl hover:bg-neutral-300 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
    aria-label="Open filters"
  >
    <FilterIcon className="w-5 h-5 text-neutral-600" />
  </button>
</div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
          onClick={handleBackdropClick}
        >
          {/* Modal Content */}
          <div
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-[90%] max-w-md h-[80vh] overflow-hidden relative transform transition-all duration-200 ease-out border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FilterIcon className="h-5 w-5" />
                Filters
              </h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-1 rounded-full hover:bg-gray-200/50 transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto h-full pb-36">
              <div className="p-5 space-y-6">
                {/* Search (in modal) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full border border-gray-300/50 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {/* NEW: Listing Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Listing Type
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {listingTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            listingType: option.value as "for-sale" | "want-to-buy" | "all",
                          }))
                        }
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                          filters.listingType === option.value
                            ? "bg-secondary-300 text-accent-700"
                            : "border-neutral-200/50 hover:bg-primary-50/70 bg-neutral-white/50 backdrop-blur-sm"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium mb-4">
                    Price Range: {currency} {formatPrice(minPrice)} - {currency} {formatPrice(maxPriceValue)}
                  </label>

                  {/* Custom Draggable Slider UI */}
                  <div className="px-1 pt-2 pb-6 relative">
                    {/* Slider Track */}
                    <div
                      ref={trackRef}
                      className="bg-gray-200 h-2 rounded-full relative"
                    />

                    {/* Range Fill (Orange part) */}
                    <div
                      className="bg-orange-400 h-2 rounded-full absolute top-2"
                      style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`,
                      }}
                    />

                    {/* Min Handle */}
                    <div
                      onMouseDown={() => handleMouseDown("min")}
                      onTouchStart={() => handleMouseDown("min")}
                      className={`absolute top-2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-orange-500 shadow-md cursor-pointer transition ${
                        isDragging === "min"
                          ? "ring-2 ring-orange-300"
                          : "hover:ring-2 hover:ring-orange-300"
                      }`}
                      style={{ left: `${minPercent}%` }}
                      title={`Min: ${currency}${formatPrice(minPrice)}`}
                    />

                    {/* Max Handle */}
                    <div
                      onMouseDown={() => handleMouseDown("max")}
                      onTouchStart={() => handleMouseDown("max")}
                      className={`absolute top-2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-orange-500 shadow-md cursor-pointer transition ${
                        isDragging === "max"
                          ? "ring-2 ring-orange-300"
                          : "hover:ring-2 hover:ring-orange-300"
                      }`}
                      style={{ left: `${maxPercent}%` }}
                      title={`Max: ${currency}${formatPrice(maxPriceValue)}`}
                    />
                  </div>

                  {/* Text inputs for precise entry */}
                  <div className="flex items-center space-x-3 mt-4">
                    <div className="relative w-1/2">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {currency}
                      </span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={
                          minPrice === 0 &&
                          (initialFilters.minPriceRange === undefined ||
                            initialFilters.minPriceRange === 0)
                            ? ""
                            : minPrice
                        }
                        onChange={handleMinPriceInput}
                        min={0}
                        max={maxPrice}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all bg-white/80 backdrop-blur-sm text-sm"
                      />
                    </div>
                    <span className="text-gray-500">–</span>
                    <div className="relative w-1/2">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        {currency}
                      </span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={
                          maxPriceValue === maxPrice &&
                          (initialFilters.priceRange === undefined ||
                            initialFilters.priceRange === maxPrice)
                            ? ""
                            : maxPriceValue
                        }
                        onChange={handleMaxPriceInput}
                        min={0}
                        max={maxPrice}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300/50 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all bg-white/80 backdrop-blur-sm text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{currency} 0</span>
                    <span>
                      {currency} {maxPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, state, or area"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300/50 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-3">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-2 rounded-full text-sm cursor-pointer transition-colors ${
                          filters.selectedTags.includes(tag)
                            ? "bg-secondary-300 text-accent-700"
                            : "bg-neutral-100/70 hover:bg-primary-100/70 backdrop-blur-sm"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Sort By
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {sortOptions.map((sort) => (
                      <button
                        key={sort}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, sortBy: sort }))
                        }
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                          filters.sortBy === sort
                            ? "bg-secondary-300 text-accent-700"
                            : "border-neutral-200/50 hover:bg-primary-50/70 bg-neutral-white/50 backdrop-blur-sm"
                        }`}
                      >
                        {sort}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex gap-3 p-5 border-t border-gray-200/50 bg-white/90 backdrop-blur-sm">
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300/50 hover:bg-gray-100/50 transition-colors bg-white/70 backdrop-blur-sm"
              >
                Clear All
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary-300 text-accent-700 hover:bg-secondary-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchFilter;