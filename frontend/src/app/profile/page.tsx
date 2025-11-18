"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Star, CheckCircle, Camera, Lock, Loader2 } from "lucide-react";
import { MOCK_ACHIEVEMENTS, getAchievementStats, PROFILE_TABS } from "@/utils/mock-all-data-used";
import axios, { AxiosError } from "axios";

// Use centralized tabs configuration
const tabs = PROFILE_TABS;

interface UserProfile {
  id: number;
  clerk_user_id: string;
  email: string;
  username: string;
  is_active: boolean;
  rating: number;
  rating_count: number;
  total_listings: number;
  completed_deals: number;
  kyc_status: string;
  kyc_session_id: string | null;
  kyc_initiated_at: string | null;
  kyc_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycTimeRemaining, setKycTimeRemaining] = useState<number | null>(null);
  const [showKycSuccess, setShowKycSuccess] = useState(false);

  // Extract fetchProfile so it can be reused (initial load + timer expiry)
  const fetchProfile = async () => {
    try {
      const token = await getToken();

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile(response.data);
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      const errorMessage = error.response?.data?.detail || error.message || "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Check for KYC completion redirect
  useEffect(() => {
    if (searchParams.get('kyc_completed') === 'true') {
      setShowKycSuccess(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowKycSuccess(false), 5000);
      // Refresh profile to show updated KYC status
      fetchProfile();
    }
  }, [searchParams]);

  // KYC Countdown Timer
  useEffect(() => {
    // Only run timer if KYC is in progress and we have a start time
    if (profile?.kyc_status !== "in_progress" || !profile?.kyc_initiated_at) {
      setKycTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const initiatedAt = new Date(profile.kyc_initiated_at!).getTime();
      const now = Date.now();
      const elapsed = (now - initiatedAt) / 1000; // seconds
      const remaining = Math.max(0, 900 - elapsed); // 15 minutes = 900 seconds

      if (remaining === 0) {
        // Timer expired - fetch updated profile from backend
        // Backend will auto-reset status to "pending"
        setKycTimeRemaining(null);
        fetchProfile();
        return 0;
      }

      return remaining;
    };

    // Initial calculation
    setKycTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setKycTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [profile?.kyc_status, profile?.kyc_initiated_at]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initiateKYC = async () => {
    setKycLoading(true);
    try {
      const token = await getToken();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/kyc/initiate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data as { verification_url: string; session_id: string };

      // Open Didit verification in new window
      window.open(data.verification_url, "_blank");

      // Update profile to reflect in_progress status
      if (profile) {
        setProfile({
          ...profile,
          kyc_status: "in_progress",
          kyc_session_id: data.session_id,
          kyc_initiated_at: new Date().toISOString(), // Start the timer immediately
        });
      }
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      const errorMessage = error.response?.data?.detail || error.message || "Failed to start KYC verification";
      alert(errorMessage);
    } finally {
      setKycLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-100">
        <Loader2 className="w-8 h-8 animate-spin text-accent-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use real data from API
  const saleListingsData = []; // TODO: Fetch from listings API
  const wantedListingsData = []; // TODO: Fetch from listings API

  return (
    <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-6 pb-24 bg-primary-100 text-accent-500 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* KYC Success Alert */}
        {showKycSuccess && (
          <div className="mb-4 p-4 rounded-lg bg-success-50 border border-success-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-success-900">KYC Verification Complete!</p>
              <p className="text-sm text-success-700">Your identity has been verified successfully.</p>
            </div>
            <button
              onClick={() => setShowKycSuccess(false)}
              className="text-success-600 hover:text-success-800 text-xl font-bold"
            >
              ×
            </button>
          </div>
        )}
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
              {profile?.username?.charAt(0)?.toUpperCase() ||
               user?.username?.charAt(0)?.toUpperCase() ||
               "U"}
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow">
                <Camera size={14} className="sm:w-4 sm:h-4 text-accent-500" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base sm:text-lg truncate">
                {profile?.username || user?.username || "User"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {profile?.email || user?.primaryEmailAddress?.emailAddress}
              </p>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                {/* KYC Status Badge */}
                {profile?.kyc_status === "verified" ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-success-50 text-success-900 font-medium flex items-center gap-1">
                    <CheckCircle size={12} className="sm:w-3 sm:h-3" />
                    KYC Verified
                  </span>
                ) : profile?.kyc_status === "in_progress" ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-warning-50 text-warning-900 font-medium flex items-center gap-1">
                    KYC In Progress
                    {kycTimeRemaining !== null && (
                      <span className="ml-1 font-mono">({formatTime(kycTimeRemaining)})</span>
                    )}
                  </span>
                ) : (
                  <button
                    onClick={initiateKYC}
                    disabled={kycLoading}
                    className="px-2 py-0.5 text-xs rounded-full bg-error-50 text-error-900 font-medium hover:bg-error-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {kycLoading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>Unverified - Click to Verify</>
                    )}
                  </button>
                )}

                <div className="flex items-center text-xs sm:text-sm text-yellow-600">
                  <Star size={14} className="sm:w-4 sm:h-4" fill="gold" />
                  <span className="ml-1">
                    {profile?.rating.toFixed(1) || "0.0"} ({profile?.rating_count || 0})
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
            <p className="text-2xl font-bold">{profile?.total_listings || 0}</p>
            <p className="text-sm">Total Listings</p>
          </div>
          <div
            className="rounded-2xl shadow p-4 flex flex-col items-center justify-center text-center md:col-span-1"
            style={{ backgroundColor: "#fff" }}
          >
            <p className="text-2xl font-bold">{profile?.completed_deals || 0}</p>
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
