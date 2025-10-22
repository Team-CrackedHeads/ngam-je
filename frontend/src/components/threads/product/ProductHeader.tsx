import { Heart, Share2, MoreVertical, ArrowLeft } from "lucide-react";
import { BreadcrumbNav } from "./BreadcrumbNav";

const buttonClasses = `
  p-2 rounded-full transition-all border border-neutral-200
  hover:bg-gray-100 hover:shadow-md hover:ring-1 hover:border-neutral-300
  active:scale-95 active:shadow-lg active:ring-1
`;

const glowStyle = "text-accent-500 focus:ring-accent-500";

interface ProductHeaderProps {
  onBack?: () => void;
  listingType?: "sale" | "want";
  category: string;
  listingTitle: string;
  isScrolled?: boolean;
}

export const ProductHeader = ({ onBack, listingType = "sale", category, listingTitle, isScrolled = false }: ProductHeaderProps) => {
  return (
    <div className="sticky top-0 z-[5] bg-white shadow-sm transition-all duration-300">
      {/* Breadcrumb - Hide when scrolled */}
      {!isScrolled && (
        <div className="px-6 pt-2">
          <BreadcrumbNav
            category={category}
            listingTitle={listingTitle}
            listingType={listingType}
          />
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          <button
            className={`${buttonClasses} ${glowStyle}`}
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold capitalize text-accent-700">
            {listingType === "sale" ? "Sell Listings" : "Buy Listings"}
          </h1>
        </div>
        <div className="flex gap-2">
          {[Heart, Share2, MoreVertical].map((Icon, i) => (
            <button key={i} className={`${buttonClasses} ${glowStyle}`}>
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
