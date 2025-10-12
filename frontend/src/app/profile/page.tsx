"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, CheckCircle, Camera } from "lucide-react";

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
    { label: "Test" },
    { label: "Test" },
    { label: "Test" },
    { label: "Test" },
  ],
};

// Tabs configuration
const tabs = [
  { label: "Overview", href: "/profile" },
  { label: "Activity", href: "/profile/activity" },
];

export default function ProfilePage({ user }: ProfilePageProps) {
  const data = user ?? placeholderUser;
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-4 py-6 pb-24 bg-primary-100 text-accent-500 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {/* <div className="flex justify-center mb-4">
          <h1 className="text-xl font-bold">Profile</h1>
        </div> */}

        {/* Tabs */}
        <div className="flex justify-center mb-6 border-b pb-2 space-x-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                // className="text-base font-medium pb-2"
                className={`${isActive ? 'text-accent-700 border-b-2 border-accent-700' : 'text-accent-500'}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Responsive Layout */}
        <div className="grid gap-6 md:grid-cols-3 md:auto-rows-min">
          {/* Profile Card */}
          <div
            className="rounded-2xl shadow p-4 flex items-center space-x-4 md:col-span-3"
            style={{ backgroundColor: "#fff" }}
          >
            {/* Avatar */}
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white bg-secondary-500">
              {data.name.charAt(0).toUpperCase()}
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">
                <Camera size={16} className="text-accent-500" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="font-bold text-lg">{data.name}</h2>
              <p className="text-sm text-gray-600">{data.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                {data.verified && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">
                    Verified
                  </span>
                )}
                <div className="flex items-center text-sm text-yellow-600">
                  <Star size={16} fill="gold" />
                  <span className="ml-1">
                    {data.rating} ({data.ratingCount})
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
            <p className="text-2xl font-bold">{data.totalListings}</p>
            <p className="text-sm">Total Listings</p>
          </div>
          <div
            className="rounded-2xl shadow p-4 flex flex-col items-center justify-center text-center md:col-span-1"
            style={{ backgroundColor: "#fff" }}
          >
            <p className="text-2xl font-bold">{data.completedDeals}</p>
            <p className="text-sm">Completed Deals</p>
          </div>

          {/* Active Listings */}
          <div
            className="rounded-2xl shadow p-4 md:col-span-1"
            style={{ backgroundColor: "#fff" }}
          >
            <h3 className="font-semibold mb-3">Active Listings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4 text-center bg-secondary-500">
                <p className="text-2xl font-bold">{data.forSale}</p>
                <p className="text-sm">For Sale</p>
              </div>
              <div className="rounded-xl p-4 text-center bg-secondary-100">
                <p className="text-2xl font-bold">{data.wantToBuy}</p>
                <p className="text-sm">Want to Buy</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div
            className="rounded-2xl shadow p-4 md:col-span-3"
            style={{ backgroundColor: "#fff" }}
          >
            <h3 className="font-semibold mb-3">Achievements</h3>
            <div className="flex flex-col gap-3">
              {data.achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-4 flex items-center justify-between bg-primary-200"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-secondary-600" />
                    <p className="text-sm">{ach.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
