import { Heart, Share2, MoreVertical, ArrowLeft } from "lucide-react";

// Move the shared styles directly into this file
const buttonClasses = `
  p-2 rounded-full transition-all
  hover:bg-gray-100 hover:shadow-md hover:ring-1
  active:scale-95 active:shadow-lg active:ring-1
`;

const glowStyle = "text-accent-500 focus:ring-accent-500";

interface ProductHeaderProps {
  onBack?: () => void;
  listingType?: "sale" | "want";
}

export const ProductHeader = ({ onBack, listingType = "sale" }: ProductHeaderProps) => (
  <div className="sticky top-0 z-50 flex items-center justify-between p-4 shadow-sm bg-primary-100">
    <div className="flex items-center gap-3">
      <button
        className={`${buttonClasses} ${glowStyle}`}
        onClick={onBack}
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-lg font-bold text-accent-700">
        {listingType === "sale" ? "Want to Sell" : "Want to Buy"}
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
);
