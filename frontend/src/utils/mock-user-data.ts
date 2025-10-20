export interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  rating: number;
  ratingCount: number;
  totalListings: number;
  completedDeals: number;
  avatar?: string;
  joinedDate: string;
}

export const MOCK_USER: User = {
  id: "user-001",
  name: "John Michael Smith",
  email: "user@example.com",
  verified: true,
  rating: 4.8,
  ratingCount: 24,
  totalListings: 12,
  completedDeals: 28,
  joinedDate: "Jan 1, 2024",
};

// Additional mock users for testing
export const MOCK_USERS: User[] = [
  MOCK_USER,
  {
    id: "user-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    verified: true,
    rating: 4.9,
    ratingCount: 47,
    totalListings: 23,
    completedDeals: 56,
    joinedDate: "Dec 15, 2023",
  },
  {
    id: "user-003",
    name: "Alex Chen",
    email: "alex.chen@example.com",
    verified: false,
    rating: 4.2,
    ratingCount: 8,
    totalListings: 5,
    completedDeals: 12,
    joinedDate: "Mar 20, 2024",
  },
];
