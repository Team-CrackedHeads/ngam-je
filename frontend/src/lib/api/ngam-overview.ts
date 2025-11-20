/**
 * API functions for Ngam Overview (market research)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface NgamOverviewRequest {
  query: string;
  include_images?: boolean;
  max_results?: number;
}

export interface NgamOverviewResponse {
  content: string;
  images?: string[];
  sources?: string[];
  key_points?: string[];
  price_range?: string;
}

export interface FollowUpRequest {
  original_query: string;
  original_content: string;
  followup_question: string;
}

export interface FollowUpResponse {
  answer: string;
}

/**
 * Generate a market overview for an item
 */
export async function generateNgamOverview(
  request: NgamOverviewRequest
): Promise<NgamOverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ngam-overview/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to generate overview" }));
    throw new Error(error.detail || "Failed to generate overview");
  }

  return response.json();
}

/**
 * Ask a follow-up question about the overview
 */
export async function askFollowUpQuestion(
  request: FollowUpRequest
): Promise<FollowUpResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ngam-overview/followup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to answer follow-up" }));
    throw new Error(error.detail || "Failed to answer follow-up question");
  }

  return response.json();
}
