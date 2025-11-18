/**
 * Threads API client
 * All functions for interacting with the threads endpoints
 */

import { AxiosInstance } from "axios";
import { Thread } from "@/types/thread";

const API_BASE = "/api/v1/threads/";

/**
 * Fetch all threads with optional filters
 */
export async function fetchThreads(
  apiClient: AxiosInstance,
  params?: {
    skip?: number;
    limit?: number;
    category?: string;
    is_active?: boolean;
  }
): Promise<{ threads: Thread[]; total: number }> {
  const response = await apiClient.get<{ threads: Thread[]; total: number }>(
    API_BASE,
    { params }
  );
  return response.data;
}

/**
 * Fetch a single thread by ID
 */
export async function fetchThreadById(
  apiClient: AxiosInstance,
  threadId: number
): Promise<Thread> {
  const response = await apiClient.get<Thread>(`${API_BASE}/${threadId}`);
  return response.data;
}

/**
 * Create a new thread (requires authentication)
 */
export async function createThread(
  apiClient: AxiosInstance,
  data: {
    title: string;
    description: string;
    category: string;
    image_url?: string;
    tags?: string[];
  }
): Promise<Thread> {
  const response = await apiClient.post<Thread>(API_BASE, data);
  return response.data;
}

/**
 * Update an existing thread (requires authentication & ownership)
 */
export async function updateThread(
  apiClient: AxiosInstance,
  threadId: number,
  data: {
    title?: string;
    description?: string;
    category?: string;
    image_url?: string;
    tags?: string[];
    is_active?: boolean;
  }
): Promise<Thread> {
  const response = await apiClient.put<Thread>(
    `${API_BASE}/${threadId}`,
    data
  );
  return response.data;
}

/**
 * Delete a thread (soft delete, requires authentication & ownership)
 */
export async function deleteThread(
  apiClient: AxiosInstance,
  threadId: number
): Promise<void> {
  await apiClient.delete(`${API_BASE}/${threadId}`);
}

/**
 * Contribute to a thread (boost its tier)
 */
export async function contributeToThread(
  apiClient: AxiosInstance,
  threadId: number,
  contributionAmount: number
): Promise<Thread> {
  const response = await apiClient.post<Thread>(
    `${API_BASE}/${threadId}/contribute`,
    { contribution_amount: contributionAmount }
  );
  return response.data;
}
