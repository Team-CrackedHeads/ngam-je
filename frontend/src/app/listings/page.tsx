"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Clock,
  MapPin,
  Eye,
  Timer,
  AlertTriangle,
  Sparkles,
  Plus,
  Handshake,
  Search,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { LISTINGS_TABS } from "@/utils/mock-all-data-used";
import { useIsMobile } from "@/hooks/use-mobile";
import ViewDropdown from "@/components/threads/ViewDropdown";
import CategoryDropdown from "@/components/ui/CategoryDropdown";
import { useClerkApiClient } from "@/lib/clerk-api-client";
import { useUser } from "@clerk/nextjs";
import { fetchUserListings } from "@/lib/api/listings";
import { fetchListingRecommendations } from "@/lib/api/recommendations";
import { fetchThreadById } from "@/lib/api/threads";
import type { Listing as ApiListing } from "@/types/listing";

// Helper functions for calculating listing expiration based on thread tier
// Assuming all users are premium for now
function getListingDurationByTier(threadTier: number): number {
  // Premium user durations (in days)
  switch (threadTier) {
    case 0:
      return 7;
    case 1:
      return 14;
    case 2:
      return 30;
    case 3:
      return 60;
    default:
      return 7;
  }
}

function calculateExpiresAt(createdAt: string, threadTier: number): string {
  const created = new Date(createdAt);
  const durationDays = getListingDurationByTier(threadTier);
  const expires = new Date(
    created.getTime() + durationDays * 24 * 60 * 60 * 1000
  );
  return expires.toISOString();
}

// Helper functions for timer calculations
function getTimeRemaining(expiresAt: string) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) {
    return { expired: true, text: "Expired", urgent: false, days: 0, hours: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const urgent = days <= 3; // Mark as urgent if 3 days or less

  if (days > 0) {
    return {
      expired: false,
      text: `${days}d ${hours}h`,
      urgent,
      days,
      hours,
    };
  } else {
    return {
      expired: false,
      text: `${hours}h`,
      urgent: true,
      days: 0,
      hours,
    };
  }
}

function getExtensionPrice(tier: number): string {
  // Extension price based on thread tier (assuming premium users)
  switch (tier) {
    case 0:
      return "RM 4.25"; // Tier 0
    case 1:
      return "RM 3.50"; // Tier 1
    case 2:
      return "RM 2.15"; // Tier 2
    case 3:
      return "RM 1.70"; // Tier 3
    default:
      return "RM 4.25";
  }
}

// Convert API listing to UI listing format
interface UiListing extends ApiListing {
  expiresAt: string;
  matchCount: number;
  threadTier: number; // Store the thread tier with the listing
}

function convertApiListingToUiListing(
  apiListing: ApiListing,
  threadTier: number,
  matchCount: number
): UiListing {
  return {
    ...apiListing,
    expiresAt: calculateExpiresAt(apiListing.created_at, threadTier),
    matchCount,
    threadTier,
  };
}

// Use centralized tabs configuration and add icons
const tabs = LISTINGS_TABS.map((tab) => ({
  ...tab,
  icon:
    tab.iconName === "ShoppingCart"
      ? ShoppingCart
      : tab.iconName === "Package"
      ? Package
      : Handshake,
}));

// Mobile-specific compact card component
function MobileProductCard({
  listing,
  type,
  isHighlighted,
}: {
  listing: UiListing;
  type: "sale" | "wanted" | "matched";
  isHighlighted?: boolean;
}) {
  const router = useRouter();
  const timeRemaining = getTimeRemaining(listing.expiresAt);
  const extensionPrice = getExtensionPrice(listing.threadTier);
  const matchCount = listing.matchCount;

  const handleExtendListing = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(
      `Extending listing ${listing.id} for 7 days at ${extensionPrice}`
    );
  };

  const handleViewMatches = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/listings/${listing.id}/matches?type=${type}`);
  };

  const handleCardClick = () => {
    router.push(`/listings/${listing.id}/matches?type=${type}`);
  };

  return (
    <div>
      {/* Timer badge and Match badge above card */}
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <div
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
            timeRemaining.expired
              ? "bg-red-100 text-red-700"
              : timeRemaining.urgent
              ? "bg-orange-100 text-orange-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {timeRemaining.expired ? (
            <AlertTriangle size={10} />
          ) : (
            <Timer size={10} />
          )}
          <span className="font-medium">{timeRemaining.text}</span>
        </div>

        {/* Match badge */}
        {matchCount > 0 && (
          <button
            onClick={handleViewMatches}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-all font-medium border border-secondary-200"
          >
            <Sparkles size={12} />
            <span>{matchCount}</span>
          </button>
        )}

        {/* Checked Out badge */}
        {listing.is_checked_out && (
          <div className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-success-500 text-white font-medium">
            <ShoppingCart size={12} />
            <span>Checked Out</span>
          </div>
        )}
      </div>

      <div
        onClick={handleCardClick}
        className={`rounded-xl shadow p-3 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col ${
          isHighlighted ? "ring-4 ring-secondary-500 bg-secondary-50" : ""
        }`}
      >
        {/* Listing Image */}
        <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}

          {/* Extension overlay for urgent/expired listings */}
          {(timeRemaining.urgent || timeRemaining.expired) && (
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-lg flex flex-col items-center justify-center">
              <AlertTriangle className="mb-1 text-black w-3 h-3" />
              <button
                onClick={handleExtendListing}
                className="px-2 py-0.5 bg-secondary-500 text-accent-700 rounded text-[10px] font-medium hover:bg-secondary-600 transition-colors shadow-md"
              >
                {extensionPrice}
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-accent-700 line-clamp-2 text-xs leading-tight mb-1">
            {listing.title}
          </h3>

          {/* Price */}
          <div className="mb-2">
            <span className="font-bold text-base text-secondary-700">
              {listing.currency} {listing.price}
            </span>
          </div>

          {/* Category badge - using tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="mb-2">
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary-200 text-accent-600">
                {listing.tags[0]}
              </span>
            </div>
          )}

          {/* Footer - compact */}
          <div className="space-y-1 mt-auto">
            {/* Location */}
            {listing.creator_location && (
              <div className="flex items-center gap-1 text-[10px] text-accent-400">
                <MapPin className="w-[11px] h-[11px]" />
                <span className="truncate">{listing.creator_location}</span>
              </div>
            )}

            {/* Views */}
            <div className="flex items-center gap-3 text-[11px] text-accent-400">
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{listing.views || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  listing,
  type,
  viewMode,
  isHighlighted,
}: {
  listing: UiListing;
  type: "sale" | "wanted" | "matched";
  viewMode: "grid" | "list";
  isHighlighted?: boolean;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const timeRemaining = getTimeRemaining(listing.expiresAt);
  const extensionPrice = getExtensionPrice(listing.threadTier);
  const matchCount = listing.matchCount;

  const handleExtendListing = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(
      `Extending listing ${listing.id} for 7 days at ${extensionPrice}`
    );
    // Future implementation: API call to extend listing
  };

  const handleViewMatches = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/listings/${listing.id}/matches?type=${type}`);
  };

  const handleCardClick = () => {
    // Navigate to matches page for this listing
    router.push(`/listings/${listing.id}/matches?type=${type}`);
  };

  // Use mobile component for grid view on mobile
  if (isMobile && viewMode === "grid") {
    return (
      <MobileProductCard
        listing={listing}
        type={type}
        isHighlighted={isHighlighted}
      />
    );
  }

  if (viewMode === "list") {
    return (
      <div>
        {/* Timer badge and Match badge above card */}
        <div className="mb-2 flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
              timeRemaining.expired
                ? "bg-red-100 text-red-700"
                : timeRemaining.urgent
                ? "bg-orange-100 text-orange-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {timeRemaining.expired ? (
              <AlertTriangle size={10} />
            ) : (
              <Timer size={10} />
            )}
            <span className="font-medium">{timeRemaining.text}</span>
          </div>

          {/* Match badge */}
          {matchCount > 0 && (
            <button
              onClick={handleViewMatches}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-all font-medium border border-secondary-200"
            >
              <Sparkles size={12} />
              <span className="max-md:hidden">
                {matchCount} {matchCount === 1 ? "match" : "matches"}
              </span>
              <span className="md:hidden">{matchCount}</span>
            </button>
          )}

          {/* Checked Out badge */}
          {listing.is_checked_out && (
            <div className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-success-500 text-white font-medium">
              <ShoppingCart size={12} />
              <span>Checked Out</span>
            </div>
          )}
        </div>

        <div
          onClick={handleCardClick}
          className={`rounded-2xl shadow p-4 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer h-48 ${
            isHighlighted ? "ring-4 ring-secondary-500 bg-secondary-50" : ""
          }`}
        >
          <div className="flex gap-4 h-full">
            {/* Image Section */}
            <div className="flex-shrink-0">
              {/* Image - wider aspect ratio for better visual balance */}
              <div className="w-32 h-full bg-gray-200 rounded-xl flex items-center justify-center relative">
                <span className="text-gray-400 text-xs">Image</span>

                {/* Extension overlay for urgent/expired listings - row view only */}
                {(timeRemaining.urgent || timeRemaining.expired) && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-xl flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1 mb-2">
                      <AlertTriangle size={16} className="text-black" />
                    </div>
                    <button
                      onClick={handleExtendListing}
                      className="px-3 py-1 bg-secondary-500 text-accent-700 rounded text-xs font-medium hover:bg-secondary-600 transition-colors shadow-md"
                    >
                      {extensionPrice}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col h-full">
              {/* Top Section */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-accent-700 line-clamp-2 flex-1 text-sm leading-tight">
                    {listing.title}
                  </h3>
                  <span className="font-bold text-sm text-secondary-700 ml-2 whitespace-nowrap">
                    {listing.currency} {listing.price}
                  </span>
                </div>

                {/* Category badge - using tags */}
                {listing.tags && listing.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600">
                      {listing.tags[0]}
                    </span>
                  </div>
                )}

                {/* Description */}
                <div className="mb-2">
                  <p className="text-xs text-accent-500 line-clamp-2 leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              </div>

              {/* Footer - always at bottom */}
              <div className="space-y-1 mt-auto">
                {/* Location */}
                {listing.creator_location && (
                  <div className="flex items-center gap-1 text-xs text-accent-400">
                    <MapPin size={12} />
                    <span>{listing.creator_location}</span>
                  </div>
                )}

                {/* Post Time */}
                <div className="flex items-center gap-1 text-xs text-accent-400">
                  <Clock size={12} />
                  <span>
                    {new Date(listing.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Views */}
                <div className="flex items-center gap-4 text-xs text-accent-400">
                  <div className="flex items-center gap-1">
                    <Eye size={12} />
                    <span>{listing.views || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Timer badge and Match badge above card */}
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <div
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
            timeRemaining.expired
              ? "bg-red-100 text-red-700"
              : timeRemaining.urgent
              ? "bg-orange-100 text-orange-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {timeRemaining.expired ? (
            <AlertTriangle size={10} />
          ) : (
            <Timer size={10} />
          )}
          <span className="font-medium">{timeRemaining.text}</span>
        </div>

        {/* Match badge */}
        {matchCount > 0 && (
          <button
            onClick={handleViewMatches}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-all font-medium border border-secondary-200"
          >
            <Sparkles size={12} />
            <span className="max-md:hidden">
              {matchCount} {matchCount === 1 ? "match" : "matches"}
            </span>
            <span className="md:hidden">{matchCount}</span>
          </button>
        )}

        {/* Checked Out badge */}
        {listing.is_checked_out && (
          <div className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-success-500 text-white font-medium">
            <ShoppingCart size={12} />
            <span>Checked Out</span>
          </div>
        )}
      </div>

      <div
        onClick={handleCardClick}
        className={`rounded-2xl shadow p-4 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer h-96 flex flex-col ${
          isHighlighted ? "ring-4 ring-secondary-500 bg-secondary-50" : ""
        }`}
      >
        {/* Listing Image */}
        <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">No Image</span>
          )}

          {/* Extension overlay for urgent/expired listings */}
          {(timeRemaining.urgent || timeRemaining.expired) && (
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-xl flex flex-col items-center justify-center">
              <AlertTriangle size={16} className="mb-1 text-black" />
              <div className="text-center">
                <div className="font-medium mb-1 text-accent-700">
                  {timeRemaining.expired ? "Expired" : "Expires Soon"}
                </div>
                <button
                  onClick={handleExtendListing}
                  className="px-2 py-1 bg-secondary-500 text-accent-700 rounded text-xs font-medium hover:bg-secondary-600 transition-colors shadow-md"
                >
                  Extend {extensionPrice}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Area - flex-grow to fill remaining space */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="mb-2">
            <h3 className="font-semibold text-accent-700 line-clamp-2 text-sm leading-tight">
              {listing.title}
            </h3>
          </div>

          {/* Category badge - using tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600">
                {listing.tags[0]}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mb-2">
            <span className="font-bold text-lg text-secondary-700">
              {listing.currency} {listing.price}
            </span>
          </div>

          {/* Description - flex-grow to take available space */}
          <p className="text-xs text-accent-500 mb-3 line-clamp-3 leading-relaxed flex-1 overflow-hidden text-ellipsis">
            {listing.description}
          </p>

          {/* Footer - always at bottom */}
          <div className="space-y-1 mt-auto">
            {/* Location */}
            {listing.creator_location && (
              <div className="flex items-center gap-1 text-xs text-accent-400">
                <MapPin size={12} />
                <span className="truncate">{listing.creator_location}</span>
              </div>
            )}

            {/* Post Time */}
            <div className="flex items-center gap-1 text-xs text-accent-400">
              <Clock size={12} />
              <span>{new Date(listing.created_at).toLocaleDateString()}</span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-4 text-xs text-accent-400">
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{listing.views || 0} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListingsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const getApiClient = useClerkApiClient();

  const [activeTab, setActiveTab] = useState<"sale" | "wanted" | "matched">(
    "sale"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<UiListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const type = searchParams.get("type") as "sale" | "wanted" | "matched";
    const highlight = searchParams.get("highlight");

    if (type && (type === "sale" || type === "wanted" || type === "matched")) {
      setActiveTab(type);
    }

    if (highlight) {
      const id = parseInt(highlight);
      setHighlightId(id);
      // Remove highlight after 3 seconds
      setTimeout(() => setHighlightId(null), 3000);
    }
  }, [searchParams]);

  // Fetch user's listings
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiClient = await getApiClient();

        // Get current user profile to fetch user ID
        const userProfile = await apiClient.get<{ id: number }>(
          "/api/v1/users/me/"
        );

        if (activeTab === "matched") {
          // For matched tab, fetch all user listings and filter for those with matches
          const saleListings = await fetchUserListings(
            apiClient.instance,
            userProfile.id,
            {
              listing_type: "sale",
              limit: 100,
            }
          );

          const wantedListings = await fetchUserListings(
            apiClient.instance,
            userProfile.id,
            {
              listing_type: "wanted",
              limit: 100,
            }
          );

          const allUserListings = [
            ...saleListings.listings,
            ...wantedListings.listings,
          ];
          const matchedListingsData: UiListing[] = [];

          for (const listing of allUserListings) {
            try {
              const recommendations = await fetchListingRecommendations(
                apiClient.instance,
                listing.id,
                "matched"
              );

              if (recommendations.recommendations.length > 0) {
                // Fetch thread tier from thread API
                try {
                  const thread = await fetchThreadById(
                    apiClient.instance,
                    listing.thread_id
                  );
                  matchedListingsData.push(
                    convertApiListingToUiListing(
                      listing,
                      thread.tier,
                      recommendations.recommendations.length
                    )
                  );
                } catch (threadErr) {
                  console.error(
                    `Error fetching thread ${listing.thread_id}:`,
                    threadErr
                  );
                  // Fallback to tier 0 if thread fetch fails
                  matchedListingsData.push(
                    convertApiListingToUiListing(
                      listing,
                      0,
                      recommendations.recommendations.length
                    )
                  );
                }
              }
            } catch (err) {
              console.error(
                `Error fetching recommendations for listing ${listing.id}:`,
                err
              );
            }
          }

          setListings(matchedListingsData);
        } else {
          // For sale/wanted tabs, fetch listings of that type
          const response = await fetchUserListings(
            apiClient.instance,
            userProfile.id,
            {
              listing_type: activeTab === "sale" ? "sale" : "wanted",
              limit: 100,
            }
          );

          // Convert API listings to UI listings
          const uiListings: UiListing[] = [];
          for (const listing of response.listings) {
            try {
              // Fetch thread tier from thread API
              const thread = await fetchThreadById(
                apiClient.instance,
                listing.thread_id
              );

              // Fetch match count for this listing
              try {
                const recommendations = await fetchListingRecommendations(
                  apiClient.instance,
                  listing.id,
                  "matched"
                );

                uiListings.push(
                  convertApiListingToUiListing(
                    listing,
                    thread.tier,
                    recommendations.recommendations.length
                  )
                );
              } catch (recErr) {
                console.error(
                  `Error fetching recommendations for listing ${listing.id}:`,
                  recErr
                );
                // Still add the listing even if recommendations fetch fails
                uiListings.push(
                  convertApiListingToUiListing(listing, thread.tier, 0)
                );
              }
            } catch (threadErr) {
              console.error(
                `Error fetching thread ${listing.thread_id}:`,
                threadErr
              );
              // Fallback to tier 0 if thread fetch fails
              try {
                const recommendations = await fetchListingRecommendations(
                  apiClient.instance,
                  listing.id,
                  "matched"
                );
                uiListings.push(
                  convertApiListingToUiListing(
                    listing,
                    0,
                    recommendations.recommendations.length
                  )
                );
              } catch (_recErr) {
                uiListings.push(convertApiListingToUiListing(listing, 0, 0));
              }
            }
          }

          setListings(uiListings);
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]); // Re-fetch when user or activeTab changes

  // Extract unique categories from tags
  const categories = [
    ...new Set(listings.flatMap((listing) => listing.tags || [])),
  ];

  // Apply category and search filters
  let currentListings = selectedCategory
    ? listings.filter((listing) => listing.tags?.includes(selectedCategory))
    : listings;

  // Apply search filter
  if (searchQuery.trim()) {
    currentListings = currentListings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (listing.creator_location &&
          listing.creator_location
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );
  }

  const ActiveIcon =
    activeTab === "sale"
      ? ShoppingCart
      : activeTab === "wanted"
      ? Package
      : Handshake;

  return (
    <div className="min-h-screen px-4 py-6 pb-24 bg-primary-100 text-accent-500 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b pb-2 space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() =>
                  router.push(`/listings?type=${tab.value}`, { scroll: false })
                }
                className={`flex items-center gap-2 pb-2 transition-colors ${
                  isActive
                    ? "text-accent-700 border-b-2 border-accent-700"
                    : "text-accent-500 hover:text-accent-700"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Control Bar */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 font-medium">Category:</span>
              <CategoryDropdown
                categories={categories}
                selectedCategory={selectedCategory}
                categoryAction={setSelectedCategory}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 font-medium">View:</span>
              <ViewDropdown activeView={viewMode} viewAction={setViewMode} />
            </div>
          </div>

          {/* Right Section */}
          {activeTab === "matched" ? (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search matched listings..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              />
            </div>
          ) : (
            <button
              onClick={() => {}}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-secondary-500 text-accent-700 font-semibold rounded-xl shadow hover:scale-105 active:scale-95 border border-secondary-600 transition"
            >
              <Plus className="w-4 h-4" />
              Create Listing
            </button>
          )}
        </div>

        <div className="md:hidden mb-4 space-y-2">
          <div className="flex items-center gap-2 p-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <CategoryDropdown
              categories={categories}
              selectedCategory={selectedCategory}
              categoryAction={setSelectedCategory}
            />
            <ViewDropdown activeView={viewMode} viewAction={setViewMode} />
            {activeTab !== "matched" && (
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold bg-secondary-500 text-accent-700 rounded-lg border border-secondary-600 shadow-sm hover:scale-[1.02] active:scale-95 transition-transform ml-auto"
                aria-label="Create new listing"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            )}
          </div>
          {activeTab === "matched" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search matched listings..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-accent-500">Loading listings...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500">{error}</div>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && !error && (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {currentListings.map((listing) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                type={activeTab}
                viewMode={viewMode}
                isHighlighted={highlightId === listing.id}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && currentListings.length === 0 && (
          <div className="text-center py-12">
            <ActiveIcon className="w-16 h-16 text-accent-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-accent-600 mb-2">
              No{" "}
              {activeTab === "sale"
                ? "items for sale"
                : activeTab === "wanted"
                ? "wanted items"
                : "matched items"}{" "}
              yet
            </h3>
            {activeTab !== "matched" && (
              <>
                <p className="text-accent-400 mb-4">
                  Be the first to post a{" "}
                  {activeTab === "sale"
                    ? "sale listing"
                    : activeTab === "wanted"
                    ? "wanted request"
                    : "matched request"}
                  !
                </p>
                <button className="px-6 py-3 bg-secondary-500 text-accent-700 rounded-lg font-medium hover:bg-secondary-600 transition-colors">
                  Create{" "}
                  {activeTab === "sale" ? "Sale Listing" : "Wanted Request"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-4 py-6 pb-24 bg-primary-100 flex items-center justify-center">
          <div className="text-accent-500">Loading...</div>
        </div>
      }
    >
      <ListingsPageContent />
    </Suspense>
  );
}
