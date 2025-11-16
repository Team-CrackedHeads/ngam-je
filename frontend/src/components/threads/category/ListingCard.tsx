"use client";

import React, { useState } from "react";
import SafeImage from "@/components/ui/SafeImage";
import { Heart, MapPin, Clock } from "lucide-react";
import { UnifiedListingData } from "@/utils/mock-all-data-used";

type ListingCardProps = {
  listing: UnifiedListingData;
  onClick?: (listing: UnifiedListingData) => void;
  onMessage?: (listing: UnifiedListingData) => void;
  onFAQ?: (listing: UnifiedListingData) => void;
};

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onClick,
}) => {
  const [liked, setLiked] = useState(false);

  const {
    title,
    price,
    currency,
    seller,
    tags,
    imageUrl,
    listingType,
  } = listing;

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-4 relative cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col"
      onClick={() => onClick?.(listing)}
    >
      {/* Heart/Like Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setLiked(!liked);
        }}
        className="absolute top-8 right-6 bg-white p-2 rounded-full shadow-md z-[1] hover:shadow-lg transition-shadow"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${liked
            ? "text-red-500 fill-red-500"
            : "text-gray-400 hover:text-red-400"
            }`}
        />
      </button>

      {/* Image with themed badge */}
      <div className="relative">
        <SafeImage
          src={imageUrl}
          alt={title}
          width={800}
          height={400}
          className="w-full rounded-lg object-cover h-48 sm:h-64"
          maxRetries={3}
        />
        {/* For Sale - badge */}
        <span
          className={`absolute top-2 left-2 text-accent-700 text-xs px-3 py-1 rounded-full font-medium shadow-md ${listingType === "sale" ? "bg-secondary-500" : "bg-primary-500"
            }`}
        >
          {listingType === "sale" ? "For Sale" : "Want to Buy"}
        </span>
      </div>

      <div>
        {/* Title */}
        <h3 className="mt-2 font-bold text-lg line-clamp-2 text-accent-700">
          {title}
        </h3>

        {/* Seller info - moved below title */}
        <div className="flex items-center text-xs text-gray-600 mt-3 gap-2">
          <SafeImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seller.name}`}
            alt={seller.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full bg-gray-200"
          />
          <div className="flex items-center gap-1">
            <span className="font-medium">{seller.name}</span>
          </div>
        </div>

        {/* Location and Time */}
        <div className="flex items-center text-xs text-gray-600 mt-1 gap-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{seller.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.s5" />
            <span>{seller.timePosted}</span>
          </div>
        </div>

        {/* Price - Now with currency */}
        <div className="font-bold text-xl mt-3 text-accent-700">
          {currency} {price.toFixed(2)}
        </div>

        {/* Subtitle (if exists) */}
        {listing.subtitle && (
          <p className="text-sm font-medium text-gray-700 mt-2">
            {listing.subtitle}
          </p>
        )}

        {/* Tags */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full font-medium transition-colors hover:opacity-90 bg-secondary-100 text-accent-600"
              style={{
                backgroundColor: "var(--color-secondary-500)"
              }}
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-500 py-1">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      </div>


    </div>
  );
};

export default ListingCard;
