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

export interface AIMatchingProps {
  userMode: "buyer" | "seller";
  userListings: unknown[];
  availableListings: unknown[];
  onMatch: (listing: MatchedListing, action: "like" | "pass") => void;
  onMessage: (listing: MatchedListing) => void;
  onViewDetails: (listing: MatchedListing) => void;
  onClose: () => void;
}

export type SortOption = "match-score" | "price-low" | "price-high" | "recent" | "location";
export type ColumnType = "queue" | "liked" | "passed";
