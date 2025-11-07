"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { ProductHeader } from "@/components/threads/product/ProductHeader";
import { ProductDetails } from "@/components/threads/product/ProductDetails";
import { useIsMobile } from "@/hooks/use-mobile";
import { createClerkApiClient } from "@/lib/clerk-api-client";
import { fetchListingById } from "@/lib/api/listings";
import { fetchThreadById } from "@/lib/api/threads";
import { Listing } from "@/types/listing";
import { Thread } from "@/types/thread";
import { UnifiedListingData } from "@/types/listing-form";

// Main Product Listing Screen
export default function ProductListingScreen() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  const [listing, setListing] = useState<Listing | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrolled = target.scrollTop > 10;
      setIsScrolled(scrolled);
    };

    // Find the main scrollable container
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Get params
  const threadId = parseInt(params.threadId as string);
  const listingId = parseInt(params.listingId as string);

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = await getToken();
      const apiClient = createClerkApiClient(token);
      const user = await apiClient.get<{ id: number }>("/api/v1/users/me");
      setCurrentUserId(user.id);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  }, [getToken]);

  // Fetch listing
  const fetchListing = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const apiClient = createClerkApiClient(token);

      const listingData = await fetchListingById(apiClient.instance, listingId);
      setListing(listingData);
    } catch (error) {
      console.error("Failed to fetch listing:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken, listingId]);

  // Fetch thread
  const fetchThread = useCallback(async () => {
    try {
      const token = await getToken();
      const apiClient = createClerkApiClient(token);

      const threadData = await fetchThreadById(apiClient.instance, threadId);
      setThread(threadData);
    } catch (error) {
      console.error("Failed to fetch thread:", error);
    }
  }, [getToken, threadId]);

  useEffect(() => {
    fetchCurrentUser();
    fetchListing();
    fetchThread();
  }, [fetchCurrentUser, fetchListing, fetchThread]);

  // Convert API Listing to UnifiedListingData
  const convertToUnified = (listing: Listing): UnifiedListingData => {
    const timeAgo = (date: string) => {
      const now = new Date();
      const created = new Date(date);
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
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
      faqs: listing.faqs,
      shippingOptions: listing.shipping_options,
    };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading listing...</p>
        </div>
      </div>
    );
  }

  // Show error if listing not found
  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Listing Not Found
          </h1>
          <p className="text-gray-600 mt-2">
            The listing you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push(`/threads/${threadId}`)}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Back to Thread
          </button>
        </div>
      </div>
    );
  }

  // Handle back navigation
  const handleBack = () => {
    router.push(`/threads/${threadId}`);
  };

  const unifiedListing = convertToUnified(listing);

  return (
    <div className="min-h-screen w-full pb-32 bg-primary-50">
      <ProductHeader
        onBack={handleBack}
        listingType={listing.listing_type}
        category={thread?.category || "general"}
        listingTitle={listing.title}
        isScrolled={isScrolled}
      />
      <div className="container mx-auto px-4 py-6">
        <ProductDetails listing={unifiedListing} />
      </div>
    </div>
  );
}
