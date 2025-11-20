/**
 * AI Chat API Client
 */

import { createClerkApiClient } from '@/lib/clerk-api-client';

export interface ChatMessageRequest {
  message: string;
  conversation_history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ChatMessageResponse {
  content: string;
  links: Array<{
    text: string;
    url: string;
  }>;
}

/**
 * Send a message to the AI chat assistant
 */
export async function sendChatMessage(
  token: string | null,
  message: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ChatMessageResponse> {
  const client = createClerkApiClient(token);
  return client.post<ChatMessageResponse>('/api/v1/ai-chat/chat', {
    message,
    conversation_history: conversationHistory,
  });
}
