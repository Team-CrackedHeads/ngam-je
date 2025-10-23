//MARYAM
// level 1: community/category data (existing, but with category added)
export type ThreadData = {
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
  category: string; // new: for url routing
  onlineUsers?: number;
  totalUsers?: number;
};

// community data (level 1) - updated with category
export const MOCK_THREADS: ThreadData[] = [
  {
    id: 1,
    title: "Pre-loved Apple",
    description: "Latest smartphones, laptops, gaming gear and smart devices",
    imageUrl:
      "https://images.unsplash.com/photo-1646621407385-528a18fbe004?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    comments: 245,
    views: 18500,
    upvotes: 892,
    currentTokens: 12400,
    goalTokens: 15000,
    tags: ["apple", "iphone", "macbook", "trending"],
    isPinned: true,
    isHot: true,
    timeAgo: "30m ago",
    contributions: 4200,
    category: "apple-devices", // more specific
    onlineUsers: 342,
    totalUsers: 8420,
  },
  {
    id: 2,
    title: "Nintendo Lovers",
    description: "Everything Nintendo Pre-loved",
    imageUrl:
      "https://images.unsplash.com/photo-1567094764148-bb14c3e6f14c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    comments: 312,
    views: 22100,
    upvotes: 1205,
    currentTokens: 8900,
    goalTokens: 12000,
    tags: ["gaming", "esports", "console"],
    isPinned: false,
    isHot: true,
    timeAgo: "45m ago",
    contributions: 3800,
    category: "gaming", // new
    onlineUsers: 156,
    totalUsers: 5230,
  },
  {
    id: 3,
    title: "Pre-loved Luxurious Brands",
    description: "Shoes, bags, jewelry, watches and style accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1629439612315-b69e9236c8e1?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bG91aXMlMjB2dWl0dG9uJTIwYmFnc3xlbnwwfHwwfHx8MA%3D%3D",
    comments: 156,
    views: 9800,
    upvotes: 423,
    currentTokens: 3200,
    goalTokens: 8000,
    tags: ["fashion", "accessories", "style"],
    isPinned: false,
    isHot: false,
    timeAgo: "1h ago",
    contributions: 1850,
    category: "fashion", // new
    onlineUsers: 89,
    totalUsers: 3420,
  },
  {
    id: 4,
    title: "IKEA Pre-Loved",
    description:
      "Furniture, decor, appliances and home improvement swap from IKEA",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=958&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    comments: 89,
    views: 5600,
    upvotes: 234,
    currentTokens: 6500,
    goalTokens: 6500,
    tags: ["furniture", "home", "decor"],
    isPinned: true,
    isHot: false,
    timeAgo: "3h ago",
    contributions: 2100,
    category: "furniture", // new
    onlineUsers: 67,
    totalUsers: 2890,
  },
  {
    id: 5,
    title: "Asian Literature",
    description: "Swaps asian literature!",
    imageUrl:
      "https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    comments: 67,
    views: 3400,
    upvotes: 178,
    currentTokens: 1800,
    goalTokens: 5000,
    tags: ["books", "media", "education"],
    isPinned: false,
    isHot: false,
    timeAgo: "5h ago",
    contributions: 920,
    category: "books", // new
    onlineUsers: 34,
    totalUsers: 1560,
  },
  {
    id: 6,
    title: "GymBros Exchange",
    description:
      "Exercise equipment, sportswear, outdoor gear and wellness products",
    imageUrl:
      "https://images.unsplash.com/photo-1591311630200-ffa9120a540f?q=80&w=1110&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    comments: 134,
    views: 7200,
    upvotes: 356,
    currentTokens: 4100,
    goalTokens: 10000,
    tags: ["sports", "fitness", "wellness"],
    isPinned: false,
    isHot: false,
    timeAgo: "2h ago",
    contributions: 1650,
    category: "sport", // new
    onlineUsers: 123,
    totalUsers: 4210,
  },
  {
    id: 7,
    title: "AI Tools & Software Development",
    description:
      "Discussing the latest in machine learning, generative AI, and coding frameworks.",
    imageUrl:
      "https://images.unsplash.com/photo-1712002641088-9d76f9080889?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hhdGdwdHxlbnwwfHwwfHx8MA%3D%3D",
    comments: 245,
    views: 18500,
    upvotes: 892,
    currentTokens: 12400,
    goalTokens: 15000,
    tags: ["ai", "software", "coding", "trending"],
    isPinned: true,
    isHot: true, // Now hot
    timeAgo: "30m ago",
    contributions: 4200,
    category: "ai-tools", // More specific for AI/software content,
    onlineUsers: 101,
    totalUsers: 2154,
  },
  {
    id: 8,
    title: "Collectible Sneakers & Streetwear Drops",
    description:
      "Talk about new releases, resale market, and styling advice for streetwear and sneakers.",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmlrZXxlbnwwfHwwfHx8MA%3D%3D",
    comments: 312,
    views: 22100,
    upvotes: 1205,
    currentTokens: 8900,
    goalTokens: 12000,
    tags: ["fashion", "sneakers", "streetwear", "drops"],
    isPinned: false,
    isHot: true,
    timeAgo: "45m ago",
    contributions: 3800,
    category: "fashion", // Kept 'fashion'
    onlineUsers: 120,
    totalUsers: 1928,
  },
  {
    id: 9,
    title: "MMORPGs & Online Multiplayer Games",
    description:
      "Guides, discussions, and news for massive online role-playing games and co-op titles.",
    imageUrl:
      "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    comments: 156,
    views: 9800,
    upvotes: 423,
    currentTokens: 3200,
    goalTokens: 8000,
    tags: ["gaming", "mmorpg", "online", "multiplayer"],
    isPinned: false,
    isHot: false,
    timeAgo: "1h ago",
    contributions: 1850,
    category: "gaming", // Changed from 'fashion' to 'gaming'
    onlineUsers: 19,
    totalUsers: 1020,
  },
  {
    id: 10,
    title: "Vintage & Mid-Century Modern Furniture",
    description:
      "Collecting, restoring, and finding unique pieces of vintage and retro home decor.",
    imageUrl:
      "https://images.unsplash.com/photo-1715249891485-4b8e66b584dc?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmludGFnZSUyMGZ1cm5pdHVyZXxlbnwwfHwwfHx8MA%3D%3D",
    comments: 89,
    views: 5600,
    upvotes: 234,
    currentTokens: 6500,
    goalTokens: 6500, // Goal reached!
    tags: ["furniture", "vintage", "decor", "design"],
    isPinned: true,
    isHot: false,
    timeAgo: "3h ago",
    contributions: 2100,
    category: "furniture", // Kept 'furniture'
    onlineUsers: 100,
    totalUsers: 1200,
  },
  {
    id: 11,
    title: "Self-Help & Productivity Items",
    description:
      "Discussing strategies for personal growth, habit building, and maximizing daily output.",
    imageUrl:
      "https://images.unsplash.com/photo-1598301257942-e6bde1d2149b?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXRvbWljJTIwaGFiaXRzfGVufDB8fDB8fHww",
    comments: 67,
    views: 3400,
    upvotes: 178,
    currentTokens: 1800,
    goalTokens: 5000,
    tags: ["books", "self-help", "productivity", "wellness"],
    isPinned: false,
    isHot: false,
    timeAgo: "5h ago",
    contributions: 920,
    category: "books", // Kept 'books'
    onlineUsers: 10,
    totalUsers: 2010,
  },
  {
    id: 12,
    title: "Running & Marathon Equipments",
    description:
      "Tips, gear reviews, and motivation for runners of all levels, from 5K to marathon distances.",
    imageUrl:
      "https://images.unsplash.com/photo-1597892657493-6847b9640bac?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cnVubmluZyUyMHNob2VzfGVufDB8fDB8fHww",
    comments: 134,
    views: 7200,
    upvotes: 356,
    currentTokens: 4100,
    goalTokens: 10000,
    tags: ["sports", "running", "marathon", "fitness"],
    isPinned: false,
    isHot: false,
    timeAgo: "2h ago",
    contributions: 1650,
    category: "sport", // Kept 'sport'
    onlineUsers: 102,
    totalUsers: 1029,
  },

  {
    id: 13,
    title: "DIY & Home Renovation Thread",
    description: "Pleaces to share your DIY items.",
    imageUrl:
      "https://images.unsplash.com/photo-1603227809135-512eb5c03f43?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8d3JlbmNoZXN8ZW58MHx8MHx8fDA%3D",
    comments: 98,
    views: 6100,
    upvotes: 310,
    currentTokens: 5400,
    goalTokens: 7500,
    tags: ["diy", "home", "tools", "renovation"],
    isPinned: false,
    isHot: false,
    timeAgo: "1d ago",
    contributions: 1900,
    category: "furniture",
    onlineUsers: 104,
    totalUsers: 4038,
  },
  {
    id: 14,
    title: "High-End PC Building & Overclocking",
    description:
      "Discussions on custom PC builds, components, and performance tuning.",
    imageUrl:
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2FtaW5nJTIwcGN8ZW58MHx8MHx8fDA%3D",
    comments: 480,
    views: 35000,
    upvotes: 2150,
    currentTokens: 18500,
    goalTokens: 20000,
    tags: ["pc-building", "gaming", "overclocking", "hardware"],
    isPinned: true,
    isHot: true,
    timeAgo: "15m ago",
    contributions: 5500,
    category: "pc-building",
    onlineUsers: 102,
    totalUsers: 2038,
  },
  {
    id: 15,
    title: "Sustainable & Ethical Facial Brands",
    description: "Sell or buy sustainable facial brands.",
    imageUrl:
      "https://images.unsplash.com/photo-1634217620030-403525c4b9de?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWVzb3B8ZW58MHx8MHx8fDA%3D",
    comments: 112,
    views: 8400,
    upvotes: 560,
    currentTokens: 2500,
    goalTokens: 6000,
    tags: ["fashion", "sustainability", "eco-friendly"],
    isPinned: true,
    isHot: false,
    timeAgo: "6h ago",
    contributions: 1100,
    category: "fashion",
    onlineUsers: 213,
    totalUsers: 8420,
  },
  {
    id: 16,
    title: "Outdoor Adventures & Hiking Gear",
    description:
      "Reviews and recommendations for tents, packs, boots, and trail guides.",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1663127114654-37b84c0ed3ed?q=80&w=1150&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    comments: 205,
    views: 14200,
    upvotes: 780,
    currentTokens: 7800,
    goalTokens: 10000,
    tags: ["sports", "outdoor", "travel", "gear"],
    isPinned: false,
    isHot: true,
    timeAgo: "2h ago",
    contributions: 3200,
    category: "sport",
    onlineUsers: 27,
    totalUsers: 727,
  },
  {
    id: 17,
    title: "Fantasy Book Club: High Fantasy",
    description:
      "Discussing the latest and greatest in epic high fantasy novels and series.",
    imageUrl:
      "https://images.unsplash.com/photo-1540650659171-c24a35e9cd54?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    comments: 145,
    views: 8100,
    upvotes: 490,
    currentTokens: 3500,
    goalTokens: 5500,
    tags: ["books", "fantasy", "literature"],
    isPinned: false,
    isHot: false,
    timeAgo: "4h ago",
    contributions: 1550,
    category: "books",
    onlineUsers: 342,
    totalUsers: 8420,
  },
  {
    id: 18,
    title: "Best Smart Home Automation Hubs",
    description:
      "Comparing Google Home, Amazon Echo, Apple HomeKit, and custom solutions.",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1758492123932-31c78cdbabe2?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    comments: 288,
    views: 19300,
    upvotes: 1100,
    currentTokens: 9200,
    goalTokens: 11000,
    tags: ["smart-home", "automation", "iot", "homekit"],
    isPinned: true,
    isHot: true,
    timeAgo: "55m ago",
    contributions: 4000,
    category: "smart-home",
    onlineUsers: 12,
    totalUsers: 840,
  },
];
// Define the ListingData type structure as provided by you (LUQMAN)
export type ListingData = {
  id: string;
  title: string;
  description: string;
  price: string;
  seller: string;
  location: string;
  time: string;
  tags: string[];
  imageUrl: string;
  category: string; // which category this belongs to
  listingType: "sale" | "wanted";
};

// Unified listing data type that works for both category listing and detail pages
export type UnifiedListingData = {
  // Core fields
  id: string;
  title: string;
  subtitle?: string;
  description: string;

  // Price (better for calculations)
  price: number;
  currency: string;

  // Enhanced seller info
  seller: {
    name: string;
    location: string;
    verified: boolean;
    timePosted: string;
  };

  // Images (support both single + gallery)
  imageUrl: string; // main image for cards
  gallery?: string[]; // additional images for detail view

  // Categories & types
  category: string;
  listingType: "sale" | "wanted";

  // Enhanced metadata
  tags: string[];
  views: number;
  protected: boolean;
};

export const UNIFIED_LISTINGS: UnifiedListingData[] = [
  // --- PC BUILDING & GAMING GEAR ---
  {
    id: "elec-001",
    title: "Gaming PC Setup - RTX 4070",
    subtitle: "Complete Setup",
    description:
      'Complete gaming setup with RTX 4070, 32GB RAM, and 27" 144Hz monitor.',
    price: 3500.0,
    currency: "RM",
    seller: {
      name: "GamerGirl2024",
      location: "Kuala Lumpur",
      verified: true,
      timePosted: "1 hour ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1706954817491-4d8d735256e5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cnR4JTIwNDA3MHxlbnwwfHwwfHx8MA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1624701928517-44c8ac49d93c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3B1fGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1729934746958-857e5b082dcc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdwdXxlbnwwfHwwfHx8MA%3D%3D", // Placeholder gallery image 2
    ],
    category: "pc-building",
    listingType: "sale",
    tags: ["pc-building", "rtx-4070", "gaming-pc", "custom-build"],
    views: 345,
    protected: true,
  },
  {
    id: "elec-002",
    title: "Looking to Buy: Latest iPhone 15 Pro Max",
    subtitle: "256GB - Budget RM 4,500",
    description:
      "Seeking a brand new or lightly used iPhone 15 Pro Max, 256GB. Budget: RM 4,500.",
    price: 4500.0,
    currency: "RM",
    seller: {
      name: "TechHunter",
      location: "Petaling Jaya",
      verified: false,
      timePosted: "2 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1647866276622-7990c3ee684d?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1704380895316-caa2e4d68a7e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aXBob25lJTIwMTV8ZW58MHx8MHx8fDA%3D",
      "https://plus.unsplash.com/premium_photo-1681233750830-dfbb25c7abc0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aXBob25lJTIwMTV8ZW58MHx8MHx8fDA%3D",
    ],
    category: "apple-devices",
    listingType: "wanted",
    tags: ["iphone", "apple", "buy-request"],
    views: 89,
    protected: false,
  },
  {
    id: "elec-003",
    title: "Sony WH-1000XM4 Noise Cancelling Headphones",
    subtitle: "Excellent Condition",
    description:
      "Excellent condition, comes with original box and accessories. Used for 6 months.",
    price: 650.0,
    currency: "RM",
    seller: {
      name: "AudioPhile",
      location: "Subang Jaya",
      verified: true,
      timePosted: "5 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1583305727488-61f82c7eae4b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c29ueSUyMGhlYWRwaG9uZXN8ZW58MHx8MHx8fDA%3D",
    ],
    category: "audio-gear",
    listingType: "sale",
    tags: ["sony", "headphones", "audio"],
    views: 175,
    protected: true,
  },
  {
    id: "elec-004",
    title: "DJI Mini 3 Pro Drone Combo",
    subtitle: "Fly More Kit Included",
    description:
      "Fly More Combo with extra batteries and controller screen. Low flight hours.",
    price: 2800.0,
    currency: "RM",
    seller: {
      name: "DronePilotMY",
      location: "Klang",
      verified: true,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1662348316911-d6aef85f8560?q=80&w=3030&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1714618849685-89cad85746b1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c29ueSUyMGRyb25lfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1655219282209-6e6e64515c0d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c29ueSUyMGRyb25lfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1667948088559-f5036b9f3802?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHNvbnklMjBkcm9uZXxlbnwwfHwwfHx8MA%3D%3D",
    ],
    category: "ai-tools",
    listingType: "sale",
    tags: ["dji", "drone", "mini-3-pro", "photography"],
    views: 410,
    protected: true,
  },
  {
    id: "elec-005",
    title: "HP LaserJet Pro Multifunction Printer",
    subtitle: "Office/Home Use",
    description:
      "Black and white laser printer, scanner, and copier. Perfect for small office.",
    price: 450.0,
    currency: "RM",
    seller: {
      name: "OfficeClearance",
      location: "Johor Bahru",
      verified: false,
      timePosted: "7 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJpbnRlcnxlbnwwfHwwfHx8MA%3D%3D",
    ],
    category: "ai-tools",
    listingType: "sale",
    tags: ["printer", "hp", "office", "equipment"],
    views: 112,
    protected: false,
  },
  {
    id: "elec-006",
    title: "Selling: Canon EOS M50 Mark II Mirrorless Camera",
    subtitle: "Vlogging Kit",
    description:
      "Comes with 15-45mm kit lens. Great for vlogging and beginner photography.",
    price: 1900.0,
    currency: "RM",
    seller: {
      name: "PhotoHobbyist",
      location: "Penang",
      verified: true,
      timePosted: "2 days ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1581673958497-493bc93c2a0a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2Fub258ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1504093376055-b3094b674dcb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2Fub258ZW58MHx8MHx8fDA%3D",
    ],
    category: "ai-tools",
    listingType: "sale",
    tags: ["camera", "canon", "mirrorless", "vlog", "photography"],
    views: 290,
    protected: true,
  },
  {
    id: "elec-007",
    title: "WTB: Vintage Vinyl Turntable (Working)",
    subtitle: "Technics/Pioneer Preferred",
    description:
      "Searching for a classic, working turntable, preferably Technics or Pioneer model.",
    price: 1000.0,
    currency: "RM",
    seller: {
      name: "VinylJunkie",
      location: "Ipoh",
      verified: false,
      timePosted: "10 hours ago",
    },
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1663011373221-9bce9f22261e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1510100831744-b8d7fea7ca2e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dHVybnRhYmxlfGVufDB8fDB8fHww",
    ],
    category: "audio-gear",
    listingType: "wanted",
    tags: ["turntable", "vinyl", "vintage", "audio"],
    views: 65,
    protected: false,
  },
  {
    id: "elec-008",
    title: "Apple Watch SE (2nd Gen, 40mm) Starlight",
    subtitle: "With Extra Sports Band",
    description:
      "Less than 3 months old, worn a few times. Comes with extra sports band.",
    price: 850.0,
    currency: "RM",
    seller: {
      name: "AppleFanMY",
      location: "Kuala Lumpur",
      verified: true,
      timePosted: "3 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1614106765035-bceac4ac1911?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1624096104992-9b4fa3a279dd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXBwbGUlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1609096458733-95b38583ac4e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXBwbGUlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    category: "apple-devices",
    listingType: "sale",
    tags: ["apple-watch", "wearable", "se", "apple"],
    views: 198,
    protected: true,
  },
  {
    id: "elec-009",
    title: "WTB: High-End Gaming PC Components",
    subtitle: "RTX 4080 or 4090, 32GB DDR5 RAM",
    description:
      "Looking for high-end gaming PC components: RTX 4080/4090, 32GB DDR5 RAM, latest gen CPU. Budget: RM 8,000.",
    price: 8000.0,
    currency: "RM",
    seller: {
      name: "PCEnthusiast",
      location: "Petaling Jaya",
      verified: true,
      timePosted: "4 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nJTIwcGN8ZW58MHx8MHx8fDA%3D",
    gallery: [
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nJTIwcGN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1624705011240-c92ad5f33b31?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGdwdSUyMGNhcmR8ZW58MHx8MHx8fDA%3D",
    ],
    category: "pc-building",
    listingType: "wanted",
    tags: ["pc-building", "rtx-4080", "rtx-4090", "gaming-pc", "wtb"],
    views: 156,
    protected: false,
  },
  {
    id: "smart-001",
    title: "Google Nest Hub Max",
    subtitle: "Smart Display with Voice Control",
    description:
      "Google Nest Hub Max with 10-inch display, camera, and Google Assistant. Perfect for smart home control.",
    price: 580.0,
    currency: "RM",
    seller: {
      name: "SmartHomeMY",
      location: "Shah Alam",
      verified: true,
      timePosted: "2 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjBkaXNwbGF5JTIwZ29vZ2xlfGVufDB8fDB8fHww",
    gallery: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjBkaXNwbGF5JTIwZ29vZ2xlfGVufDB8fDB8fHww",
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c21hcnQlMjBob21lJTIwZGV2aWNlfGVufDB8fDB8fHww",
    ],
    category: "smart-home",
    listingType: "sale",
    tags: ["google-nest", "smart-display", "home-automation", "voice-control"],
    views: 124,
    protected: false,
  },
  {
    id: "smart-002",
    title: "WTB: Philips Hue Smart Light Starter Kit",
    subtitle: "Color Bulbs + Bridge Included",
    description:
      "Looking for Philips Hue starter kit with bridge and color bulbs. Prefer complete package. Budget: RM 450.",
    price: 450.0,
    currency: "RM",
    seller: {
      name: "HomeAutomator",
      location: "Kuala Lumpur",
      verified: false,
      timePosted: "6 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjBsaWdodHN8ZW58MHx8MHx8fDA%3D",
    gallery: [
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjBsaWdodHN8ZW58MHx8MHx8fDA%3D",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z29vZ2xlJTIwbmVzdHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    category: "smart-home",
    listingType: "wanted",
    tags: ["philips-hue", "smart-lights", "home-automation", "wtb"],
    views: 89,
    protected: false,
  },
  {
    id: "smart-003",
    title: "Amazon Echo Dot (5th Gen) Bundle",
    subtitle: "3 Units + Smart Plug Included",
    description:
      "Bundle of 3 Echo Dot devices with smart plugs. Perfect for multi-room voice control setup.",
    price: 320.0,
    currency: "RM",
    seller: {
      name: "TechBundler",
      location: "Subang Jaya",
      verified: true,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW1hem9uJTIwZWNob3xlbnwwfHwwfHx8MA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW1hem9uJTIwZWNob3xlbnwwfHwwfHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c21hcnQlMjBob21lJTIwZGV2aWNlfGVufDB8fDB8fHww",
    ],
    category: "smart-home",
    listingType: "sale",
    tags: ["amazon-echo", "voice-assistant", "smart-plug", "bundle"],
    views: 167,
    protected: true,
  },

  {
    id: "furn-001",
    title: "Minimalist Scandinavian 4-Seater Sofa",
    subtitle: "Light Grey Fabric, Excellent Condition",
    description:
      "Light grey fabric sofa, perfect condition, selling due to relocation.",
    price: 1800.0,
    currency: "RM",
    seller: {
      name: "HomeStylist",
      location: "Kuala Lumpur",
      verified: true,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxwxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxwxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1658501238841-da09649a94f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fDQlMjBzZWF0ZXIlMjBzb2ZhfGVufDB8fDB8fHww",
    ],
    category: "furniture",
    listingType: "sale",
    tags: ["sofa", "minimalist", "scandinavian", "living-room"],
    views: 280,
    protected: true,
  },
  {
    id: "furn-002",
    title: "Looking to Buy: Vintage Wooden Study Desk",
    subtitle: "Solid Wood, Must Have Drawers",
    description:
      "Seeking a solid wood antique or vintage study desk, must have drawers.",
    price: 500.0,
    currency: "RM",
    seller: {
      name: "AntiqueCollector",
      location: "Ipoh",
      verified: false,
      timePosted: "3 days ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1585148481101-0dea656c03a9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1664297827889-5cc99441cada?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c3R1ZHklMjBkZXNrfGVufDB8fDB8fHww",
    ],
    category: "furniture",
    listingType: "wanted",
    tags: ["desk", "vintage", "study", "wtb"],
    views: 60,
    protected: false,
  },
  {
    id: "furn-003",
    title: "IKEA Billy Bookcase (White, 5 units)",
    subtitle: "Selling as a Set Only",
    description:
      "Five standard white Billy bookcases. Selling as a set only. Used for 1 year.",
    price: 400.0,
    currency: "RM",
    seller: {
      name: "BookLoverKL",
      location: "Shah Alam",
      verified: true,
      timePosted: "8 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1593670755950-603e1d6184b9?q=80&w=1963&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1593670755950-603e1d6184b9?q=80&w=1963&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1543248939-4296e1fea89b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aWtlYSUyMGJvb2slMjBjYXNlfGVufDB8fDB8fHww",
    ],
    category: "furniture",
    listingType: "sale",
    tags: ["ikea", "bookcase", "storage", "shelving"],
    views: 120,
    protected: true,
  },
  {
    id: "furn-004",
    title: "Queen Size Bed Frame and Mattress",
    subtitle: "Medium-Firm, Self-Pickup Required",
    description:
      "Metal frame and medium-firm spring mattress. Used for 2 years. Self-pickup required.",
    price: 950.0,
    currency: "RM",
    seller: {
      name: "MovingOutSale",
      location: "Subang Jaya",
      verified: false,
      timePosted: "4 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1593184091721-409ccc1753d9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1593184091721-409ccc1753d9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    category: "furniture",
    listingType: "sale",
    tags: ["bed", "mattress", "bedroom", "queen-size"],
    views: 190,
    protected: true,
  },
  {
    id: "furn-005",
    title: "Modern Glass Dining Table (6-Seater)",
    subtitle: "Includes 6 Fabric Chairs",
    description:
      "Tempered glass top with stainless steel legs. Includes 6 fabric chairs.",
    price: 1500.0,
    currency: "RM",
    seller: {
      name: "DiningDeals",
      location: "Klang",
      verified: true,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1582472181599-86a60136bdf4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fE1vZGVybiUyMEdsYXNzJTIwRGluaW5nJTIwVGFibGUlMjAoNiUyMFNlYXRlcyl8ZW58MHwwfDR8fHww",
    gallery: [
      "https://images.unsplash.com/photo-1582472181599-86a60136bdf4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fE1vZGVybiUyMEdsYXNzJTIwRGluaW5nJTIwVGFibGUlMjAoNiUyMFNlYXRlcyl8ZW58MHwwfDR8fHww",
    ],
    category: "furniture",
    listingType: "sale",
    tags: ["dining", "table", "glass", "6-seater"],
    views: 210,
    protected: true,
  },
  {
    id: "furn-006",
    title: "Selling: Herman Miller Embody Office Chair",
    subtitle: "Ergonomic, Black, With Receipt",
    description:
      "Ergonomic chair in black. Excellent support for long hours of work. Original purchase receipt available.",
    price: 3500.0,
    currency: "RM",
    seller: {
      name: "WorkFromHomePro",
      location: "Petaling Jaya",
      verified: true,
      timePosted: "2 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1616982731841-001a8a090d86?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fEhlcm1hbiUyME1pbGxlciUyMEVtYm9keSUyME9mZmljZSUyMENoYWlyfGVufDB8MHw0fHx8MA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1616982731841-001a8a090d86?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fEhlcm1hbiUyME1pbGxlciUyMEVtYm9keSUyME9mZmljZSUyMENoYWlyfGVufDB8MHw0fHx8MA%3D%3D",
    ],
    category: "furniture",
    listingType: "sale",
    tags: ["office-chair", "herman-miller", "ergonomic", "work-from-home"],
    views: 350,
    protected: true,
  },
  {
    id: "furn-007",
    title: "WTB: Antique Chinese Cabinet or Chest",
    subtitle: "Looking for Genuine Antique",
    description:
      "Looking for a genuine antique Chinese-style wooden cabinet. Condition can be moderate.",
    price: 3000.0, // Using the max budget specified
    currency: "RM",
    seller: {
      name: "HeritageFinder",
      location: "Georgetown",
      verified: true,
      timePosted: "6 days ago",
    },
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1720884611740-f5e807d7c77e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8QW50aXF1ZSUyMENoaW5lc2UlMjBDYWJpbmV0JTIwb3IlMjBDaGVzdHxlbnwwfDB8NHx8fDA%3D",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1720884611740-f5e807d7c77e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8QW50aXF1ZSUyMENoaW5lc2UlMjBDYWJpbmV0JTIwb3IlMjBDaGVzdHxlbnwwfDB8NHx8fDA%3D",
    ],
    category: "furniture",
    listingType: "wanted",
    tags: ["antique", "cabinet", "chinese", "wtb"],
    views: 40,
    protected: false,
  },
  {
    id: "furn-008",
    title: "Large Outdoor Patio Umbrella (Cantilever)",
    subtitle: "3-Meter Beige",
    description:
      "3-meter cantilever umbrella in beige. Great for garden or balcony. Minor sun fading.",
    price: 550.0,
    currency: "RM",
    seller: {
      name: "BalconyRelax",
      location: "Johor Bahru",
      verified: false,
      timePosted: "12 hours ago",
    },
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1676638972162-99c667d08938?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fExhcmdlJTIwT3V0ZG9vciUyMFBhdGlvJTIwVW1icmVsbGF8ZW58MHwwfDR8fHww",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1676638972162-99c667d08938?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fExhcmdlJTIwT3V0ZG9vciUyMFBhdGlvJTIwVW1icmVsbGF8ZW58MHwwfDR8fHww",
      "https://example.com/gallery/furn-008-2.jpg",
    ],
    category: "furniture",
    listingType: "sale",
    tags: ["outdoor", "patio", "umbrella", "garden"],
    views: 95,
    protected: true,
  },
  {
    id: "book-001",
    title: "The Lord of the Rings Trilogy (Hardcover)",
    subtitle: "Collector's Edition, Like New",
    description: "Collector's edition hardcover set. Like new condition.",
    price: 150.0,
    currency: "RM",
    seller: {
      name: "FantasyReader",
      location: "Johor Bahru",
      verified: true,
      timePosted: "2 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1607948274673-3dc6578ebecc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1607948274673-3dc6578ebecc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1590594786467-09c7c73c111f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    category: "books",
    listingType: "sale",
    tags: ["fantasy", "fiction", "collector", "lotr"],
    views: 110,
    protected: true,
  },
  {
    id: "book-002",
    title: "Selling: Used University Textbooks (Finance/Eco)",
    subtitle: "Discount for Bulk Buy",
    description:
      "Assorted university textbooks for Finance and Economics degrees. Discount for bulk buy.",
    price: 80.0,
    currency: "RM",
    seller: {
      name: "GradStudent",
      location: "Petaling Jaya",
      verified: false,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1520467795206-62e33627e6ce?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8VXNlZCUyMFVuaXZlcnNpdHklMjBUZXh0Ym9va3MlMjAoRmluYW5jZSUyRkVjbyl8ZW58MHwwfDR8fHww",
    gallery: [
      "https://images.unsplash.com/photo-1520467795206-62e33627e6ce?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8VXNlZCUyMFVuaXZlcnNpdHklMjBUZXh0Ym9va3MlMjAoRmluYW5jZSUyRkVjbyl8ZW58MHwwfDR8fHww",
    ],
    category: "books",
    listingType: "sale",
    tags: ["textbook", "finance", "education", "economics"],
    views: 95,
    protected: false,
  },
  {
    id: "book-003",
    title: "WTB: Rare First Edition Comic Books",
    subtitle: "Malaysian/Asian Comics Preferred",
    description:
      "Looking to buy rare Malaysian or Asian comic books, first editions preferred.",
    price: 0.0, // Price is negotiable/WTB, setting to 0 or 1.00 is common for WTB listings
    currency: "RM",
    seller: {
      name: "ComicFanatic",
      location: "Online",
      verified: true,
      timePosted: "5 days ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1598888831741-cb535295b013?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1598888831741-cb535295b013?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    category: "books",
    listingType: "wanted",
    tags: ["comic", "rare", "first-edition", "wtb"],
    views: 20,
    protected: false,
  },
  {
    id: "book-004",
    title: "Complete Harry Potter Series (Paperback)",
    subtitle: "All 7 Books, Excellent Condition",
    description:
      "All 7 books in the standard paperback edition. Read once, excellent condition.",
    price: 200.0,
    currency: "RM",
    seller: {
      name: "PotterHeadMY",
      location: "Kuala Lumpur",
      verified: true,
      timePosted: "3 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1481047540402-8f3d39289bca?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Q29tcGxldGUlMjBIYXJyeSUyMFBvdHRlciUyMFNlcmllcyUyMEJvb2tzfGVufDB8MHw0fHx8MA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1481047540402-8f3d39289bca?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Q29tcGxldGUlMjBIYXJyeSUyMFBvdHRlciUyMFNlcmllcyUyMEJvb2tzfGVufDB8MHw0fHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1610466025839-ec6040c347b6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fENvbXBsZXRlJTIwSGFycnklMjBQb3R0ZXIlMjBTZXJpZXMlMjAoUGFwZXJiYWNrKXxlbnwwfHwwfHx8MA%3D%3D",
    ],
    category: "books",
    listingType: "sale",
    tags: ["harry-potter", "fiction", "series", "young-adult"],
    views: 250,
    protected: true,
  },
  {
    id: "book-005",
    title: "Selling: Malaysian Cookbook Collection (5 Books)",
    subtitle: "Nonya and Malay Cuisine",
    description:
      "Set of five local cookbooks, including Nonya and Malay cuisine. Great for beginners.",
    price: 120.0,
    currency: "RM",
    seller: {
      name: "HomeChefKL",
      location: "Shah Alam",
      verified: true,
      timePosted: "1 hour ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1570570329584-b41861c52c5b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvb2tib29rc3xlbnwwfDB8NHx8fDA%3D",
    gallery: [
      "https://images.unsplash.com/photo-1570570329584-b41861c52c5b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvb2tib29rc3xlbnwwfDB8NHx8fDA%3D",
    ],
    category: "books",
    listingType: "sale",
    tags: ["cookbook", "malaysian-cuisine", "cooking", "recipe"],
    views: 70,
    protected: true,
  },
  {
    id: "book-006",
    title: "WTB: Used Manga - Attack on Titan Vol. 1-30",
    subtitle: "Complete or Near-Complete Set",
    description:
      "Looking for a complete or near-complete set of the Attack on Titan manga series.",
    price: 10.0, // Using the per-volume budget as a placeholder price
    currency: "RM",
    seller: {
      name: "MangaFanBoy",
      location: "Penang",
      verified: false,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1553931122-eb3db723739f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hbmdhJTIwY29taWNzJTIwY29sbGVjdGlvbnxlbnwwfDB8NHx8fDA%3D",
    gallery: [
      "https://images.unsplash.com/photo-1553931122-eb3db723739f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hbmdhJTIwY29taWNzJTIwY29sbGVjdGlvbnxlbnwwfDB8NHx8fDA%3D",
    ],
    category: "books",
    listingType: "wanted",
    tags: ["manga", "attack-on-titan", "anime", "wtb"],
    views: 55,
    protected: false,
  },
  {
    id: "book-007",
    title: "Biography of Elon Musk (New Release)",
    subtitle: "Hardcover, Dust Jacket Intact",
    description:
      "Hardcover copy of the latest biography. Read once, dust jacket intact.",
    price: 95.0,
    currency: "RM",
    seller: {
      name: "BusinessReader",
      location: "Subang Jaya",
      verified: true,
      timePosted: "7 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1650178284536-2d6dff47f903?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmlvZ3JhcGh5JTIwZWxvbnxlbnwwfDB8NHx8fDA%3D",
    gallery: [
      "https://images.unsplash.com/photo-1650178284536-2d6dff47f903?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YmlvZ3JhcGh5JTIwZWxvbnwwfDB8NHx8fDA%3D",
      "https://example.com/gallery/book-007-2.jpg",
    ],
    category: "books",
    listingType: "sale",
    tags: ["biography", "non-fiction", "business", "hardcover"],
    views: 140,
    protected: true,
  },
  {
    id: "book-008",
    title: "Kids' Picture Book Bundle (20 Books)",
    subtitle: "English and Malay Storybooks",
    description:
      "Mix of English and Malay storybooks for children aged 3-6. Good for reading practice.",
    price: 60.0,
    currency: "RM",
    seller: {
      name: "ParentSeller",
      location: "Bayan Lepas",
      verified: false,
      timePosted: "5 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1469013078550-305e63b7c8f7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpbGRyZW4lMjBib29rc3xlbnwwfDB8NHx8fDA%3D",
    gallery: [
      "https://images.unsplash.com/photo-1469013078550-305e63b7c8f7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpbGRyZW4lMjBib29rc3xlbnwwfDB8NHx8fDA%3D",
      "https://example.com/gallery/book-008-2.jpg",
    ],
    category: "books",
    listingType: "sale",
    tags: ["childrens-books", "kids", "education", "bundle"],
    views: 85,
    protected: false,
  },
  // --- FASHION (Category: fashion) ---
  {
    id: "fash-001",
    title: "Nike Air Max 270 (Size 9)",
    subtitle: "Brand New, Black/White",
    description:
      "Brand new Nike Air Max 270 in black/white colorway. Never worn.",
    price: 450.0,
    currency: "RM",
    seller: {
      name: "SneakerHead99",
      location: "Shah Alam",
      verified: true,
      timePosted: "30 minutes ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1562613521-6b5293e5b0ea?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://example.com/gallery/fash-001-2.jpg",
    ],
    category: "fashion",
    listingType: "sale",
    tags: ["nike", "air-max", "sneakers", "new"],
    views: 152,
    protected: false,
  },
  {
    id: "fash-002",
    title: "Want to Buy: Vintage Leather Jacket (Size L)",
    subtitle: "Distressed Brown Motorcycle Style",
    description:
      "Seeking a genuine, distressed brown leather motorcycle jacket. Must be size L. Budget: RM 800.00.",
    price: 800.0,
    currency: "RM",
    seller: {
      name: "RockerStyle",
      location: "Georgetown",
      verified: false,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1641943632479-3798ef1e14c6?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTEwfHxWaW50YWdlJTIwTGVhdGhlciUyMEphY2tldHxlbnwwfHwwfHx8MA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1641943632479-3798ef1e14c6?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTEwfHxWaW50YWdlJTIwTGVhdGhlciUyMEphY2tldHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    category: "fashion",
    listingType: "wanted",
    tags: ["vintage", "leather", "jacket", "wtb"],
    views: 45,
    protected: false,
  },
  {
    id: "fash-003",
    title: "Tissot Chronograph Watch",
    subtitle: "Swiss-made, Stainless Steel",
    description:
      "Swiss-made chronograph. Stainless steel with black leather strap. Excellent condition.",
    price: 1800.0,
    currency: "RM",
    seller: {
      name: "TimePieceGuy",
      location: "Johor Bahru",
      verified: true,
      timePosted: "4 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1727716919539-3cd4aaf7af99?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1727716919539-3cd4aaf7af99?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://example.com/gallery/fash-003-2.jpg",
    ],
    category: "fashion",
    listingType: "sale",
    tags: ["watch", "tissot", "luxury", "accessories"],
    views: 110,
    protected: true,
  },
  {
    id: "fash-004",
    title: "Original Coach Tote Bag (Black)",
    subtitle: "Large Capacity, Excellent Condition",
    description:
      "Large capacity tote bag, perfect for work or travel. Used a few times, excellent condition.",
    price: 750.0,
    currency: "RM",
    seller: {
      name: "BagLoverKL",
      location: "Kuala Lumpur",
      verified: true,
      timePosted: "50 minutes ago",
    },
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1750218296007-f73edb01d1ba?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1750218296007-f73edb01d1ba?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://example.com/gallery/fash-004-2.jpg",
    ],
    category: "fashion",
    listingType: "sale",
    tags: ["handbag", "coach", "designer", "tote"],
    views: 78,
    protected: false,
  },
  {
    id: "fash-005",
    title: "Ray-Ban Aviator Sunglasses (Polarized)",
    subtitle: "Classic Aviator Style with Case",
    description:
      "Classic aviator style, polarized lenses. Only worn a few times. Comes with case.",
    price: 350.0,
    currency: "RM",
    seller: {
      name: "SunShadesMY",
      location: "Subang Jaya",
      verified: false,
      timePosted: "3 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1530432999454-016a47c78af3?q=80&w=1336&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1530432999454-016a47c78af3?q=80&w=1336&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://example.com/gallery/fash-005-2.jpg",
    ],
    category: "fashion",
    listingType: "sale",
    tags: ["sunglasses", "ray-ban", "accessories", "polarized"],
    views: 61,
    protected: false,
  },
  {
    id: "fash-006",
    title: "Wedding Dress (Size M/UK 10)",
    subtitle: "Mermaid Cut, Lace, Dry-Cleaned",
    description:
      "Mermaid-cut, lace detailing. Worn once, professionally dry-cleaned. Negotiable price.",
    price: 1500.0,
    currency: "RM",
    seller: {
      name: "BrideToSeller",
      location: "Melaka",
      verified: true,
      timePosted: "2 days ago",
    },
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1661432699720-b50b2abd5c0a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1661432699720-b50b2abd5c0a?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://example.com/gallery/fash-006-2.jpg",
    ],
    category: "fashion",
    listingType: "sale",
    tags: ["wedding", "dress", "formal", "negotiable"],
    views: 198,
    protected: true,
  },
  {
    id: "fash-007",
    title: "WTB: Authentic Hermes Scarf (Silk)",
    subtitle: "Seeking Proof of Authenticity",
    description:
      "Seeking a genuine Hermes silk scarf, any color/pattern. Must provide proof of authenticity. Budget: RM 1,200.00.",
    price: 1200.0,
    currency: "RM",
    seller: {
      name: "LuxuryBuyer",
      location: "Online",
      verified: true,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1758611682513-261331205a40?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1758611682513-261331205a40?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    category: "fashion",
    listingType: "wanted",
    tags: ["hermes", "luxury", "scarf", "wtb"],
    views: 22,
    protected: true,
  },
  {
    id: "fash-008",
    title: "Uniqlo Heattech Long-Sleeve Tops (4 Pcs)",
    subtitle: "Size M, 2 Black & 2 Grey",
    description:
      "Four pieces of Uniqlo Heattech (2 Black, 2 Grey), size M. Great for winter travel.",
    price: 100.0,
    currency: "RM",
    seller: {
      name: "TravelReady",
      location: "Petaling Jaya",
      verified: false,
      timePosted: "1 hour ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1624522955553-a5240288ce21?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1624522955553-a5240288ce21?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://example.com/gallery/fash-008-2.jpg",
    ],
    category: "fashion",
    listingType: "sale",
    tags: ["uniqlo", "heattech", "winter", "bundle"],
    views: 90,
    protected: false,
  },
  {
    id: "game-001",
    title: "Nintendo Switch OLED (White)",
    subtitle: "Barely Used, Includes Zelda Game",
    description:
      "Barely used console with all original accessories and one game (Zelda).",
    price: 1250.0,
    currency: "RM",
    seller: {
      name: "ConsoleSeller",
      location: "Klang",
      verified: true,
      timePosted: "45 minutes ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1680007966627-d49ae18dbbae?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://unsplash.com/photos/a-nintendo-wii-game-controller-sitting-on-top-of-a-table-xNUXE7iUBo8",
      "https://example.com/gallery/game-001-2.jpg",
    ],
    category: "gaming",
    listingType: "sale",
    tags: ["nintendo", "switch", "oled", "console"],
    views: 210,
    protected: false,
  },
  {
    id: "game-002",
    title: "PS5 DualSense Controllers (Pair)",
    subtitle: "White and Midnight Black, Mint Condition",
    description:
      "Two controllers, one white, one midnight black. Mint condition.",
    price: 380.0,
    currency: "RM",
    seller: {
      name: "AccessoryMaster",
      location: "Bayan Lepas",
      verified: false,
      timePosted: "2 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1643906651350-20325b18debb?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://unsplash.com/photos/a-close-up-of-a-video-game-controller-bZ6ZpgG3u4M",
      "https://unsplash.com/photos/two-video-game-controllers-sitting-side-by-side-K_QbvoNqRvo",
      "https://unsplash.com/photos/a-close-up-of-a-video-game-controller-k4c5V15zf-4",
    ],
    category: "gaming",
    listingType: "sale",
    tags: ["ps5", "dualsense", "controller", "accessories"],
    views: 155,
    protected: false,
  },
  {
    id: "game-003",
    title: "Looking for: Used Valve Steam Deck (512GB)",
    subtitle: "WTB, KL Meet-up Preferred",
    description:
      "Seeking a 512GB Steam Deck model. Willing to meet up in KL area for trade. Budget: RM 2,000.00.",
    price: 2000.0,
    currency: "RM",
    seller: {
      name: "PCGamer23",
      location: "Kuala Lumpur",
      verified: false,
      timePosted: "6 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1654621158365-55fcf7b76fb7?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://unsplash.com/photos/a-close-up-of-a-knife-WLAW-NGcMiw",
      "https://unsplash.com/photos/a-close-up-of-a-video-game-controller-qgyAjUAtDW4",
      "https://unsplash.com/photos/a-cell-phone-sitting-on-top-of-a-wooden-table-RKch9pfBmnA",
    ],
    category: "gaming",
    listingType: "wanted",
    tags: ["steam-deck", "pc-gaming", "portable", "wtb"],
    views: 95,
    protected: false,
  },
  {
    id: "game-004",
    title: "Xbox Series X Console (Mint Condition)",
    subtitle: "Less than 1 Year Old, Includes 2 Controllers",
    description:
      "Used for less than a year. Includes 2 controllers and original box. Selling to upgrade PC.",
    price: 1900.0,
    currency: "RM",
    seller: {
      name: "GreenTeamMY",
      location: "Petaling Jaya",
      verified: true,
      timePosted: "4 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://unsplash.com/photos/black-xbox-one-console-with-controller-DPOdCl4bGJU",
      "https://unsplash.com/photos/white-xbox-one-game-controller-ABbtsOGAmZ4",
      "https://unsplash.com/photos/white-xbox-one-game-controller-CYRP7Tv--Ns",
    ],
    category: "gaming",
    listingType: "sale",
    tags: ["xbox", "series-x", "console"],
    views: 250,
    protected: true,
  },
  {
    id: "game-005",
    title: "The Last of Us Part II (PS4/PS5)",
    subtitle: "Physical Copy, Excellent Condition",
    description:
      "Physical copy, excellent condition. Compatible with PS5 via backward compatibility.",
    price: 80.0,
    currency: "RM",
    seller: {
      name: "GameSwapPJ",
      location: "Subang Jaya",
      verified: false,
      timePosted: "1 hour ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1585984968562-1443b72fb0dc?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://preview.redd.it/found-a-good-discounted-physical-edition-really-excited-to-v0-jqac4wtxpt5e1.jpeg?auto=webp&s=8725055d987b616b0c8a5591ac09d9d0315b7797",
      "https://i.ebayimg.com/thumbs/images/g/PU4AAeSwxwRo1YJl/s-l1200.jpg",
    ],
    category: "gaming",
    listingType: "sale",
    tags: ["ps4", "ps5", "game", "last-of-us", "physical"],
    views: 75,
    protected: false,
  },
  {
    id: "game-006",
    title: "Retro Console Lot - Nintendo 64 & Games",
    subtitle: "N64 Console, 2 Controllers, 5 Classic Games",
    description:
      "N64 console, 2 controllers, and 5 classic games (Mario 64, Ocarina of Time, etc.).",
    price: 700.0,
    currency: "RM",
    seller: {
      name: "RetroHunter",
      location: "Kuala Lumpur",
      verified: true,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1630835149127-e07e5f9b0a9f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://unsplash.com/photos/black-and-white-digital-device-hSNE-IbwJV4",
      "https://images.unsplash.com/photo-1749135583906-3baa6e31434c?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fG5pbnRlbmRvJTIwY29uc29sZXxlbnwwfHwwfHx8MA%3D%3D",
    ],
    category: "gaming",
    listingType: "sale",
    tags: ["retro", "nintendo-64", "n64", "vintage"],
    views: 180,
    protected: false,
  },
  {
    id: "game-007",
    title: "WTB: Used Razer BlackShark V2 Pro Headset",
    subtitle: "Wireless Version Preferred, Working Condition",
    description:
      "Seeking the wireless version of the Razer BlackShark V2 Pro headset. Must be in working order. Budget: RM 400.00.",
    price: 400.0,
    currency: "RM",
    seller: {
      name: "VoiceChatKing",
      location: "Georgetown",
      verified: false,
      timePosted: "9 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1674989844487-722ec77b9b81?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1591105866700-cb5d708ccd93?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fFJhemVyJTIwQmxhY2tTaGFyayUyMFYyJTIwUHJvJTIwSGVhZHNldHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    category: "gaming",
    listingType: "wanted",
    tags: ["headset", "razer", "pc-gaming", "wtb"],
    views: 40,
    protected: false,
  },
  {
    id: "game-008",
    title: "Logitech G Pro X Mechanical Gaming Keyboard",
    subtitle: "Tactile Switches, Tenkeyless Design",
    description:
      "Tactile switches, tenkeyless design. Perfect for competitive gaming. Less than a year old.",
    price: 350.0,
    currency: "RM",
    seller: {
      name: "PCMasterRace",
      location: "Shah Alam",
      verified: true,
      timePosted: "3 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1623593475667-377c7376f0f4?q=80&w=1365&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gallery: [
      "https://unsplash.com/photos/a-person-holding-a-phone-and-a-keyboard-BgFjWcCicYA",
      "https://images.unsplash.com/photo-1733751605002-8634ac96006b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    category: "gaming",
    listingType: "sale",
    tags: ["keyboard", "logitech", "pc-gaming", "mechanical"],
    views: 115,
    protected: false,
  },

  // --- SPORT (Category: sport) ---
  {
    id: "sport-001",
    title: "Used Road Bike - Polygon Strattos S5 (Size 52)",
    subtitle: "Good Condition, Maintained",
    description:
      "Good condition, regularly maintained. Perfect for beginner to intermediate riders.",
    price: 2200.0,
    currency: "RM",
    seller: {
      name: "BikeLoverMY",
      location: "Puchong",
      verified: true,
      timePosted: "1 hour ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1487803836022-91054ca05fdd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cm9hZCUyMGJpa2V8ZW58MHwwfDR8fHww",
    gallery: [
      "https://images.unsplash.com/photo-1487803836022-91054ca05fdd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cm9hZCUyMGJpa2V8ZW58MHwwfDR8fHww",
      "https://images.unsplash.com/photo-1695808403736-ebfb667a05ce?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHJvYWQlMjBiaWtlfGVufDB8fDB8fHww",
    ],
    category: "sport",
    listingType: "sale",
    tags: ["road-bike", "cycling", "fitness", "polygon"],
    views: 170,
    protected: false,
  },
  {
    id: "sport-002",
    title: "Looking for: Adjustable Dumbbell Set (50kg)",
    subtitle: "WTB, Space-Saving Design",
    description:
      "Seeking a space-saving, adjustable dumbbell set (up to 25kg per hand). Must be good quality. Budget: RM 600.00.",
    price: 600.0,
    currency: "RM",
    seller: {
      name: "HomeGymGuy",
      location: "Selangor",
      verified: false,
      timePosted: "7 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZHVtYmJlbGxzfGVufDB8MHw0fHx8MA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZHVtYmJlbGxzfGVufDB8MHw0fHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1685633225047-92be467dbe57?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZHVtYmVsbCUyMHNldHxlbnwwfHwwfHx8MA%3D%3D",
    ],
    category: "sport",
    listingType: "wanted",
    tags: ["dumbbell", "gym", "home-fitness", "wtb"],
    views: 55,
    protected: false,
  },
  {
    id: "sport-003",
    title: "Professional Yonex Badminton Rackets (Pair)",
    subtitle: "High-End, Recently Re-strung",
    description:
      "Two high-end Yonex rackets, recently re-strung. Selling as a pair.",
    price: 480.0,
    currency: "RM",
    seller: {
      name: "BadmintonPro",
      location: "Penang",
      verified: true,
      timePosted: "3 days ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1564226803380-91139fdcb4d0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2h1dHRsZWNvY2t8ZW58MHwwfDR8fHww",
    gallery: [
      "https://images.unsplash.com/photo-1564226803380-91139fdcb4d0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2h1dHRsZWNvY2t8ZW58MHwwfDR8fHww",
      "https://5.imimg.com/data5/CN/HZ/EA/SELLER-65772240/yonex-badminton-racket.jpg",
    ],
    category: "sport",
    listingType: "sale",
    tags: ["badminton", "yonex", "racket", "pair"],
    views: 130,
    protected: false,
  },
  {
    id: "sport-004",
    title: "Adidas Predator Football Boots (Size UK 10)",
    subtitle: "Used 1 Season, Firm Ground Cleats",
    description:
      "Used for one season only, excellent grip and condition. Cleats for firm ground.",
    price: 180.0,
    currency: "RM",
    seller: {
      name: "FootyFanatic",
      location: "Kuala Lumpur",
      verified: false,
      timePosted: "2 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1580902394724-b08ff9ba7e8a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YWRpZGFzJTIwc2hvZXN8ZW58MHwwfDR8fHww",
    gallery: [
      "https://images.unsplash.com/photo-1580902394724-b08ff9ba7e8a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YWRpZGFzJTIwc2hvZXN8ZW58MHwwfDR8fHww",
      "https://al-ikhsan.com/cdn/shop/files/if6345.jpg?v=1724041107",
    ],
    category: "sport",
    listingType: "sale",
    tags: ["football", "adidas", "boots", "size-10"],
    views: 88,
    protected: false,
  },
  {
    id: "sport-005",
    title: "Used Golf Clubs Set (Complete)",
    subtitle: "PING G425 Irons and Driver, Includes Bag",
    description:
      "Full set of PING G425 irons and driver. Perfect for a mid-handicap player. Includes bag.",
    price: 4500.0,
    currency: "RM",
    seller: {
      name: "GolfLoverMY",
      location: "Subang Jaya",
      verified: true,
      timePosted: "1 day ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1675106643681-da7ad12e926f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z29sZiUyMGNsdWJzfGVufDB8MHw0fHx8MA%3D%3D",
    gallery: [
      "https://images.unsplash.com/photo-1675106643681-da7ad12e926f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z29sZiUyMGNsdWJzfGVufDB8MHw0fHx8MA%3D%3D",
      "https://images.unsplash.com/photo-1698324010210-87ce3105292e?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fGdvbGYlMjBjbHViJTIwc2V0fGVufDB8fDB8fHww",
    ],
    category: "sport",
    listingType: "sale",
    tags: ["golf", "clubs", "ping", "complete-set"],
    views: 220,
    protected: true,
  },
  {
    id: "sport-006",
    title: "WTB: Scuba Diving BCD (Size M)",
    subtitle: "Scubapro Preferred, Well-Maintained",
    description:
      "Searching for a reliable and well-maintained Buoyancy Control Device (BCD) for diving. Brand preferred: Scubapro. Budget: RM 1,500.00.",
    price: 1500.0,
    currency: "RM",
    seller: {
      name: "DiverJoe",
      location: "Kota Kinabalu",
      verified: false,
      timePosted: "9 hours ago",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1645059986162-d077871822b6?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fFNjdWJhJTIwRGl2aW5nJTIwQkNEfGVufDB8fDB8fHww",
    gallery: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS6xeI8awNtHlHSFrNQftdb9VI2EqNhtaUJg&s",
    ],
    category: "sport",
    listingType: "wanted",
    tags: ["diving", "scuba", "watersports", "bcd", "wtb"],
    views: 35,
    protected: false,
  },
  {
    id: "sport-007",
    title: "Xiaomi Walking Pad Treadmill",
    subtitle: "Foldable, Under-Desk, Hardly Used",
    description:
      "Foldable, under-desk treadmill. Excellent for a home office setup. Hardly used.",
    price: 900.0,
    currency: "RM",
    seller: {
      name: "FitnessHome",
      location: "Petaling Jaya",
      verified: true,
      timePosted: "4 hours ago",
    },
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1677530095881-f49a6bcabef0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2N1YmElMjBkaXZpbmd8ZW58MHwwfDR8fHww",
    gallery: [
      "https://plus.unsplash.com/premium_photo-1677530095881-f49a6bcabef0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2N1YmElMjBkaXZpbmd8ZW58MHwwfDR8fHww",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKe9nB-gX_DGuuRBUxX_xcJXGNTdymI2kIkA&s",
    ],
    category: "sport",
    listingType: "sale",
    tags: ["treadmill", "home-fitness", "xiaomi", "foldable"],
    views: 165,
    protected: false,
  },
  {
    id: "sport-008",
    title: "Basketball Shoes - Nike Kobe 5 Protro (Size 11)",
    subtitle: "Rare Colorway, Indoor Court Use Only",
    description:
      "Rare colorway, worn for indoor court only. Good traction remaining.",
    price: 750.0,
    currency: "RM",
    seller: {
      name: "HoopsMaster",
      location: "Johor Bahru",
      verified: false,
      timePosted: "5 days ago",
    },
    imageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm5IO04dUeXmJDSI-ZtUGaQGuXJBkFioWwtQ&s",
    gallery: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFza2V0YmFsbCUyMHNob2VzfGVufDB8MHw0fHx8MA%3D%3D",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm5IO04dUeXmJDSI-ZtUGaQGuXJBkFioWwtQ&s",
    ],
    category: "sport",
    listingType: "sale",
    tags: ["basketball", "nike", "kobe", "sneakers", "rare"],
    views: 99,
    protected: false,
  },
];

// helper functions
export function getListingsByCategory(
  category: string,
  listingType?: "sale" | "wanted"
): UnifiedListingData[] {
  let filtered = UNIFIED_LISTINGS.filter(
    (listing) => listing.category === category
  );

  if (listingType) {
    filtered = filtered.filter(
      (listing) => listing.listingType === listingType
    );
  }

  return filtered;
}

// Additional helper function for getting individual listing by ID
export function getListingById(id: string): UnifiedListingData | undefined {
  return UNIFIED_LISTINGS.find((listing) => listing.id === id);
}
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
  isMatched?: boolean; // Whether this listing has been matched
}

// Mock data for sale listings (items user is selling - have prices)
export const mockSaleListings: Listing[] = [
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

// Mock data for wanted listings (items user wants to buy - have budgets)
export const mockWantedListings: Listing[] = [
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

// Function to get matched listings (filters listings where isMatched is true)
export function getMockMatchedListings(): Listing[] {
  const matchedSales = mockSaleListings.filter((listing) => !listing.isOwner && listing.isMatched);
  const matchedWanted = mockWantedListings.filter((listing) => !listing.isOwner && listing.isMatched);
  // return [...matchedSales, ...matchedWanted];
  return [...matchedSales];
}

import type { LucideIcon } from "lucide-react";
import {
  Trophy,
  Star,
  Zap,
  Briefcase,
  Users,
  ListChecks,
  ShieldCheck,
  Rocket,
  Camera,
  Target,
  Award,
  Clock,
} from "lucide-react";

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  unlockedAt?: string;
}

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-sale",
    label: "First Sale",
    description: "Complete your first successful sale",
    icon: Trophy,
    unlocked: true,
    unlockedAt: "Jan 15, 2024",
  },
  {
    id: "trusted-seller",
    label: "Trusted Seller",
    description: "Achieve a 4.5+ rating with 10+ reviews",
    icon: Star,
    unlocked: true,
    unlockedAt: "Feb 20, 2024",
  },
  {
    id: "fast-responder",
    label: "Fast Responder",
    description: "Respond to messages within 5 minutes",
    icon: Zap,
    unlocked: true,
    unlockedAt: "Mar 10, 2024",
  },
  {
    id: "deal-master",
    label: "Deal Master",
    description: "Complete 25 successful deals",
    icon: Briefcase,
    unlocked: true,
    unlockedAt: "Apr 5, 2024",
  },
  {
    id: "community-helper",
    label: "Community Helper",
    description: "Help 10 users in the forums",
    icon: Users,
    unlocked: false,
  },
  {
    id: "power-lister",
    label: "Power Lister",
    description: "Create 50+ active listings",
    icon: ListChecks,
    unlocked: false,
  },
  {
    id: "verified-pro",
    label: "Verified Pro",
    description: "Complete identity verification",
    icon: ShieldCheck,
    unlocked: true,
    unlockedAt: "Jan 10, 2024",
  },
  {
    id: "early-adopter",
    label: "Early Adopter",
    description: "Join during the beta period",
    icon: Rocket,
    unlocked: true,
    unlockedAt: "Jan 1, 2024",
  },
  {
    id: "photo-pro",
    label: "Photo Pro",
    description: "Upload high-quality photos to 20+ listings",
    icon: Camera,
    unlocked: false,
  },
  {
    id: "negotiator",
    label: "Negotiator",
    description: "Successfully negotiate 15 deals",
    icon: Target,
    unlocked: false,
  },
  {
    id: "five-star",
    label: "Five Star",
    description: "Maintain a 5.0 rating with 20+ reviews",
    icon: Award,
    unlocked: false,
  },
  {
    id: "speed-seller",
    label: "Speed Seller",
    description: "Sell an item within 24 hours of listing",
    icon: Clock,
    unlocked: true,
    unlockedAt: "Feb 1, 2024",
  },
];

export const getUnlockedAchievements = () =>
  MOCK_ACHIEVEMENTS.filter(a => a.unlocked);

export const getAchievementStats = () => ({
  unlocked: MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length,
  total: MOCK_ACHIEVEMENTS.length,
});
export type Activity = {
  type: "sale" | "purchase" | "achievement" | "alert";
  message: string;
  date: string;
};

export const placeholderActivities: Activity[] = [
  {
    type: "sale",
    message: "Sold an item: Vintage Camera",
    date: "2 hours ago",
  },
  {
    type: "purchase",
    message: "Bought an item: Wireless Headphones",
    date: "1 day ago",
  },
  {
    type: "achievement",
    message: "Unlocked achievement: Trusted Seller",
    date: "3 days ago",
  },
  {
    type: "sale",
    message: "Sold an item: Gaming Console",
    date: "4 days ago",
  },
  {
    type: "purchase",
    message: "Bought an item: Mechanical Keyboard",
    date: "5 days ago",
  },
  {
    type: "achievement",
    message: "Unlocked achievement: First Sale",
    date: "6 days ago",
  },
  {
    type: "sale",
    message: "Sold an item: Designer Jacket",
    date: "1 week ago",
  },
  {
    type: "alert",
    message: "Sale processing failed: ID 22481955371",
    date: "1 week ago",
  },
  {
    type: "purchase",
    message: "Bought an item: Smart Watch",
    date: "1 week ago",
  },
  {
    type: "sale",
    message: "Sold an item: Mountain Bike",
    date: "2 weeks ago",
  },
  {
    type: "achievement",
    message: "Unlocked achievement: Speed Seller",
    date: "2 weeks ago",
  },
  {
    type: "purchase",
    message: "Bought an item: Coffee Maker",
    date: "2 weeks ago",
  },
  {
    type: "sale",
    message: "Sold an item: Vintage Vinyl Records",
    date: "3 weeks ago",
  },
  {
    type: "purchase",
    message: "Bought an item: Designer Sunglasses",
    date: "3 weeks ago",
  },
  {
    type: "achievement",
    message: "Unlocked achievement: Deal Master",
    date: "3 weeks ago",
  },
  {
    type: "sale",
    message: "Sold an item: Gaming Chair",
    date: "1 month ago",
  },
  {
    type: "purchase",
    message: "Bought an item: Bluetooth Speaker",
    date: "1 month ago",
  },
  {
    type: "sale",
    message: "Sold an item: iPad Pro",
    date: "1 month ago",
  },
  {
    type: "achievement",
    message: "Unlocked achievement: Verified Pro",
    date: "1 month ago",
  },
  {
    type: "purchase",
    message: "Bought an item: Running Shoes",
    date: "1 month ago",
  },
  {
    type: "sale",
    message: "Sold an item: Electric Scooter",
    date: "2 months ago",
  },
  {
    type: "purchase",
    message: "Bought an item: Desk Lamp",
    date: "2 months ago",
  },
  {
    type: "sale",
    message: "Sold an item: Tennis Racket",
    date: "2 months ago",
  },
  {
    type: "achievement",
    message: "Unlocked achievement: Community Helper",
    date: "2 months ago",
  },
  {
    type: "purchase",
    message: "Bought an item: Camping Tent",
    date: "2 months ago",
  },
];export type ProductInfo = { title: string; price: string; image: string };

export type MessagePreview = {
  id: string;
  name: string;
  type: string;
  message: string;
  time: string;
  unread: number;
  status: "online" | "offline" | "always";
  product?: ProductInfo;
};

export type ConversationMessage = {
  id: string;
  sender: "me" | "them";
  content: string;
  timestamp: string;
  product?: ProductInfo;
};

export type ConversationData = { id: string; messages: ConversationMessage[] };

/* ---------- Placeholder data (swap with backend later) ---------- */
export const messagesData: MessagePreview[] = [
  {
    id: "1",
    name: "SneakerHead99",
    message: "Hey! Is the Nike Air Max still available? I'm very intereste...",
    type: "product",
    time: "2 min ago",
    unread: 2,
    status: "online",
    product: { title: "Nike Air Max - Blue/Orange", price: "$299.9", image: "/shoe.png" },
  },
  {
    id: "2",
    name: "AI Assistant",
    message: "I found 3 MacBook Pro listings that match your criteria...",
    type: "ai",
    time: "5 min ago",
    unread: 1,
    status: "always",
  },
  {
    id: "3",
    name: "VintageVibes",
    message: "You: Perfect! I'll take it. When can we meet?",
    type: "product",
    time: "1 hour ago",
    unread: 0,
    status: "offline",
    product: { title: "Vintage Leather Jacket", price: "$200", image: "/jacket.png" },
  },
  {
    id: "4",
    name: "Bean44",
    message: "Hello? Are you there?",
    type: "general",
    time: "3 hours ago",
    unread: 1,
    status: "offline",
  },
  {
    id: "5",
    name: "TechGuru",
    message: "I'm interested in the MacBook Pro. Is it still available?",
    type: "product",
    time: "4 hours ago",
    unread: 0,
    status: "online",
  },
  {
    id: "6",
    name: "FashionFan",
    message: "Do you have any other jackets in stock?",
    type: "general",
    time: "5 hours ago",
    unread: 3,
    status: "offline",
  },
  {
    id: "7",
    name: "GamingKing",
    message: "Can you send more photos of the PS5?",
    type: "product",
    time: "6 hours ago",
    unread: 0,
    status: "online",
  },
  {
    id: "8",
    name: "BookLover",
    message: "Is the textbook still available? I need it for next semester.",
    type: "general",
    time: "1 day ago",
    unread: 0,
    status: "offline",
  },
  {
    id: "9",
    name: "MusicMaker",
    message: "What's the lowest price you'd accept for the guitar?",
    type: "product",
    time: "1 day ago",
    unread: 2,
    status: "online",
  },
  {
    id: "10",
    name: "FitnessFreak",
    message: "Are the dumbbells still available?",
    type: "general",
    time: "2 days ago",
    unread: 0,
    status: "offline",
  },
  {
    id: "11",
    name: "PhotoPro",
    message: "I'm interested in the Canon camera. Can we negotiate?",
    type: "product",
    time: "2 days ago",
    unread: 1,
    status: "online",
  },
  {
    id: "12",
    name: "BikeRider",
    message: "What condition is the mountain bike in?",
    type: "general",
    time: "3 days ago",
    unread: 0,
    status: "offline",
  },
  {
    id: "13",
    name: "HomeDecorator",
    message: "Do you deliver furniture?",
    type: "general",
    time: "3 days ago",
    unread: 0,
    status: "online",
  },
  {
    id: "14",
    name: "PetOwner",
    message: "Is the pet carrier for cats or dogs?",
    type: "general",
    time: "4 days ago",
    unread: 0,
    status: "offline",
  },
  {
    id: "15",
    name: "ArtCollector",
    message: "Can you tell me more about the painting?",
    type: "product",
    time: "5 days ago",
    unread: 0,
    status: "offline",
  },
];

export const conversationsData: ConversationData[] = [
  {
    id: "1",
    messages: [
      // { id: "m0", sender: "them", content: "", timestamp: "10:00 AM", product: { title: "Nike Air Max - Blue/Orange", price: "$299.9", image: "/shoe.png" } },
      { id: "m1", sender: "them", content: "Hey! Is the Nike Air Max still available?", timestamp: "10:00 AM" },
      { id: "m2", sender: "me", content: "Yes, it's still available!", timestamp: "10:01 AM" },
      { id: "m3", sender: "them", content: "Awesome, can you hold it for me until tomorrow?", timestamp: "10:02 AM" },
      { id: "m4", sender: "me", content: "Sure, I can hold it for 24 hours. After that I'll have to open it back up.", timestamp: "10:03 AM" },
      { id: "m5", sender: "them", content: "Perfect! What's your location?", timestamp: "10:04 AM" },
      { id: "m6", sender: "me", content: "I'm near downtown, close to the metro station.", timestamp: "10:05 AM" },
      { id: "m7", sender: "them", content: "Great! That works for me. Can we meet there tomorrow at 3pm?", timestamp: "10:06 AM" },
      { id: "m8", sender: "me", content: "3pm works perfectly. I'll be at the coffee shop next to the station.", timestamp: "10:07 AM" },
      { id: "m9", sender: "them", content: "Sounds good! Should I bring cash or can you take Venmo?", timestamp: "10:08 AM" },
      { id: "m10", sender: "me", content: "Either works for me! Cash is preferred but Venmo is fine too.", timestamp: "10:09 AM" },
      { id: "m11", sender: "them", content: "I'll bring cash then. See you tomorrow!", timestamp: "10:10 AM" },
      { id: "m12", sender: "me", content: "See you then! Text me if anything comes up.", timestamp: "10:11 AM" },
      { id: "m13", sender: "them", content: "Will do, thanks!", timestamp: "10:12 AM" },
      { id: "m14", sender: "me", content: "No problem!", timestamp: "10:13 AM" },
      { id: "m15", sender: "them", content: "By the way, what size are they?", timestamp: "10:15 AM" },
      { id: "m16", sender: "me", content: "They're size 10.5, US men's sizing.", timestamp: "10:16 AM" },
      { id: "m17", sender: "them", content: "Perfect, that's my size!", timestamp: "10:17 AM" },
      { id: "m18", sender: "me", content: "Awesome! They're in great condition too, barely worn.", timestamp: "10:18 AM" },
      { id: "m19", sender: "them", content: "Even better. Looking forward to tomorrow!", timestamp: "10:19 AM" },
      { id: "m20", sender: "me", content: "Same here! Talk soon.", timestamp: "10:20 AM" },
    ],
  },
  {
    id: "2",
    messages: [
      { id: "m1", sender: "them", content: "I found 3 MacBook Pro listings that match your criteria.", timestamp: "9:30 AM" },
      { id: "m2", sender: "me", content: "That's great! Can you send me the details?", timestamp: "9:32 AM" },
      { id: "m3", sender: "them", content: "Sure! The first one is a 2021 model with M1 chip, 16GB RAM, 512GB SSD for $1200.", timestamp: "9:33 AM" },
      { id: "m4", sender: "me", content: "What about the other two?", timestamp: "9:34 AM" },
      { id: "m5", sender: "them", content: "Second one is 2020 Intel i7, 16GB RAM, 1TB SSD for $1100.", timestamp: "9:35 AM" },
      { id: "m6", sender: "them", content: "And the third is 2022 M2, 24GB RAM, 1TB SSD for $1800.", timestamp: "9:36 AM" },
      { id: "m7", sender: "me", content: "The M1 sounds good. Is it in good condition?", timestamp: "9:38 AM" },
      { id: "m8", sender: "them", content: "Yes, it's in excellent condition with minimal wear.", timestamp: "9:39 AM" },
    ],
  },
  {
    id: "3",
    messages: [
      { id: "m1", sender: "me", content: "Perfect! I'll take it. When can we meet?", timestamp: "Yesterday" },
      { id: "m2", sender: "them", content: "Tomorrow evening works for me.", timestamp: "Yesterday" },
      { id: "m3", sender: "me", content: "What time exactly?", timestamp: "Yesterday" },
      { id: "m4", sender: "them", content: "How about 6pm?", timestamp: "Yesterday" },
      { id: "m5", sender: "me", content: "That works! Where should we meet?", timestamp: "Yesterday" },
      { id: "m6", sender: "them", content: "There's a Starbucks on Main Street. That good for you?", timestamp: "Yesterday" },
    ],
  },
  {
    id: "4",
    messages: [
      { id: "m1", sender: "them", content: "Hello? Are you there?", timestamp: "1:00 AM" },
      { id: "m2", sender: "them", content: "I'm interested in your listing", timestamp: "1:05 AM" },
      { id: "m3", sender: "them", content: "Please let me know if it's still available", timestamp: "1:10 AM" },
    ],
  },
  {
    id: "5",
    messages: [],
  },
];
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
// Mock data for listing matches

export type MatchQuality = "excellent" | "good" | "possible";

export interface MatchReason {
  type: "category" | "price" | "location" | "keyword" | "timing";
  label: string;
  matched: boolean;
  details?: string;
}

export interface ListingMatch {
  id: string;
  yourListingId: number;
  matchedListing: Listing;
  matchScore: number; // 0-100
  matchQuality: MatchQuality;
  matchReasons: MatchReason[];
  distance?: string; // e.g., "5km away"
  createdAt: string;
  status: "new" | "contacted" | "dismissed";
  compatibility: {
    priceMatch: boolean;
    locationMatch: boolean;
    categoryMatch: boolean;
  };
}

// Generate mock matches for a specific listing
export function generateMatchesForListing(
  listingId: number,
  listingType: "sale" | "wanted"
): ListingMatch[] {
  const yourListing = listingType === "sale"
    ? mockSaleListings.find(l => l.id === listingId)
    : mockWantedListings.find(l => l.id === listingId);

  if (!yourListing) return [];

  // Generate matches based on the listing
  const matches: ListingMatch[] = [];

  // For demo purposes, create some matches
  if (listingId === 1 && listingType === "sale") {
    // iPhone 14 Pro listing matches
    matches.push({
      id: "match-1",
      yourListingId: 1,
      matchedListing: mockWantedListings[4], // iPhone 15 Pro Max wanted
      matchScore: 95,
      matchQuality: "excellent",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Same location", matched: true, details: "Kuala Lumpur" },
        { type: "price", label: "Price compatible", matched: true, details: "Within budget range" },
        { type: "keyword", label: "Similar product", matched: true, details: "iPhone Pro series" },
      ],
      distance: "Same city",
      createdAt: "2025-10-10T09:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: true,
        locationMatch: true,
        categoryMatch: true,
      }
    });

    matches.push({
      id: "match-2",
      yourListingId: 1,
      matchedListing: mockWantedListings[0], // MacBook Pro wanted
      matchScore: 72,
      matchQuality: "good",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Same location", matched: true, details: "Kuala Lumpur" },
        { type: "price", label: "Different price range", matched: false, details: "Price gap: RM 5,100" },
        { type: "keyword", label: "Related products", matched: true, details: "Apple ecosystem" },
      ],
      distance: "Same city",
      createdAt: "2025-10-10T08:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: false,
        locationMatch: true,
        categoryMatch: true,
      }
    });

    matches.push({
      id: "match-3",
      yourListingId: 1,
      matchedListing: mockWantedListings[7], // Smartwatch wanted
      matchScore: 68,
      matchQuality: "possible",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Nearby location", matched: true, details: "Ampang" },
        { type: "price", label: "Lower budget", matched: false, details: "Price gap: RM 1,700" },
        { type: "keyword", label: "Related products", matched: true, details: "Apple products" },
      ],
      distance: "12km away",
      createdAt: "2025-10-09T15:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: false,
        locationMatch: true,
        categoryMatch: true,
      }
    });
  } else if (listingId === 2 && listingType === "sale") {
    // MacBook Air listing matches
    matches.push({
      id: "match-4",
      yourListingId: 2,
      matchedListing: mockWantedListings[0], // MacBook Pro wanted
      matchScore: 92,
      matchQuality: "excellent",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Nearby location", matched: true, details: "Kuala Lumpur & Petaling Jaya" },
        { type: "price", label: "Price match", matched: true, details: "Within budget" },
        { type: "keyword", label: "Exact product match", matched: true, details: "MacBook series" },
      ],
      distance: "3km away",
      createdAt: "2025-10-10T07:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: true,
        locationMatch: true,
        categoryMatch: true,
      }
    });

    matches.push({
      id: "match-5",
      yourListingId: 2,
      matchedListing: mockWantedListings[5], // Gaming Monitor wanted
      matchScore: 65,
      matchQuality: "possible",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Computing" },
        { type: "location", label: "Different location", matched: false, details: "Cyberjaya" },
        { type: "price", label: "Lower budget", matched: false, details: "Price gap: RM 2,125" },
      ],
      distance: "18km away",
      createdAt: "2025-10-09T12:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: false,
        locationMatch: false,
        categoryMatch: true,
      }
    });
  } else if (listingId === 1 && listingType === "wanted") {
    // Want MacBook Pro - show for sale listings
    matches.push({
      id: "match-6",
      yourListingId: 1,
      matchedListing: mockSaleListings[1], // MacBook Air for sale
      matchScore: 88,
      matchQuality: "good",
      matchReasons: [
        { type: "category", label: "Same category", matched: true, details: "Electronics" },
        { type: "location", label: "Nearby location", matched: true, details: "Petaling Jaya" },
        { type: "price", label: "Close to budget", matched: true, details: "Slightly lower than budget" },
        { type: "keyword", label: "Similar product", matched: true, details: "MacBook series" },
      ],
      distance: "3km away",
      createdAt: "2025-10-10T06:00:00Z",
      status: "new",
      compatibility: {
        priceMatch: true,
        locationMatch: true,
        categoryMatch: true,
      }
    });
  }

  // Sort by match score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

// Get all matches for all user's listings
export function getAllUserMatches(userListingIds: number[]): Map<number, ListingMatch[]> {
  const allMatches = new Map<number, ListingMatch[]>();

  userListingIds.forEach(id => {
    // Determine if this is a sale or wanted listing
    const isSaleListing = mockSaleListings.some(l => l.id === id);
    const matches = generateMatchesForListing(id, isSaleListing ? "sale" : "wanted");
    if (matches.length > 0) {
      allMatches.set(id, matches);
    }
  });

  return allMatches;
}

// Get total match count for a listing
export function getMatchCount(listingId: number, listingType: "buy" | "sell"): number {
  const mappedType = listingType === "sell" ? "sale" : "wanted";
  return generateMatchesForListing(listingId, mappedType).length;
}
export type MockAIResponse = {
  prompt: string;
  content: string; // Now markdown content instead of separate fields
  images?: string[];
  sources?: string[];
};

export const mockAIResponses: MockAIResponse[] = [
  {
    prompt: "How do I verify if sneakers are authentic?",
    content: `Authentication is crucial in the sneaker resale market. The Air Jordan 1 'Chicago' is one of the most replicated sneakers, making verification essential before any purchase.

## Key Authentication Points

1. **Check the Swoosh** - Must be smooth, properly positioned, and symmetrical with clean edges
2. **Inspect Wings Logo** - Should have crisp embossing with clear 'AIR JORDAN' text and ® symbol
3. **Examine Stitching** - Look for consistent, straight lines with no loose threads or irregular spacing
4. **Verify Box Label** - Style code, production dates, and size must match the shoes exactly
5. **Assess Leather Quality** - Authentic pairs use premium leather with natural grain patterns

## Pro Tips

- Use professional authentication services like **CheckCheck** or **Legit App** ($10-30)
- Compare with verified authentic pairs on StockX or GOAT reference images
- Meet sellers at reputable sneaker stores that offer authentication services
- Request detailed photos of all angles, especially heel shape and toe box curve`,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&h=300&auto=format&fit=crop&q=60"
    ],
    sources: [
      "https://stockx.com/authentication-101",
      "https://www.goat.com/editorial/how-to-authenticate-jordans",
      "https://checkcheck.app/en/guide"
    ],
  },
  {
    prompt: "What's the current market value for Air Jordan 1 Chicago 2015?",
    content: `The 2015 Air Jordan 1 Retro High OG 'Chicago' remains one of the most valuable and sought-after sneakers in the resale market, with prices varying significantly based on condition, size, and seller platform.

## Current Market Prices

- **Size 9-11 (Most Popular)** - RM1,200 to RM1,500 for deadstock condition
- **Size 8 & 12-13** - RM900 to RM1,200 depending on condition
- **Smaller/Larger Sizes** - RM800 to RM1,000, typically more available
- **Lightly Worn Pairs** - Save RM200-400 compared to deadstock versions
- **Box Condition** - Original box with all accessories adds RM100-200 to value

## Market Tips

- Avoid listings under **RM700** - these are almost always replicas
- StockX and GOAT offer authentication but charge 10-15% service fees
- **Best time to buy**: Late December/January when many sellers liquidate inventory
- Price dropped 15% in 2024 due to market saturation - good time for buyers`,
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&h=300&auto=format&fit=crop&q=60"
    ],
    sources: [
      "https://stockx.com/air-jordan-1-retro-high-og-chicago",
      "https://www.goat.com/sneakers/air-jordan-1-retro-high-og-chicago",
      "https://www.stadiumgoods.com/shopping/jordan-1-chicago"
    ],
  },
  {
    prompt: "Should I invest in sneakers as collectibles?",
    content: `Sneaker investing has evolved into a legitimate alternative asset class, with the resale market valued at over **$6 billion globally**. However, like any investment, it requires research, market knowledge, and careful strategy.

## Investment Considerations

- **ROI Potential** - Top-tier releases can appreciate 200-500% within first year
- **Market Volatility** - Prices fluctuate based on trends, celebrity endorsements, and supply
- **Liquidity** - Popular models sell quickly on platforms like StockX, GOAT, and Stadium Goods
- **Storage Requirements** - Proper storage away from sunlight and humidity is essential
- **Authentication Risk** - Counterfeit market is sophisticated; always verify authenticity

## Investment Strategy

1. Focus on **limited collaborations** (Nike x Off-White, Travis Scott, etc.)
2. Diversify across multiple brands and styles rather than going all-in on one pair
3. Keep original boxes, receipts, and all accessories to maximize resale value
4. Track market trends using StockX price charts and historical data
5. Consider selling fees (10-15%) when calculating potential profit margins`,
    sources: [
      "https://www.cowen.com/insights/sneaker-resale-market-research/",
      "https://stockx.com/news/2024-sneaker-investment-guide/",
      "https://www.bloomberg.com/news/articles/sneaker-resale-market"
    ],
  },
  {
    prompt: "What are the best places to buy authentic sneakers in Malaysia?",
    content: `Malaysia has a growing sneaker culture with both physical stores and online platforms offering authentic products. Knowing where to shop safely is essential to avoid counterfeits.

## Trusted Retailers

- **Foot Locker & JD Sports** - Official retailers with guaranteed authenticity
- **Sole What** - Malaysia's leading sneaker consignment store with authentication
- **Sneaker LAB MY** - Trusted local marketplace with verification services
- **Limited Edt** - Premium streetwear and sneaker boutique in KL
- **Online**: StockX, GOAT, eBay Authenticity Guarantee - Ship to Malaysia with authentication

## Shopping Tips

- Join Facebook groups like **'Sneaker Head Malaysia'** for community deals
- Attend sneaker conventions like **Sole Superior** for networking and purchases
- Use **PayPal Goods & Services** for buyer protection on peer-to-peer sales
- Beware of Instagram sellers without verified track records or escrow services`,
    images: [
      "https://images.unsplash.com/photo-1465479423260-c2bcd53b3d4e?w=300&h=300&auto=format&fit=crop&q=60"
    ],
    sources: [
      "https://solekl.com/",
      "https://www.footlocker.com.my/",
      "https://sneakerlab.my/"
    ],
  },
];
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
export type SearchSuggestion = {
  id: string;
  type: 'chat'
  title: string;
  path: string; // The path to navigate to
  icon?: string; // Optional icon name for display
};

type ToolCall = {
  name: string;
  status: string;
  result?: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
};

export type ChatHistoryItem = {
  id: number;
  title: string;
  timestamp: string; // e.g., "2 hours ago", "1 day ago"
  created_at: string; // ISO string for actual date
  messages?: Message[]; // Detailed messages for the chat
};

// --- Mock Data for Search Suggestions ---
export const mockSearchSuggestions: SearchSuggestion[] = [

  // General Chat History (from Sidebar.tsx mockChatHistory)
  { id: 'chat-iphone-14', type: 'chat', title: 'iPhone 14 Pro price comparison', path: '/chat/history?id=1', icon: 'MessageSquare' },
  { id: 'chat-gaming-pc', type: 'chat', title: 'Gaming PC under RM4000', path: '/chat/history?id=2', icon: 'MessageSquare' },
  { id: 'chat-nintendo-switch', type: 'chat', title: 'Verify Nintendo Switch seller', path: '/chat/history?id=3', icon: 'MessageSquare' },
  { id: 'chat-gaming-pc-parts', type: 'chat', title: 'Gaming PC parts compatibility', path: '/chat/history?id=4', icon: 'MessageSquare' },
  { id: 'chat-vintage-watch', type: 'chat', title: 'Vintage watch authenticity verification', path: '/chat/history?id=5', icon: 'MessageSquare' },
  { id: 'chat-camera-lens', type: 'chat', title: 'Camera lens condition assessment', path: '/chat/history?id=6', icon: 'MessageSquare' },
  { id: 'chat-furniture-quality', type: 'chat', title: 'Furniture quality vs price analysis', path: '/chat/history?id=7', icon: 'MessageSquare' },
  { id: 'chat-electric-bike', type: 'chat', title: 'Electric bike safety standards', path: '/chat/history?id=8', icon: 'MessageSquare' },
  { id: 'chat-designer-handbag', type: 'chat', title: 'Designer handbag authentication tips', path: '/chat/history?id=9', icon: 'MessageSquare' },
  { id: 'chat-motorcycle-maintenance', type: 'chat', title: 'Motorcycle maintenance costs Honda', path: '/chat/history?id=10', icon: 'MessageSquare' },
  { id: 'chat-smartphone-trade-in', type: 'chat', title: 'Smartphone trade-in value check', path: '/chat/history?id=11', icon: 'MessageSquare' },
  { id: 'chat-laptop-performance', type: 'chat', title: 'Laptop performance benchmarks', path: '/chat/history?id=12', icon: 'MessageSquare' },
  { id: 'chat-art-print-value', type: 'chat', title: 'Art print value estimation', path: '/chat/history?id=13', icon: 'MessageSquare' },
  { id: 'chat-kitchen-appliance', type: 'chat', title: 'Kitchen appliance energy ratings', path: '/chat/history?id=14', icon: 'MessageSquare' },
  { id: 'chat-exercise-equipment', type: 'chat', title: 'Exercise equipment durability test', path: '/chat/history?id=15', icon: 'MessageSquare' },
  { id: 'chat-board-game', type: 'chat', title: 'Board game condition grading', path: '/chat/history?id=16', icon: 'MessageSquare' },
  { id: 'chat-power-tools', type: 'chat', title: 'Power tools safety inspection', path: '/chat/history?id=17', icon: 'MessageSquare' },
  { id: 'chat-sneaker', type: 'chat', title: 'Sneaker authenticity red flags', path: '/chat/history?id=18', icon: 'MessageSquare' },
  { id: 'chat-home-theater', type: 'chat', title: 'Home theater setup compatibility', path: '/chat/history?id=19', icon: 'MessageSquare' },
  { id: 'chat-musical-instrument', type: 'chat', title: 'Musical instrument condition check', path: '/chat/history?id=20', icon: 'MessageSquare' },
];

// --- Mock Data for Full Chat History Page and Sidebar Menus ---
export const mockFullChatHistory: ChatHistoryItem[] = [
  {
    id: 1,
    title: "iPhone 14 Pro price comparison",
    timestamp: "2 hours ago",
    created_at: "2025-10-03T14:00:00Z",
    messages: [
      { id: "1-1", role: "user", content: "Compare iPhone 14 Pro prices", timestamp: new Date("2025-10-03T13:58:00Z") },
      { id: "1-2", role: "assistant", content: "Searching for iPhone 14 Pro deals...", timestamp: new Date("2025-10-03T13:58:10Z") },
      { id: "1-3", role: "assistant", content: "Found several options. The best deal is RM4500 from Seller A.", timestamp: new Date("2025-10-03T13:58:30Z") },
    ]
  },
  {
    id: 2,
    title: "Gaming PC under RM4000",
    timestamp: "5 hours ago",
    created_at: "2025-10-03T11:00:00Z",
    messages: [
      { id: "2-1", role: "user", content: "Find gaming PCs under RM4000", timestamp: new Date("2025-10-03T10:59:00Z") },
      { id: "2-2", role: "assistant", content: "Let me help you with that. I'll search our listings and analyze the best options...", timestamp: new Date("2025-10-03T10:59:10Z"), toolCalls: [{ name: "search_listings", status: "completed", result: "Found 12 listings" }] },
      { id: "2-3", role: "assistant", content: "✅ **Analysis Complete!**\n\nI found **12 gaming PCs** under RM4000. Here are your best options:\n\n1. **RTX 4070 Gaming PC** - RM3,500 (Verified seller)\n2. **Custom Build RTX 4060 Ti** - RM3,200 (Top rated)\n3. **Pre-built Gaming Rig** - RM3,800 (Like new)\n\nAll sellers have 4.5+ ratings. Would you like me to track prices or get more details on any listing?", timestamp: new Date("2025-10-03T10:59:40Z") },
    ]
  },
  {
    id: 3,
    title: "Verify Nintendo Switch seller",
    timestamp: "1 day ago",
    created_at: "2025-10-02T16:00:00Z",
    messages: [
      { id: "3-1", role: "user", content: "Is this Nintendo Switch seller reliable?", timestamp: new Date("2025-10-02T15:58:00Z") },
      { id: "3-2", role: "assistant", content: "Checking seller ratings and reviews...", timestamp: new Date("2025-10-02T15:58:05Z"), toolCalls: [{ name: "verify_sellers", status: "completed", result: "Seller 'GameMaster' has a 4.8-star rating" }] },
      { id: "3-3", role: "assistant", content: "Seller 'GameMaster' has a 4.8-star rating with over 500 sales. They are highly reliable.", timestamp: new Date("2025-10-02T15:58:20Z") },
    ]
  },
  {
    id: 4,
    title: "Gaming PC parts compatibility",
    timestamp: "1 day ago",
    created_at: "2025-10-02T13:30:00Z",
    messages: [
      { id: "4-1", role: "user", content: "Are an Intel i7-12700K and an RTX 3070 compatible?", timestamp: new Date("2025-10-02T13:28:00Z") },
      { id: "4-2", role: "assistant", content: "Yes, an Intel i7-12700K and an RTX 3070 are generally compatible. You'll need a motherboard with an LGA 1700 socket for the CPU and a PCIe x16 slot for the GPU, along with a sufficient power supply.", timestamp: new Date("2025-10-02T13:28:45Z") },
    ]
  },
  {
    id: 5,
    title: "Vintage watch authenticity verification",
    timestamp: "2 days ago",
    created_at: "2025-10-01T19:45:00Z",
    messages: [
      { id: "5-1", role: "user", content: "How to verify a vintage Rolex?", timestamp: new Date("2025-10-01T19:43:00Z") },
      { id: "5-2", role: "assistant", content: "Authenticating a vintage Rolex involves checking the serial number, movement, dial, case, and bracelet. It's highly recommended to consult a certified watchmaker or expert.", timestamp: new Date("2025-10-01T19:43:50Z") },
    ]
  },
  {
    id: 6,
    title: "Camera lens condition assessment",
    timestamp: "3 days ago",
    created_at: "2025-09-30T10:30:00Z",
    messages: [
      { id: "6-1", role: "user", content: "What to look for when buying a used camera lens?", timestamp: new Date("2025-09-30T10:28:00Z") },
      { id: "6-2", role: "assistant", content: "Check for fungus, haze, scratches on glass elements, smooth focus and aperture rings, and proper functioning of autofocus and image stabilization.", timestamp: new Date("2025-09-30T10:28:50Z") },
    ]
  },
  {
    id: 7,
    title: "Furniture quality vs price analysis",
    timestamp: "4 days ago",
    created_at: "2025-09-29T14:20:00Z",
    messages: [
      { id: "7-1", role: "user", content: "Is solid wood always better than engineered wood for furniture?", timestamp: new Date("2025-09-29T14:18:00Z") },
      { id: "7-2", role: "assistant", content: "Solid wood is generally more durable and can be refinished, but engineered wood can be more stable in varying humidity and often more affordable. The 'better' choice depends on budget, use, and desired aesthetic.", timestamp: new Date("2025-09-29T14:19:10Z") },
    ]
  },
  {
    id: 8,
    title: "Electric bike safety standards",
    timestamp: "5 days ago",
    created_at: "2025-09-28T08:15:00Z",
    messages: [
      { id: "8-1", role: "user", content: "What safety standards should an e-bike meet?", timestamp: new Date("2025-09-28T08:13:00Z") },
      { id: "8-2", role: "assistant", content: "Look for certifications like EN 15194 (Europe), UL 2849 (US for electrical systems), and ensure it has proper brakes, lights, and reflectors. Always wear a helmet!", timestamp: new Date("2025-09-28T08:14:00Z") },
    ]
  },
  {
    id: 9,
    title: "Designer handbag authentication tips",
    timestamp: "1 week ago",
    created_at: "2025-09-26T16:40:00Z",
    messages: [
      { id: "9-1", role: "user", content: "How to spot a fake Louis Vuitton bag?", timestamp: new Date("2025-09-26T16:38:00Z") },
      { id: "9-2", role: "assistant", content: "Examine the stitching, hardware, date code, materials, and overall craftsmanship. Authentic bags have consistent patterns and high-quality details. When in doubt, use a professional authentication service.", timestamp: new Date("2025-09-26T16:39:15Z") },
    ]
  },
  {
    id: 10,
    title: "Motorcycle maintenance costs Honda",
    timestamp: "1 week ago",
    created_at: "2025-09-26T09:15:00Z",
    messages: [
      { id: "10-1", role: "user", content: "What are typical maintenance costs for a Honda CBR500R?", timestamp: new Date("2025-09-26T09:13:00Z") },
      { id: "10-2", role: "assistant", content: "Routine maintenance for a Honda CBR500R typically includes oil changes, chain lubrication, tire checks, and brake fluid flushes. Costs vary by region and service provider, but expect a few hundred dollars annually for basic upkeep.", timestamp: new Date("2025-09-26T09:14:30Z") },
    ]
  },
  {
    id: 11,
    title: "Smartphone trade-in value check",
    timestamp: "1 week ago",
    created_at: "2025-09-25T12:30:00Z",
    messages: [
      { id: "11-1", role: "user", content: "What's the trade-in value for an iPhone 12 Pro Max?", timestamp: new Date("2025-09-25T12:28:00Z") },
      { id: "11-2", role: "assistant", content: "Trade-in values for an iPhone 12 Pro Max depend on its condition, storage capacity, and the carrier/retailer. Expect anywhere from $200-$400 USD. Check specific trade-in programs for current offers.", timestamp: new Date("2025-09-25T12:29:10Z") },
    ]
  },
  {
    id: 12,
    title: "Laptop performance benchmarks",
    timestamp: "1 week ago",
    created_at: "2025-09-24T15:45:00Z",
    messages: [
      { id: "12-1", role: "user", content: "What are good benchmarks for a gaming laptop?", timestamp: new Date("2025-09-24T15:43:00Z") },
      { id: "12-2", role: "assistant", content: "For gaming laptops, look at 3DMark scores (Time Spy, Fire Strike), Cinebench for CPU performance, and actual in-game FPS benchmarks for titles you play. Aim for consistent high FPS at your desired resolution.", timestamp: new Date("2025-09-24T15:44:10Z") },
    ]
  },
  {
    id: 13,
    title: "Art print value estimation",
    timestamp: "2 weeks ago",
    created_at: "2025-09-19T14:45:00Z",
    messages: [
      { id: "13-1", role: "user", content: "How to estimate the value of a limited edition art print?", timestamp: new Date("2025-09-19T14:43:00Z") },
      { id: "13-2", role: "assistant", content: "Factors include the artist's reputation, edition size, condition of the print, signature, provenance, and recent auction results for similar works. Professional appraisal is recommended for accurate valuation.", timestamp: new Date("2025-09-19T14:44:15Z") },
    ]
  },
  {
    id: 14,
    title: "Kitchen appliance energy ratings",
    timestamp: "2 weeks ago",
    created_at: "2025-09-18T11:20:00Z",
    messages: [
      { id: "14-1", role: "user", content: "What do energy star ratings mean for refrigerators?", timestamp: new Date("2025-09-18T11:18:00Z") },
      { id: "14-2", role: "assistant", content: "Energy Star ratings indicate that an appliance meets strict energy efficiency guidelines set by the EPA. For refrigerators, this means it consumes less energy than standard models, saving you money on electricity bills.", timestamp: new Date("2025-09-18T11:19:10Z") },
    ]
  },
  {
    id: 15,
    title: "Exercise equipment durability test",
    timestamp: "2 weeks ago",
    created_at: "2025-09-17T18:30:00Z",
    messages: [
      { id: "15-1", role: "user", content: "How to check the durability of a used treadmill?", timestamp: new Date("2025-09-17T18:28:00Z") },
      { id: "15-2", role: "assistant", content: "Inspect the frame for cracks, test the motor for smooth operation and unusual noises, check the belt for wear and tear, and ensure all electronic functions work. A sturdy frame and powerful motor are key indicators of durability.", timestamp: new Date("2025-09-17T18:29:15Z") },
    ]
  },
  {
    id: 16,
    title: "Board game condition grading",
    timestamp: "3 weeks ago",
    created_at: "2025-09-12T15:30:00Z",
    messages: [
      { id: "16-1", role: "user", content: "What are the common grading scales for used board games?", timestamp: new Date("2025-09-12T15:28:00Z") },
      { id: "16-2", role: "assistant", content: "Common scales include 'New/Sealed', 'Like New', 'Very Good', 'Good', 'Acceptable', and 'Poor'. These refer to the condition of the box, components, and rulebooks. Always ask for photos and detailed descriptions.", timestamp: new Date("2025-09-12T15:29:10Z") },
    ]
  },
  {
    id: 17,
    title: "Power tools safety inspection",
    timestamp: "3 weeks ago",
    created_at: "2025-09-11T08:45:00Z",
    messages: [
      { id: "17-1", role: "user", content: "Safety checks for used power tools?", timestamp: new Date("2025-09-11T08:43:00Z") },
      { id: "17-2", role: "assistant", content: "Inspect the power cord for damage, ensure all guards and safety features are present and functional, check for loose parts, and test the on/off switch. Never use a damaged tool.", timestamp: new Date("2025-09-11T08:44:10Z") },
    ]
  },
  {
    id: 18,
    title: "Sneaker authenticity red flags",
    timestamp: "3 weeks ago",
    created_at: "2025-09-10T20:15:00Z",
    messages: [
      { id: "18-1", role: "user", content: "How to tell if sneakers are fake?", timestamp: new Date("2025-09-10T20:13:00Z") },
      { id: "18-2", role: "assistant", content: "Look for inconsistencies in stitching, logo placement, material quality, and packaging. Compare with official images. If the price seems too good to be true, it probably is. Use authentication apps if unsure.", timestamp: new Date("2025-09-10T20:14:15Z") },
    ]
  },
  {
    id: 19,
    title: "Home theater setup compatibility",
    timestamp: "1 month ago",
    created_at: "2025-09-03T13:20:00Z",
    messages: [
      { id: "19-1", role: "user", content: "Can I connect a new 4K TV to an old receiver?", timestamp: new Date("2025-09-03T13:18:00Z") },
      { id: "19-2", role: "assistant", content: "It depends on the receiver's ports. If your receiver has HDMI inputs that support HDCP 2.2 and 4K passthrough, it might work. Otherwise, you might need an HDMI audio extractor or a new receiver.", timestamp: new Date("2025-09-03T13:19:10Z") },
    ]
  },
  {
    id: 20,
    title: "Musical instrument condition check",
    timestamp: "1 month ago",
    created_at: "2025-08-28T16:10:00Z",
    messages: [
      { id: "20-1", role: "user", content: "What to check when buying a used guitar?", timestamp: new Date("2025-08-28T16:08:00Z") },
      { id: "20-2", role: "assistant", content: "Inspect the neck for straightness, frets for wear, tuners for stability, electronics for functionality, and the body for cracks or damage. Play it to check intonation and action.", timestamp: new Date("2025-08-28T16:09:15Z") },
    ]
  },
  // {
  //   id: 21,
  //   title: "Collectible toy market trends",
  //   timestamp: "1 month ago",
  //   created_at: "2025-08-25T12:00:00Z",
  //   messages: [
  //     { id: "21-1", role: "user", content: "Are Funko Pops still a good investment?", timestamp: new Date("2025-08-25T11:58:00Z") },
  //     { id: "21-2", role: "assistant", content: "While some rare Funko Pops can appreciate, the market is volatile. Focus on limited editions, chase variants, and popular franchises. Collect what you love, and any value increase is a bonus.", timestamp: new Date("2025-08-25T11:59:10Z") },
  //   ]
  // },
  // {
  //   id: 22,
  //   title: "Textbook edition differences",
  //   timestamp: "1 month ago",
  //   created_at: "2025-08-22T09:30:00Z",
  //   messages: [
  //     { id: "22-1", role: "user", content: "What's the difference between the 8th and 9th edition of 'Calculus: Early Transcendentals'?", timestamp: new Date("2025-08-22T09:28:00Z") },
  //     { id: "22-2", role: "assistant", content: "Newer editions often have updated examples, exercises, and sometimes minor content revisions. Page numbers for topics might shift. Check with your instructor if an older edition is acceptable for your course.", timestamp: new Date("2025-08-22T09:29:10Z") },
  //   ]
  // },
  // {
  //   id: 23,
  //   title: "Garden equipment seasonal pricing",
  //   timestamp: "2 months ago",
  //   created_at: "2025-08-15T10:30:00Z",
  //   messages: [
  //     { id: "23-1", role: "user", content: "When is the best time to buy a lawnmower?", timestamp: new Date("2025-08-15T10:28:00Z") },
  //     { id: "23-2", role: "assistant", content: "The best time to buy a lawnmower is typically in late fall or early winter when retailers clear out seasonal inventory to make room for new models. You can often find significant discounts then.", timestamp: new Date("2025-08-15T10:29:10Z") },
  //   ]
  // },
  // {
  //   id: 24,
  //   title: "Sports gear quality indicators",
  //   timestamp: "2 months ago",
  //   created_at: "2025-08-10T14:15:00Z",
  //   messages: [
  //     { id: "24-1", role: "user", content: "How to assess the quality of a used bicycle?", timestamp: new Date("2025-08-10T14:13:00Z") },
  //     { id: "24-2", role: "assistant", content: "Check the frame for cracks, wheels for true-ness, brakes for responsiveness, gears for smooth shifting, and chain for rust/wear. Test ride it to feel for any issues. High-quality components (Shimano, SRAM) are a good sign.", timestamp: new Date("2025-08-10T14:14:15Z") },
  //   ]
  // },
  // {
  //   id: 25,
  //   title: "Vintage clothing sizing guide",
  //   timestamp: "2 months ago",
  //   created_at: "2025-08-05T09:45:00Z",
  //   messages: [
  //     { id: "25-1", role: "user", content: "How does vintage clothing sizing compare to modern sizing?", timestamp: new Date("2025-08-05T09:43:00Z") },
  //     { id: "25-2", role: "assistant", content: "Vintage sizing is often smaller than modern sizing due to changes in manufacturing standards and body ideals. Always rely on measurements (bust, waist, hips, length) rather than just the tag size when buying vintage.", timestamp: new Date("2025-08-05T09:44:10Z") },
  //   ]
  // },
  // {
  //   id: 26,
  //   title: "Electronic component lifespan",
  //   timestamp: "2 months ago",
  //   created_at: "2025-07-30T17:20:00Z",
  //   messages: [
  //     { id: "26-1", role: "user", content: "What's the expected lifespan of a typical SSD?", timestamp: new Date("2025-07-30T17:18:00Z") },
  //     { id: "26-2", role: "assistant", content: "Modern SSDs are very durable, with lifespans often measured in Terabytes Written (TBW). For average users, an SSD can easily last 5-10 years or more before reaching its write endurance limit.", timestamp: new Date("2025-07-30T17:19:10Z") },
  //   ]
  // },
  // {
  //   id: 27,
  //   title: "Jewelry appraisal process",
  //   timestamp: "3 months ago",
  //   created_at: "2025-07-20T11:30:00Z",
  //   messages: [
  //     { id: "27-1", role: "user", content: "How does jewelry appraisal work?", timestamp: new Date("2025-07-20T11:28:00Z") },
  //     { id: "27-2", role: "assistant", content: "A jewelry appraisal involves a professional gemologist examining the item, identifying materials, assessing quality (e.g., 4Cs for diamonds), and researching market value to determine its worth for insurance, resale, or estate purposes.", timestamp: new Date("2025-07-20T11:29:15Z") },
  //   ]
  // },
  // {
  //   id: 28,
  //   title: "Car parts compatibility matrix",
  //   timestamp: "3 months ago",
  //   created_at: "2025-07-15T14:45:00Z",
  //   messages: [
  //     { id: "28-1", role: "user", content: "Are brake pads from a 2015 Honda Civic compatible with a 2018 model?", timestamp: new Date("2025-07-15T14:43:00Z") },
  //     { id: "28-2", role: "assistant", content: "Brake pad compatibility often varies even within the same model line across different years or trims. Always check the specific part numbers and vehicle specifications (year, make, model, trim, engine size) to ensure a correct fit.", timestamp: new Date("2025-07-15T14:44:15Z") },
  //   ]
  // },
  // {
  //   id: 29,
  //   title: "Antique furniture restoration cost",
  //   timestamp: "3 months ago",
  //   created_at: "2025-07-10T16:20:00Z",
  //   messages: [
  //     { id: "29-1", role: "user", content: "How much does it cost to restore an antique wooden chair?", timestamp: new Date("2025-07-10T16:18:00Z") },
  //     { id: "29-2", role: "assistant", content: "Restoration costs for antique furniture vary widely based on the extent of damage, type of wood, and complexity of the piece. Minor repairs might be $100-$300, while full structural and cosmetic restoration could be $500-$1500+. Get multiple quotes from specialists.", timestamp: new Date("2025-07-10T16:19:30Z") },
  //   ]
  // },
  // {
  //   id: 30,
  //   title: "Tech gadget depreciation rates",
  //   timestamp: "4 months ago",
  //   created_at: "2025-06-25T13:10:00Z",
  //   messages: [
  //     { id: "30-1", role: "user", content: "What are typical depreciation rates for smartphones?", timestamp: new Date("2025-06-25T13:08:00Z") },
  //     { id: "30-2", role: "assistant", content: "Smartphones typically depreciate rapidly, losing 20-40% of their value in the first year and continuing to drop. Flagship models tend to hold value slightly better initially but still see significant drops with new releases.", timestamp: new Date("2025-06-25T13:09:15Z") },
  //   ]
  // },
];// /utils/mock-threads-faq-data.ts
import { Question } from "@/components/threads/product-faq/types";

// Structure: { [listingId: string]: Question[] }
export const mockListingFAQs: Record<string, Question[]> = {
  // Nike Kobe 5 Protro FAQs
  "fash-001": [
    {
      id: "q1",
      question: "What's the exact condition of the shoes?",
      description:
        "You mentioned indoor court only - any scuffs, sole separation, or yellowing?",
      answers: [
        {
          id: "a1_1",
          user: "HoopsMaster",
          text: "Condition is 8.5/10. Soles have great traction left, no separation. Minor scuffing on the toe box from pivoting but nothing major. No yellowing on the midsole. Insoles are still in great shape.",
          isAccepted: true,
          likes: 12,
          dislikes: 1,
          replies: [
            {
              id: "r1_1",
              user: "Baller23",
              text: "Can you post close-up pics of the sole and toe box?",
              likes: 3,
              dislikes: 0,
              replies: [
                {
                  id: "r1_1_1",
                  user: "HoopsMaster",
                  text: "Sure! I'll upload them to the gallery tonight.",
                  likes: 5,
                  dislikes: 0,
                  replies: [],
                },
              ],
            },
            {
              id: "r1_2",
              user: "CourtKing",
              text: "Indoor only is a big plus. These should last a while!",
              likes: 7,
              dislikes: 0,
              replies: [],
            },
          ],
        },
        {
          id: "a1_2",
          user: "SneakerHead88",
          text: "For indoor use only, that's actually really good condition. Indoor courts are way less harsh on shoes.",
          likes: 4,
          dislikes: 0,
          replies: [],
        },
      ],
      isAnsweredByPoster: true,
    },
    {
      id: "q2",
      question: "Is this colorway authentic or custom?",
      description:
        "You mentioned rare colorway - is this an official Nike release?",
      answers: [
        {
          id: "a2_1",
          user: "HoopsMaster",
          text: "100% authentic Nike release. This is the 'Bruce Lee' alternate colorway from the 2020 drop. Comes with original box and extra laces. Can provide receipt from Nike Store KL if needed.",
          isAccepted: true,
          likes: 18,
          dislikes: 0,
          replies: [
            {
              id: "r2_1",
              user: "AuthenticCheck",
              text: "Bruce Lee colorway is legit fire 🔥 Good price too!",
              likes: 9,
              dislikes: 0,
              replies: [],
            },
          ],
        },
      ],
      isAnsweredByPoster: true,
    },
    {
      id: "q3",
      question: "Does it fit true to size?",
      description:
        "I'm normally a size 10.5, should I size up or down for Kobe 5s?",
      answers: [
        {
          id: "a3_1",
          user: "HoopsMaster",
          text: "Kobe 5s fit snug, which is great for court feel. If you're 10.5, size 11 might actually work well for you. I'm a true 11 and these fit perfectly - not too tight, not loose.",
          isAccepted: true,
          likes: 6,
          dislikes: 0,
          replies: [],
        },
        {
          id: "a3_2",
          user: "SizeExpert",
          text: "Kobe models generally run narrow and snug. If you have wide feet, definitely size up. For normal width, TTS works.",
          likes: 8,
          dislikes: 1,
          replies: [
            {
              id: "r3_1",
              user: "WideFeetGuy",
              text: "Can confirm - I have wide feet and had to go half size up on Kobe 6s",
              likes: 3,
              dislikes: 0,
              replies: [],
            },
          ],
        },
      ],
      isAnsweredByPoster: true,
    },
    {
      id: "q4",
      question: "Can you ship to Penang?",
      description: "How much would shipping cost and how long would it take?",
      answers: [
        {
          id: "a4_1",
          user: "HoopsMaster",
          text: "Yes, I can ship nationwide! To Penang from JB, shipping via J&T would be around RM15-20. Takes about 3-5 days. Can also use Lalamove if you want faster delivery (1-2 days) but costs more.",
          isAccepted: true,
          likes: 5,
          dislikes: 0,
          replies: [],
        },
      ],
      isAnsweredByPoster: true,
    },
    {
      id: "q5",
      question: "Are the original insoles included?",
      description:
        "Some people replace insoles - do these still have the Nike Zoom insoles?",
      answers: [],
      isAnsweredByPoster: false,
    },
    {
      id: "q6",
      question: "Price negotiable?",
      description: "Interested but RM750 is slightly over my budget",
      answers: [],
      isAnsweredByPoster: false,
    },
  ],
};

// Helper function to get FAQs for a specific listing
export function getListingFAQs(listingId: string): Question[] {
  return mockListingFAQs[listingId] || [];
}

// Helper to check if listing has FAQs
export function hasListingFAQs(listingId: string): boolean {
  const faqs = mockListingFAQs[listingId];
  return faqs !== undefined && faqs.length > 0;
}

// Keep this if you still need it elsewhere
export const mockAiSummary = `
# Listing Analysis Summary

## Key Information Provided

Based on the current FAQ discussions, the listing has addressed the following critical details:

#### Sizing Information
Standard US sizing with reference to a size chart

#### Durability
High-quality vegan leather construction with reinforced stitching, expected lifespan of 12+ months with daily use

#### Build Quality
Multiple users confirm long-term satisfaction with durability

---

## Outstanding Questions

### Critical ⚠️

#### Warranty Terms
No response provided yet - this is a potential deal blocker for risk-averse buyers

---

## Community Insights

Users report shoes run slightly small - recommend sizing up

Verified user testimony: "Over a year with daily wear" indicates strong product reliability

---

## Negotiation Readiness Score: **75%**

#### To improve readiness:
1. Address warranty policy question
2. Add waterproofing/weather resistance details
3. Clarify return policy for incorrect sizing

---

*This analysis helps both buyers and sellers ensure all critical information is addressed before proceeding to negotiation.*
`;

// ============================================================================
// CONFIGURATION DATA (extracted from hardcoded components)
// ============================================================================


// Pricing Page - Tier Features Configuration
export const TIER_FEATURES = [
  {
    category: "Listing Creation",
    tiers: [
      { free: "1/month, 3 days", premium: "3/month, 7 days" },
      { free: "2/month, 7 days", premium: "5/month, 14 days" },
      { free: "5/month, 14 days", premium: "15/month, 30 days" },
      { free: "10/month, 30 days", premium: "Unlimited, 60 days" },
    ],
  },
  {
    category: "AI Search",
    tiers: [
      { free: "3/month", premium: "15/month" },
      { free: "Unlimited", premium: "Unlimited (faster)" },
      { free: "Unlimited", premium: "Unlimited (priority)" },
      { free: "Unlimited", premium: "Unlimited (priority queue)" },
    ],
  },
  {
    category: "AI Tools Access",
    tiers: [
      { free: false, premium: false },
      { free: false, premium: "1 AI-assist/day" },
      { free: "3 AI-assists/day", premium: "Unlimited" },
      { free: "10 AI-assists/day", premium: "Unlimited" },
    ],
  },
  {
    category: "AI FAQ Bot",
    tiers: [
      { free: false, premium: "Basic (5 min)" },
      { free: "Basic (15 min)", premium: "Standard (instant)" },
      { free: "Standard (instant)", premium: "Advanced (context)" },
      { free: "Advanced (context)", premium: "Premium+ (predictive)" },
    ],
  },
  {
    category: "Smart Matching",
    tiers: [
      { free: "Random order only", premium: "Basic sorting" },
      { free: "Basic sorting", premium: "AI compatibility scores" },
      { free: "AI compatibility", premium: "Advanced AI + probability" },
      { free: "Advanced AI", premium: "Premium+ (negotiation)" },
    ],
  },
];

// NgamOverview - Default AI Suggestions
export const DEFAULT_AI_SUGGESTIONS = [
  "Show me more details",
  "Is the price fair right now?",
  "Common defects to check?",
  "How to verify authenticity?",
];

// AI Matching Kanban - Column Configuration
export const KANBAN_COLUMNS = [
  {
    id: "passed" as const,
    title: "Passed",
    iconName: "Ban",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "queue" as const,
    title: "For You",
    iconName: "Sparkles",
    color: "text-secondary-600",
    bgColor: "bg-secondary-100",
  },
  {
    id: "liked" as const,
    title: "Liked",
    iconName: "Heart",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

// Listings Page - Tab Configuration
export const LISTINGS_TABS = [
  { label: "Sale Listings", value: "sale", iconName: "ShoppingCart" },
  { label: "Want Listings", value: "wanted", iconName: "Package" },
];

// Profile Page - Tab Configuration
export const PROFILE_TABS = [
  { label: "Overview", href: "/profile" },
  { label: "Activity", href: "/profile/activity" },
];
