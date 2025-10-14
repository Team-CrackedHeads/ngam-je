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
];

export const conversationsData: ConversationData[] = [
  {
    id: "1",
    messages: [
      // { id: "m0", sender: "them", content: "", timestamp: "10:00 AM", product: { title: "Nike Air Max - Blue/Orange", price: "$299.9", image: "/shoe.png" } },
      { id: "m1", sender: "them", content: "Hey! Is the Nike Air Max still available?", timestamp: "10:00 AM" },
      { id: "m2", sender: "me", content: "Yes, it's still available!", timestamp: "10:01 AM" },
      { id: "m3", sender: "them", content: "Awesome, can you hold it for me until tomorrow?", timestamp: "10:02 AM" },
    ],
  },
  {
    id: "2",
    messages: [
      {
        id: "m1",
        sender: "them",
        content: "I found 3 MacBook Pro listings that match your criteria.",
        timestamp: "9:30 AM",
      },
    ],
  },
  {
    id: "3",
    messages: [
      { id: "m1", sender: "me", content: "Perfect! I'll take it. When can we meet?", timestamp: "Yesterday" },
      { id: "m2", sender: "them", content: "Tomorrow evening works for me.", timestamp: "Yesterday" },
    ],
  },
  {
    id: "4",
    messages: [
      { id: "m1", sender: "them", content: "Hello? Are you there?", timestamp: "1:00 AM" },
    ],
  },
];
