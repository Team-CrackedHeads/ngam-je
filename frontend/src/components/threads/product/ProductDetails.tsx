"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { UnifiedListingData } from "@/utils/mock-all-data-used";
import { ImageGalleryModal } from "./ImageGalleryModal";
import ProductFAQSummary from "./ProductFAQSummary";
import ProductDetailsTop from "./ProductDetailsTop";
import ProductDetailsMiddle from "./ProductDetailsMiddle";
import ProductDetailsBottom from "./ProductDetailsBottom";
import MakeOfferBuy from "@/components/create-listing/MakeOfferBuy";
import MakeOfferSell from "@/components/create-listing/MakeOfferSell";
import { createClerkApiClient } from "@/lib/clerk-api-client";

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
  const threadId = params.threadId ? parseInt(params.threadId as string) : undefined;
  const { getToken } = useAuth();

  // Check if current user owns this listing (using database user ID)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const isOwnListing = currentUserId !== null && currentUserId.toString() === listing.userId;

  // Fetch current user's database ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = await getToken();
        const apiClient = createClerkApiClient(token);
        const user = await apiClient.get<{ id: number }>("/api/v1/users/me");
        setCurrentUserId(user.id);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    fetchCurrentUser();
  }, [getToken]);

  // State for gallery modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State for Make Offer modal
  const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = useState(false);

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
    if (threadId) {
      router.push(`/threads/${threadId}/listings/${listing.id}/faq`);
    }
  };

  const handleMakeOfferClick = () => {
    setIsMakeOfferModalOpen(true);
  };

  // Set main image source - use imageUrl (first uploaded image), gallery contains remaining images
  const mainImageSrc = listing.imageUrl;

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
        <ProductDetailsMiddle
          galleryImages={galleryImages}
          description={listing.description}
          openModal={openModal}
        />
      </div>

      <div className="shadow-sm mt-4 md:mt-6 w-full sm:rounded-lg sm:max-w-4xl sm:mx-auto bg-white p-6">
        <ProductDetailsBottom
          seller={listing.seller}
          onChat={handleChatClick}
          onFAQ={handleFAQClick}
          onBuyNow={handleMakeOfferClick}
          isOwnListing={isOwnListing}
          listingType={listing.listingType}
          listingId={listing.id}
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

      {/* Make Offer Modal - conditionally render based on listing type */}
      {listing.listingType === "sale" ? (
        <MakeOfferBuy
          isOpen={isMakeOfferModalOpen}
          onClose={() => setIsMakeOfferModalOpen(false)}
          sourceListingId={String(listing.id)}
          sourceTitle={listing.title}
          sourceDescription={listing.description}
          sourceImages={listing.gallery || [listing.imageUrl]}
          sourceOwnershipProof={null}
          sourceTags={listing.tags}
          sourcePrice={listing.price}
          category={listing.category}
          sourceFAQs={listing.faqs || []}
        />
      ) : (
        <MakeOfferSell
          isOpen={isMakeOfferModalOpen}
          onClose={() => setIsMakeOfferModalOpen(false)}
          sourceListingId={String(listing.id)}
          sourceTitle={listing.title}
          sourcePrice={listing.price}
          category={listing.category}
          sourceFAQs={listing.faqs || []}
        />
      )}

      {threadId && (
        <ProductFAQSummary listingId={listing.id} threadId={threadId} />
      )}
    </>
  );
};