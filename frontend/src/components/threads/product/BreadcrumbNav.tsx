import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface BreadcrumbNavProps {
  category: string;
  listingTitle: string;
  listingType: "sale" | "wanted";
}

export const BreadcrumbNav = ({
  category,
  listingTitle,
  listingType
}: BreadcrumbNavProps) => {
  const router = useRouter();

  // Determine the type parameter for going back to category
  const typeParam = listingType === "wanted" ? "wtb" : "wts";
  const typeName = listingType === "wanted" ? "Buy Listings" : "Sell Listings";

  const breadcrumbs = [
    {
      label: "Threads",
      onClick: () => router.push("/threads")
    },
    {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      onClick: () => router.push(`/threads/${category}?type=${typeParam}`)
    },
    {
      label: typeName,
      onClick: () => router.push(`/threads/${category}?type=${typeParam}`)
    },
    {
      label: listingTitle,
      onClick: null // Current page
    }
  ];

  return (
    <nav className="flex items-center space-x-2 py-3">
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