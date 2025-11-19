/**
 * FAQ API Client Functions
 *
 * Provides functions to interact with FAQ endpoints
 */

import { AxiosInstance } from "axios";

const API_BASE = "/api/v1/faqs/";

/**
 * FAQ interfaces matching backend schemas
 */
export interface FAQ {
  id: number;
  listing_id: number;
  question_user_id: number | null;
  answer_user_id: number | null;
  question: string;
  question_username: string | null;
  answer: string | null;
  answer_username: string | null;
  is_answered: boolean;
  is_accepted: boolean;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionRequest {
  listing_id: number;
  question: string;
}

export interface CreateAnswerRequest {
  answer: string;
}

export interface UpdateFAQRequest {
  is_accepted?: boolean;
  helpful_count?: number;
  not_helpful_count?: number;
}

/**
 * Create a new question for a listing
 */
export async function createQuestion(
  apiClient: AxiosInstance,
  data: CreateQuestionRequest
): Promise<FAQ> {
  const response = await apiClient.post<FAQ>(`${API_BASE}questions`, data);
  return response.data;
}

/**
 * Answer a question (listing owner only)
 */
export async function answerQuestion(
  apiClient: AxiosInstance,
  faqId: number,
  data: CreateAnswerRequest
): Promise<FAQ> {
  const response = await apiClient.post<FAQ>(
    `${API_BASE}${faqId}/answer`,
    data
  );
  return response.data;
}

/**
 * Response type for listing FAQs endpoint
 */
export interface FAQListResponse {
  faqs: FAQ[];
  total: number;
}

/**
 * Get all FAQs for a specific listing
 */
export async function fetchFAQsByListingId(
  apiClient: AxiosInstance,
  listingId: number
): Promise<FAQ[]> {
  const response = await apiClient.get<FAQListResponse>(
    `${API_BASE}listing/${listingId}`
  );
  return response.data.faqs; // Extract the faqs array from the response
}

/**
 * Get a single FAQ by ID
 */
export async function fetchFAQById(
  apiClient: AxiosInstance,
  faqId: number
): Promise<FAQ> {
  const response = await apiClient.get<FAQ>(`${API_BASE}${faqId}`);
  return response.data;
}

/**
 * Update an FAQ (mark as accepted, update votes)
 */
export async function updateFAQ(
  apiClient: AxiosInstance,
  faqId: number,
  data: UpdateFAQRequest
): Promise<FAQ> {
  const response = await apiClient.patch<FAQ>(`${API_BASE}${faqId}`, data);
  return response.data;
}

/**
 * Delete an FAQ (author only)
 */
export async function deleteFAQ(
  apiClient: AxiosInstance,
  faqId: number
): Promise<void> {
  await apiClient.delete(`${API_BASE}${faqId}`);
}

/**
 * Vote on an FAQ answer (helpful/not helpful)
 */
export async function voteFAQ(
  apiClient: AxiosInstance,
  faqId: number,
  helpful: boolean
): Promise<FAQ> {
  const currentFAQ = await fetchFAQById(apiClient, faqId);

  const updateData: UpdateFAQRequest = helpful
    ? { helpful_count: currentFAQ.helpful_count + 1 }
    : { not_helpful_count: currentFAQ.not_helpful_count + 1 };

  return updateFAQ(apiClient, faqId, updateData);
}

/**
 * Mark an FAQ answer as accepted (listing owner only)
 */
export async function markFAQAsAccepted(
  apiClient: AxiosInstance,
  faqId: number
): Promise<FAQ> {
  return updateFAQ(apiClient, faqId, { is_accepted: true });
}

// =====================================================
// AI FAQ Bot Endpoints
// =====================================================

const AI_BOT_BASE = "/api/v1/faq-bot";

/**
 * AI FAQ Bot interfaces
 */
export interface AIFAQRequest {
  listing_id: number;
  question: string;
  user_id?: number;
}

export interface AIWidgetResponse {
  summary: string;
  key_features?: string[];
  common_questions?: string[];
}

export interface AIFAQResponse {
  status: "found" | "created";
  message: string;
  data: FAQ;
  category?: string;
}

/**
 * Ask AI assistant a question about a listing
 * Uses semantic search to find similar questions, or generates an AI answer
 */
export async function askAIQuestion(
  apiClient: AxiosInstance,
  data: AIFAQRequest
): Promise<AIFAQResponse> {
  const response = await apiClient.post<AIFAQResponse>(`${AI_BOT_BASE}/ask`, data);
  return response.data;
}

/**
 * Get AI-generated summary widget for a listing
 * Generates a comprehensive summary with key features and common questions
 */
export async function getAISummary(
  apiClient: AxiosInstance,
  listingId: number
): Promise<AIWidgetResponse> {
  const response = await apiClient.get<AIWidgetResponse>(`${AI_BOT_BASE}/summary/${listingId}`);
  return response.data;
}
