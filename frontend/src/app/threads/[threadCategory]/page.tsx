"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ListingCard from "@/app/components/threads-category-ui/ListingCard";
import { MOCK_LISTINGS, ListingData } from "@/utils/mock-threads-data";

import { COLORS } from "../../theme";
type ListingType = "wtb" | "wts";

const CategoryPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const category = params.threadCategory as string;
  
  // Get type from URL or default to 'wtb'
  const [activeType, setActiveType] = useState<ListingType>(
    (searchParams.get('type') as ListingType) || 'wtb'
  );

  // Update URL when type changes
  const handleTypeChange = (type: ListingType) => {
    setActiveType(type);
    router.push(`/threads/${category}?type=${type}`);
  };

  // Filter listings by category and type
  const getFilteredListings = (): ListingData[] => {
    const categoryListings = MOCK_LISTINGS.filter(
      listing => listing.category === category
    );

    if (activeType === "wtb") {
      return categoryListings.filter(listing => listing.listingType === "want-to-buy");
    } else {
      return categoryListings.filter(listing => listing.listingType === "for-sale");
    }
  };

  const filteredListings = getFilteredListings();

  const handleCardClick = (listing: ListingData) => {
    console.log('Clicked listing:', listing);
  };

  const handleMessage = (listing: ListingData) => {
    console.log('Message clicked for:', listing);
  };

  const handleFAQ = (listing: ListingData) => {
    console.log('FAQ clicked for:', listing);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
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
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Want to Buy ({MOCK_LISTINGS.filter(l => l.category === category && l.listingType === "want-to-buy").length})
          </button>
          
          <button
            onClick={() => handleTypeChange("wts")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              activeType === "wts"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Want to Sell ({MOCK_LISTINGS.filter(l => l.category === category && l.listingType === "for-sale").length})
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
          Showing {filteredListings.length} {activeType === "wtb" ? "want to buy" : "for sale"} listings in {category}
        </div>
        
      </div>
    </div>
  );
};

export default CategoryPage;