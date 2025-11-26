export interface Answer {
  id: string;
  user: string;
  text: string;
  isAccepted?: boolean;
  likes?: number;
  dislikes?: number;
  replies?: Answer[];
  createdAt?: string;
  userAvatar?: string;
  userRole?: "seller" | "buyer" | "helper" | null;
}

export interface Question {
  id: string;
  question: string;
  description: string;
  answers: Answer[];
  isAnsweredByPoster: boolean;
  createdAt?: string;
  askedBy?: string;
  askedByAvatar?: string;
  lastActivity?: string;
  viewCount?: number;
}

export type VoteType = "like" | "dislike" | null;
