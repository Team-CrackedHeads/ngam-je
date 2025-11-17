import { UnifiedListingData } from './mock-all-data-used';

// In-memory storage for new listings (in a real app, this would be a database/API call)
let newListings: UnifiedListingData[] = [];

export function addNewListing(listing: UnifiedListingData): string | number {
  newListings.push(listing);
  return listing.id;
}

export function getNewListings(): UnifiedListingData[] {
  return newListings;
}

export function clearNewListings(): void {
  newListings = [];
}

// Generate a unique ID for a new listing
export function generateListingId(category: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${category}-${timestamp}-${random}`;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FormData {
  generatedTitle?: string;
  generatedDescription?: string;
  generatedImages?: string[];
  uploadedImages?: string[];
  ownershipProofImage?: string | null;
  currency?: string;
  minPrice?: string;
  maxPrice?: string;
  tags?: string[];
  shippingOptions?: string[];
  faqs?: FAQ[];
  quantity?: string;
  inventoryQuantity?: string;
  location?: string;
}

// Convert form data to UnifiedListingData format
export function convertFormToListing(
  formData: FormData,
  listingType: 'buy' | 'sell',
  threadCategory?: string
): Omit<UnifiedListingData, 'id'> {
  const isBuy = listingType === 'buy';
  const images = isBuy ? formData.generatedImages : formData.uploadedImages;

  // Use the thread category if provided, otherwise try to infer from tags, or default to 'general'
  const category = threadCategory ||
    (formData.tags && formData.tags.length > 0
      ? formData.tags[0].toLowerCase().replace(/\s+/g, '-')
      : 'general');

  return {
    userId: 'user-1', // TODO: Get from auth context when authentication is implemented
    title: formData.generatedTitle || 'Untitled Listing',
    subtitle: isBuy ? `Budget ${formData.currency} ${formData.minPrice} - ${formData.maxPrice}` : undefined,
    description: formData.generatedDescription || '',
    price: parseFloat(isBuy ? (formData.maxPrice || '0') : (formData.minPrice || '0')) || 0,
    currency: formData.currency || 'MYR',
    seller: {
      name: 'You', // In real app, get from auth context
      location: formData.location || 'Not specified',
      verified: isBuy ? false : (formData.ownershipProofImage ? true : false),
      timePosted: 'Just now',
    },
    imageUrl: images && images.length > 0 ? images[0] : '',
    gallery: images && images.length > 1 ? images.slice(1) : [],
    category: category,
    listingType: isBuy ? 'wanted' : 'sale',
    tags: formData.tags || [],
    views: 0,
    protected: false,
  };
}
