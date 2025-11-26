// src/components/threads/product/ActionButtons.tsx
import { HandCoins, FileText } from "lucide-react";
import Link from "next/link";
// Import shared styles from the ProductDetails file
import { wideButtonClasses } from "./ProductDetails";

const glowStyle = "text-accent-500 focus:ring-accent-500";

interface ActionButtonsProps {
  onFAQ?: () => void;
  onBuyNow?: () => void;
  listingType?: "sale" | "wanted";
  isOwnListing?: boolean;
  listingId?: number | string;
  recommendationCount?: number;
}

export const ActionButtons = ({
  onFAQ: _onFAQ,
  onBuyNow,
  listingType = "sale",
  isOwnListing = false,
  listingId,
  recommendationCount = 0,
}: ActionButtonsProps) => {

  return (
  <div className="flex flex-col sm:flex-row gap-3 mt-6">
    {/* <button
      className={`${wideButtonClasses} outline-solid outline-1 border-primary-200 ${glowStyle}`}
      onClick={_onFAQ}
    >
      <HelpCircle className="w-5 h-5 text-accent-500" />
      <span>FAQ</span>
    </button> */}
    {isOwnListing ? (
      <Link
        href={`/listings/${listingId}/matches?type=${listingType}`}
        className={`${wideButtonClasses} font-semibold shadow-md outline-solid outline-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-accent-700 focus:ring-accent-500 no-underline`}
      >
        <FileText className="w-5 h-5" />
        <span>View Offers</span>
        {recommendationCount > 0 && (
          <span className="ml-2 bg-primary-100 text-accent-700 text-xs font-bold rounded-full px-2 py-0.5">
            {recommendationCount}
          </span>
        )}
      </Link>
    ) : (
      <button
        className={`${wideButtonClasses} font-semibold shadow-md outline-solid outline-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-accent-700 focus:ring-accent-500`}
        onClick={onBuyNow}
      >
        <HandCoins className="w-5 h-5" />
        <span>Make Offer</span>
      </button>
    )}
  </div>
  );
};
