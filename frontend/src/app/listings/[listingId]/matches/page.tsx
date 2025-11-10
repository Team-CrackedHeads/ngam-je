"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Package, MapPin, Clock, Eye, ShoppingCart, Handshake } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AIMatchingContainer } from "@/components/matching/AIMatchingContainer";
import { ListingDetailsModal } from "@/components/listings/ListingDetailsModal";
import { MatchesHeader } from "@/components/matching/MatchesHeader";
import { useClerkApiClient } from "@/lib/clerk-api-client";
import { fetchListingById } from "@/lib/api/listings";
import { fetchListingRecommendations } from "@/lib/api/recommendations";
import type { Listing as ApiListing } from "@/types/listing";
import type { Recommendation } from "@/lib/api/recommendations";

export default function ListingMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const getApiClient = useClerkApiClient();

  const [selectedListing, setSelectedListing] = useState<ApiListing | null>(null);
  const [yourListing, setYourListing] = useState<ApiListing | null>(null);
  const [matchedListings, setMatchedListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);

  const listingId = parseInt(params.listingId as string);
  const listingType = (searchParams.get("type") || "sale") as "sale" | "wanted" | "matched";

  // Fetch listing and its recommendations from database
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Get API client inside the effect to avoid dependency issues
        const apiClient = await getApiClient();

        if (!isMounted) return;

        // Fetch the current listing
        const listing = await fetchListingById(apiClient.instance, listingId);

        if (!isMounted) return;
        setYourListing(listing);

        // Fetch recommendations for this listing
        const recommendations = await fetchListingRecommendations(
          apiClient.instance,
          listingId,
          "matched" // Only get matched recommendations
        );

        if (!isMounted) return;

        // Fetch the actual matched listings
        const matches: ApiListing[] = [];
        for (const rec of recommendations.recommendations) {
          try {
            // Get the other listing (if this is source, get target; if target, get source)
            const matchedListingId = rec.source_listing_id === listingId
              ? rec.target_listing_id
              : rec.source_listing_id;
            const matchedListing = await fetchListingById(apiClient.instance, matchedListingId);
            matches.push(matchedListing);
          } catch (err) {
            console.error(`Failed to fetch matched listing:`, err);
          }
        }

        if (!isMounted) return;
        setMatchedListings(matches);
      } catch (error) {
        console.error("Error fetching listing data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]); // Only depend on listingId, not getApiClient

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500 mx-auto mb-4"></div>
          <p className="text-accent-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!yourListing) {
    return (
      <div className="min-h-screen bg-primary-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-accent-700 mb-2">Listing not found</h2>
          <button
            onClick={() => router.push("/listings")}
            className="px-4 py-2 bg-secondary-500 text-accent-700 rounded-lg hover:bg-secondary-600 transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  // Listing Card Component (reused for both desktop and modal)
  const ListingCard = () => (
    <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-neutral-200">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Image */}
        <div className="flex-shrink-0 w-full md:w-auto">
          {yourListing.image_url ? (
            <img
              src={yourListing.image_url}
              alt={yourListing.title}
              className="w-full aspect-square md:w-40 md:h-40 object-cover rounded-xl"
            />
          ) : (
            <div className="w-full aspect-square md:w-40 md:h-40 bg-primary-100 rounded-xl flex items-center justify-center">
              <span className="text-accent-400 text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Listing Details */}
        <div className="flex-1 flex flex-col">
          {/* Title and Price */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-accent-700 flex-1 md:pr-4">
              {yourListing.title}
            </h1>
            <span className="text-xl md:text-2xl font-bold text-secondary-600 whitespace-nowrap">
              {yourListing.currency} {yourListing.price}
            </span>
          </div>

          {/* Tags */}
          <div className="mb-3 flex flex-wrap gap-2">
            {yourListing.tags.map((tag, i) => (
              <span key={i} className="inline-block px-3 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-accent-600 mb-4 line-clamp-3">
            {yourListing.description}
          </p>

          {/* Footer Info */}
          <div className="mt-auto space-y-2">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-accent-500">
              <MapPin className="w-4 h-4" />
              <span>{yourListing.creator_location || "Location not specified"}</span>
            </div>

            {/* Time Posted */}
            <div className="flex items-center gap-2 text-sm text-accent-500">
              <Clock className="w-4 h-4" />
              <span>{new Date(yourListing.created_at).toLocaleDateString()}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-accent-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{yourListing.views} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Listing Details Modal */}
      <AnimatePresence>
        {selectedListing && (
          <ListingDetailsModal
            listing={selectedListing}
            type={
              selectedListing.id === yourListing.id
                ? listingType : listingType === "sale"
                  ? "wanted" : listingType === "wanted"
                    ? "sale" : "matched"
            }
            onClose={() => setSelectedListing(null)}
          />
        )}
      </AnimatePresence>



      <div className="min-h-screen bg-primary-100 text-accent-500">
        <div className="w-full mx-auto">
          {/* Matches Header */}
          <MatchesHeader
            onBack={() => router.push(`/listings?type=${listingType}`)}
            listingType={listingType}
            listingTitle={yourListing.title}
            matchCount={matchedListings.length}
          />

          <div className="px-4 md:px-12 py-6">
            {/* Your Listing Section - Desktop Only */}
            {!isMobile && (
              <>
              {/* Your Listing Header */}
              <div className="flex items-center gap-3 mb-4">
                {listingType === "sale" ? (
                  <ShoppingCart className="w-6 h-6 text-secondary-600" />
                ) : listingType === "wanted" ? (
                  <Package className="w-6 h-6 text-secondary-600" />
                ) : (
                  <Handshake className="w-6 h-6 text-secondary-600" />
                )}
                <h2 className="text-2xl font-bold text-accent-700">
                  Your {listingType === "sale" ? "Sale" : listingType === "wanted" ? "Wanted" : "Matched"} Listing
                </h2>
              </div>

              {/* Your Listing Card */}
              <div
                onClick={() => setSelectedListing(yourListing)}
                className="cursor-pointer hover:ring-2 hover:ring-secondary-400 rounded-2xl transition-all"
              >
                <ListingCard />
              </div>
              <div className="mb-6" />
            </>
          )}

          {/* Mobile: Compact Your Listing Banner */}
          {isMobile && (
            <div
              onClick={() => setSelectedListing(yourListing)}
              className="mb-6 bg-white rounded-xl shadow-sm p-4 border border-neutral-200 cursor-pointer active:scale-[0.98] transition-transform"
            >
              {/* Header with icon and label */}
              <div className="flex items-center gap-2 mb-3">
                {listingType === "sale" ? (
                  <ShoppingCart className="w-6 h-6 text-secondary-600" />
                ) : listingType === "wanted" ? (
                  <Package className="w-6 h-6 text-secondary-600" />
                ) : (
                  <Handshake className="w-6 h-6 text-secondary-600" />
                )}
                <span className="text-xs font-medium text-accent-500">Your {listingType === "sale" ? "Sale" : listingType === "wanted" ? "Wanted" : "Matched"} Listing</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Small Image */}
                {yourListing.image_url ? (
                  <img
                    src={yourListing.image_url}
                    alt={yourListing.title}
                    className="flex-shrink-0 w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-accent-400 text-xs">Image</span>
                  </div>
                )}

                {/* Listing Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-accent-700 line-clamp-1 mb-1">
                    {yourListing.title}
                  </h3>
                  <span className="text-lg font-bold text-secondary-600">
                    {yourListing.currency} {yourListing.price}
                  </span>
                </div>
              </div>
            </div>
          )}

          {listingType !== "matched" && (
            <>
              {/* AI Matching Component */}
              <AIMatchingContainer
                userMode={listingType === "sale" ? "seller" : "buyer"}
                userListings={[yourListing] as unknown as import("@/components/matching/types").ListingType[]}
                availableListings={matchedListings as unknown as import("@/components/matching/types").ListingType[]}
                onMatch={() => { }}
                onMessage={() => { }}
                onViewDetails={(listing) => setSelectedListing(listing)}
                onClose={() => { }}
              />
            </>
          )}
          </div>
        </div>
      </div>
    </>
  );
}
