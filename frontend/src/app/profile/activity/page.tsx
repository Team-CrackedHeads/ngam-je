"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle, ShoppingCart, Tag, OctagonAlert } from "lucide-react";
import { placeholderActivities } from "@/utils/mock-all-data-used";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export type Activity = {
  type: string;
  message: string;
  date: string;
};

// Tabs configuration
const tabs = [
  { label: "Overview", href: "/profile" },
  { label: "Activity", href: "/profile/activity" },
];

// Utility to choose icon by type
function getIcon(type: Activity["type"]) {
  switch (type) {
    case "sale":
      return <Tag size={18} className="text-secondary-600" />;
    case "purchase":
      return <ShoppingCart size={18} className="text-accent-700" />;
    case "achievement":
      return <CheckCircle size={18} className="text-secondary-500" />;
    case "alert":
      return <OctagonAlert size={18} className="text-error-500" />;
    default:
      return null;
  }
}

export default function ActivityPage() {
  const data = placeholderActivities;
  const pathname = usePathname();

  // Pagination state
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentActivities = data.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 py-4 sm:py-6 pb-24 bg-primary-100 text-accent-500 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex justify-center mb-4 sm:mb-6 border-b pb-2 space-x-4 sm:space-x-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-sm sm:text-base font-medium ${isActive ? 'text-accent-700 border-b-2 border-accent-700' : 'text-accent-500'}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Recent Activity Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">Recent Activity</h2>
          <span className="px-2 sm:px-3 py-1 text-xs rounded-full bg-primary-200 text-accent-700 font-medium">
            {data.length} activities
          </span>
        </div>

        {/* Activity Feed - No internal scroll */}
        <div className="rounded-2xl shadow bg-white overflow-hidden mb-6">
          <div className="divide-y divide-border">
            {currentActivities.map((activity, idx) => (
              <div
                key={idx}
                className="p-4 flex items-center space-x-3 sm:space-x-4 hover:bg-primary-50 transition-colors"
              >
                {/* Icon */}
                <div className="flex-shrink-0">{getIcon(activity.type)}</div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shadcn Pagination at bottom */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevPage}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
