export interface Answer {
  id: string;
  user: string;
  text: string;
  isAccepted?: boolean;
  likes?: number;
  dislikes?: number;
  replies?: Answer[];
}

export interface Question {
  id: string;
  question: string;
  description: string;
  answers: Answer[];
  isAnsweredByPoster: boolean;
}

export type VoteType = "like" | "dislike" | null;