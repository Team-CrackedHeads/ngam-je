"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";

export default function KYCDevApprovePage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveKYC = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/kyc/dev/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Success! Redirect to profile
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      const errorMessage = error.response?.data?.detail || error.message || "Failed to approve KYC";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-accent-700 mb-2">
            DEV: KYC Verification
          </h1>
          <p className="text-sm text-gray-600">
            This is a development-only page to bypass KYC verification.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        ) : null}

        {!loading && !error ? (
          <Button
            onClick={approveKYC}
            className="w-full bg-accent-600 hover:bg-accent-700 text-white"
          >
            Approve My KYC
          </Button>
        ) : null}

        {loading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600 mb-4"></div>
            <p className="text-sm text-gray-600">Approving KYC...</p>
            <p className="text-xs text-gray-500 mt-2">
              Redirecting to profile...
            </p>
          </div>
        ) : null}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/profile")}
            className="text-sm text-accent-600 hover:text-accent-700"
          >
            ← Back to Profile
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ This page only works when <code>KYC_SKIP_VERIFICATION=true</code> in your backend .env file
          </p>
        </div>
      </div>
    </div>
  );
}
