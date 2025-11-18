/**
 * Recommendations API client
 * All functions for interacting with the recommendations endpoints
 */

import { AxiosInstance } from "axios";

const API_BASE = "/api/v1/recommendations/";

export interface Recommendation {
  id: number;
  source_listing_id: number;
  target_listing_id: number;
  created_by_user_id: number | null;
  recommendation_type: "ai_match" | "user_offer" | "similar";
  match_score: number;
  match_reasons: string[] | null;
  status: "pending" | "liked_by_source" | "liked_by_target" | "matched" | "checkout_by_source" | "checkout_by_target" | "completed" | "rejected" | "expired";
  message: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface RecommendationListResponse {
  recommendations: Recommendation[];
  total: number;
}

export interface RecommendationCreate {
  source_listing_id: number;
  target_listing_id: number;
  recommendation_type?: "ai_match" | "user_offer" | "similar";
  match_score?: number;
  match_reasons?: string[];
  message?: string;
}

export interface RecommendationUpdate {
  status?: "pending" | "liked_by_source" | "liked_by_target" | "matched" | "checkout_by_source" | "checkout_by_target" | "completed" | "rejected" | "expired";
  match_score?: number;
  match_reasons?: string[];
}

/**
 * Fetch all recommendations for a specific listing
 */
export async function fetchListingRecommendations(
  apiClient: AxiosInstance,
  listingId: number,
  statusFilter?: string
): Promise<RecommendationListResponse> {
  const params = statusFilter ? { status_filter: statusFilter } : {};
  const response = await apiClient.get<RecommendationListResponse>(
    `${API_BASE}/listing/${listingId}`,
    { params }
  );
  return response.data;
}

/**
 * Fetch only MATCHED recommendations for a listing
 * This is what shows in the "Matched Listings" section
 */
export async function fetchMatchedListings(
  apiClient: AxiosInstance,
  listingId: number
): Promise<RecommendationListResponse> {
  const response = await apiClient.get<RecommendationListResponse>(
    `${API_BASE}/listing/${listingId}/matched`
  );
  return response.data;
}

/**
 * Create a new recommendation (AI or user-initiated)
 */
export async function createRecommendation(
  apiClient: AxiosInstance,
  data: RecommendationCreate
): Promise<Recommendation> {
  const response = await apiClient.post<Recommendation>(API_BASE, data);
  return response.data;
}

/**
 * Like a recommendation (user clicks heart/like)
 */
export async function likeRecommendation(
  apiClient: AxiosInstance,
  recommendationId: number
): Promise<Recommendation> {
  const response = await apiClient.patch<Recommendation>(
    `${API_BASE}/${recommendationId}/like`
  );
  return response.data;
}

/**
 * Checkout a matched recommendation (finalize the deal)
 */
export async function checkoutRecommendation(
  apiClient: AxiosInstance,
  recommendationId: number
): Promise<Recommendation> {
  const response = await apiClient.patch<Recommendation>(
    `${API_BASE}/${recommendationId}/checkout`
  );
  return response.data;
}

/**
 * Reject a recommendation (user clicks pass/X)
 */
export async function rejectRecommendation(
  apiClient: AxiosInstance,
  recommendationId: number
): Promise<Recommendation> {
  const response = await apiClient.patch<Recommendation>(
    `${API_BASE}/${recommendationId}/reject`
  );
  return response.data;
}

/**
 * Update a recommendation (for AI to update match scores)
 */
export async function updateRecommendation(
  apiClient: AxiosInstance,
  recommendationId: number,
  data: RecommendationUpdate
): Promise<Recommendation> {
  const response = await apiClient.patch<Recommendation>(
    `${API_BASE}/${recommendationId}`,
    data
  );
  return response.data;
}

/**
 * Delete a recommendation
 */
export async function deleteRecommendation(
  apiClient: AxiosInstance,
  recommendationId: number
): Promise<void> {
  await apiClient.delete(`${API_BASE}/${recommendationId}`);
}
