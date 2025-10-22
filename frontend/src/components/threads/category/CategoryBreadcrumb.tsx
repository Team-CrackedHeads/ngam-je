import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryBreadcrumbProps {
  category: string;
  activeType: "wtb" | "wts"| "general";
}

export const CategoryBreadcrumb = ({ category, activeType }: CategoryBreadcrumbProps) => {
  const router = useRouter();

  // FIX: Include logic for 'general' type name
  const typeName = 
    activeType === "wtb" ? "Buy Listings" :
    activeType === "wts" ? "Sell Listings" :
    "General Listings"; // Case for "general"

  const breadcrumbs = [
    {
      label: "Threads",
      onClick: () => router.replace("/threads")
    },
    {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      onClick: null // Current category
    },
    {
      label: typeName,
      onClick: null // Current type
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