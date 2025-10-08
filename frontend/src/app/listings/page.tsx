"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShoppingCart, Package, Clock, MapPin, Eye, Heart, Grid, List } from "lucide-react";
import { useState, useEffect } from "react";

// Types
interface Listing {
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
}

// Mock data for buy listings (items for sale)
const mockBuyListings: Listing[] = [
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
    category: "Electronics"
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
    category: "Electronics"
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
    category: "Audio"
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
    category: "Computing"
  }
];

// Mock data for sell listings (wanted items)
const mockSellListings: Listing[] = [
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
    category: "Electronics"
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
    category: "Transportation"
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
    category: "Photography"
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
    category: "Furniture"
  }
];

// Tabs configuration
const tabs = [
  { label: "Buy Listings", value: "buy", icon: ShoppingCart },
  { label: "Sell Listings", value: "sell", icon: Package },
];

function ProductCard({ listing, type, viewMode }: { listing: Listing; type: "buy" | "sell"; viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="rounded-2xl shadow p-4 bg-white hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex gap-4">
          {/* Image */}
          <div className="w-32 h-24 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-gray-400 text-xs">Image</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-accent-700 line-clamp-1 flex-1">
                {listing.title}
              </h3>
              <span className="font-bold text-lg text-secondary-700 ml-4">
                {type === "buy" ? listing.price : listing.budget}
              </span>
            </div>

            {/* Category badge */}
            <div className="mb-2">
              <span className="px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600">
                {listing.category}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-accent-500 mb-2 line-clamp-1">
              {listing.description}
            </p>

            {/* Footer */}
            <div className="space-y-1">
              {/* Location */}
              <div className="flex items-center gap-1 text-xs text-accent-400">
                <MapPin size={12} />
                <span>{listing.location}</span>
              </div>

              {/* Post Time */}
              <div className="flex items-center gap-1 text-xs text-accent-400">
                <Clock size={12} />
                <span>{listing.timestamp}</span>
              </div>

              {/* Views and Likes */}
              <div className="flex items-center gap-4 text-xs text-accent-400">
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>{listing.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={12} />
                  <span>{listing.likes} likes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow p-4 bg-white hover:shadow-lg transition-shadow cursor-pointer">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Image placeholder</span>
      </div>

      {/* Header */}
      <div className="mb-2">
        <h3 className="font-semibold text-accent-700 line-clamp-2">
          {listing.title}
        </h3>
      </div>

      {/* Category badge */}
      <div className="mb-2">
        <span className="px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600">
          {listing.category}
        </span>
      </div>

      {/* Price/Budget */}
      <div className="mb-2">
        <span className="font-bold text-lg text-secondary-700">
          {type === "buy" ? listing.price : listing.budget}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-accent-500 mb-3 line-clamp-2">
        {listing.description}
      </p>

      {/* Footer */}
      <div className="space-y-2">
        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-accent-400">
          <MapPin size={12} />
          <span>{listing.location}</span>
        </div>

        {/* Post Time */}
        <div className="flex items-center gap-1 text-xs text-accent-400">
          <Clock size={12} />
          <span>{listing.timestamp}</span>
        </div>

        {/* Views and Likes */}
        <div className="flex items-center gap-4 text-xs text-accent-400">
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{listing.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={12} />
            <span>{listing.likes} likes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const type = searchParams.get("type") as "buy" | "sell";
    if (type && (type === "buy" || type === "sell")) {
      setActiveTab(type);
    }
  }, [searchParams]);

  const currentListings = activeTab === "buy" ? mockBuyListings : mockSellListings;
  const ActiveIcon = activeTab === "buy" ? ShoppingCart : Package;

  return (
    <div className="min-h-screen px-4 py-6 pb-24 bg-primary-100 text-accent-500 overflow-auto">
      <div className="max-w-6xl mx-auto">

        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b pb-2 space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as "buy" | "sell")}
                className={`flex items-center gap-2 pb-2 transition-colors ${
                  isActive
                    ? 'text-accent-700 border-b-2 border-accent-700'
                    : 'text-accent-500 hover:text-accent-700'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Listings Count and Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-accent-600">
              {currentListings.length} {activeTab === "buy" ? "items for sale" : "wanted items"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-secondary-500 text-accent-700"
                    : "bg-white text-accent-500 hover:bg-secondary-200"
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-secondary-500 text-accent-700"
                    : "bg-white text-accent-500 hover:bg-secondary-200"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
          <button className="px-4 py-2 bg-secondary-500 text-accent-700 rounded-lg font-medium hover:bg-secondary-600 transition-colors">
            + New {activeTab === "buy" ? "Request" : "Sale"}
          </button>
        </div>

        {/* Listings Grid */}
        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {currentListings.map((listing) => (
            <ProductCard
              key={listing.id}
              listing={listing}
              type={activeTab}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Empty State */}
        {currentListings.length === 0 && (
          <div className="text-center py-12">
            <ActiveIcon className="w-16 h-16 text-accent-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-accent-600 mb-2">
              No {activeTab === "buy" ? "items for sale" : "wanted items"} yet
            </h3>
            <p className="text-accent-400 mb-4">
              Be the first to post a {activeTab === "buy" ? "sale listing" : "wanted request"}!
            </p>
            <button className="px-6 py-3 bg-secondary-500 text-accent-700 rounded-lg font-medium hover:bg-secondary-600 transition-colors">
              Create {activeTab === "buy" ? "Wanted Request" : "Sale Listing"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}