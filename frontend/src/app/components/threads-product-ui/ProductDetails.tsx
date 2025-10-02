"use client";
import React, { useState } from "react";
import {
  MessageCircle,
  HelpCircle,
  Shield,
  Eye,
  MapPin,
  Clock,
} from "lucide-react";
import { UnifiedListingData } from "@/utils/mock-threads-data"; // Updated import
import { COLORS } from "@/app/theme";
import { ImageGalleryModal } from "./ImageGalleryModal";
import { ActionButtons } from "./ActionButtons";

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

export const glowStyle: React.CSSProperties = {
  color: COLORS.text,
  ["--tw-ring-color" as any]: COLORS.text, // override ring color
};
// ------------------------------------------------

// Updated prop type
export const ProductDetails = ({
  listing,
}: {
  listing: UnifiedListingData;
}) => {
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

  // Set main image source - use gallery first, then imageUrl fallback
  const mainImageSrc = hasGalleryImages ? galleryImages[0] : listing.imageUrl; // Use listing.imageUrl instead of hardcoded fallback

  return (
    <div
      className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto"
      style={{ backgroundColor: COLORS.justWhite }}
    >
      {/* Product Image - Clicking this opens the modal */}
      <div className="relative w-full">
        <img
          src={mainImageSrc}
          alt={listing.title} // Use dynamic title
          className="w-full h-64 sm:h-[50vh] object-cover sm:rounded-t-lg"
          onClick={() => hasGalleryImages && openModal(0)}
          style={{ cursor: hasGalleryImages ? "pointer" : "default" }}
        />
        {/* Updated badge logic */}
        <span
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            backgroundColor:
              listing.listingType === "for-sale"
                ? COLORS.accentActive
                : "#3B82F6",
            color: COLORS.text,
          }}
        >
          {listing.listingType === "for-sale" ? "For Sale" : "Want to Buy"}
        </span>
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full flex items-center gap-1 text-xs"
          style={{ backgroundColor: COLORS.hoverBg, color: COLORS.text }}
        >
          <Eye className="w-4 h-4" />
          <span className="font-medium">{listing.views} views</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: COLORS.text }}
            >
              {listing.title}
            </h1>
            {/* Only show subtitle if it exists */}
            {listing.subtitle && (
              <p className="text-lg" style={{ color: COLORS.textActive }}>
                - {listing.subtitle}
              </p>
            )}
            <p className="text-sm mt-1" style={{ color: COLORS.text }}>
              {listing.category} {/* Dynamic category */}
            </p>
          </div>
          <div className="flex gap-2">
            {[Shield, MessageCircle, HelpCircle].map((Icon, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{
                  background: `linear-gradient(to bottom right, ${COLORS.accentFrom}, ${COLORS.accentTo})`,
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Price of the product */}
        <div className="mb-6">
          <p
            className="text-3xl font-bold"
            style={{ color: COLORS.textActive }}
          >
            {listing.currency} {listing.price.toFixed(2)}
          </p>
          {listing.protected && (
            <div className="flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4" style={{ color: COLORS.text }} />
              <span className="text-sm" style={{ color: COLORS.text }}>
                Protected by Escrow
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-bold" style={{ color: COLORS.text }}>
            Description
          </h2>
          <p className="mt-2" style={{ color: COLORS.textActive }}>
            {listing.description}
          </p>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
            Tags
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {listing.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: COLORS.accentFrom,
                  color: COLORS.text,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Gallery - Only show if has images */}
        {hasGalleryImages && (
          <div className="mb-6">
            <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
              Gallery
            </h3>
            <div className="flex flex-wrap gap-3 mt-2">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="w-24 h-24 rounded-lg overflow-hidden border cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openModal(index)}
                >
                  <img
                    src={image.replace("w=1200", "w=200")}
                    alt={`Gallery thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Info */}
        <div className="pt-4 border-t" style={{ borderColor: COLORS.hoverBg }}>
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.hoverBg }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: COLORS.text }}
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
                <p className="font-semibold" style={{ color: COLORS.text }}>
                  {listing.seller.name}
                </p>
                <div
                  className="flex items-center gap-1 text-sm"
                  style={{ color: COLORS.textActive }}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{listing.seller.location}</span>
                </div>
                <div
                  className="flex items-center gap-1 text-sm"
                  style={{ color: COLORS.textActive }}
                >
                  <Clock className="w-3 h-3" />
                  <span>{listing.seller.timePosted}</span>
                </div>
              </div>
            </div>
            {listing.seller.verified && (
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: COLORS.accentFrom,
                  color: COLORS.text,
                }}
              >
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <ActionButtons />
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
    </div>
  );
};
