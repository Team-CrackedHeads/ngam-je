"use client";

import React, { useState } from "react";
import { Heart, MessageSquare, CircleHelp } from "lucide-react";
import { COLORS } from "@/app/theme"; // Make sure you have this

export type ListingData = {
  id: string;
  title: string;
  description: string;
  price: string;
  seller: string;
  location: string;
  time: string;
  tags: string[];
  imageUrl: string;
  category: string;
  listingType: "for-sale" | "want-to-buy";
};

type ListingCardProps = {
  listing: ListingData;
  onClick?: (listing: ListingData) => void;
  onMessage?: (listing: ListingData) => void;
  onFAQ?: (listing: ListingData) => void;
};

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onClick,
  onMessage,
  onFAQ,
}) => {
  const [liked, setLiked] = useState(false);

  const {
    id,
    title,
    description,
    price,
    seller,
    location,
    time,
    tags,
    imageUrl,
    category,
    listingType,
  } = listing;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm p-4 relative cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={() => onClick?.(listing)}
    >
      {/* Heart/Like Button - Updated colors */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setLiked(!liked);
        }}
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md z-10 hover:shadow-lg transition-shadow"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            liked ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-400"
          }`}
        />
      </button>

      {/* Image with themed badge */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full rounded-lg object-cover h-48 sm:h-64"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/800x400/cccccc/333333?text=Image+Missing";
          }}
        />
        {/* Themed badge */}
        <span 
          className="absolute top-2 left-2 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md"
          style={{
            backgroundColor: listingType === "for-sale" ? COLORS.activeBg : "#3B82F6"
          }}
        >
          {listingType === "for-sale" ? "For Sale" : "Want to Buy"}
        </span>
      </div>

      {/* Title - Themed color */}
      <h3 
        className="mt-3 font-bold text-lg line-clamp-2"
        style={{ color: COLORS.textActive }}
      >
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{description}</p>

      {/* Tags - Themed colors */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-3 py-1 rounded-full font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: COLORS.accentFrom,
              color: COLORS.text,
            }}
          >
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-xs text-gray-500 py-1">+{tags.length - 3} more</span>
        )}
      </div>

      {/* Price - Themed color */}
      <div 
        className="font-bold text-xl mt-3"
        style={{ color: COLORS.textActive }}
      >
        {price}
      </div>

      {/* Seller info */}
      <div className="flex items-center text-sm text-gray-500 mt-2 gap-2">
        <span className="font-medium" style={{ color: COLORS.text }}>{seller}</span>
        <span>• {location}</span>
        <span>• {time}</span>
      </div>

      {/* Action buttons - Themed colors */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMessage?.(listing);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 border"
          style={{
            borderColor: COLORS.accentFrom,
            color: COLORS.text,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.accentFrom;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Message</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFAQ?.(listing);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: COLORS.activeBg,
            color: COLORS.text,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.accentTo;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.activeBg;
          }}
        >
          <CircleHelp className="w-4 h-4" />
          <span>FAQ</span>
        </button>
      </div>
    </div>
  );
};

export default ListingCard;