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
];