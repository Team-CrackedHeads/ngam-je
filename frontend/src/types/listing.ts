/**
 * Listing type definitions matching backend API
 */

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// Backend API response format (snake_case)
export interface Listing {
  id: number;
  user_id: number;
  thread_id: number;
  title: string;
  description: string;
  price: number;
  min_price: number | null;
  max_price: number | null;
  currency: string;
  listing_type: "sale" | "wanted"; // "sale" = WTS/sell, "wanted" = WTB/buy
  category: string;
  image_url: string | null;
  gallery: string[];
  tags: string[];
  views: number;
  protected: boolean;
  creator_name: string | null;
  creator_location: string | null;
  creator_verified: boolean;
  shipping_options: string[];
  inventory_quantity: number | null;
  ownership_proof_url: string | null;
  faqs: FAQ[];
  is_active: boolean;
  is_matched: boolean;
  is_checked_out: boolean;
  created_at: string;
  updated_at: string;
}

// Request format for creating a listing
export interface ListingCreate {
  thread_id: number; // REQUIRED - connects listing to thread
  title: string;
  description: string;
  price: number;
  min_price?: number | null;
  max_price?: number | null;
  currency?: string;
  listing_type: "sale" | "wanted";
  image_url?: string | null;
  gallery?: string[];
  tags?: string[];
  protected?: boolean;
  creator_location?: string | null;
  shipping_options?: string[];
  inventory_quantity?: number | null;
  ownership_proof_url?: string | null;
  faqs?: FAQ[];
}

// Request format for updating a listing
export interface ListingUpdate {
  title?: string;
  description?: string;
  price?: number;
  min_price?: number | null;
  max_price?: number | null;
  currency?: string;
  listing_type?: "sale" | "wanted";
  image_url?: string | null;
  gallery?: string[];
  tags?: string[];
  protected?: boolean;
  creator_location?: string | null;
  is_active?: boolean;
  is_matched?: boolean;
  shipping_options?: string[];
  inventory_quantity?: number | null;
  ownership_proof_url?: string | null;
  faqs?: FAQ[];
}

// API list response
export interface ListingListResponse {
  listings: Listing[];
  total: number;
}
