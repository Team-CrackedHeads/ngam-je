"use client";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ThreadCard from "../components/threads-ui/ThreadCard";
import { MOCK_THREADS, ThreadData } from "../../utils/mock-threads-data";
import AIAgentOverlay from "../components/threads-ui/AIAgentOverlay";
import CreateThreadsSection from "../components/threads-ui/CreateThreadsSection";
import AIAgentSearch from "../components/threads-ui/AIAgentSearch";
import FilterButton from "../components/threads-ui/FilterButton";
import PageHeader from "../components/threads-ui/PageHeader";

// the different ways users can filter threads
type FilterType = "All" | "Hot" | "Top" | "New";

// main page that shows all the community threads
function ThreadsPage() {
  // keeps track of which filter button is selected
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  // controls if the ai chat popup is open or closed
  const [isAIOpen, setIsAIOpen] = useState(false);
  // controls if the create thread popup is open or closed
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // tracks if user has scrolled down (for sticky ai search bar)
  const [isScrolled, setIsScrolled] = useState(false);
  // infinite scroll state
  const [displayedCount, setDisplayedCount] = useState(6); // start with 6 items
  const [isLoading, setIsLoading] = useState(false); // loading state for new items

  // listen for scroll events to make ai search bar sticky AND handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // sticky ai bar logic
      setIsScrolled(scrollTop > 100);

      // infinite scroll logic - load more when near bottom
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 200; // 200px before bottom

      if (scrolledToBottom && !isLoading) {
        loadMoreItems();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, displayedCount]);

  // function to load more items
  const loadMoreItems = () => {
    const allFilteredThreads = getFilteredThreads();

    // don't load if we're already showing everything
    if (displayedCount >= allFilteredThreads.length) return;

    setIsLoading(true);

    // simulate loading delay (remove this in real app)
    setTimeout(() => {
      setDisplayedCount((prev) =>
        Math.min(prev + 6, allFilteredThreads.length)
      ); // load 6 more
      setIsLoading(false);
    }, 500); // 500ms delay to show loading
  };

  // reset displayed count when filter changes
  useEffect(() => {
    setDisplayedCount(6); // reset to 6 items when filter changes
  }, [activeFilter]);

  // function that filters and sorts threads based on what filter is selected
  const getFilteredThreads = (): ThreadData[] => {
    let filtered = [...MOCK_THREADS];

    switch (activeFilter) {
      case "All":
        return filtered;
      case "Hot":
        return filtered
          .filter((thread) => thread.isHot)
          .sort((a, b) => b.upvotes - a.upvotes);
      case "Top":
        return filtered.sort((a, b) => b.upvotes - a.upvotes);
      case "New":
        return filtered.sort((a, b) => {
          const getMinutes = (timeAgo: string) => {
            if (timeAgo.includes("m")) return parseInt(timeAgo);
            if (timeAgo.includes("h")) return parseInt(timeAgo) * 60;
            if (timeAgo.includes("d")) return parseInt(timeAgo) * 1440;
            return 0;
          };
          return getMinutes(a.timeAgo) - getMinutes(b.timeAgo);
        });
      default:
        return filtered;
    }
  };

  // get the filtered list of threads to show
  const allFilteredThreads = getFilteredThreads();
  // only show the number of items we want to display
  const threadsToShow = allFilteredThreads.slice(0, displayedCount);

  // when user clicks a filter button, update which one is selected
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  // when user clicks create thread button, open the popup
  const handleCreateThread = () => {
    setIsCreateOpen(true);
  };

  return (
    <>
      {/* main page container */}
      <div className="min-h-screen bg-gray-50 ">
        <div
          className={`container mx-auto px-4 md:px-8 py-8 pb-32 md:pb-40 ${
            isScrolled ? "pt-20" : ""
          }`}
        >
          {/* ai search section at the top - now becomes sticky when scrolled */}
          <AIAgentSearch
            onOpenAI={() => setIsAIOpen(true)}
            isScrolled={isScrolled}
          />

          {/* page title and create button */}
          <PageHeader onCreateThread={handleCreateThread} />

          {/* filter buttons (all, hot, top, new) */}
          <FilterButton
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />

          {/* shows how many threads are displayed */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <p className="text-sm sm:text-base text-gray-600">
              Showing {threadsToShow.length} of {allFilteredThreads.length}{" "}
              threads
              {activeFilter !== "All" && ` • Filter: ${activeFilter}`}
            </p>
          </div>

          {/* grid of thread cards (1 column on mobile, 2 on tablet, 3 on desktop) */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {threadsToShow.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>

          {/* loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2 text-gray-600">
                Loading more threads...
              </span>
            </div>
          )}

          {/* message when all items are loaded */}
          {displayedCount >= allFilteredThreads.length &&
            allFilteredThreads.length > 6 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">-No more items-</p>
              </div>
            )}

          {/* message shown when no threads match the filter */}
          {allFilteredThreads.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">
                No threads found for the selected filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ai chat popup (only shows when user clicks ai search) */}
      <AIAgentOverlay isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      {/* create thread popup (only shows when user clicks create button) */}
      <CreateThreadsSection
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}

export default ThreadsPage;
