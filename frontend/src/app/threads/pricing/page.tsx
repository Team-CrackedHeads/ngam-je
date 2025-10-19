"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, X, Sparkles } from "lucide-react";
import { MOCK_THREADS } from "@/utils/mock-threads-data";
import BreadcrumbNav from "@/app/threads/BreadcrumbNav";

// tier features data
const tierFeatures = [
  {
    category: "Listing Creation",
    tiers: [
      { free: "1/month, 3 days", premium: "3/month, 7 days" },
      { free: "2/month, 7 days", premium: "5/month, 14 days" },
      { free: "5/month, 14 days", premium: "15/month, 30 days" },
      { free: "10/month, 30 days", premium: "Unlimited, 60 days" },
    ],
  },
  {
    category: "AI Search",
    tiers: [
      { free: "3/month", premium: "15/month" },
      { free: "Unlimited", premium: "Unlimited (faster)" },
      { free: "Unlimited", premium: "Unlimited (priority)" },
      { free: "Unlimited", premium: "Unlimited (priority queue)" },
    ],
  },
  {
    category: "AI Tools Access",
    tiers: [
      { free: false, premium: false },
      { free: false, premium: "1 AI-assist/day" },
      { free: "3 AI-assists/day", premium: "Unlimited" },
      { free: "10 AI-assists/day", premium: "Unlimited" },
    ],
  },
  {
    category: "AI FAQ Bot",
    tiers: [
      { free: false, premium: "Basic (5 min)" },
      { free: "Basic (15 min)", premium: "Standard (instant)" },
      { free: "Standard (instant)", premium: "Advanced (context)" },
      { free: "Advanced (context)", premium: "Premium+ (predictive)" },
    ],
  },
  {
    category: "Smart Matching",
    tiers: [
      { free: "Random order only", premium: "Basic sorting" },
      { free: "Basic sorting", premium: "AI compatibility scores" },
      { free: "AI compatibility", premium: "Advanced AI + probability" },
      { free: "Advanced AI", premium: "Premium+ (negotiation)" },
    ],
  },
];

// component for feature value display
function FeatureValue({ value }: { value: string | boolean }) {
  if (value === false) {
    return (
      <div className="flex items-center justify-center text-neutral-400">
        <X className="w-4 h-4" />
      </div>
    );
  }
  if (value === true) {
    return (
      <div className="flex items-center justify-center text-secondary-500">
        <Check className="w-5 h-5" />
      </div>
    );
  }
  return <div className="text-sm text-center text-accent-700">{value}</div>;
}

// tier card component
function TierCard({
  tier,
  isCurrentTier,
  isPastTier,
  boostsRequired,
}: {
  tier: number;
  isCurrentTier: boolean;
  isPastTier: boolean;
  boostsRequired: number;
}) {
  return (
    <div
      className={`rounded-xl p-4 sm:p-6 transition-all ${
        isCurrentTier
          ? "bg-secondary-100 border-2 border-secondary-500 shadow-lg scale-105"
          : isPastTier
          ? "bg-neutral-100 border border-neutral-300 opacity-70"
          : "bg-neutral-white border-2 border-accent-700 shadow-md hover:shadow-lg"
      }`}
    >
      <div className="text-center mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-accent-700 mb-2">
          Tier {tier}
        </h3>
        {isCurrentTier && (
          <span className="inline-block px-3 py-1 bg-secondary-500 text-accent-700 text-xs sm:text-sm font-semibold rounded-full">
            Current Tier
          </span>
        )}
        {isPastTier && (
          <span className="inline-block px-3 py-1 bg-neutral-300 text-neutral-600 text-xs sm:text-sm font-semibold rounded-full">
            Unlocked
          </span>
        )}
        <div className="mt-2 text-xs sm:text-sm text-neutral-600">
          {boostsRequired} Boosts Required
        </div>
      </div>

      {!isPastTier && !isCurrentTier && (
        <button className="w-full bg-accent-700 hover:bg-accent-800 text-secondary-500 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors mt-4 text-sm sm:text-base">
          Upgrade to Tier {tier}
        </button>
      )}
    </div>
  );
}

// main pricing page component
function PricingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTier = parseInt(searchParams.get("tier") || "0");
  const threadCategory = searchParams.get("category") || "apple-devices";

  // find the thread data based on category
  const threadData =
    MOCK_THREADS.find((thread) => thread.category === threadCategory) ||
    MOCK_THREADS[0];

  // tier boost requirements
  const boostRequirements = [0, 2, 7, 14];
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  // calculate boosts needed for next tier
  const boostsToNextTier =
    currentTier < 3 ? boostRequirements[currentTier + 1] : 0;

  return (
    <div className="min-h-screen bg-primary-50">
      {/* breadcrumb navigation */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav />
      </div>

      {/* hero section with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#fff7e0] to-[#ffe29d]">
        <div className="relative container mx-auto py-8 sm:py-12 md:py-16 px-4">
          <div className="text-center">
            {/* thread image */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-neutral-white shadow-lg">
                <img
                  src={threadData.imageUrl}
                  alt={threadData.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-700 mb-2">
              {threadData.title}
            </h1>
            <p className="text-base sm:text-lg text-accent-500 mb-4 sm:mb-6">
              <Sparkles className="w-4 h-4 inline mr-1" />
              No Boosts
            </p>

            {/* action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-4">
              <button className="bg-neutral-white text-accent-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-[30px] font-semibold hover:bg-neutral-100 transition-colors text-sm sm:text-base">
                Boost This Thread
              </button>
              <button className="bg-secondary-500 text-neutral-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-[30px] font-semibold hover:bg-secondary-600 transition-colors text-sm sm:text-base">
                Get Nitro with 2 Free Boosts
              </button>
            </div>

            {/* boosts needed tooltip */}
            {currentTier < 3 && (
              <div className="inline-block bg-neutral-white/90 text-accent-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                {boostsToNextTier} more Boosts to Level {currentTier + 1}
              </div>
            )}

            {/* tier progress visualization */}
            <div className="max-w-3xl mx-auto px-4">
              <div className="relative py-8 sm:py-12 pt-12 sm:pt-16">
                <div className="relative flex items-center pt-6 sm:pt-8">
                  {/* base line */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-200/50" />

                  {/* progress line */}
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-secondary-500 transition-all duration-500"
                    style={{
                      width:
                        currentTier === 0
                          ? "0%"
                          : currentTier === 1
                          ? "33.33%"
                          : currentTier === 2
                          ? "66.66%"
                          : "100%",
                    }}
                  />

                  {/* tier nodes */}
                  <div className="relative w-full flex justify-between">
                    {[0, 1, 2, 3].map((tier) => {
                      const isActive = tier <= currentTier;
                      const isCurrent = tier === currentTier;
                      return (
                        <div
                          key={tier}
                          className="relative flex flex-col items-center"
                          onMouseEnter={() => setHoveredTier(tier)}
                          onMouseLeave={() => setHoveredTier(null)}
                        >
                          {/* hover tooltip */}
                          {hoveredTier === tier && (
                            <div className="hidden sm:block absolute bottom-full mb-4 bg-neutral-900 text-neutral-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg z-20">
                              <div className="font-semibold">Level {tier}</div>
                              <div className="text-xs text-neutral-300">
                                {boostRequirements[tier]} Boosts
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                                <div className="w-2 h-2 bg-neutral-900 rotate-45" />
                              </div>
                            </div>
                          )}

                          {/* node */}
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 ${
                              isActive
                                ? "bg-gradient-to-br from-secondary-500 to-secondary-400 shadow-lg scale-110"
                                : "bg-primary-200 hover:bg-primary-300"
                            }`}
                          >
                            {isCurrent && (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-neutral-white" />
                            )}
                            {!isCurrent && isActive && (
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-white" />
                            )}
                          </div>

                          {/* label */}
                          <span
                            className={`mt-2 sm:mt-3 text-xs sm:text-sm font-semibold ${
                              isActive ? "text-accent-700" : "text-primary-600"
                            }`}
                          >
                            Level {tier}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* tier cards section */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {[0, 1, 2, 3].map((tier) => (
            <TierCard
              key={tier}
              tier={tier}
              isCurrentTier={tier === currentTier}
              isPastTier={tier < currentTier}
              boostsRequired={boostRequirements[tier]}
            />
          ))}
        </div>

        {/* comparison table */}
        <div className="bg-neutral-white rounded-xl shadow-lg overflow-hidden mb-20">
          <div className="bg-accent-700 text-neutral-white px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-xl sm:text-2xl font-bold">
              Feature Comparison
            </h2>
            <p className="text-primary-200 text-xs sm:text-sm">
              See what unlocks at each tier level
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-primary-100 border-b border-neutral-200">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-accent-700 font-semibold text-xs sm:text-base">
                    Feature
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-accent-700 font-semibold text-xs sm:text-base">
                    User Type
                  </th>
                  {[0, 1, 2, 3].map((tier) => (
                    <th
                      key={tier}
                      className={`px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-xs sm:text-base ${
                        tier === currentTier
                          ? "bg-secondary-100 text-secondary-700"
                          : "text-accent-700"
                      }`}
                    >
                      Tier {tier}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tierFeatures.map((feature, idx) => (
                  <React.Fragment key={idx}>
                    <tr className="border-b border-neutral-200 hover:bg-primary-50">
                      <td
                        className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-accent-700 text-xs sm:text-base"
                        rowSpan={2}
                      >
                        {feature.category}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center text-neutral-600">
                        Free User
                      </td>
                      {feature.tiers.map((tier, tierIdx) => (
                        <td
                          key={tierIdx}
                          className={`px-3 sm:px-6 py-3 sm:py-4 ${
                            tierIdx === currentTier ? "bg-secondary-50" : ""
                          }`}
                        >
                          <FeatureValue value={tier.free} />
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-neutral-200 hover:bg-primary-50 bg-accent-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-center text-accent-700 font-medium">
                        Premium User
                      </td>
                      {feature.tiers.map((tier, tierIdx) => (
                        <td
                          key={tierIdx}
                          className={`px-3 sm:px-6 py-3 sm:py-4 ${
                            tierIdx === currentTier ? "bg-secondary-100" : ""
                          }`}
                        >
                          <FeatureValue value={tier.premium} />
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* floating button - bottom right corner */}
      <button className="fixed bottom-6 right-6 bg-secondary-500 hover:bg-secondary-600 text-accent-700 font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline">Boost Thread</span>
        <span className="sm:hidden">Boost</span>
      </button>
    </div>
  );
}

export default PricingPage;
