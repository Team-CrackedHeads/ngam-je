"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, CheckCircle, Camera, Lock } from "lucide-react";
import { mockSaleListings, mockWantedListings } from "@/utils/mock-listings-data";
import { MOCK_ACHIEVEMENTS, getAchievementStats } from "@/utils/mock-achievements-data";
import { MOCK_USER, type User } from "@/utils/mock-user-data";

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
  expiresAt: string
  subscriptionTier: "basic" | "pro" | "enterprise";
  isOwner?: boolean;
}

interface ProfilePageProps {
  user?: User;
  saleListings?: Listing[];
  wantedListings?: Listing[];
}

// Tabs configuration
const tabs = [
  { label: "Overview", href: "/profile" },
  { label: "Activity", href: "/profile/activity" },
];

export default function ProfilePage({ user, saleListings, wantedListings }: ProfilePageProps) {
  const userData = user ?? MOCK_USER;
  const saleListingsData = (saleListings ?? mockSaleListings).filter(listing => listing.isOwner === true);
  const wantedListingsData = (wantedListings ?? mockWantedListings).filter(listing => listing.isOwner === true);
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-6 pb-24 bg-primary-100 text-accent-500 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {/* <div className="flex justify-center mb-4">
          <h1 className="text-xl font-bold">Profile</h1>
        </div> */}

        {/* Tabs */}
        <div className="flex justify-center mb-4 sm:mb-6 border-b pb-2 space-x-4 sm:space-x-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-sm sm:text-base font-medium ${isActive ? 'text-accent-700 border-b-2 border-accent-700' : 'text-accent-500'}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Responsive Layout */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 md:auto-rows-min">
          {/* Profile Card */}
          <div
            className="rounded-2xl shadow p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4 md:col-span-3"
            style={{ backgroundColor: "#fff" }}
          >
            {/* Avatar */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-white bg-secondary-500 flex-shrink-0">
              {userData.name.charAt(0).toUpperCase()}
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">
                <Camera size={14} className="sm:w-4 sm:h-4 text-accent-500" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base sm:text-lg truncate">{userData.name}</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{userData.email}</p>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                {userData.verified && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-success-50 text-success-900 font-medium">
                    Verified
                  </span>
                )}
                <div className="flex items-center text-xs sm:text-sm text-yellow-600">
                  <Star size={14} className="sm:w-4 sm:h-4" fill="gold" />
                  <span className="ml-1">
                    {userData.rating} ({userData.ratingCount})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            className="rounded-2xl shadow p-4 flex flex-col items-center justify-center text-center md:col-span-1"
            style={{ backgroundColor: "#fff" }}
          >
            <p className="text-2xl font-bold">{userData.totalListings}</p>
            <p className="text-sm">Total Listings</p>
          </div>
          <div
            className="rounded-2xl shadow p-4 flex flex-col items-center justify-center text-center md:col-span-1"
            style={{ backgroundColor: "#fff" }}
          >
            <p className="text-2xl font-bold">{userData.completedDeals}</p>
            <p className="text-sm">Completed Deals</p>
          </div>

          {/* Active Listings */}
          <div
            className="rounded-2xl shadow p-4 md:col-span-1"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold">Active Listings</h3>
              <span className="px-2 sm:px-3 py-1 text-xs rounded-full bg-secondary-500 text-accent-700 font-medium whitespace-nowrap">
                {saleListingsData.length + wantedListingsData.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/listings?type=sale"
                className="rounded-xl p-4 text-center bg-secondary-500 hover:bg-secondary-600 transition-colors cursor-pointer"
              >
                <p className="text-2xl font-bold">{saleListingsData.length}</p>
                <p className="text-sm">For Sale</p>
              </Link>
              <Link
                href="/listings?type=wanted"
                className="rounded-xl p-4 text-center bg-secondary-100 hover:bg-secondary-200 transition-colors cursor-pointer"
              >
                <p className="text-2xl font-bold">{wantedListingsData.length}</p>
                <p className="text-sm">Want to Buy</p>
              </Link>
            </div>
          </div>

          {/* Achievements */}
          <div
            className="rounded-2xl shadow p-3 sm:p-4 md:col-span-3 overflow-hidden"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm sm:text-base">Achievements</h3>
              <span className="px-2 sm:px-3 py-1 text-xs rounded-full bg-secondary-500 text-white font-medium whitespace-nowrap">
                {getAchievementStats().unlocked}/{getAchievementStats().total}
              </span>
            </div>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {MOCK_ACHIEVEMENTS.map((ach) => {
                const IconComponent = ach.icon;
                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-3 sm:p-4 flex-shrink-0 w-36 sm:w-40 flex flex-col items-center justify-center text-center transition-all ${
                      ach.unlocked
                        ? "bg-secondary-100 border-2 border-secondary-500"
                        : "bg-gray-100 opacity-60"
                    }`}
                  >
                    <div className="mb-2 relative">
                      {ach.unlocked ? (
                        <IconComponent size={28} className="sm:w-8 sm:h-8 text-secondary-600" />
                      ) : (
                        <div className="relative">
                          <IconComponent size={28} className="sm:w-8 sm:h-8 text-gray-400 opacity-30" />
                          <Lock size={14} className="sm:w-4 sm:h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold mb-1">{ach.label}</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2">{ach.description}</p>
                    {ach.unlocked && ach.unlockedAt && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-secondary-600">
                        <CheckCircle size={10} className="sm:w-3 sm:h-3" />
                        <span className="whitespace-nowrap">{ach.unlockedAt}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
