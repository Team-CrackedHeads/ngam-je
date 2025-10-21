// Mock data for listing matches
import { Listing, mockSaleListings, mockWantedListings } from "./mock-listings-data";

export type MatchQuality = "excellent" | "good" | "possible";

export interface MatchReason {
  type: "category" | "price" | "location" | "keyword" | "timing";
  label: string;
  matched: boolean;
  details?: string;
}

export interface ListingMatch {
  id: string;
  yourListingId: number;
  matchedListing: Listing;
  matchScore: number; // 0-100
  matchQuality: MatchQuality;
  matchReasons: MatchReason[];
  distance?: string; // e.g., "5km away"
  createdAt: string;
  status: "new" | "contacted" | "dismissed";
  compatibility: {
    priceMatch: boolean;
    locationMatch: boolean;
    categoryMatch: boolean;
  };
}

// Generate mock matches for a specific listing
export function generateMatchesForListing(
  listingId: number,
  listingType: "sale" | "wanted" | "matched"
): ListingMatch[] {
  const yourListing = listingType === "sale"
    ? mockSaleListings.find(l => l.id === listingId)
    : mockWantedListings.find(l => l.id === listingId);

  if (!yourListing) return [];

  // Generate matches based on the listing
  const matches: ListingMatch[] = [];

  // For demo purposes, create some matches
  if (listingId === 1 && listingType === "sale") {
    // iPhone 14 Pro listing matches
    matches.push({
      id: "match-1",
      yourListingId: 1,
      matchedListing: mockWantedListings[4], // iPhone 15 Pro Max wanted
      matchScore: 95,
      matchQuality: "excellent",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Same location", matched: true, details: "Kuala Lumpur" },
        { type: "price", label: "Price compatible", matched: true, details: "Within budget range" },
        { type: "keyword", label: "Similar product", matched: true, details: "iPhone Pro series" },
      ],
      distance: "Same city",
      createdAt: "2025-10-10T09:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: true,
        locationMatch: true,
        categoryMatch: true,
      }
    });

    matches.push({
      id: "match-2",
      yourListingId: 1,
      matchedListing: mockWantedListings[0], // MacBook Pro wanted
      matchScore: 72,
      matchQuality: "good",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Same location", matched: true, details: "Kuala Lumpur" },
        { type: "price", label: "Different price range", matched: false, details: "Price gap: RM 5,100" },
        { type: "keyword", label: "Related products", matched: true, details: "Apple ecosystem" },
      ],
      distance: "Same city",
      createdAt: "2025-10-10T08:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: false,
        locationMatch: true,
        categoryMatch: true,
      }
    });

    matches.push({
      id: "match-3",
      yourListingId: 1,
      matchedListing: mockWantedListings[7], // Smartwatch wanted
      matchScore: 68,
      matchQuality: "possible",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Nearby location", matched: true, details: "Ampang" },
        { type: "price", label: "Lower budget", matched: false, details: "Price gap: RM 1,700" },
        { type: "keyword", label: "Related products", matched: true, details: "Apple products" },
      ],
      distance: "12km away",
      createdAt: "2025-10-09T15:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: false,
        locationMatch: true,
        categoryMatch: true,
      }
    });
  } else if (listingId === 2 && listingType === "sale") {
    // MacBook Air listing matches
    matches.push({
      id: "match-4",
      yourListingId: 2,
      matchedListing: mockWantedListings[0], // MacBook Pro wanted
      matchScore: 92,
      matchQuality: "excellent",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Nearby location", matched: true, details: "Kuala Lumpur & Petaling Jaya" },
        { type: "price", label: "Price match", matched: true, details: "Within budget" },
        { type: "keyword", label: "Exact product match", matched: true, details: "MacBook series" },
      ],
      distance: "3km away",
      createdAt: "2025-10-10T07:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: true,
        locationMatch: true,
        categoryMatch: true,
      }
    });

    matches.push({
      id: "match-5",
      yourListingId: 2,
      matchedListing: mockWantedListings[5], // Gaming Monitor wanted
      matchScore: 65,
      matchQuality: "possible",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Computing" },
        { type: "location", label: "Different location", matched: false, details: "Cyberjaya" },
        { type: "price", label: "Lower budget", matched: false, details: "Price gap: RM 2,125" },
      ],
      distance: "18km away",
      createdAt: "2025-10-09T12:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: false,
        locationMatch: false,
        categoryMatch: true,
      }
    });
  } else if (listingId === 1 && listingType === "wanted") {
    // Want MacBook Pro - show for sale listings
    matches.push({
      id: "match-6",
      yourListingId: 1,
      matchedListing: mockSaleListings[1], // MacBook Air for sale
      matchScore: 88,
      matchQuality: "good",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Nearby location", matched: true, details: "Petaling Jaya" },
        { type: "price", label: "Close to budget", matched: true, details: "Slightly lower than budget" },
        { type: "keyword", label: "Similar product", matched: true, details: "MacBook series" },
      ],
      distance: "3km away",
      createdAt: "2025-10-10T06:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: true,
        locationMatch: true,
        categoryMatch: true,
      }
    });
  }

  // Sort by match score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

// Get all matches for all user's listings
export function getAllUserMatches(userListingIds: number[]): Map<number, ListingMatch[]> {
  const allMatches = new Map<number, ListingMatch[]>();

  userListingIds.forEach(id => {
    // Determine if this is a sale or wanted listing
    const isSaleListing = mockSaleListings.some(l => l.id === id);
    const matches = generateMatchesForListing(id, isSaleListing ? "sale" : "wanted");
    if (matches.length > 0) {
      allMatches.set(id, matches);
    }
  });

  return allMatches;
}

// Get total match count for a listing
export function getMatchCount(listingId: number, listingType: "buy" | "sell"): number {
  const mappedType = listingType === "sell" ? "sale" : "wanted";
  return generateMatchesForListing(listingId, mappedType).length;
}
