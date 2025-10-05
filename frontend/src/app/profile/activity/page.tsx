"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, ShoppingCart, Tag, OctagonAlert } from "lucide-react";

export type Activity = {
  type: string;
  message: string;
  date: string;
};

interface ActivityPageProps {
  activities?: Activity[];
}

// Tabs configuration
const tabs = [
  { label: "Overview", href: "/profile" },
  { label: "Activity", href: "/profile/activity" },
];

// Placeholder activity data
const placeholderActivities: Activity[] = [
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

// Utility to choose icon by type
function getIcon(type: Activity["type"]) {
  switch (type) {
    case "sale":
      return <Tag size={18} className="text-secondary-600" />;
    case "purchase":
      return <ShoppingCart size={18} className="text-accent-700" />;
    case "achievement":
      return <CheckCircle size={18} className="text-secondary-500" />;
    case "alert":
      return <OctagonAlert size={18} className="text-error-500" />;
    default:
      return null;
  }
}

export default function ActivityPage({ activities }: ActivityPageProps) {
  const data = activities ?? placeholderActivities;
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-4 py-6 pb-24 bg-primary-100 text-accent-500">
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
                className={`${isActive ? 'text-accent-700 border-b-2 border-accent-700' : 'text-accent-500'}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {data.map((activity, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow p-4 flex items-center space-x-4"
              style={{ backgroundColor: "#fff" }}
            >
              {/* Icon */}
              <div className="flex-shrink-0">{getIcon(activity.type)}</div>
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
