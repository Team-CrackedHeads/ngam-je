/**
 * Listings API client
 * All functions for interacting with the listings endpoints
 */

import { AxiosInstance } from "axios";
import {
  Listing,
  ListingCreate,
  ListingUpdate,
  ListingListResponse,
} from "@/types/listing";

const API_BASE = "/api/v1/listings/";

/**
 * Fetch all listings with optional filters
 */
export async function fetchListings(
  apiClient: AxiosInstance,
  params?: {
    skip?: number;
    limit?: number;
    listing_type?: "sale" | "wanted";
    thread_id?: number; // IMPORTANT: Filter by thread
    is_active?: boolean;
  }
): Promise<ListingListResponse> {
  const response = await apiClient.get<ListingListResponse>(API_BASE, {
    params,
  });
  return response.data;
}

/**
 * Fetch a single listing by ID
 * Automatically increments view count
 */
export async function fetchListingById(
  apiClient: AxiosInstance,
  listingId: number
): Promise<Listing> {
  const response = await apiClient.get<Listing>(`${API_BASE}/${listingId}`);
  return response.data;
}

/**
 * Create a new listing (requires authentication)
 */
export async function createListing(
  apiClient: AxiosInstance,
  data: ListingCreate
): Promise<Listing> {
  const response = await apiClient.post<Listing>(API_BASE, data);
  return response.data;
}

/**
 * Update an existing listing (requires authentication & ownership)
 */
export async function updateListing(
  apiClient: AxiosInstance,
  listingId: number,
  data: ListingUpdate
): Promise<Listing> {
  const response = await apiClient.put<Listing>(
    `${API_BASE}/${listingId}`,
    data
  );
  return response.data;
}

/**
 * Delete a listing (soft delete, requires authentication & ownership)
 */
export async function deleteListing(
  apiClient: AxiosInstance,
  listingId: number
): Promise<void> {
  await apiClient.delete(`${API_BASE}/${listingId}`);
}

/**
 * Fetch all listings for a specific user
 */
export async function fetchUserListings(
  apiClient: AxiosInstance,
  userId: number,
  params?: {
    skip?: number;
    limit?: number;
    listing_type?: "sale" | "wanted";
    is_active?: boolean;
  }
): Promise<ListingListResponse> {
  const response = await apiClient.get<ListingListResponse>(
    `${API_BASE}/user/${userId}`,
    { params }
  );
  return response.data;
}

/**
 * Confirm checkout for a matched listing
 * Marks both listings in the match as checked out
 */
export async function confirmCheckout(
  apiClient: AxiosInstance,
  listingId: number,
  data: {
    recommendation_id: number;
    transaction_method: string;
    delivery_address?: string;
    payment_method?: string;
  }
): Promise<Listing> {
  const response = await apiClient.post<Listing>(
    `${API_BASE}/${listingId}/checkout`,
    data
  );
  return response.data;
}
