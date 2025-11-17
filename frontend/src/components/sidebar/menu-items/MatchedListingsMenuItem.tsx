"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Clock, Handshake } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { useClerkApiClient } from "@/lib/clerk-api-client";
import { useUser } from "@clerk/nextjs";
import { fetchUserListings } from "@/lib/api/listings";
import { fetchListingRecommendations } from "@/lib/api/recommendations";
import type { Listing } from "@/types/listing";

export default function MatchedListingsMenuItem() {
  const router = useRouter();
  const { user } = useUser();
  const getApiClient = useClerkApiClient();

  const [isOpen, setIsOpen] = useState(false);
  const [visibleListings, setVisibleListings] = useState(5);
  const [loading, setLoading] = useState(false);
  const [matchedListings, setMatchedListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const KEEP_RECENT_COUNT = 10;
  const MAX_LOADED_COUNT = 25;
  const DELOAD_TO_COUNT = 15;

  // Lazy load: Only fetch when menu is opened for the first time
  useEffect(() => {
    if (!user || !isOpen || hasLoadedOnce) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const apiClient = await getApiClient();

        // Get current user profile
        const userProfile = await apiClient.get<{ id: number }>("/api/v1/users/me");

        // Fetch all user's listings (both sale and wanted)
        const saleListings = await fetchUserListings(apiClient.instance, userProfile.id, {
          listing_type: "sale",
          limit: 100,
        });

        const wantedListings = await fetchUserListings(apiClient.instance, userProfile.id, {
          listing_type: "wanted",
          limit: 100,
        });

        const allUserListings = [...saleListings.listings, ...wantedListings.listings];

        // For each listing, fetch its matched recommendations
        const matchedListingsData: Listing[] = [];

        for (const listing of allUserListings) {
          try {
            const recommendations = await fetchListingRecommendations(
              apiClient.instance,
              listing.id,
              "matched" // Only fetch matched recommendations
            );

            if (recommendations.recommendations.length > 0) {
              // This listing has matches, add it to the list
              matchedListingsData.push(listing);
            }
          } catch (err) {
            console.error(`Error fetching recommendations for listing ${listing.id}:`, err);
          }
        }

        setMatchedListings(matchedListingsData);
        setError(null);
        setHasLoadedOnce(true);
      } catch (err) {
        console.error("Error fetching matched listings:", err);
        setError("Failed to load matched listings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpen]); // Fetch when opened

  const handleListingClick = (listingId: number) => {
    // Navigate to the listing page instead of opening modal
    router.push(`/listings/${listingId}/matches?type=matched`);
  };

  const loadMoreListings = () => {
    if (loading || visibleListings >= matchedListings.length) return;

    setLoading(true);
    setTimeout(() => {
      const newCount = Math.min(visibleListings + 5, matchedListings.length);

      if (newCount > MAX_LOADED_COUNT) {
        setVisibleListings(Math.max(DELOAD_TO_COUNT, KEEP_RECENT_COUNT));
      } else {
        setVisibleListings(newCount);
      }

      setLoading(false);
    }, 300);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollHeight - scrollTop <= clientHeight + 5) {
      loadMoreListings();
    }

    if (scrollTop === 0 && visibleListings > KEEP_RECENT_COUNT) {
      const currentTarget = e.currentTarget;
      setTimeout(() => {
        if (currentTarget && currentTarget.scrollTop === 0) {
          setVisibleListings(KEEP_RECENT_COUNT);
        }
      }, 500);
    }
  };

  return (
    <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setIsOpen(!isOpen)}
          className="group/menu-item text-accent-700 font-semibold"
        >
          <Handshake className="w-5 h-5" />
          <span>Matched Listings</span>
          {isOpen ? (
            <ChevronDown className="ml-auto h-4 w-4 transition-transform" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4 transition-transform" />
          )}
        </SidebarMenuButton>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                onClick={() =>
                  router.push("/listings?type=matched", { scroll: false })
                }
                className="text-accent-500 hover:bg-primary-200 hover:text-accent-700 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Recent Listings</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>

            <SidebarMenuSubItem>
              <div
                className="max-h-32 overflow-y-auto space-y-1 px-2"
                onScroll={handleScroll}
              >
                {error && (
                  <div className="p-2 text-xs text-red-500">{error}</div>
                )}

                {!error && matchedListings.length === 0 && !loading && (
                  <div className="p-2 text-xs text-accent-400 text-center">
                    No matched listings yet
                  </div>
                )}

                {matchedListings.slice(0, visibleListings).map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => handleListingClick(listing.id)}
                    className="p-2 rounded cursor-pointer transition-colors text-xs text-accent-500 hover:bg-primary-200 hover:text-accent-700"
                  >
                    <div className="truncate font-medium">{listing.title}</div>
                    <div className="flex justify-between text-[10px] text-accent-400">
                      <span>{listing.currency} {listing.price}</span>
                      <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-center py-2">
                    <div className="text-xs text-accent-400">Loading...</div>
                  </div>
                )}

                {visibleListings >= matchedListings.length &&
                  matchedListings.length > 5 && (
                    <div className="flex justify-center py-2">
                      <div className="text-xs text-accent-400">
                        No more listings
                      </div>
                    </div>
                  )}

                {visibleListings < matchedListings.length &&
                  visibleListings >= MAX_LOADED_COUNT && (
                    <div className="flex justify-center py-2">
                      <div className="text-xs text-accent-300">
                        {matchedListings.length - visibleListings} older listings
                        hidden
                      </div>
                    </div>
                  )}
              </div>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </div>
      </SidebarMenuItem>
  );
}
