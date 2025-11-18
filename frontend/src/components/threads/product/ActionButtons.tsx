// src/components/threads/product/ActionButtons.tsx
import { MessageCircle, HandCoins, FileText } from "lucide-react";
import Link from "next/link";
// Import shared styles from the ProductDetails file
import { wideButtonClasses } from "./ProductDetails";

const glowStyle = "text-accent-500 focus:ring-accent-500";

interface ActionButtonsProps {
  onChat?: () => void;
  onFAQ?: () => void;
  onBuyNow?: () => void;
  listingType?: "sale" | "want";
  isOwnListing?: boolean;
}

export const ActionButtons = ({
  onChat,
  onFAQ: _onFAQ,
  onBuyNow,
  listingType = "sale",
  isOwnListing = false,
}: ActionButtonsProps) => {

  return (
  <div className="flex flex-col sm:flex-row gap-3 mt-6">
    {!isOwnListing && (
      <button
        className={`${wideButtonClasses} outline-solid outline-1 border-primary-200 ${glowStyle}`}
        onClick={onChat}
      >
        <MessageCircle className="w-5 h-5 text-accent-500" />
        <span>Chat</span>
      </button>
    )}
    {/* <button
      className={`${wideButtonClasses} outline-solid outline-1 border-primary-200 ${glowStyle}`}
      onClick={_onFAQ}
    >
      <HelpCircle className="w-5 h-5 text-accent-500" />
      <span>FAQ</span>
    </button> */}
    {isOwnListing ? (
      <Link
        href={`/listings?type=${listingType === "sale" ? "sale" : "wanted"}`}
        className={`${wideButtonClasses} font-semibold shadow-md outline-solid outline-1 bg-gradient-to-r from-secondary-500 to-secondary-600 text-accent-700 focus:ring-accent-500 no-underline`}
      >
        <FileText className="w-5 h-5" />
        <span>View Offers</span>
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
