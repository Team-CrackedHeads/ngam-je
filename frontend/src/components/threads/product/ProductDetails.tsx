"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { MapPin, Clock } from "lucide-react";
import { UnifiedListingData } from "@/utils/mock-threads-data";
import { ImageGalleryModal } from "./ImageGalleryModal";
import { ActionButtons } from "./ActionButtons";
import ProductFAQSummary from "./ProductFAQSummary";
import ProductDetailsTop from "./ProductDetailsTop";

// --- EXPORTED SHARED STYLES (NO SEPARATE FILE) ---
export const buttonClasses = `
  p-2 rounded-full transition-all
  hover:bg-gray-100 hover:shadow-md hover:ring-1
  active:scale-95 active:shadow-lg active:ring-1
`;

export const wideButtonClasses = `
  flex-1 flex items-center justify-center gap-2 py-3 px-3 border rounded-lg font-medium transition-all
  hover:shadow-md hover:ring-2
  active:scale-95 active:shadow-lg active:ring-2
`;

export const glowStyle = "text-accent-500 focus:ring-accent-500";
// ------------------------------------------------

// Updated prop type
export const ProductDetails = ({
  listing,
}: {
  listing: UnifiedListingData;
}) => {
  // ADDED: Router and params for navigation
  const router = useRouter();
  const params = useParams();
  const category = params.threadCategory as string;

  // State for gallery modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check if gallery has images
  const galleryImages = listing.gallery || [];
  const hasGalleryImages = galleryImages.length > 0;

  const openModal = (index: number) => {
    if (!hasGalleryImages) return;
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToNext = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1 // Loop to start
    );
  };

  const goToPrev = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1 // Loop to end
    );
  };

  // ADDED: Action button handlers
  const handleChatClick = () => {
    console.log("Chat clicked");
    // TODO: Implement chat functionality
  };

  const handleFAQClick = () => {
    router.push(`/threads/${category}/${listing.id}/faq`);
  };

  const handleBuyNowClick = () => {
    console.log("Buy Now clicked");
    // TODO: Implement buy now functionality
  };

  // Set main image source - use gallery first, then imageUrl fallback
  const mainImageSrc = hasGalleryImages ? galleryImages[0] : listing.imageUrl;

  return (
    <>
      <div className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto bg-white">
        <ProductDetailsTop
          listing={listing}
          mainImageSrc={mainImageSrc}
          hasGalleryImages={true}
          openModal={() => hasGalleryImages && openModal(0)}
        />
      </div>

      <div className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto bg-white p-6">
        {/* Gallery - Only show if has images */}
        {hasGalleryImages && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-accent-500">Gallery</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="w-24 h-24 rounded-lg overflow-hidden border cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openModal(index)}
                >
                  <Image
                    src={image.replace("w=1200", "w=200")}
                    alt={`Gallery thumbnail ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-accent-500">Description</h2>
          <p className="mt-2 text-accent-700">{listing.description}</p>
        </div>
      </div>

      <div className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto bg-white p-6">
        {/* Seller Info */}
        <div className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-200">
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
                  {listing.seller.name}
                </p>
                <div className="flex items-center gap-1 text-sm text-accent-700">
                  <MapPin className="w-3 h-3" />
                  <span>{listing.seller.location}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-accent-700">
                  <Clock className="w-3 h-3" />
                  <span>{listing.seller.timePosted}</span>
                </div>
              </div>
            </div>
            {listing.seller.verified && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-500 text-accent-500">
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - UPDATED WITH HANDLERS */}
        <ActionButtons
          onChat={handleChatClick}
          onFAQ={handleFAQClick}
          onBuyNow={handleBuyNowClick}
        />
      </div>

      {/* render image gallery modal*/}
      {isModalOpen && hasGalleryImages && (
        <ImageGalleryModal
          images={galleryImages}
          currentIndex={currentImageIndex}
          onClose={closeModal}
          onNext={goToNext}
          onPrev={goToPrev}
        />
      )}
      <ProductFAQSummary listingId={listing.id} category={category} />
    </>
  );
};
