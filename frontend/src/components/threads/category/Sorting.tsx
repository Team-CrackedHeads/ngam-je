import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  MapPin,
  Lock,
  Clock,
  Eye,
  Image,
  Sparkles,
  ArrowDown,
  ArrowUp,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

// --- Constants ---
const ICON_SIZE = 16;

// --- Types ---
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

const Sorting: React.FC<SortingProps> = ({
  onFiltersChange,
  initialFilters = {
    primaryFilter: null,
    quickFilters: [],
    quickSort: null,
  },
}) => {
  // --- States ---
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

  // --- Emit changes to parent ---
  useEffect(() => {
    onFiltersChange?.({
      primaryFilter: activePrimaryFilter,
      quickFilters: activeQuickFilters,
      quickSort: activeQuickSort,
    });
  }, [
    activePrimaryFilter,
    activeQuickFilters,
    activeQuickSort,
    onFiltersChange,
  ]);

  // --- Handlers ---
  const handlePrimaryFilterClick = (filter: PrimaryFilter) => {
    setActivePrimaryFilter((current) => (current === filter ? null : filter));
  };

  const handleToggleMore = () => setIsMoreOpen(!isMoreOpen);

  const handleQuickFilterToggle = (filter: QuickFilter) => {
    setActiveQuickFilters((current) =>
      current.includes(filter)
        ? current.filter((f) => f !== filter)
        : [...current, filter]
    );
  };

  const handleQuickSortChange = (sort: QuickSort) => {
    setActiveQuickSort((current) => (current === sort ? null : sort));
  };

  // --- Primary Buttons ---
  const primaryButtons = [
    {
      label: "Verified",
      filter: "Verified Sellers" as PrimaryFilter,
      icon: <ShieldCheck size={ICON_SIZE} />,
    },
    {
      label: "Nearby",
      filter: "Nearby" as PrimaryFilter,
      icon: <MapPin size={ICON_SIZE} />,
    },
  ];

  // --- Quick Filters ---
  const quickFilterOptions = [
    {
      label: "Protected Listings",
      filter: "Protected Listings" as QuickFilter,
      icon: <Lock size={ICON_SIZE} />,
    },
    {
      label: "Posted Today",
      filter: "Posted Today" as QuickFilter,
      icon: <Clock size={ICON_SIZE} />,
    },
    {
      label: "High Views",
      filter: "High Views" as QuickFilter,
      icon: <Eye size={ICON_SIZE} />,
    },
    {
      label: "Has Gallery",
      filter: "Has Gallery" as QuickFilter,
      icon: <Image size={ICON_SIZE} />,
    },
  ];

  // --- Quick Sort ---
  const quickSortOptions = [
    {
      label: "Nearest First",
      sort: "Nearest First" as QuickSort,
      icon: <MapPin size={ICON_SIZE} />,
    },
    {
      label: "Newest First",
      sort: "Newest First" as QuickSort,
      icon: <Sparkles size={ICON_SIZE} />,
    },
    {
      label: "Lowest Price",
      sort: "Lowest Price" as QuickSort,
      icon: <ArrowDown size={ICON_SIZE} />,
    },
    {
      label: "Highest Price",
      sort: "Highest Price" as QuickSort,
      icon: <ArrowUp size={ICON_SIZE} />,
    },
    {
      label: "Most Views",
      sort: "Most Views" as QuickSort,
      icon: <Eye size={ICON_SIZE} />,
    },
  ];

  // --- Styles ---
  const getPrimaryButtonClasses = (filter: PrimaryFilter) => {
    const isActive = activePrimaryFilter === filter;
    return `
      flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
      ${
        isActive
          ? "bg-secondary-500 text-white"
          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
      }
    `;
  };

  const getChipClasses = (isActive: boolean) => `
      flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer
      ${
        isActive
          ? "bg-accent-700 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }
  `;

  // --- Render ---
  return (
    <div className="w-full">
      {/* --- PRIMARY BUTTONS --- */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {primaryButtons.map(({ label, filter, icon }) => (
          <button
            key={filter}
            onClick={() => handlePrimaryFilterClick(filter)}
            className={getPrimaryButtonClasses(filter)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}

        {/* 'More' Button */}
        <button
          onClick={handleToggleMore}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
            ${
              isMoreOpen
                ? "bg-gray-400 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
        >
          {isMoreOpen ? (
            <MinusCircle size={ICON_SIZE} />
          ) : (
            <PlusCircle size={ICON_SIZE} />
          )}
          <span>{isMoreOpen ? "Less" : "More"}</span>
        </button>
      </div>

      {/* --- MORE DROPDOWN --- */}
      {isMoreOpen && (
        <div className="mt-4 p-4 border-t border-gray-200 animate-fadeIn">
          {/* Quick Filters */}
          <h3 className="text-md font-semibold mb-2 text-accent-700">
            Quick Filters
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickFilterOptions.map(({ label, filter, icon }) => (
              <div
                key={filter}
                onClick={() => handleQuickFilterToggle(filter)}
                className={getChipClasses(activeQuickFilters.includes(filter))}
              >
                {icon}
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Quick Sort */}
          <h3 className="text-md font-semibold mb-2 text-accent-700">
            Quick Sort
          </h3>
          <div className="flex flex-wrap gap-2">
            {quickSortOptions.map(({ label, sort, icon }) => (
              <div
                key={sort}
                onClick={() => handleQuickSortChange(sort)}
                className={getChipClasses(activeQuickSort === sort)}
              >
                {icon}
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
