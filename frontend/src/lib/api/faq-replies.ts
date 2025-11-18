/**
 * FAQ Reply API Client Functions
 *
 * Provides functions to interact with FAQ reply endpoints
 */

import { AxiosInstance } from "axios";

const API_BASE = "/api/v1/faq-replies/";

/**
 * FAQ Reply interfaces matching backend schemas
 */
export interface FAQReply {
  id: number;
  faq_id: number;
  parent_reply_id: number | null;
  user_id: number | null;
  username: string;
  text: string;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  replies?: FAQReply[]; // Nested replies
}

export interface CreateReplyRequest {
  faq_id: number;
  parent_reply_id?: number | null;
  text: string;
}

export interface UpdateReplyRequest {
  text?: string;
  helpful_count?: number;
  not_helpful_count?: number;
}

/**
 * Create a new reply to an FAQ or another reply
 */
export async function createReply(
  apiClient: AxiosInstance,
  data: CreateReplyRequest
): Promise<FAQReply> {
  const response = await apiClient.post<FAQReply>(`${API_BASE}`, data);
  return response.data;
}

/**
 * Get all replies for a specific FAQ (in nested tree structure)
 */
export async function fetchRepliesByFAQId(
  apiClient: AxiosInstance,
  faqId: number
): Promise<FAQReply[]> {
  const response = await apiClient.get<FAQReply[]>(`${API_BASE}faq/${faqId}`);
  return response.data;
}

/**
 * Get a single reply by ID
 */
export async function fetchReplyById(
  apiClient: AxiosInstance,
  replyId: number
): Promise<FAQReply> {
  const response = await apiClient.get<FAQReply>(`${API_BASE}${replyId}`);
  return response.data;
}

/**
 * Update a reply
 */
export async function updateReply(
  apiClient: AxiosInstance,
  replyId: number,
  data: UpdateReplyRequest
): Promise<FAQReply> {
  const response = await apiClient.patch<FAQReply>(
    `${API_BASE}${replyId}`,
    data
  );
  return response.data;
}

/**
 * Delete a reply (author only)
 */
export async function deleteReply(
  apiClient: AxiosInstance,
  replyId: number
): Promise<void> {
  await apiClient.delete(`${API_BASE}${replyId}`);
}

/**
 * Vote on a reply (helpful/not helpful)
 */
export async function voteReply(
  apiClient: AxiosInstance,
  replyId: number,
  helpful: boolean
): Promise<FAQReply> {
  const currentReply = await fetchReplyById(apiClient, replyId);

  const updateData: UpdateReplyRequest = helpful
    ? { helpful_count: currentReply.helpful_count + 1 }
    : { not_helpful_count: currentReply.not_helpful_count + 1 };

  return updateReply(apiClient, replyId, updateData);
}
