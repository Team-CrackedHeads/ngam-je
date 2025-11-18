import React from 'react';
import { MapPin, Clock } from 'lucide-react'; // Import icons needed for seller info
import { ActionButtons } from './ActionButtons'; // Assuming ActionButtons is in the same directory or accessible path

// Define the shape of the seller data
interface SellerData {
  name: string;
  location: string;
  timePosted: string;
  verified: boolean;
}

// Define the props for the ProductDetailsBottom component
interface ProductDetailsBottomProps {
  seller: SellerData;
  onChat: () => void;
  onFAQ: () => void;
  onBuyNow: () => void;
  isOwnListing?: boolean;
  listingType?: "sale" | "want";
}

const ProductDetailsBottom: React.FC<ProductDetailsBottomProps> = ({
  seller,
  onChat,
  onFAQ,
  onBuyNow,
  isOwnListing = false,
  listingType = "sale",
}) => {
  return (
    <>
      {/* Seller Info */}
      <div className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-200">
              {/* This SVG is for a generic user icon */}
              <svg
                className="w-6 h-6 text-accent-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-accent-500">
                {seller.name}
              </p>
              <div className="flex items-center gap-1 text-sm text-accent-700">
                <MapPin className="w-3 h-3" />
                <span>{seller.location}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-accent-700">
                <Clock className="w-3 h-3" />
                <span>{seller.timePosted}</span>
              </div>
            </div>
          </div>
          {seller.verified && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-500 text-accent-500">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons
        onChat={onChat}
        onFAQ={onFAQ}
        onBuyNow={onBuyNow}
        isOwnListing={isOwnListing}
        listingType={listingType}
      />
    </>
  );
};

export default ProductDetailsBottom;