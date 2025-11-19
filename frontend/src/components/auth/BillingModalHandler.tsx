"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

/**
 * Handles opening the Clerk User Profile modal to the billing section
 * when redirected from middleware due to missing subscription features
 */
export function BillingModalHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openUserProfile } = useClerk();

  useEffect(() => {
    const showBilling = searchParams.get("showBilling");

    if (showBilling === "true") {
      // Open the user profile modal
      openUserProfile();

      // Remove the query param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("showBilling");
      router.replace(`${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    }
  }, [searchParams, router, openUserProfile]);

  return null; // This component doesn't render anything
}
