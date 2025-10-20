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
];