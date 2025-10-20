export type ProductInfo = { title: string; price: string; image: string };

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
