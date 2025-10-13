import { MatchedListing } from "@/components/matching/types";

export const mockAIMatchings: MatchedListing[] = [
  {
    id: "ai-match-1",
    title: "MacBook Pro M3 16-inch - Excellent Condition",
    description: "Professional-grade laptop for video editing. Barely used, comes with original box and accessories. Perfect for creative professionals.",
    price: 8500,
    originalAsk: 9000,
    images: ["https://via.placeholder.com/400x300"],
    tags: ["Electronics", "Laptop", "Apple", "M3", "MacBook Pro"],
    location: "Kuala Lumpur",
    timeAgo: "2 hours ago",
    seller: "John Doe",
    type: "sell",
    category: "Electronics",
    matchScore: 95,
    matchReasons: [
      "Price matches your budget range",
      "Located in your preferred area",
      "High seller rating and verified account"
    ]
  },
  {
    id: "ai-match-2",
    title: "MacBook Pro M3 14-inch - Like New",
    description: "Lightly used MacBook Pro perfect for creative work. 512GB SSD, 16GB RAM. Upgraded recently.",
    price: 7800,
    originalAsk: 8500,
    images: ["https://via.placeholder.com/400x300"],
    tags: ["Electronics", "Laptop", "Apple", "M3"],
    location: "Petaling Jaya",
    timeAgo: "5 hours ago",
    seller: "Jane Smith",
    type: "sell",
    category: "Electronics",
    matchScore: 88,
    matchReasons: [
      "Similar specifications to your request",
      "Within your budget",
      "Nearby location for easy pickup"
    ]
  },
  {
    id: "ai-match-3",
    title: "MacBook Pro M2 16-inch - Great Deal",
    description: "Previous generation but still powerful. Great condition, well maintained. Includes AppleCare+ warranty.",
    price: 6500,
    originalAsk: 7000,
    images: ["https://via.placeholder.com/400x300"],
    tags: ["Electronics", "Laptop", "Apple", "M2"],
    location: "Shah Alam",
    timeAgo: "1 day ago",
    seller: "Tech Store",
    type: "sell",
    category: "Electronics",
    matchScore: 75,
    matchReasons: [
      "Good value for money",
      "Trusted seller with warranty",
      "Still meets your requirements"
    ]
  },
  {
    id: "ai-match-4",
    title: "MacBook Pro M3 Pro - Professional Setup",
    description: "Top-tier configuration with 32GB RAM and 1TB SSD. Used for professional video editing. Pristine condition.",
    price: 9500,
    originalAsk: 10000,
    images: ["https://via.placeholder.com/400x300"],
    tags: ["Electronics", "Laptop", "Apple", "M3 Pro", "Professional"],
    location: "Kuala Lumpur",
    timeAgo: "3 hours ago",
    seller: "Creative Studio",
    type: "sell",
    category: "Electronics",
    matchScore: 82,
    matchReasons: [
      "Professional-grade specs exceed requirements",
      "Same location for easy meetup",
      "Seller is reputable creative agency"
    ]
  },
  {
    id: "ai-match-5",
    title: "MacBook Pro M3 Max - Ultimate Performance",
    description: "Highest spec M3 Max chip for heavy video editing and 3D work. 64GB RAM, 2TB SSD. Barely used, 2 months old.",
    price: 11000,
    originalAsk: 12000,
    images: ["https://via.placeholder.com/400x300"],
    tags: ["Electronics", "Laptop", "Apple", "M3 Max", "High-end"],
    location: "Subang Jaya",
    timeAgo: "6 hours ago",
    seller: "Production House",
    type: "sell",
    category: "Electronics",
    matchScore: 70,
    matchReasons: [
      "Premium specs for professional work",
      "Nearly new condition",
      "Seller is established production company"
    ]
  },
];

export const userAIListing: MatchedListing = {
  id: "user-listing",
  title: "Looking for MacBook Pro M3 for Video Editing",
  description: "I need a MacBook Pro M3 for professional video editing work. Must be in excellent condition with at least 16GB RAM.",
  price: 8000,
  originalAsk: 8000,
  images: ["https://via.placeholder.com/400x300"],
  tags: ["Electronics", "Laptop", "Wanted", "MacBook"],
  location: "Kuala Lumpur",
  timeAgo: "1 day ago",
  seller: "You",
  type: "buy",
  category: "Electronics",
  matchScore: 0,
  matchReasons: []
};
