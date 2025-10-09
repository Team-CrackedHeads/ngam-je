// Mock data for listing matches
import { Listing, mockBuyListings, mockSellListings } from "./mock-listings-data";

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

// Helper function to determine match quality from score
function getMatchQuality(score: number): MatchQuality {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  return "possible";
}

// Generate mock matches for a specific listing
export function generateMatchesForListing(
  listingId: number,
  listingType: "buy" | "sell"
): ListingMatch[] {
  const yourListing = listingType === "buy"
    ? mockBuyListings.find(l => l.id === listingId)
    : mockSellListings.find(l => l.id === listingId);

  if (!yourListing) return [];

  // Get opposite type listings (if you're selling, show buyers and vice versa)
  const potentialMatches = listingType === "buy" ? mockSellListings : mockBuyListings;

  // Generate matches based on the listing
  const matches: ListingMatch[] = [];

  // For demo purposes, create some matches
  if (listingId === 1 && listingType === "buy") {
    // iPhone 14 Pro listing matches
    matches.push({
      id: "match-1",
      yourListingId: 1,
      matchedListing: mockSellListings[4], // iPhone 15 Pro Max wanted
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
      matchedListing: mockSellListings[0], // MacBook Pro wanted
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
      matchedListing: mockSellListings[7], // Smartwatch wanted
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
  } else if (listingId === 2 && listingType === "buy") {
    // MacBook Air listing matches
    matches.push({
      id: "match-4",
      yourListingId: 2,
      matchedListing: mockSellListings[0], // MacBook Pro wanted
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
      matchedListing: mockSellListings[5], // Gaming Monitor wanted
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
  } else if (listingId === 1 && listingType === "sell") {
    // Want MacBook Pro - show for sale listings
    matches.push({
      id: "match-6",
      yourListingId: 1,
      matchedListing: mockBuyListings[1], // MacBook Air for sale
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
    // Determine if this is a buy or sell listing
    const isBuyListing = mockBuyListings.some(l => l.id === id);
    const matches = generateMatchesForListing(id, isBuyListing ? "buy" : "sell");
    if (matches.length > 0) {
      allMatches.set(id, matches);
    }
  });

  return allMatches;
}

// Get total match count for a listing
export function getMatchCount(listingId: number, listingType: "buy" | "sell"): number {
  return generateMatchesForListing(listingId, listingType).length;
}
