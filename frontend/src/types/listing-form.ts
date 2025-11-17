/**
 * Centralized type definitions for listing forms
 * Used across CreateListingModal, MakeOfferBuy, MakeOfferSell, and related components
 */

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// Common fields shared by both buy and sell forms
interface BaseFormData {
  generatedTitle: string;
  generatedDescription: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  location: string;
  shippingOptions: string[];
  tags: string[];
  faqs: FAQ[];
}

// Buy-specific form data
export interface BuyFormData extends BaseFormData {
  generatedImages: string[];
  quantity: string;
}

// Sell-specific form data
export interface SellFormData extends BaseFormData {
  uploadedImages: string[];
  ownershipProofImage: string | null;
  inventoryQuantity: string;
}

// Union type for components that handle both
export type ListingFormData = BuyFormData | SellFormData;

// Partial version for step components that only use subset of fields
export type PartialFormData = Partial<BuyFormData & SellFormData>;

// Unified listing data for display (used in ProductDetails component)
export interface UnifiedListingData {
  id: number | string; // Support both during migration
  userId: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  currency: string;
  seller: {
    name: string;
    location: string;
    verified: boolean;
    timePosted: string;
  };
  imageUrl: string;
  gallery?: string[];
  category: string;
  listingType: "sale" | "wanted";
  tags: string[];
  views: number;
  protected: boolean; // Listing protection status
  faqs?: FAQ[]; // Optional during migration
  shippingOptions?: string[]; // Optional during migration
}
