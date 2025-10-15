export type Activity = {
  type: string;
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
    type: "alert",
    message: "Sale processing failed: ID 22481955371",
    date: "1 week ago",
  },
];