"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referenceId, setReferenceId] = useState<string>("");

  useEffect(() => {
    // Get session_id from URL or generate a mock reference ID
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      setReferenceId(sessionId);
    } else {
      // Generate a mock reference ID
      const mockId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setReferenceId(mockId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7e0] to-[#ffe29d] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-accent-700 mb-4">
          Payment Made!
        </h1>

        <p className="text-neutral-600 mb-6">
          Your payment has been processed successfully.
        </p>

        {/* Reference ID */}
        {referenceId && (
          <div className="mb-6 p-4 bg-secondary-100 rounded-lg">
            <p className="text-sm text-neutral-600 mb-2">Reference ID</p>
            <p className="text-lg font-mono font-semibold text-accent-700 break-all">
              {referenceId}
            </p>
          </div>
        )}

        {/* Receipt Info */}
        <p className="text-sm text-neutral-600 mb-8">
          A receipt has been emailed to you.
        </p>

        {/* Back to Threads Button */}
        <button
          onClick={() => router.push("/threads")}
          className="w-full bg-accent-700 hover:bg-accent-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Go to Threads
        </button>
      </div>
    </div>
  );
}
