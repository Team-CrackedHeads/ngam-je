import { UnifiedListingData } from './mock-threads-data';

// In-memory storage for new listings (in a real app, this would be a database/API call)
let newListings: UnifiedListingData[] = [];

export function addNewListing(listing: UnifiedListingData): string {
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

// Convert form data to UnifiedListingData format
export function convertFormToListing(
  formData: any,
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
    title: formData.generatedTitle || 'Untitled Listing',
    subtitle: isBuy ? `Budget ${formData.currency} ${formData.minPrice} - ${formData.maxPrice}` : undefined,
    description: formData.generatedDescription || '',
    price: parseFloat(isBuy ? formData.maxPrice : formData.minPrice) || 0,
    currency: formData.currency || 'MYR',
    seller: {
      name: 'You', // In real app, get from auth context
      location: formData.location || 'Not specified',
      verified: isBuy ? false : (formData.ownershipProofImage ? true : false),
      timePosted: 'Just now',
    },
    imageUrl: images && images.length > 0 ? images[0] : '',
    gallery: images && images.length > 1 ? images.slice(1) : undefined,
    category: category,
    listingType: isBuy ? 'wanted' : 'sale',
    tags: formData.tags || [],
    views: 0,
    protected: false,
  };
}
