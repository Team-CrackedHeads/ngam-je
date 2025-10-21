"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Package, Home, MapPin, Clock, Eye, Heart, ShoppingCart, X, Cable } from "lucide-react";
import { mockSaleListings, mockWantedListings, type Listing } from "@/utils/mock-listings-data";
import { MatchedListing } from "@/components/matching/types";
import { generateMatchesForListing } from "@/utils/mock-match-data";
import { motion, AnimatePresence } from "motion/react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AIMatchingContainer } from "@/components/matching/AIMatchingContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ListingMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [selectedListing, setSelectedListing] = useState<Listing | MatchedListing | null>(null);

  const listingId = parseInt(params.listingId as string);
  const listingType = (searchParams.get("type") || "sale") as "sale" | "wanted" | "matched";

  // Get the current listing
  const yourListing: Listing | undefined =
    listingType === "sale" ? mockSaleListings.find(l => l.id === listingId) :
    listingType === "wanted" ? mockWantedListings.find(l => l.id === listingId) :
    mockWantedListings.find(l => l.id === listingId);

  // Get matches for this listing
  const matches = yourListing && listingType !== "matched" ? generateMatchesForListing(listingId, listingType) : [];
  const matchedListings = matches.map(match => match.matchedListing);

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
              {listingType === "sale" ? yourListing.price : yourListing.budget}
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
  );

  // Detailed Listing Modal Component
  const ListingDetailsModal = ({ listing, type }: { listing: Listing | MatchedListing; type: "sale" | "wanted" | "matched" }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setSelectedListing(null)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <Card className="bg-white overflow-hidden border-neutral-200 shadow-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0 bg-primary-50">
            <div className="flex items-center gap-3">
              {type === "sale" ? (
                <ShoppingCart className="w-5 h-5 text-secondary-600" />
              ) : type === "wanted" ? (
                <Package className="w-5 h-5 text-secondary-600" />
              ) : (
                <Cable className="w-5 h-5 text-secondary-600" />
              )}
              <h2 className="text-xl font-bold text-accent-700">
                Listing Details
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedListing(null)}
              className="rounded-full hover:bg-primary-100 transition-colors"
            >
              <X className="h-5 w-5 text-accent-600" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Image */}
            <div className="w-full h-64 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <span className="text-accent-400 text-sm">Image</span>
            </div>

            {/* Title and Price */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-accent-700 mb-2">
                {listing.title}
              </h1>
              <span className="text-3xl font-bold text-secondary-600">
                {type === "sale" ? listing.price : ('budget' in listing ? listing.budget : listing.price)}
              </span>
            </div>

            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1.5 text-sm rounded-full bg-primary-200 text-accent-600 font-medium">
                {listing.category}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-accent-700 mb-2 uppercase tracking-wide">Description</h3>
              <p className="text-accent-600 leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Location */}
              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                <MapPin className="w-5 h-5 text-secondary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-accent-500 mb-1">Location</div>
                  <div className="text-sm font-semibold text-accent-700">{listing.location}</div>
                </div>
              </div>

              {/* Time Posted */}
              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                <Clock className="w-5 h-5 text-secondary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-accent-500 mb-1">Posted</div>
                  <div className="text-sm font-semibold text-accent-700">{'timestamp' in listing ? listing.timestamp : 'timeAgo' in listing ? listing.timeAgo : 'N/A'}</div>
                </div>
              </div>

              {/* Views */}
              {'views' in listing && (
              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                <Eye className="w-5 h-5 text-secondary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-accent-500 mb-1">Views</div>
                  <div className="text-sm font-semibold text-accent-700">{listing.views} views</div>
                </div>
              </div>
              )}

              {/* Likes */}
              {'likes' in listing && (
              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                <Heart className="w-5 h-5 text-secondary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-accent-500 mb-1">Likes</div>
                  <div className="text-sm font-semibold text-accent-700">{listing.likes} likes</div>
                </div>
              </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="border-t border-neutral-200 pt-4">
              <h3 className="text-sm font-semibold text-accent-700 mb-3 uppercase tracking-wide">Additional Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-accent-500">Listing ID</span>
                  <span className="font-medium text-accent-700">#{listing.id}</span>
                </div>
                {'subscriptionTier' in listing && (
                <div className="flex justify-between">
                  <span className="text-accent-500">Subscription Tier</span>
                  <span className="font-medium text-accent-700 capitalize">{listing.subscriptionTier}</span>
                </div>
                )}
                {'expiresAt' in listing && (
                <div className="flex justify-between">
                  <span className="text-accent-500">Expires At</span>
                  <span className="font-medium text-accent-700">{new Date(listing.expiresAt).toLocaleDateString()}</span>
                </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-neutral-200 bg-primary-50 shrink-0">
            <div className="flex gap-3">
              <Button
                onClick={() => setSelectedListing(null)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-accent-700"
              >
                Contact Seller
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      {/* Listing Details Modal */}
      <AnimatePresence>
        {selectedListing && (
          <ListingDetailsModal
            listing={selectedListing}
            type={selectedListing.id === yourListing.id ? listingType : (listingType === "sale" ? "wanted" : listingType === "wanted" ? "sale" : "matched")}
          />
        )}
      </AnimatePresence>



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
                  {listingType === "sale" ? "My Sale Listings" : listingType === "wanted" ? "My Want Listings" : "My Matched Listings"}
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

        {/* Your Listing Section - Desktop Only */}
        {!isMobile && (
          <>
            {/* Your Listing Header */}
            <div className="flex items-center gap-3 mb-4">
              {listingType === "sale" ? (
                <ShoppingCart className="w-6 h-6 text-secondary-600" />
              ) : (
                <Package className="w-6 h-6 text-secondary-600" />
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
                <ShoppingCart className="w-4 h-4 text-secondary-600 flex-shrink-0" />
              ) : (
                <Package className="w-4 h-4 text-secondary-600 flex-shrink-0" />
              )}
              <span className="text-xs font-medium text-accent-500">Your {listingType === "sale" ? "Sale" : listingType === "wanted" ? "Wanted" : "Matched"} Listing</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Small Image */}
              <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-accent-400 text-xs">Image</span>
              </div>

              {/* Listing Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-accent-700 line-clamp-1 mb-1">
                  {yourListing.title}
                </h3>
                <span className="text-lg font-bold text-secondary-600">
                  {listingType === "sale" ? yourListing.price : yourListing.budget}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Matches Header */}
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-secondary-600" />
          <h2 className="text-2xl font-bold text-accent-700">
            Your Matches
          </h2>
        </div>

        {/* AI Matching Component */}
        <AIMatchingContainer
          userMode={listingType === "sale" ? "seller" : "buyer"}
          userListings={[yourListing] as unknown as import("@/components/matching/types").ListingType[]}
          availableListings={matchedListings as unknown as import("@/components/matching/types").ListingType[]}
          onMatch={() => {}}
          onMessage={() => {}}
          onViewDetails={(listing) => setSelectedListing(listing)}
          onClose={() => {}}
        />
        </div>
      </div>
    </>
  );
}
