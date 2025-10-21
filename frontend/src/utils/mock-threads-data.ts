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
    category: "ai-tools", // More specific for AI/software content
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
