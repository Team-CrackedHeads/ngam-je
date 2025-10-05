"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ListingCard from "@/app/components/threads-category-ui/ListingCard";
import { CategoryBreadcrumb } from "@/app/components/threads-category-ui/CategoryBreadcrumb";
import {
  UNIFIED_LISTINGS,
  UnifiedListingData,
  getListingsByCategory,
} from "@/utils/mock-threads-data";

type ListingType = "wtb" | "wts";

const CategoryPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = params.threadCategory as string;

  // Get type from URL or default to 'wtb'
  const [activeType, setActiveType] = useState<ListingType>(
    (searchParams.get("type") as ListingType) || "wtb"
  );

  // Update URL when type changes
  const handleTypeChange = (type: ListingType) => {
    setActiveType(type);
    router.push(`/threads/${category}?type=${type}`);
  };

  // Filter listings by category and type using helper function
  const getFilteredListings = (): UnifiedListingData[] => {
    if (activeType === "wtb") {
      return getListingsByCategory(category, "want-to-buy");
    } else {
      return getListingsByCategory(category, "for-sale");
    }
  };

  const filteredListings = getFilteredListings();

  // Updated to navigate to detail page
  const handleCardClick = (listing: UnifiedListingData) => {
    router.push(`/threads/${category}/${listing.id}`);
  };

  const handleMessage = (listing: UnifiedListingData) => {
    console.log("Message clicked for:", listing);
  };

  const handleFAQ = (listing: UnifiedListingData) => {
    console.log("FAQ clicked for:", listing);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <CategoryBreadcrumb category={category} activeType={activeType} />

        {/* Category Header */}
        <h1 className="text-2xl font-bold mb-4 capitalize">
          {category} Marketplace
        </h1>

        {/* WTB/WTS Toggle Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleTypeChange("wtb")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeType === "wtb"
                ? "bg-primary-500 text-white"
                : "bg-neutral-100 text-accent-500 hover:bg-primary-200"
            }`}
          >
            Want to Buy ({getListingsByCategory(category, "want-to-buy").length}
            )
          </button>

          <button
            onClick={() => handleTypeChange("wts")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeType === "wts"
                ? "bg-secondary-500 text-white"
                : "bg-neutral-100 text-accent-500 hover:bg-primary-200"
            }`}
          >
            Want to Sell ({getListingsByCategory(category, "for-sale").length})
          </button>
        </div>

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
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
