export interface MatchedListing {
  id: string;
  title: string;
  description: string;
  price: number;
  originalAsk?: number;
  images: string[];
  tags: string[];
  location: string;
  timeAgo: string;
  seller: string;
  type: "sell" | "buy";
  category: string;
  matchScore: number;
  matchReasons: string[];
}

export interface ListingType {
  id: number | string;
  title: string;
  description: string;
  price?: string | number;
  budget?: string | number;
  images?: string[];
  tags?: string[];
  location: string;
  timestamp?: string;
  seller?: string;
  type: "sell" | "buy";
  category: string;
}

export interface AIMatchingProps {
  userMode: "buyer" | "seller";
  userListings: ListingType[];
  availableListings: ListingType[];
  onMatch: (listing: MatchedListing, action: "like" | "pass") => void;
  onMessage: (listing: MatchedListing) => void;
  onViewDetails: (listing: MatchedListing) => void;
  onClose: () => void;
}

export type SortOption = "match-score" | "price-low" | "price-high" | "recent" | "location";
export type ColumnType = "queue" | "liked" | "passed";
