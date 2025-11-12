/**
 * Types for messaging system - matches backend API schema
 */

// Backend API Response Types
export interface ConversationResponse {
  id: number;
  recommendation_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  // Enriched data from backend
  other_user_name?: string;
  other_user_id?: number;
  listing_title?: string;
  listing_image?: string;
  my_listing_title?: string;
}

export interface MessageResponse {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  content: string;
  message_type: string; // "text" | "system" | "image"
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationListResponse {
  conversations: ConversationResponse[];
  total: number;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  total: number;
  unread_count: number;
}

// Request Types
export interface MessageCreateRequest {
  conversation_id: number;
  content: string;
  message_type?: string;
}

export interface ConversationCreateRequest {
  recommendation_id: number;
}

// Frontend Display Types (enriched with user/listing data)
export interface ConversationDisplay extends ConversationResponse {
  otherUserName?: string;
  otherUserAvatar?: string;
  listingTitle?: string;
  listingImage?: string;
  listingPrice?: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface MessageDisplay extends MessageResponse {
  senderName?: string;
  isCurrentUser: boolean;
}
