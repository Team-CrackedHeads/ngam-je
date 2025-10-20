"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Clock, Cable } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { mockSaleListings } from "@/utils/mock-listings-data";

export default function BuyListingsMenuItem() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [visibleListings, setVisibleListings] = useState(5);
  const [loading, setLoading] = useState(false);
  const KEEP_RECENT_COUNT = 10;
  const MAX_LOADED_COUNT = 25;
  const DELOAD_TO_COUNT = 15;

  const handleListingClick = (listingId: number) => {
    router.push(`/listings/${listingId}/matches?type=sale`);
  };

  const loadMoreListings = () => {
    if (loading || visibleListings >= mockSaleListings.length) return;

    setLoading(true);
    setTimeout(() => {
      const newCount = Math.min(visibleListings + 5, mockSaleListings.length);

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
        <Cable className="w-5 h-5" />
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
                router.push("/listings?type=sale", { scroll: false })
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
              {mockSaleListings.slice(0, visibleListings).map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => handleListingClick(listing.id)}
                  className="p-2 rounded cursor-pointer transition-colors text-xs text-accent-500 hover:bg-primary-200 hover:text-accent-700"
                >
                  <div className="truncate font-medium">{listing.title}</div>
                  <div className="flex justify-between text-[10px] text-accent-400">
                    <span>{listing.price || listing.budget}</span>
                    <span>{listing.timestamp}</span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-center py-2">
                  <div className="text-xs text-accent-400">Loading...</div>
                </div>
              )}

              {visibleListings >= mockSaleListings.length &&
                mockSaleListings.length > 5 && (
                  <div className="flex justify-center py-2">
                    <div className="text-xs text-accent-400">
                      No more listings
                    </div>
                  </div>
                )}

              {visibleListings < mockSaleListings.length &&
                visibleListings >= MAX_LOADED_COUNT && (
                  <div className="flex justify-center py-2">
                    <div className="text-xs text-accent-300">
                      {mockSaleListings.length - visibleListings} older listings
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
