"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COLORS } from "../../theme";
import { CheckCircle, ShoppingCart, Tag } from "lucide-react";

export type User = {
  name: string;
  email: string;
  verified: boolean;
  rating: number;
  ratingCount: number;
  totalListings: number;
  completedDeals: number;
  forSale: number;
  wantToBuy: number;
  achievements: { label: string }[];
};

interface ProfilePageProps {
  user?: User;
}

// Placeholder user if no prop is passed
const placeholderUser: User = {
  name: "John Michael Smith",
  email: "user@example.com",
  verified: true,
  rating: 4.8,
  ratingCount: 24,
  totalListings: 12,
  completedDeals: 28,
  forSale: 3,
  wantToBuy: 2,
  achievements: [
    { label: "First Sale" },
    { label: "Trusted Seller" },
    { label: "Top Rated" },
  ],
};

// Tabs configuration
const tabs = [
  { label: "Overview", href: "/profile" },
  { label: "Activity", href: "/profile/activity" },
];

// Placeholder activity data
const activityFeed = [
  {
    type: "sale",
    message: "Sold an item: Vintage Camera",
    date: "2 hours ago",
    icon: <Tag size={18} style={{ color: COLORS.accentTo }} />,
  },
  {
    type: "purchase",
    message: "Bought an item: Wireless Headphones",
    date: "1 day ago",
    icon: <ShoppingCart size={18} style={{ color: COLORS.textActive }} />,
  },
  {
    type: "achievement",
    message: "Unlocked achievement: Trusted Seller",
    date: "3 days ago",
    icon: <CheckCircle size={18} style={{ color: COLORS.accentFrom }} />,
  },
  {
    type: "sale",
    message: "Sold an item: Gaming Laptop",
    date: "1 week ago",
    icon: <Tag size={18} style={{ color: COLORS.accentTo }} />,
  },
];

export default function ActivityPage({ user }: ProfilePageProps) {
  const data = user ?? placeholderUser;
  const pathname = usePathname();

  return (
    <div
      className="min-h-screen px-4 py-6 pb-24"
      style={{ backgroundColor: COLORS.background, color: COLORS.text }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-center mb-4">
          <h1 className="text-xl font-bold">Profile</h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6 border-b pb-2 space-x-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="text-base font-medium pb-2"
                style={{
                  color: isActive ? COLORS.textActive : COLORS.text,
                  borderBottom: isActive
                    ? `2px solid ${COLORS.accentActive}`
                    : "none",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {activityFeed.map((activity, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow p-4 flex items-center space-x-4"
              style={{ backgroundColor: "#fff" }}
            >
              {/* Icon */}
              <div className="flex-shrink-0">{activity.icon}</div>
              {/* Content */}
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
