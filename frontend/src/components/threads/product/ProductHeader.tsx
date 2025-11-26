import { Heart, Share2, MoreVertical, ArrowLeft, Trash2 } from "lucide-react";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { useState, useRef, useEffect } from "react";

const buttonClasses = `
  p-2 rounded-full transition-all border border-neutral-200
  hover:bg-gray-100 hover:shadow-md hover:ring-1 hover:border-neutral-300
  active:scale-95 active:shadow-lg active:ring-1
`;

const glowStyle = "text-accent-500 focus:ring-accent-500";

interface ProductHeaderProps {
  onBack?: () => void;
  listingType?: "sale" | "wanted";
  category: string;
  listingTitle: string;
  isScrolled?: boolean;
  isOwner?: boolean;
  onDelete?: () => void;
}

export const ProductHeader = ({ onBack, listingType = "sale", category, listingTitle, isScrolled = false, isOwner = false, onDelete }: ProductHeaderProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

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
          <button className={`${buttonClasses} ${glowStyle}`}>
            <Heart className="w-5 h-5" />
          </button>
          <button className={`${buttonClasses} ${glowStyle}`}>
            <Share2 className="w-5 h-5" />
          </button>
          {/* More options dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className={`${buttonClasses} ${glowStyle}`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-10">
                <button
                  onClick={() => {
                    if (isOwner && onDelete) {
                      setShowDropdown(false);
                      onDelete();
                    }
                  }}
                  disabled={!isOwner || !onDelete}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                    isOwner && onDelete
                      ? "text-red-600 hover:bg-red-50 cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  title={!isOwner ? "Only the owner can delete this listing" : ""}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Listing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
