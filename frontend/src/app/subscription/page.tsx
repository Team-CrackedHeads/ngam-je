"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PricingTable } from "@clerk/nextjs";

const PricingTablePage = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <>
      <div className="container mx-auto px-4 py-4 sm:py-1 text-center min-h-screen bg-gradient-to-br from-[#fff7e0] to-[#ffe29d]">
        <div className="flex items-center gap-4 mb-6 pt-4">
          <button
            onClick={handleBackClick}
            className="p-2 rounded-full hover:bg-secondary-subtle transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="h-6 w-6 text-accent-700" />
          </button>
          <h1 className="text-2xl font-semibold text-accent-800">
            Subscription Plan
          </h1>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-700 mb-10 sm:mb-12">
          Your Account Plan
        </h2>
        <PricingTable />
      </div>
    </>
  );
};

export default PricingTablePage;
