"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ProductHeader } from "@/components/threads/product/ProductHeader";
import { ProductDetails } from "@/components/threads/product/ProductDetails";
// Import unified data instead
import { getListingById } from "@/utils/mock-all-data-used";
import { useIsMobile } from "@/hooks/use-mobile";

// Main Product Listing Screen
export default function ProductListingScreen() {
  const params = useParams();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrolled = target.scrollTop > 10;
      setIsScrolled(scrolled);
    };

    // Find the main scrollable container
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    mainElement.addEventListener("scroll", handleScroll);
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Get the listing ID from URL params
  const listingId = params.listingId as string;
  const category = params.threadCategory as string;

  // Find the specific listing by ID
  const listing = getListingById(listingId);

  // Show error if listing not found
  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Listing Not Found
          </h1>
          <p className="text-gray-600 mt-2">
            The listing you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push(`/threads/${category}`)}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Back to {category}
          </button>
        </div>
      </div>
    );
  }

  // Handle back navigation - go to category page with appropriate type
  const handleBack = () => {
    const typeParam = listing.listingType === "wanted" ? "wtb" : "wts";
    router.push(`/threads/${category}?type=${typeParam}`);
  };

  return (
    <div className="min-h-screen w-full pb-32 bg-primary-50">
      <ProductHeader
        onBack={handleBack}
        listingType={listing.listingType === "wanted" ? "want" : listing.listingType}
        category={category}
        listingTitle={listing.title}
        isScrolled={isScrolled}
      />
      <div className="container mx-auto px-4 py-6">
        {/* Pass the dynamic listing data */}
        <ProductDetails listing={listing} />
      </div>
    </div>
  );
}
