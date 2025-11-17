/**
 * Thread types matching backend API response (snake_case from API)
 */

export interface Thread {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  tags: string[];
  tier: number;
  contributions: number;
  active_contributions: number;
  boost_expires_at: string | null;
  member_count: number;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
  online_users: number;
}

export interface ThreadListResponse {
  threads: Thread[];
  total: number;
}

/**
 * Thread display type for frontend components (camelCase)
 * Used by UI components and mock data
 */
export interface ThreadDisplay {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  comments: number;
  views: number;
  upvotes: number;
  currentTokens: number;
  goalTokens: number;
  tags: string[];
  isPinned: boolean;
  isHot: boolean;
  timeAgo: string;
  contributions: number;
  category: string;
  tier?: number;
  onlineUsers?: number;
  totalUsers?: number;
}
