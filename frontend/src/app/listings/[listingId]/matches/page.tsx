"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Package, SearchX, Home, MapPin, Clock, Eye, Heart, ShoppingCart } from "lucide-react";
import { mockBuyListings, mockSellListings, type Listing } from "@/utils/mock-listings-data";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AIMatchingContainer } from "@/components/matching/AIMatchingContainer";

export default function ListingMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const listingId = parseInt(params.listingId as string);
  const listingType = (searchParams.get("type") || "buy") as "buy" | "sell";

  // Get the current listing
  const yourListing: Listing | undefined = listingType === "buy"
    ? mockBuyListings.find(l => l.id === listingId)
    : mockSellListings.find(l => l.id === listingId);

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

  return (
    <div className="min-h-screen px-4 py-6 pb-24 bg-primary-100 text-accent-500">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => router.push('/')}
                  className="flex items-center gap-1 cursor-pointer hover:text-accent-700"
                >
                  <Home className="w-4 h-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => router.push(`/listings?type=${listingType}`)}
                  className="cursor-pointer hover:text-accent-700"
                >
                  {listingType === "buy" ? "My Sale Listings" : "My Want Listings"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-accent-700 font-medium">
                  Matches
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Your Listing Header */}
        <div className="flex items-center gap-3 mb-4">
          {listingType === "buy" ? (
            <ShoppingCart className="w-6 h-6 text-secondary-600" />
          ) : (
            <Package className="w-6 h-6 text-secondary-600" />
          )}
          <h2 className="text-2xl font-bold text-accent-700">
            Your {listingType === "buy" ? "Sale" : "Wanted"} Listing
          </h2>
        </div>

        {/* Your Listing Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6 border border-neutral-200">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Image Placeholder */}
            <div className="flex-shrink-0 w-full md:w-auto">
              <div className="w-full aspect-square md:w-40 md:h-40 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-accent-400 text-sm">Image</span>
              </div>
            </div>

            {/* Listing Details */}
            <div className="flex-1 flex flex-col">
              {/* Title and Price */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-accent-700 flex-1 md:pr-4">
                  {yourListing.title}
                </h1>
                <span className="text-xl md:text-2xl font-bold text-secondary-600 whitespace-nowrap">
                  {listingType === "buy" ? yourListing.price : yourListing.budget}
                </span>
              </div>

              {/* Category Badge */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium">
                  {yourListing.category}
                </span>
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
                  <span>{yourListing.location}</span>
                </div>

                {/* Time Posted */}
                <div className="flex items-center gap-2 text-sm text-accent-500">
                  <Clock className="w-4 h-4" />
                  <span>{yourListing.timestamp}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-accent-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{yourListing.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{yourListing.likes} likes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Header */}
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-secondary-600" />
          <h2 className="text-2xl font-bold text-accent-700">
            Your Matches
          </h2>
        </div>

        {/* AI Matching Component */}
        <AIMatchingContainer
          userMode={listingType === "buy" ? "seller" : "buyer"}
          userListings={[yourListing]}
          availableListings={[]}
          onMatch={() => {}}
          onMessage={() => {}}
          onViewDetails={() => {}}
          onClose={() => {}}
        />
      </div>
    </div>
  );
}
