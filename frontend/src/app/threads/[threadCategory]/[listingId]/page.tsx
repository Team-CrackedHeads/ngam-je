"use client";
import React, { useState } from "react";
import {Heart,Share2,MoreVertical,ArrowLeft,MessageCircle,HelpCircle,ShoppingCart,MapPin,Clock,Shield,Eye,X,ChevronLeft,ChevronRight} from "lucide-react";
import { Product, productData } from "@/utils/mock-product-listing";
import { COLORS } from "@/app/theme";

// Shared button styles in prod-listing page
const buttonClasses = `
  p-2 rounded-full transition-all
  hover:bg-gray-100 hover:shadow-md hover:ring-1
  active:scale-95 active:shadow-lg active:ring-1
`;

const wideButtonClasses = `
  flex-1 flex items-center justify-center gap-2 py-3 px-3 border rounded-lg font-medium transition-all
  hover:shadow-md hover:ring-2
  active:scale-95 active:shadow-lg active:ring-2
`;

const glowStyle: React.CSSProperties = {
  color: COLORS.text,
  ["--tw-ring-color" as any]: COLORS.text, // override ring color
};

// Product Header 
const ProductHeader = ({ onBack }: { onBack?: () => void }) => (
  <div
    className="sticky top-0 z-50 flex items-center justify-between p-4 shadow-sm"
    style={{ backgroundColor: COLORS.background }}
  >
    <button
      className={buttonClasses}
      style={glowStyle}
      onClick={onBack}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
    <div className="flex gap-2">
      {[Heart, Share2, MoreVertical].map((Icon, i) => (
        <button key={i} className={buttonClasses} style={glowStyle}>
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  </div>
);

// Action Buttons (Chat, FAQ, Buy Now) 
const ActionButtons = ({
  onChat,
  onFAQ,
  onBuyNow,
}: {
  onChat?: () => void;
  onFAQ?: () => void;
  onBuyNow?: () => void;
}) => (
  <div className="flex flex-col sm:flex-row gap-3 mt-6">
    <button
      className={wideButtonClasses + " outline-solid outline-1"}
      style={{ ...glowStyle, borderColor: COLORS.hoverBg }}
      onClick={onChat}
    >
      <MessageCircle className="w-5 h-5" style={{ color: COLORS.text }} />
      <span>Chat</span>
    </button>
    <button
      className={wideButtonClasses + " outline-solid outline-1"}
      style={{ ...glowStyle, borderColor: COLORS.hoverBg }}
      onClick={onFAQ}
    >
      <HelpCircle className="w-5 h-5" style={{ color: COLORS.text }} />
      <span>FAQ</span>
    </button>
    <button
      className={
        wideButtonClasses + " font-semibold shadow-md outline-solid outline-1"
      }
      style={{
        background: `linear-gradient(to right, ${COLORS.accentFrom}, ${COLORS.accentTo})`,
        color: COLORS.textActive,
        ["--tw-ring-color" as any]: COLORS.text,
      }}
      onClick={onBuyNow}
    >
      <ShoppingCart className="w-5 h-5" />
      <span>Buy Now</span>
    </button>
  </div>
);

// Image Gallery Component
const ImageGalleryModal = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 p-4 transition-opacity"
    >
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 p-3 rounded-full bg-white bg-opacity-20 text-gray-800 hover:bg-opacity-40 z-50 transition-colors opacity-50"
        onClick={onClose}
        aria-label="Close image gallery"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image Container */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
        {/* Previous Button (Hidden if only one image) */}
        {images.length > 1 && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 ml-4 p-4 rounded-full bg-white bg-opacity-20 text-gray-800 hover:bg-opacity-40 transition-colors z-40 opacity-50"
            onClick={onPrev}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Current Image */}
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />

        {/* Next Button (Hidden if only one image) */}
        {images.length > 1 && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 mr-4 p-4 rounded-full bg-white bg-opacity-20 text-gray-800 hover:bg-opacity-40 transition-colors z-40 opacity-50"
            onClick={onNext}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black bg-opacity-50 text-white text-sm font-medium">
          {currentIndex + 1} of {images.length}
        </div>
      )}
    </div>
  );
};

// Product Details 
const ProductDetails = ({ product }: { product: Product }) => {
  // State for gallery modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check if gallery has images
  const galleryImages = product.gallery || []; 
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
    setCurrentImageIndex((prevIndex) =>
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1 // Loop to start
    );
  };

  const goToPrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1 // Loop to end
    );
  };

  // Set main image source using the galleryImages array
  const mainImageSrc = hasGalleryImages
    ? galleryImages[0]
    : "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1200&q=80"; // Fallback image


  return (
    <div
      className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto"
      style={{ backgroundColor: COLORS.justWhite }}
    >
      {/* Product Image - Clicking this opens the modal */}
      <div className="relative w-full">
        <img
          src={mainImageSrc}
          alt="Gaming Setup"
          className="w-full h-64 sm:h-[50vh] object-cover sm:rounded-t-lg"
          onClick={() => hasGalleryImages && openModal(0)} 
          style={{ cursor: hasGalleryImages ? 'pointer' : 'default' }}
        />
        {product.forSale && (
          <span
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: COLORS.accentActive, color: COLORS.text }}
          >
            For Sale
          </span>
        )}
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full flex items-center gap-1 text-xs"
          style={{ backgroundColor: COLORS.hoverBg, color: COLORS.text }}
        >
          <Eye className="w-4 h-4" />
          <span className="font-medium">{product.views} views</span>
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
              {product.title}
            </h1>
            <p className="text-lg" style={{ color: COLORS.textActive }}>
              - {product.subtitle}
            </p>
            <p className="text-sm mt-1" style={{ color: COLORS.text }}>
              Electronics
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
          <p className="text-3xl font-bold" style={{ color: COLORS.textActive }}>
            {product.currency} {product.price.toFixed(2)}
          </p>
          {product.protected && (
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
            {product.description}
          </p>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
            Tags
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.tags.map((tag, index) => (
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

        {/* Gallery - Render clickable thumbnails */}
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
                  src={image.replace('w=1200', 'w=200')} 
                  alt={`Gallery thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

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
                  {product.seller.name}
                </p>
                <div
                  className="flex items-center gap-1 text-sm"
                  style={{ color: COLORS.textActive }}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{product.seller.location}</span>
                </div>
                <div
                  className="flex items-center gap-1 text-sm"
                  style={{ color: COLORS.textActive }}
                >
                  <Clock className="w-3 h-3" />
                  <span>{product.seller.timePosted}</span>
                </div>
              </div>
            </div>
            {product.seller.verified && (
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

// Main Product Listing Screen
export default function ProductListingScreen() {
  return (
    <div
      className="min-h-screen w-full pb-32"
      style={{ backgroundColor: COLORS.offwhite }}
    >
      <ProductHeader />
      <ProductDetails product={productData} />
    </div>
  );
}