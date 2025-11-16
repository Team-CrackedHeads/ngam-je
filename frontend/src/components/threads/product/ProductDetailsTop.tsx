import React from 'react';
import Image from 'next/image';
import { Eye, Shield } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import { UnifiedListingData } from "@/utils/mock-all-data-used";

interface ProductCardDetailsProps {
  listing: UnifiedListingData;
  mainImageSrc: string;
  hasGalleryImages: boolean;
  openModal?: (index: number) => void;
}

// 3. Create the functional React component
const ProductDetailsTop: React.FC<ProductCardDetailsProps> = ({
  listing,
  mainImageSrc,
  hasGalleryImages,
  openModal,
}) => {
  return (
    <div className="product-card-details-container">
      {/* Product Image - Clicking this opens the modal */}
      <div
        className="relative w-full h-64 sm:h-[50vh]"
        onClick={() => hasGalleryImages && openModal && openModal(0)}
        style={{ cursor: hasGalleryImages && openModal ? "pointer" : "default" }}
      >
        <SafeImage
          src={mainImageSrc}
          alt={listing.title}
          fill
          className="object-cover sm:rounded-t-lg"
        />
        {/* Updated badge logic */}
        <span
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-accent-700 ${
            listing.listingType === "sale"
              ? "bg-secondary-500"
              : "bg-primary-500"
          }`}
        >
          {listing.listingType === "sale" ? "For Sale" : "Want to Buy"}
        </span>
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full flex items-center gap-1 text-xs bg-primary-200 text-accent-500">
          <Eye className="w-4 h-4" />
          <span className="font-medium">{listing.views} views</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        {/* Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mt-2">
            {listing.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-500 text-accent-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div>
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-accent-700">
              {listing.title}
            </h1>
            {/* Subtitle (conditional) */}
            {listing.subtitle && (
              <p className="text-lg text-accent-500">- {listing.subtitle}</p>
            )}
            {/* Category */}
            <p className="text-sm mt-1 text-accent-500">{listing.category}</p>
          </div>
        </div>

        {/* Price of the product */}
        <div className="mb-6">
          <p className="text-3xl font-bold text-accent-700">
            {listing.currency} {listing.price.toFixed(2)}
          </p>
          {/* Purchase safeguard label */}
          {listing.protected && (
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-accent-500" />
              <span className="text-sm text-accent-500">
                Protected by Escrow
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsTop;