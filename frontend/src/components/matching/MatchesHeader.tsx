import { ArrowLeft, Filter, RotateCcw, GitCompare, Layers } from "lucide-react";
import { MatchesBreadcrumb } from "./MatchesBreadcrumb";

const buttonClasses = `
  p-2 rounded-full transition-all border border-neutral-200
  hover:bg-gray-100 hover:shadow-md hover:ring-1 hover:border-neutral-300
  active:scale-95 active:shadow-lg active:ring-1
`;

const glowStyle = "text-accent-500 focus:ring-accent-500";

interface MatchesHeaderProps {
  onBack?: () => void;
  listingType: "sale" | "wanted" | "matched";
  listingTitle?: string;
  matchCount?: number;
  isScrolled?: boolean;
  onFilterClick?: () => void;
  onResetClick?: () => void;
  onCompareClick?: () => void;
  onViewColumnsClick?: () => void;
  compareMode?: boolean;
  selectedCount?: number;
}

export const MatchesHeader = ({
  onBack,
  listingType,
  listingTitle,
  matchCount = 0,
  isScrolled = false,
  onFilterClick,
  onResetClick,
  onCompareClick,
  onViewColumnsClick,
  compareMode = false,
  selectedCount = 0,
}: MatchesHeaderProps) => {
  return (
    <div className="sticky top-0 z-[5] bg-white shadow-sm transition-all duration-300">
      {/* Breadcrumb - Hide when scrolled */}
      {!isScrolled && (
        <div className="px-6 pt-2">
          <MatchesBreadcrumb listingType={listingType} listingTitle={listingTitle} />
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              className={`${buttonClasses} ${glowStyle}`}
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-bold capitalize text-accent-700">
            Potential Matches
          </h1>
          {/* Match count badge */}
          {matchCount > 0 && (
            <span className="inline-flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary-100 border border-secondary-300">
              <span className="text-xs font-bold text-secondary-700 leading-none">{matchCount}</span>
              <span className="text-xs font-medium text-secondary-600 leading-none">new</span>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {/* Compare Mode Badge */}
          {compareMode && selectedCount > 0 && (
            <span className="text-sm font-medium text-secondary-600 px-3 py-1 bg-secondary-100 rounded-full">
              {selectedCount} selected
            </span>
          )}

          {/* Action buttons */}
          {onFilterClick && (
            <button className={`${buttonClasses} ${glowStyle}`} onClick={onFilterClick}>
              <Filter className="w-5 h-5" />
            </button>
          )}
          {onCompareClick && (
            <button
              className={`${buttonClasses} ${glowStyle} ${compareMode ? "bg-secondary-100 ring-1 ring-secondary-300" : ""}`}
              onClick={onCompareClick}
            >
              <GitCompare className="w-5 h-5" />
            </button>
          )}
          {onViewColumnsClick && (
            <button className={`${buttonClasses} ${glowStyle}`} onClick={onViewColumnsClick}>
              <Layers className="w-5 h-5" />
            </button>
          )}
          {onResetClick && (
            <button className={`${buttonClasses} ${glowStyle}`} onClick={onResetClick}>
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
