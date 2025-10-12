// Shared mock data for listings used across sidebar and listings page

export interface Listing {
  id: number;
  title: string;
  price?: string;
  budget?: string;
  location: string;
  timestamp: string;
  description: string;
  imageUrl?: string;
  views: number;
  likes: number;
  category: string;
  expiresAt: string; // ISO date string
  subscriptionTier: "basic" | "pro" | "enterprise";
  isOwner?: boolean; // Whether current user owns this listing
}

// Mock data for buy listings (items for sale)
export const mockBuyListings: Listing[] = [
  {
    id: 1,
    title: "iPhone 14 Pro - 256GB Space Black",
    price: "RM 3,400",
    location: "Kuala Lumpur",
    timestamp: "2 hours ago",
    description: "Excellent condition, barely used. Comes with original box and charger.",
    imageUrl: "/api/placeholder/300/200",
    views: 45,
    likes: 12,
    category: "Electronics",
    expiresAt: "2025-11-15T10:00:00Z", // 5 days from now
    subscriptionTier: "basic",
    isOwner: true
  },
  {
    id: 2,
    title: "MacBook Air M2 - Like New",
    price: "RM 5,100",
    location: "Petaling Jaya",
    timestamp: "4 hours ago",
    description: "Perfect for students and professionals. 8GB RAM, 256GB SSD.",
    imageUrl: "/api/placeholder/300/200",
    views: 67,
    likes: 23,
    category: "Electronics",
    expiresAt: "2025-12-08T15:30:00Z", // 29 days from now
    subscriptionTier: "pro",
    isOwner: false
  },
  {
    id: 3,
    title: "Sony WH-1000XM4 Noise Cancelling Headphones",
    price: "RM 1,060",
    location: "Selangor",
    timestamp: "6 hours ago",
    description: "Industry-leading noise cancellation. Perfect for travel and work.",
    imageUrl: "/api/placeholder/300/200",
    views: 34,
    likes: 8,
    category: "Audio",
    expiresAt: "2025-10-10T20:00:00Z", // Expired (1 day ago)
    subscriptionTier: "basic",
    isOwner: true
  },
  {
    id: 4,
    title: "Gaming PC - RTX 4070 Build",
    price: "RM 7,650",
    location: "Subang Jaya",
    timestamp: "8 hours ago",
    description: "High-end gaming setup. Runs all latest games at 4K.",
    imageUrl: "/api/placeholder/300/200",
    views: 89,
    likes: 31,
    category: "Computing",
    expiresAt: "2026-01-05T12:00:00Z", // 87 days from now
    subscriptionTier: "enterprise",
    isOwner: false
  },
  {
    id: 5,
    title: "Canon EOS R5 Camera",
    price: "RM 10,625",
    location: "Kuala Lumpur",
    timestamp: "1 day ago",
    description: "Professional camera body with excellent condition.",
    imageUrl: "/api/placeholder/300/200",
    views: 124,
    likes: 45,
    category: "Photography",
    expiresAt: "2025-11-20T14:00:00Z",
    subscriptionTier: "pro",
    isOwner: false
  },
  {
    id: 6,
    title: "iPad Pro 12.9 - 2022",
    price: "RM 3,825",
    location: "Cyberjaya",
    timestamp: "1 day ago",
    description: "Latest iPad Pro with M2 chip and Liquid Retina display.",
    imageUrl: "/api/placeholder/300/200",
    views: 78,
    likes: 22,
    category: "Electronics",
    expiresAt: "2025-12-01T09:30:00Z",
    subscriptionTier: "basic",
    isOwner: true
  },
  {
    id: 7,
    title: "Dyson V15 Vacuum",
    price: "RM 1,700",
    location: "Shah Alam",
    timestamp: "2 days ago",
    description: "Powerful cordless vacuum with laser detection.",
    imageUrl: "/api/placeholder/300/200",
    views: 56,
    likes: 18,
    category: "Home Appliances",
    expiresAt: "2025-11-25T16:45:00Z",
    subscriptionTier: "basic",
    isOwner: false
  },
  {
    id: 8,
    title: "Nintendo Switch OLED",
    price: "RM 1,487",
    location: "Ampang",
    timestamp: "2 days ago",
    description: "Gaming console with vibrant OLED screen.",
    imageUrl: "/api/placeholder/300/200",
    views: 92,
    likes: 35,
    category: "Gaming",
    expiresAt: "2025-12-10T11:20:00Z",
    subscriptionTier: "pro",
    isOwner: false
  },
  {
    id: 9,
    title: "Samsung 4K Monitor 32\"",
    price: "RM 1,912",
    location: "Kuala Lumpur",
    timestamp: "3 days ago",
    description: "Ultra-high definition monitor for professional work.",
    imageUrl: "/api/placeholder/300/200",
    views: 67,
    likes: 19,
    category: "Computing",
    expiresAt: "2025-11-18T13:15:00Z",
    subscriptionTier: "enterprise",
    isOwner: true
  },
  {
    id: 10,
    title: "Mechanical Keyboard - Cherry MX",
    price: "RM 510",
    location: "Petaling Jaya",
    timestamp: "3 days ago",
    description: "Premium mechanical keyboard with tactile switches.",
    imageUrl: "/api/placeholder/300/200",
    views: 43,
    likes: 14,
    category: "Computing",
    expiresAt: "2025-12-05T17:30:00Z",
    subscriptionTier: "basic",
    isOwner: false
  }
];

// Mock data for sell listings (wanted items)
export const mockSellListings: Listing[] = [
  {
    id: 1,
    title: "Looking for: MacBook Pro M3 16-inch",
    budget: "RM 8,500",
    location: "Kuala Lumpur",
    timestamp: "1 hour ago",
    description: "Need for video editing work. Willing to pay good price for excellent condition.",
    imageUrl: "/api/placeholder/300/200",
    views: 23,
    likes: 5,
    category: "Electronics",
    expiresAt: "2025-10-12T08:00:00Z", // 2 days from now (urgent)
    subscriptionTier: "basic",
    isOwner: true
  },
  {
    id: 2,
    title: "Want: Electric Scooter (Xiaomi preferred)",
    budget: "RM 3,400",
    location: "Petaling Jaya",
    timestamp: "3 hours ago",
    description: "Looking for daily commute. Must be in good working condition.",
    imageUrl: "/api/placeholder/300/200",
    views: 19,
    likes: 3,
    category: "Transportation",
    expiresAt: "2025-11-25T14:20:00Z", // 46 days from now
    subscriptionTier: "pro",
    isOwner: false
  },
  {
    id: 3,
    title: "Need: DSLR Camera Body (Canon/Nikon)",
    budget: "RM 6,400",
    location: "Selangor",
    timestamp: "5 hours ago",
    description: "Starting photography business. Looking for professional camera body.",
    imageUrl: "/api/placeholder/300/200",
    views: 41,
    likes: 9,
    category: "Photography",
    expiresAt: "2025-10-13T16:30:00Z", // 3 days from now
    subscriptionTier: "basic",
    isOwner: true
  },
  {
    id: 4,
    title: "Seeking: Herman Miller Office Chair",
    budget: "RM 2,550",
    location: "Subang Jaya",
    timestamp: "7 hours ago",
    description: "Need ergonomic chair for home office. Willing to travel for pickup.",
    imageUrl: "/api/placeholder/300/200",
    views: 15,
    likes: 2,
    category: "Furniture",
    expiresAt: "2026-01-18T11:45:00Z", // 100 days from now
    subscriptionTier: "enterprise",
    isOwner: false
  },
  {
    id: 5,
    title: "Want: iPhone 15 Pro Max",
    budget: "RM 5,525",
    location: "Kuala Lumpur",
    timestamp: "12 hours ago",
    description: "Looking for latest iPhone in excellent condition.",
    imageUrl: "/api/placeholder/300/200",
    views: 87,
    likes: 26,
    category: "Electronics",
    expiresAt: "2025-11-30T10:15:00Z",
    subscriptionTier: "pro",
    isOwner: false
  },
  {
    id: 6,
    title: "Looking for: Gaming Monitor 4K",
    budget: "RM 2,975",
    location: "Cyberjaya",
    timestamp: "1 day ago",
    description: "Need high refresh rate 4K monitor for competitive gaming.",
    imageUrl: "/api/placeholder/300/200",
    views: 52,
    likes: 18,
    category: "Computing",
    expiresAt: "2025-12-15T14:30:00Z",
    subscriptionTier: "basic",
    isOwner: true
  },
  {
    id: 7,
    title: "Need: Air Purifier",
    budget: "RM 1,275",
    location: "Shah Alam",
    timestamp: "1 day ago",
    description: "Looking for HEPA air purifier for home use.",
    imageUrl: "/api/placeholder/300/200",
    views: 34,
    likes: 12,
    category: "Home Appliances",
    expiresAt: "2025-11-22T09:45:00Z",
    subscriptionTier: "basic",
    isOwner: false
  },
  {
    id: 8,
    title: "Want: Smartwatch - Apple/Samsung",
    budget: "RM 1,700",
    location: "Ampang",
    timestamp: "2 days ago",
    description: "Need fitness tracking and smart features.",
    imageUrl: "/api/placeholder/300/200",
    views: 28,
    likes: 8,
    category: "Electronics",
    expiresAt: "2025-12-08T16:20:00Z",
    subscriptionTier: "pro",
    isOwner: false
  },
  {
    id: 9,
    title: "Seeking: Coffee Machine",
    budget: "RM 2,125",
    location: "Kuala Lumpur",
    timestamp: "2 days ago",
    description: "Looking for espresso machine for home cafe setup.",
    imageUrl: "/api/placeholder/300/200",
    views: 45,
    likes: 15,
    category: "Home Appliances",
    expiresAt: "2025-11-28T12:10:00Z",
    subscriptionTier: "enterprise",
    isOwner: true
  },
  {
    id: 10,
    title: "Looking for: Bicycle - Road Bike",
    budget: "RM 4,250",
    location: "Petaling Jaya",
    timestamp: "3 days ago",
    description: "Need lightweight road bike for weekend cycling.",
    imageUrl: "/api/placeholder/300/200",
    views: 36,
    likes: 11,
    category: "Sports",
    expiresAt: "2025-12-03T08:30:00Z",
    subscriptionTier: "basic",
    isOwner: false
  }
];