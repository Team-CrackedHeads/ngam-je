"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ListingCard from "@/app/components/threads-category-ui/ListingCard";
import { CategoryBreadcrumb } from "@/app/components/threads-category-ui/CategoryBreadcrumb";
import {
  UNIFIED_LISTINGS,
  UnifiedListingData,
} from "@/utils/mock-threads-data";
import SearchFilter, {
  type FilterOptions,
} from "@/app/components/threads-category-ui/SearchFilter";
import Sorting, {
  PrimaryFilter,
  QuickFilter,
  QuickSort,
} from "@/app/components/threads-category-ui/Sorting";

type ListingType = "wtb" | "wts";

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
    (searchParams.get("type") as ListingType) || "wtb"
  );

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

  /**
   * Stable callback to prevent infinite loops in Sorting component
   */
  const handleSortingFiltersChange = useCallback((filters: SortingFilters) => {
    setSortingFilters(filters);
    console.log("Sorting filters applied:", filters);
  }, []);
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
    router.push(`/threads/${category}?type=${type}`);
  };

  // Updated click handlers for navigation to detail page
  const handleCardClick = (listing: UnifiedListingData) => {
    // Navigate to the detail page with the listing ID and category
    router.push(`/threads/${category}/${listing.id}`);
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
  // Filter listings based on all active filters - UPDATED for UnifiedListingData
  const getFilteredListings = useCallback((): UnifiedListingData[] => {
    let categoryListings = UNIFIED_LISTINGS.filter(
      (listing) => listing.category === category
    );

    // Filter by listing type (WTB/WTS)
    if (activeType === "wtb") {
      categoryListings = categoryListings.filter(
        (listing) => listing.listingType === "want-to-buy"
      );
    } else {
      categoryListings = categoryListings.filter(
        (listing) => listing.listingType === "for-sale"
      );
    }

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <CategoryBreadcrumb category={category} activeType={activeType} />

        {/* Category Header */}
        <h1 className="text-2xl font-bold mb-4 capitalize">
          {category} Marketplace
        </h1>

        {/* Search Filter Component */}
        <SearchFilter
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          onSearchChange={handleSearchChange}
          initialFilters={appliedFilters}
          maxPrice={10000}
          currency="RM"
          searchPlaceholder={`Search ${category} items...`}
          availableCategories={[
            "electronics",
            "furniture",
            "books",
            "clothing",
            "sports",
          ]}
        />

        {/* WTB/WTS Toggle Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleTypeChange("wtb")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeType === "wtb"
                ? "bg-[#f5cb5c] text-gray-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Want to Buy (
            {
              UNIFIED_LISTINGS.filter(
                (l) =>
                  l.category === category && l.listingType === "want-to-buy"
              ).length
            }
            )
          </button>
          <button
            onClick={() => handleTypeChange("wts")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeType === "wts"
                ? "bg-gray-700 text-[#f5cb5c]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Want to Sell (
            {
              UNIFIED_LISTINGS.filter(
                (l) => l.category === category && l.listingType === "for-sale"
              ).length
            }
            )
          </button>
        </div>

        {/* Sorting Component */}
        <div className="mb-6">
          <Sorting
            onFiltersChange={handleSortingFiltersChange}
            initialFilters={sortingFilters}
          />
        </div>
        {/* Active Filters Display */}
        {(appliedFilters.search ||
          appliedFilters.selectedTags.length > 0 ||
          appliedFilters.location ||
          appliedFilters.category ||
          sortingFilters.primaryFilter ||
          sortingFilters.quickFilters.length > 0 ||
          sortingFilters.quickSort) && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-blue-800">
                Active filters:
              </span>

              {/* Filters from SearchFilter */}
              {appliedFilters.search && (
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                  Search: "{appliedFilters.search}"
                </span>
              )}
              {appliedFilters.location && (
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                  Location: {appliedFilters.location}
                </span>
              )}
              {appliedFilters.category && (
                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                  Category: {appliedFilters.category}
                </span>
              )}
              {appliedFilters.listingType &&
                appliedFilters.listingType !== "all" && (
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                    Type: {appliedFilters.listingType}
                  </span>
                )}
              {appliedFilters.selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

        {/* Results count */}
        <div className="mt-8 text-center text-gray-600">
          Showing {filteredListings.length}{" "}
          {activeType === "wtb" ? "want to buy" : "for sale"} listings in{" "}
          {category}
          {filteredListings.length !==
          UNIFIED_LISTINGS.filter(
            (l) =>
              l.category === category &&
              l.listingType ===
                (activeType === "wtb" ? "want-to-buy" : "for-sale")
          ).length
            ? ` (filtered from ${
                UNIFIED_LISTINGS.filter(
                  (l) =>
                    l.category === category &&
                    l.listingType ===
                      (activeType === "wtb" ? "want-to-buy" : "for-sale")
                ).length
              } total)`
            : ""}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
