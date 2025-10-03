import { COLORS } from "@/app/theme";
import React, { useState, useEffect } from "react";

// Updated types to match UnifiedListingData structure
export type PrimaryFilter = "Verified Sellers" | "Nearby" | null;
export type QuickFilter =
  | "Protected Listings"
  | "Posted Today"
  | "High Views"
  | "Has Gallery";
export type QuickSort =
  | "Nearest First"
  | "Newest First"
  | "Lowest Price"
  | "Highest Price"
  | "Most Views";

interface SortingProps {
  onFiltersChange?: (filters: {
    primaryFilter: PrimaryFilter;
    quickFilters: QuickFilter[];
    quickSort: QuickSort | null;
  }) => void;
  initialFilters?: {
    primaryFilter: PrimaryFilter;
    quickFilters: QuickFilter[];
    quickSort: QuickSort | null;
  };
}

// A component for the primary filter and sort navigation bar.
const Sorting: React.FC<SortingProps> = ({
  onFiltersChange,
  initialFilters = {
    primaryFilter: null,
    quickFilters: [],
    quickSort: null,
  },
}) => {
  const [activePrimaryFilter, setActivePrimaryFilter] = useState<PrimaryFilter>(
    initialFilters.primaryFilter
  );
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [activeQuickFilters, setActiveQuickFilters] = useState<QuickFilter[]>(
    initialFilters.quickFilters
  );
  const [activeQuickSort, setActiveQuickSort] = useState<QuickSort | null>(
    initialFilters.quickSort
  );

  // Emit changes to parent component
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        primaryFilter: activePrimaryFilter,
        quickFilters: activeQuickFilters,
        quickSort: activeQuickSort,
      });
    }
  }, [
    activePrimaryFilter,
    activeQuickFilters,
    activeQuickSort,
    onFiltersChange,
  ]);

  // --- Primary Button Handlers ---

  const handlePrimaryFilterClick = (filter: PrimaryFilter) => {
    // Toggle the filter if it's already active, otherwise set it
    setActivePrimaryFilter((current) => (current === filter ? null : filter));
    console.log(`Primary filter set to: ${filter}`);
  };

  const handleToggleMore = () => {
    setIsMoreOpen(!isMoreOpen);
  };

  // --- Secondary Filter/Sort Handlers (within the 'More' dropdown) ---

  const handleQuickFilterToggle = (filter: QuickFilter) => {
    setActiveQuickFilters(
      (current) =>
        current.includes(filter)
          ? current.filter((f) => f !== filter) // Remove if active
          : [...current, filter] // Add if inactive
    );
    console.log(`Toggled quick filter: ${filter}`);
  };

  const handleQuickSortChange = (sort: QuickSort) => {
    // Allow unselecting by clicking the active sort option again, or set the new one
    setActiveQuickSort((current) => (current === sort ? null : sort));
    console.log(`Set quick sort to: ${sort}`);
  };

  // Updated primary buttons to match UnifiedListingData features
  const primaryButtons = [
    {
      label: "Verified Sellers",
      filter: "Verified Sellers" as PrimaryFilter,
      icon: "✓",
    },
    { label: "Nearby", filter: "Nearby" as PrimaryFilter, icon: "📍" },
  ];

  // Updated quick filter options to match UnifiedListingData fields
  const quickFilterOptions: {
    label: string;
    filter: QuickFilter;
    icon: string;
  }[] = [
    { label: "Protected Listings", filter: "Protected Listings", icon: "🔒" }, // Based on 'protected' field
    { label: "Posted Today", filter: "Posted Today", icon: "🕒" },
    { label: "High Views", filter: "High Views", icon: "👁️" }, // Based on 'views' field
    { label: "Has Gallery", filter: "Has Gallery", icon: "🖼️" }, // Based on 'gallery' field
  ];

  // Updated quick sort options to match UnifiedListingData structure
  const quickSortOptions: { label: string; sort: QuickSort; icon: string }[] = [
    { label: "Nearest First", sort: "Nearest First", icon: "📍" },
    { label: "Newest First", sort: "Newest First", icon: "🆕" },
    { label: "Lowest Price", sort: "Lowest Price", icon: "💰" },
    { label: "Highest Price", sort: "Highest Price", icon: "💎" }, // NEW: Added high to low price
    { label: "Most Views", sort: "Most Views", icon: "👁️" }, // NEW: Based on views field
  ];

  // Helper function for primary button styling with theme colors
  const getPrimaryButtonClasses = (filter: PrimaryFilter) => {
    const isActive = activePrimaryFilter === filter;
    return `
            flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
            ${
              isActive
                ? "text-white" // Active state
                : "text-gray-800 hover:bg-gray-200" // Inactive state
            }
        `;
  };

  // Helper function for chip styling with theme colors
  const getChipClasses = (isActive: boolean) => {
    return `
            flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap
            ${
              isActive
                ? "text-white" // Active state for chips
                : "bg-gray-200 text-gray-700 hover:bg-gray-300" // Inactive state for chips
            }
        `;
  };

  return (
    <div className="w-full bg-white p-4">
      {/* --- PRIMARY BUTTONS (Verified Sellers, Nearby, More/Less) --- */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {primaryButtons.map(({ label, filter, icon }) => (
          <button
            key={filter}
            onClick={() => handlePrimaryFilterClick(filter)}
            className={getPrimaryButtonClasses(filter)}
            style={{
              backgroundColor:
                activePrimaryFilter === filter ? COLORS.activeBg : "#f3f4f6", // gray-100
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}

        {/* 'More' / 'Less' Button */}
        <button
          onClick={handleToggleMore}
          className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                        ${
                          isMoreOpen
                            ? "bg-gray-400 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
        >
          <span>{isMoreOpen ? "➖" : "✨"}</span>
          <span>{isMoreOpen ? "Less" : "More"}</span>
        </button>
      </div>

      {/* --- DROPDOWN/FILTER PANEL (Content shown when 'More' is clicked) --- */}
      {isMoreOpen && (
        <div className="mt-4 p-4 border-t border-gray-200 animate-fadeIn">
          {/* Quick Filters */}
          <h3
            className="text-md font-semibold mb-2"
            style={{ color: COLORS.textActive }}
          >
            Quick Filters
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickFilterOptions.map(({ label, filter, icon }) => (
              <div
                key={filter}
                onClick={() => handleQuickFilterToggle(filter)}
                className={getChipClasses(activeQuickFilters.includes(filter))}
                style={{
                  backgroundColor: activeQuickFilters.includes(filter)
                    ? COLORS.textActive
                    : undefined,
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Quick Sort */}
          <h3
            className="text-md font-semibold mb-2"
            style={{ color: COLORS.textActive }}
          >
            Quick Sort
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickSortOptions.map(({ label, sort, icon }) => (
              <div
                key={sort}
                onClick={() => handleQuickSortChange(sort)}
                className={getChipClasses(activeQuickSort === sort)}
                style={{
                  backgroundColor:
                    activeQuickSort === sort ? COLORS.textActive : undefined,
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sorting;
