"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ListingCard from "@/components/threads/category/ListingCard";
import { CategoryHeader } from "@/components/threads/category/CategoryHeader";
import { UnifiedListingData, getListingsByCategory } from "@/utils/mock-all-data-used";
import SearchFilter, { type FilterOptions } from "@/components/threads/category/SearchFilter";
import Sorting, { PrimaryFilter, QuickFilter, QuickSort } from "@/components/threads/category/Sorting";
import ViewDropdown from "@/components/threads/ViewDropdown";
import ListingTypeDropdown from "@/components/threads/category/ListingTypeDropdown";
import { Plus } from "lucide-react";
import CreateListingModal from "@/components/create-listing/CreateListingModal";
import { useIsMobile } from "@/hooks/use-mobile";

type ListingType = "wtb" | "wts" | "general";

// Define the structure for the filters coming from the Sorting component
interface SortingFilters {
  primaryFilter: PrimaryFilter;
  quickFilters: QuickFilter[];
  quickSort: QuickSort | null;
}
const CategoryPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = params.threadCategory as string;

  const [activeType, setActiveType] = useState<ListingType>(
    (searchParams.get("type") as ListingType) || "general"
  );

  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [isScrolled, setIsScrolled] = useState(false);

  // Updated state for SearchFilter to include new fields
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>({
    search: "",
    priceRange: 10000,
    minPriceRange: 0,
    location: "",
    selectedTags: [],
    sortBy: "Newest",
    category: "",
    listingType: "all",
  });

  // State for filters controlled by the Sorting component
  const [sortingFilters, setSortingFilters] = useState<SortingFilters>({
    primaryFilter: null,
    quickFilters: [],
    quickSort: null,
  });

  // State for floating button
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // State for create listing modal
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const isMobile = useIsMobile();

  /**
   * Stable callback to prevent infinite loops in Sorting component
   */
  const handleSortingFiltersChange = useCallback((filters: SortingFilters) => {
    setSortingFilters(filters);
    console.log("Sorting filters applied:", filters);
  }, []);

  // Handle scroll for floating button and header collapse
  useEffect(() => {
    if (isMobile) {
      setIsScrolled(false);
    }

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollPosition = target.scrollTop;
      const showButtonThreshold = 300; // Show floating button after scrolling 300px
      setShowFloatingButton(scrollPosition > showButtonThreshold);
      if (!isMobile) {
        const scrolled = scrollPosition > 10;
        setIsScrolled(scrolled);
      }
    };

    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [isMobile]);
  // Handle filter application from SearchFilter
  const handleApplyFilters = (filters: FilterOptions) => {
    setAppliedFilters(filters);
    console.log("Applied filters:", filters);
  };

  // Handle filter clearing from SearchFilter
  const handleClearFilters = () => {
    setAppliedFilters({
      search: "",
      priceRange: 10000,
      minPriceRange: 0,
      location: "",
      selectedTags: [],
      sortBy: "Newest",
      category: "",
      listingType: "all",
    });
    // Also clear sorting filters
    setSortingFilters({
      primaryFilter: null,
      quickFilters: [],
      quickSort: null,
    });
    console.log("Filters cleared");
  };

  // Handle search change (real-time search)
  const handleSearchChange = (search: string) => {
    setAppliedFilters((prev) => ({ ...prev, search }));
  };

  // Update URL when type changes
  const handleTypeChange = (type: ListingType) => {
    setActiveType(type);
    // router.replace(`/threads/${category}?type=${type}`);
  };

  // Updated click handlers for navigation to detail page
  const handleCardClick = (listing: UnifiedListingData) => {
    // Navigate to the detail page with the listing ID and category
    router.replace(`/threads/${category}/${listing.id}`);
    console.log("Navigating to listing:", listing.id);
  };

  const handleMessage = (listing: UnifiedListingData) => {
    console.log("Message clicked for:", listing);
    // You can add message functionality here
  };

  const handleFAQ = (listing: UnifiedListingData) => {
    console.log("FAQ clicked for:", listing);
    // You can add FAQ functionality here
  };

  // Handle create listing modal
  const handleCreateListing = () => {
    setIsCreateListingModalOpen(true);
  };
  // Filter listings based on all active filters - UPDATED for UnifiedListingData
  const getFilteredListings = useCallback((): UnifiedListingData[] => {
    // Use getListingsByCategory to include newly created listings
    let categoryListings = getListingsByCategory(category);

    // Filter by listing type (WTB/WTS/General)
    if (activeType === "wtb") {
      categoryListings = categoryListings.filter(
        (listing) => listing.listingType === "wanted"
      );
    } else if (activeType === "wts") {
      categoryListings = categoryListings.filter(
        (listing) => listing.listingType === "sale"
      );
    }
    // For "general", don't filter by listing type - show both

    // --- APPLY FILTERS FROM SEARCH FILTER COMPONENT ---
    // Apply search filter
    if (appliedFilters.search) {
      const searchTerm = appliedFilters.search.toLowerCase();
      categoryListings = categoryListings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm) ||
          listing.description.toLowerCase().includes(searchTerm) ||
          listing.subtitle?.toLowerCase().includes(searchTerm) ||
          listing.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Price filtering for UnifiedListingData (price is now a number)
    categoryListings = categoryListings.filter((listing) => {
      const price = listing.price;
      const minPrice = appliedFilters.minPriceRange;
      const maxPrice = appliedFilters.priceRange;

      return price >= minPrice && price <= maxPrice;
    });

    // Apply location filter - UPDATED for new seller structure
    if (appliedFilters.location) {
      const locationTerm = appliedFilters.location.toLowerCase();
      categoryListings = categoryListings.filter((listing) =>
        listing.seller.location.toLowerCase().includes(locationTerm)
      );
    }

    // Apply tags filter
    if (appliedFilters.selectedTags.length > 0) {
      categoryListings = categoryListings.filter((listing) =>
        appliedFilters.selectedTags.some((selectedTag) =>
          listing.tags.some((tag) =>
            tag.toLowerCase().includes(selectedTag.toLowerCase())
          )
        )
      );
    }

    // Apply category filter (if different from current page category)
    if (appliedFilters.category && appliedFilters.category !== category) {
      categoryListings = categoryListings.filter(
        (listing) => listing.category === appliedFilters.category
      );
    }

    // Apply listing type filter from SearchFilter
    if (appliedFilters.listingType && appliedFilters.listingType !== "all") {
      categoryListings = categoryListings.filter(
        (listing) => listing.listingType === appliedFilters.listingType
      );
    }
    // --- APPLY FILTERS FROM SORTING COMPONENT ---

    // 1. Apply Primary Filter
    if (sortingFilters.primaryFilter === "Verified Sellers") {
      categoryListings = categoryListings.filter(
        (listing) => listing.seller.verified
      );
    }
    if (sortingFilters.primaryFilter === "Nearby") {
      categoryListings = categoryListings.filter((listing) =>
        listing.seller.location.toLowerCase().includes("kuala lumpur")
      );
    }

    // 2. Apply Quick Filters - UPDATED for new data structure
    if (sortingFilters.quickFilters.includes("Protected Listings")) {
      categoryListings = categoryListings.filter(
        (listing) => listing.protected
      );
    }
    if (sortingFilters.quickFilters.includes("Posted Today")) {
      categoryListings = categoryListings.filter(
        (listing) =>
          listing.seller.timePosted.includes("hour") ||
          listing.seller.timePosted.includes("day")
      );
    }
    if (sortingFilters.quickFilters.includes("High Views")) {
      categoryListings = categoryListings.filter(
        (listing) => listing.views > 100
      );
    }
    if (sortingFilters.quickFilters.includes("Has Gallery")) {
      categoryListings = categoryListings.filter(
        (listing) => listing.gallery && listing.gallery.length > 0
      );
    }

    // 3. Apply Sorting - UPDATED for UnifiedListingData
    const activeSort = sortingFilters.quickSort || appliedFilters.sortBy;

    switch (activeSort) {
      case "Lowest Price":
      case "Price: Low to High":
        categoryListings.sort((a, b) => a.price - b.price);
        break;

      case "Highest Price":
      case "Price: High to Low":
        categoryListings.sort((a, b) => b.price - a.price);
        break;

      case "Most Views":
        categoryListings.sort((a, b) => b.views - a.views);
        break;

      case "Nearest First":
      case "Distance":
        categoryListings.sort((a, b) =>
          a.seller.location.localeCompare(b.seller.location)
        );
        break;

      case "Newest First":
      case "Newest":
      default:
        categoryListings.sort((a, b) => {
          const timeA = a.seller.timePosted.includes("minute")
            ? 1
            : a.seller.timePosted.includes("hour")
              ? 2
              : 3;
          const timeB = b.seller.timePosted.includes("minute")
            ? 1
            : b.seller.timePosted.includes("hour")
              ? 2
              : 3;
          return timeA - timeB;
        });
        break;
    }

    return categoryListings;
  }, [category, activeType, appliedFilters, sortingFilters]);

  const filteredListings = getFilteredListings();
  return (
    <div className="min-h-screen bg-primary-50">
      <CategoryHeader
        onBack={() => router.push('/threads#ngam-overview')}
        category={category}
        activeType={activeType}
        isScrolled={isScrolled}
      />
      <div className="container mx-auto px-4 py-8 mb-12">
        {/* Search and Filter Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          {/* Search Filter Component */}
          <div className="mb-3">
            <SearchFilter
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              onSearchChange={handleSearchChange}
              initialFilters={appliedFilters}
              maxPrice={10000}
              currency="RM"
              searchPlaceholder={`Search ${category} items...`}
            />
          </div>

          {/* Sorting Component */}
          <div>
            <Sorting
              onFiltersChange={handleSortingFiltersChange}
              initialFilters={sortingFilters}
            />
          </div>
        </div>

        {/* Control Bar */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Sort By:</span>
              <ListingTypeDropdown activeType={activeType} onTypeChange={handleTypeChange} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">View:</span>
              <ViewDropdown activeView={viewType} viewAction={setViewType} />
            </div>
          </div>

          <button
            onClick={handleCreateListing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 text-accent-700 font-semibold rounded-xl shadow hover:scale-105 active:scale-95 border border-secondary-600"
          >
            <Plus className="w-4 h-4" />
            Create Listing
          </button>
        </div>

        <div className="md:hidden mb-4">
          <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <ListingTypeDropdown activeType={activeType} onTypeChange={handleTypeChange} />
            <ViewDropdown activeView={viewType} viewAction={setViewType} />
            <button
              onClick={handleCreateListing}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold bg-secondary-500 text-accent-700 rounded-lg border border-secondary-600 shadow-sm hover:scale-[1.02] active:scale-95 transition-transform ml-auto"
              aria-label="Create new listing"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="py-3 text-base text-gray-600">
          Showing {filteredListings.length}{" "}
          {activeType === "wtb"
            ? "want to buy"
            : activeType === "wts"
              ? "for sale"
              : ""} listings in{" "}
          {category}
          {filteredListings.length !==
            getListingsByCategory(category).filter(
              (l) => {
                if (activeType === "general") {
                  return true;
                }
                return l.listingType ===
                  (activeType === "wtb" ? "wanted" : "sale");
              }
            ).length
            ? ` (filtered from ${getListingsByCategory(category).filter(
              (l) => {
                if (activeType === "general") {
                  return true;
                }
                return l.listingType ===
                  (activeType === "wtb" ? "wanted" : "sale");
              }
            ).length
            } total)`
            : ""}
        </div>

        {/* Active Filters Display */}
        {(appliedFilters.search ||
          appliedFilters.selectedTags.length > 0 ||
          appliedFilters.location ||
          appliedFilters.category ||
          sortingFilters.primaryFilter ||
          sortingFilters.quickFilters.length > 0 ||
          sortingFilters.quickSort) && (
            <div className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-accent-700">
                  Active filters:
                </span>

                {/* Filters from SearchFilter */}
                {appliedFilters.search && (
                  <span className="px-2 py-1 bg-secondary-200 text-accent-700 rounded-full text-xs">
                    Search: &quot;{appliedFilters.search}&quot;
                  </span>
                )}
                {appliedFilters.location && (
                  <span className="px-2 py-1 bg-secondary-200 text-accent-700 rounded-full text-xs">
                    Location: {appliedFilters.location}
                  </span>
                )}
                {appliedFilters.category && (
                  <span className="px-2 py-1 bg-secondary-200 text-accent-700 rounded-full text-xs">
                    Category: {appliedFilters.category}
                  </span>
                )}
                {appliedFilters.listingType &&
                  appliedFilters.listingType !== "all" && (
                    <span className="px-2 py-1 bg-secondary-200 text-accent-700 rounded-full text-xs">
                      Type: {appliedFilters.listingType}
                    </span>
                  )}
                {appliedFilters.selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary-200 text-accent-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}

                {/* Filters from Sorting Component */}
                {sortingFilters.primaryFilter && (
                  <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs">
                    {sortingFilters.primaryFilter}
                  </span>
                )}
                {sortingFilters.quickFilters.map((filter) => (
                  <span
                    key={filter}
                    className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs"
                  >
                    {filter}
                  </span>
                ))}
                {sortingFilters.quickSort && (
                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">
                    Sort: {sortingFilters.quickSort}
                  </span>
                )}

                <button
                  onClick={handleClearFilters}
                  className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs hover:bg-red-300"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

        {/* Listings Grid */}
        <div className={viewType === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
        }>
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={handleCardClick}
              onMessage={handleMessage}
              onFAQ={handleFAQ}
            />
          ))}
        </div>

        {/* Floating Create Listing Button */}
        {showFloatingButton && !isMobile && (
          <button
            onClick={handleCreateListing}
            className="fixed bottom-6 right-6 bg-accent-700 hover:bg-accent-800 text-secondary-500 w-14 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 z-50 flex items-center justify-center"
            aria-label="Create Listing"
          >
            <span className="text-2xl font-bold">+</span>
          </button>
        )}
      </div>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateListingModalOpen}
        onClose={() => setIsCreateListingModalOpen(false)}
        category={category}
      />
    </div>
  );
};

export default CategoryPage;
