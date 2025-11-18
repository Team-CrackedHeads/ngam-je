"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import ListingCard from "@/components/threads/category/ListingCard";
import { CategoryHeader } from "@/components/threads/category/CategoryHeader";
import { UnifiedListingData } from "@/utils/mock-all-data-used";
import SearchFilter, { type FilterOptions } from "@/components/threads/category/SearchFilter";
import Sorting, { PrimaryFilter, QuickFilter, QuickSort } from "@/components/threads/category/Sorting";
import ViewDropdown from "@/components/threads/ViewDropdown";
import ListingTypeDropdown from "@/components/threads/category/ListingTypeDropdown";
import { Plus } from "lucide-react";
import CreateListingModal from "@/components/create-listing/CreateListingModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { Listing } from "@/types/listing";
import { Thread } from "@/types/thread";
import { createClerkApiClient } from "@/lib/clerk-api-client";
import { fetchListings } from "@/lib/api/listings";

type ListingType = "wtb" | "wts" | "general";

interface SortingFilters {
  primaryFilter: PrimaryFilter;
  quickFilters: QuickFilter[];
  quickSort: QuickSort | null;
}

const ThreadDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();

  // CHANGED: Use threadId instead of category
  const threadId = parseInt(params.threadId as string, 10);

  const [activeType, setActiveType] = useState<ListingType>("general");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [isScrolled, setIsScrolled] = useState(false);

  // NEW: Thread data from API
  const [thread, setThread] = useState<Thread | null>(null);
  const [threadLoading, setThreadLoading] = useState(true);

  // NEW: Listings data from API
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  // Current user ID for "You" display
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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

  const [sortingFilters, setSortingFilters] = useState<SortingFilters>({
    primaryFilter: null,
    quickFilters: [],
    quickSort: null,
  });

  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const isMobile = useIsMobile();

  // NEW: Fetch thread details
  const fetchThread = useCallback(async () => {
    try {
      setThreadLoading(true);
      const token = await getToken();
      const apiClient = createClerkApiClient(token);
      const response = await apiClient.instance.get(
        `/api/v1/threads/${threadId}`
      );
      setThread(response.data);
    } catch (error) {
      console.error("Failed to fetch thread:", error);
    } finally {
      setThreadLoading(false);
    }
  }, [threadId, getToken]);

  // NEW: Fetch listings for this thread (filtered by thread_id)
  const fetchThreadListings = useCallback(async () => {
    try {
      setListingsLoading(true);
      const token = await getToken();
      const apiClient = createClerkApiClient(token);

      const response = await fetchListings(apiClient.instance, {
        thread_id: threadId, // CRITICAL: Filter by thread_id
        is_active: true,
      });

      setListings(response.listings);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setListingsLoading(false);
    }
  }, [threadId, getToken]);

  // NEW: Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = await getToken();
      const apiClient = createClerkApiClient(token);
      const user = await apiClient.get<{ id: number }>('/api/v1/users/me');
      setCurrentUserId(user.id);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // Don't block the page if user fetch fails
    }
  }, [getToken]);

  useEffect(() => {
    fetchThread();
    fetchThreadListings();
    fetchCurrentUser();
  }, [fetchThread, fetchThreadListings, fetchCurrentUser]);

  // NEW: Convert API Listing to UnifiedListingData for compatibility
  const convertToUnified = useCallback((listing: Listing): UnifiedListingData => {
    const timeAgo = (date: string) => {
      const now = new Date();
      const created = new Date(date);
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    };

    return {
      id: listing.id,
      userId: listing.user_id.toString(),
      title: listing.title,
      subtitle: undefined,
      description: listing.description,
      price: listing.price,
      currency: listing.currency,
      seller: {
        name: currentUserId === listing.user_id ? "You" : (listing.creator_name || "Unknown"),
        location: listing.creator_location || "Not specified",
        verified: listing.creator_verified,
        timePosted: timeAgo(listing.created_at),
      },
      imageUrl: listing.image_url || "https://placehold.co/400x300/cccccc/333333?text=No+Image",
      gallery: listing.gallery,
      category: thread?.category || "general",
      listingType: listing.listing_type,
      tags: listing.tags,
      views: listing.views,
      protected: listing.protected,
    };
  }, [thread, currentUserId]);

  const handleSortingFiltersChange = useCallback((filters: SortingFilters) => {
    setSortingFilters(filters);
  }, []);

  const handleApplyFilters = (filters: FilterOptions) => {
    setAppliedFilters(filters);
  };

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
    setSortingFilters({
      primaryFilter: null,
      quickFilters: [],
      quickSort: null,
    });
  };

  const handleSearchChange = (search: string) => {
    setAppliedFilters((prev) => ({ ...prev, search }));
  };

  const handleTypeChange = (type: ListingType) => {
    setActiveType(type);
  };

  // CHANGED: Navigate to /threads/{threadId}/listings/{listingId}
  const handleCardClick = (listing: UnifiedListingData) => {
    router.push(`/threads/${threadId}/listings/${listing.id}`);
  };

  const handleMessage = (listing: UnifiedListingData) => {
    console.log("Message clicked for:", listing);
  };

  const handleFAQ = (listing: UnifiedListingData) => {
    console.log("FAQ clicked for:", listing);
  };

  const handleCreateListing = () => {
    setIsCreateListingModalOpen(true);
  };

  // NEW: Refresh listings after creating new one
  const handleListingCreated = () => {
    fetchThreadListings();
  };

  // Filter and sort listings (same logic as before)
  const getFilteredListings = useCallback((): UnifiedListingData[] => {
    let filtered = listings.map(convertToUnified);

    // Filter by listing type
    if (activeType === "wtb") {
      filtered = filtered.filter((listing) => listing.listingType === "wanted");
    } else if (activeType === "wts") {
      filtered = filtered.filter((listing) => listing.listingType === "sale");
    }

    // Search filter
    if (appliedFilters.search) {
      const searchTerm = appliedFilters.search.toLowerCase();
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm) ||
          listing.description.toLowerCase().includes(searchTerm) ||
          listing.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Price filter
    filtered = filtered.filter((listing) => {
      const price = listing.price;
      return price >= appliedFilters.minPriceRange && price <= appliedFilters.priceRange;
    });

    // Location filter
    if (appliedFilters.location) {
      const locationTerm = appliedFilters.location.toLowerCase();
      filtered = filtered.filter((listing) =>
        listing.seller.location.toLowerCase().includes(locationTerm)
      );
    }

    // Tags filter
    if (appliedFilters.selectedTags.length > 0) {
      filtered = filtered.filter((listing) =>
        appliedFilters.selectedTags.some((selectedTag) =>
          listing.tags.some((tag) => tag.toLowerCase().includes(selectedTag.toLowerCase()))
        )
      );
    }

    // Sorting filters
    if (sortingFilters.primaryFilter === "Verified Sellers") {
      filtered = filtered.filter((listing) => listing.seller.verified);
    }
    if (sortingFilters.quickFilters.includes("Protected Listings")) {
      filtered = filtered.filter((listing) => listing.protected);
    }
    if (sortingFilters.quickFilters.includes("High Views")) {
      filtered = filtered.filter((listing) => listing.views > 100);
    }

    // Apply sorting
    const activeSort = sortingFilters.quickSort || appliedFilters.sortBy;
    switch (activeSort) {
      case "Lowest Price":
      case "Price: Low to High":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "Highest Price":
      case "Price: High to Low":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "Most Views":
        filtered.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    return filtered;
  }, [listings, activeType, appliedFilters, sortingFilters, convertToUnified]);

  const filteredListings = getFilteredListings();

  useEffect(() => {
    if (isMobile) {
      setIsScrolled(false);
    }

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollPosition = target.scrollTop;
      setShowFloatingButton(scrollPosition > 300);
      if (!isMobile) {
        setIsScrolled(scrollPosition > 10);
      }
    };

    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  if (threadLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto"></div>
          <p className="mt-4 text-accent-600">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-accent-700 mb-2">Thread Not Found</h2>
          <p className="text-accent-600 mb-4">The thread you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push("/threads")}
            className="px-4 py-2 bg-secondary-500 text-accent-700 rounded-lg font-semibold"
          >
            Back to Threads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <CategoryHeader
        onBack={() => router.push("/threads#ngam-overview")}
        category={thread.category}
        activeType={activeType}
        isScrolled={isScrolled}
      />
      <div className="container mx-auto px-4 py-8 mb-12">
        {/* Thread Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <h1 className="text-3xl font-bold text-accent-700 mb-2">{thread.title}</h1>
          <p className="text-accent-600 mb-4">{thread.description}</p>
          <div className="flex flex-wrap gap-2">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-secondary-200 text-accent-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Search and Filter Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="mb-3">
            <SearchFilter
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              onSearchChange={handleSearchChange}
              initialFilters={appliedFilters}
              maxPrice={10000}
              currency="RM"
              searchPlaceholder={`Search ${thread.title}...`}
            />
          </div>
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
              <span className="text-sm text-gray-600 font-medium">Filter:</span>
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

        {/* Mobile Control Bar */}
        <div className="md:hidden mb-4">
          <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <ListingTypeDropdown activeType={activeType} onTypeChange={handleTypeChange} />
            <ViewDropdown activeView={viewType} viewAction={setViewType} />
            <button
              onClick={handleCreateListing}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold bg-secondary-500 text-accent-700 rounded-lg border border-secondary-600 shadow-sm hover:scale-[1.02] active:scale-95 transition-transform ml-auto"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="py-3 text-base text-gray-600">
          Showing {filteredListings.length}{" "}
          {activeType === "wtb" ? "want to buy" : activeType === "wts" ? "for sale" : ""} listings
        </div>

        {/* Listings Grid */}
        {listingsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto"></div>
            <p className="mt-4 text-accent-600">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-accent-600 text-lg mb-4">No listings found in this thread yet.</p>
            <button
              onClick={handleCreateListing}
              className="px-6 py-3 bg-secondary-500 text-accent-700 font-semibold rounded-xl"
            >
              Be the first to create a listing!
            </button>
          </div>
        ) : (
          <div
            className={
              viewType === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
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
        )}

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

      {/* Create Listing Modal - CHANGED: Pass threadId instead of category */}
      <CreateListingModal
        isOpen={isCreateListingModalOpen}
        onClose={() => setIsCreateListingModalOpen(false)}
        threadId={threadId}
        onListingCreated={handleListingCreated}
      />
    </div>
  );
};

export default ThreadDetailPage;
