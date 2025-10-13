"use client";
import { useParams, useRouter } from "next/navigation";
import { BreadcrumbNav } from "@/app/components/threads-product-ui/BreadcrumbNav";
import { ProductDetails } from "@/app/components/threads-product-ui/ProductDetails";
// Import unified data instead
import { getListingById } from "@/utils/mock-threads-data";

// Main Product Listing Screen
export default function ProductListingScreen() {
  const params = useParams();
  const router = useRouter();

  // Get the listing ID from URL params
  const listingId = params.listingId as string;
  const category = params.threadCategory as string;

  // Find the specific listing by ID
  const listing = getListingById(listingId);

  // Handle back navigation
  const handleBack = () => {
    router.push(`/threads/${category}`);
  };

  // Show error if listing not found
  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Listing Not Found
          </h1>
          <p className="text-gray-600 mt-2">
            The listing you're looking for doesn't exist.
          </p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Back to {category}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pb-32 bg-primary-50">
      <div className="container mx-auto px-4 py-6">
        <BreadcrumbNav
          category={category}
          listingTitle={listing.title}
          listingType={listing.listingType}
        />
        {/* Pass the dynamic listing data */}
        <ProductDetails listing={listing} />
      </div>
    </div>
  );
}