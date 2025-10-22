import { UserPlus, Share2, MoreVertical, ArrowLeft } from "lucide-react";
import { CategoryBreadcrumb } from "./CategoryBreadcrumb";

const buttonClasses = `
  p-2 rounded-full transition-all
  hover:bg-gray-100 hover:shadow-md hover:ring-1
  active:scale-95 active:shadow-lg active:ring-1
`;

const glowStyle = "text-accent-500 focus:ring-accent-500";

interface CategoryHeaderProps {
  onBack?: () => void;
  category: string;
  activeType: "wtb" | "wts" | "general";
}

export const CategoryHeader = ({ onBack, category, activeType }: CategoryHeaderProps) => (
  <div className="sticky top-0 z-[5] bg-white shadow-sm">
    {/* Breadcrumb */}
    <div className="px-6 pt-2">
      <CategoryBreadcrumb category={category} activeType={activeType} />
    </div>

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
          {category} Marketplace
        </h1>
      </div>
      <div className="flex gap-2">
        {[UserPlus, Share2, MoreVertical].map((Icon, i) => (
          <button key={i} className={`${buttonClasses} ${glowStyle}`}>
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  </div>
);
