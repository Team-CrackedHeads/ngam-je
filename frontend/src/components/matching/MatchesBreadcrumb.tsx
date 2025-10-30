import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface MatchesBreadcrumbProps {
  listingType: "sale" | "wanted" | "matched";
  listingTitle?: string;
}

export const MatchesBreadcrumb = ({ listingType, listingTitle }: MatchesBreadcrumbProps) => {
  const router = useRouter();

  const listingTypeLabel =
    listingType === "sale"
      ? "My Sale Listings"
      : listingType === "wanted"
      ? "My Want Listings"
      : "My Matched Listings";

  const breadcrumbs = [
    {
      label: "Home",
      onClick: () => router.push("/")
    },
    {
      label: listingTypeLabel,
      onClick: () => router.push(`/listings?type=${listingType}`)
    },
    ...(listingTitle ? [{
      label: listingTitle,
      onClick: null as (() => void) | null
    }] : []),
    {
      label: "Matches",
      onClick: null as (() => void) | null
    }
  ];

  return (
    <nav className="hidden md:flex items-center space-x-2 py-3">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-accent-400 flex-shrink-0" />
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-sm font-medium text-accent-500 hover:text-accent-700 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-sm font-medium text-accent-700">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
