"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Plus,
  Filter as FilterIcon,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
} from "lucide-react";
import ThreadCard from "@/components/threads/ThreadCard";
import { Thread, ThreadDisplay } from "@/types/thread";
import axios from "axios";

import CreateThreadsSection from "@/components/threads/CreateThreadsSection";
import AIAgentSearch from "@/components/threads/AIAgentSearch";
import NgamOverview from "@/components/threads/NgamOverview";
import FilterButton, { FilterType } from "@/components/threads/FilterButton";
import ViewDropdown from "@/components/threads/ViewDropdown";
import PageHeader from "@/components/threads/PageHeader";
import { MockAIResponse } from "@/utils/mock-all-data-used";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, useClerk } from "@clerk/nextjs";

type ViewType = "grid" | "list";

function ThreadsPage() {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);

  // AI overview / query
  const [currentOverview, setCurrentOverview] = useState<MockAIResponse | null>(
    null
  );
  const [isAILoading, setIsAILoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");

  // Refs
  const snapContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inlineCreateBtnRef = useRef<HTMLButtonElement | null>(null);

  const searchSectionRef = useRef<HTMLElement | null>(null);
  const threadsSectionRef = useRef<HTMLElement | null>(null);
  const metaRowRef = useRef<HTMLDivElement | null>(null);
  const overviewWrapRef = useRef<HTMLDivElement | null>(null);
  const overviewAnchorRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [inSearchView, setInSearchView] = useState(false);
  const [inOverviewView, setInOverviewView] = useState(false);
  const [isMetaInView, setIsMetaInView] = useState(false);
  const isMobile = useIsMobile();

  // Derived query keywords
  const queryKeywords = useMemo(() => {
    const base = (lastQuery || "").toLowerCase();
    const words = base
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    const set = new Set<string>(words);

    if (/[^\w](sneaker|sneakers|shoe|shoes)\b/.test(" " + base)) {
      [
        "sneaker",
        "sneakers",
        "shoe",
        "shoes",
        "yeezy",
        "jordan",
        "nike",
        "adidas",
        "new balance",
        "nb",
        "asics",
        "salomon",
      ].forEach((k) => set.add(k));
    }
    if (/\biphone|ios|apple\b/.test(base)) {
      ["iphone", "apple", "ios"].forEach((k) => set.add(k));
    }
    if (/\bmacbook|mac\s?book\b/.test(base)) {
      ["macbook", "mac book", "apple"].forEach((k) => set.add(k));
    }

    return Array.from(set);
  }, [lastQuery]);

  // Fetch threads from API
  const fetchThreads = useCallback(async () => {
    try {
      setThreadsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/threads/`
      );
      setThreads(response.data.threads);
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Convert API Thread to ThreadDisplay for compatibility with existing UI
  const convertToThreadDisplay = useCallback(
    (thread: Thread): ThreadDisplay => {
      return {
        id: thread.id,
        title: thread.title,
        description: thread.description,
        imageUrl:
          thread.image_url ||
          "https://placehold.co/800x400/cccccc/333333?text=No+Image",
        category: thread.category,
        tags: thread.tags,
        tier: thread.tier,
        contributions: thread.contributions,
        onlineUsers: thread.online_users,
        totalUsers: thread.member_count,
        // Mock fields for UI compatibility
        comments: 0,
        views: 0,
        upvotes: thread.active_contributions * 100,
        currentTokens: thread.active_contributions * 500,
        goalTokens: (thread.tier + 1) * 5000,
        isPinned: thread.tier >= 3,
        isHot: thread.tier >= 2,
        timeAgo: "Recently",
      };
    },
    []
  );

  const getBaseFilteredThreads = useCallback((): ThreadDisplay[] => {
    const filtered = threads.map(convertToThreadDisplay);
    switch (activeFilter) {
      case "Best":
        // Best: Highest tier threads with most contributions
        return filtered.sort((a, b) => {
          const scoreA = (a.tier || 0) * 1000 + (a.contributions || 0);
          const scoreB = (b.tier || 0) * 1000 + (b.contributions || 0);
          return scoreB - scoreA;
        });
      case "Hot":
        // Hot: High tier + active engagement (online users)
        return filtered
          .filter((t) => t.isHot)
          .sort((a, b) => {
            const scoreA = (a.tier || 0) * 100 + (a.onlineUsers || 0);
            const scoreB = (b.tier || 0) * 100 + (b.onlineUsers || 0);
            return scoreB - scoreA;
          });
      case "New":
        // New: Most recently created (API returns newest first already)
        return filtered;
      case "Top":
        // Top: Based on total users and contributions
        return filtered.sort((a, b) => {
          const scoreA = (a.totalUsers || 0) + (a.contributions || 0) * 10;
          const scoreB = (b.totalUsers || 0) + (b.contributions || 0) * 10;
          return scoreB - scoreA;
        });
      case "Rising":
        // Rising: Good tier but newer threads (balance between tier and recency)
        return filtered
          .filter((t) => (t.tier || 0) >= 1)
          .sort((a, b) => (b.tier || 0) - (a.tier || 0));
      case "All":
      default:
        return filtered;
    }
  }, [threads, activeFilter, convertToThreadDisplay]);

  const getFilteredThreads = useCallback((): ThreadDisplay[] => {
    const base = getBaseFilteredThreads();
    if (!queryKeywords.length) return base;
    const matched = base.filter((t) => {
      const hay = `${t.title ?? ""} ${t.category ?? ""}`.toLowerCase();
      return queryKeywords.some((kw) => hay.includes(kw));
    });
    return matched.length ? matched : base;
  }, [getBaseFilteredThreads, queryKeywords]);

  const allFilteredThreads = getFilteredThreads();
  const threadsToShow = allFilteredThreads.slice(0, displayedCount);

  useEffect(() => setDisplayedCount(6), [activeFilter, lastQuery]);

  const loadMoreItems = useCallback(() => {
    if (isLoading || displayedCount >= allFilteredThreads.length) return;
    setIsLoading(true);
    setTimeout(() => {
      setDisplayedCount((p) => Math.min(p + 6, allFilteredThreads.length));
      setIsLoading(false);
    }, 500);
  }, [isLoading, displayedCount, allFilteredThreads.length]);

  // 👇 Scroll + Intersection logic
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) loadMoreItems();
      },
      { threshold: 1.0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreItems]);

  // 👇 View detection for CTA state
  useEffect(() => {
    const searchEl = searchSectionRef.current;
    const overviewEl = overviewWrapRef.current;
    const metaEl = metaRowRef.current;
    if (!searchEl || !metaEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === searchEl) setInSearchView(entry.isIntersecting);
          if (entry.target === overviewEl)
            setInOverviewView(entry.isIntersecting);
          if (entry.target === metaEl) setIsMetaInView(entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(searchEl);
    if (overviewEl) observer.observe(overviewEl);
    observer.observe(metaEl);

    return () => observer.disconnect();
  }, [currentOverview, isAILoading]);

  // AI Handlers
  const handleAISearchStart = () => {
    setIsAILoading(true);
    setCurrentOverview(null);
    setLastQuery("");
    const container = snapContainerRef.current,
      target = threadsSectionRef.current;
    if (container && target) {
      const prev = container.style.scrollBehavior;
      container.style.scrollBehavior = "auto";
      target.scrollIntoView({ behavior: "auto", block: "start" });
      container.style.scrollBehavior = prev || "";
    }
  };

  const handleAISearchComplete = (r: MockAIResponse) => {
    setCurrentOverview(r);
    setIsAILoading(false);
    setLastQuery((r as MockAIResponse & { prompt?: string })?.prompt || "");
  };

  const handleOpenAI = () => {
    // Open AI chat or navigate to AI interface
  };

  const handleDismissOverview = () => {
    setCurrentOverview(null);
    setIsAILoading(false);
    setLastQuery("");
  };

  const handleCreateClick = () => {
    if (isSignedIn) {
      setIsCreateOpen(true);
    } else {
      openSignIn();
    }
  };

  // CTA State
  const hasOverview = !!(currentOverview || isAILoading);
  const hasQueryFilter = queryKeywords.length > 0 || lastQuery.length > 0;

  const ctaState = useMemo(() => {
    if (inSearchView || inOverviewView) {
      return {
        label: "See Listings",
        icon: "down" as const,
        targetRef: metaRowRef,
        targetVisible: isMetaInView,
      };
    }
    if (hasOverview) {
      return {
        label: "Back to AI",
        icon: "up" as const,
        targetRef: overviewAnchorRef,
        targetVisible: inOverviewView,
      };
    }
    return {
      label: "New AI Chat",
      icon: "new" as const,
      targetRef: searchSectionRef,
      targetVisible: inSearchView,
    };
  }, [inSearchView, inOverviewView, isMetaInView, hasOverview]);

  const handleBottomJump = () => {
    ctaState.targetRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const shouldShowCTA = !ctaState.targetVisible && !isMobile;

  return (
    <>
      {/* SNAP CONTAINER */}
      <div
        ref={snapContainerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      >
        {/* SECTION 1: AI Agent */}
        <section
          id="search"
          ref={searchSectionRef}
          className="h-full snap-start"
        >
          <AIAgentSearch
            onOpenAI={handleOpenAI}
            onSearchStart={handleAISearchStart}
            onSearchComplete={handleAISearchComplete}
          />
        </section>

        {/* SECTION 2: Threads */}
        <section
          id="ngam-overview"
          ref={threadsSectionRef}
          className="snap-start bg-gray-50"
        >
          <div className="container mx-auto px-4 md:px-8 py-6 pb-20 md:pb-16">
            {/* Page Header */}
            <div ref={headerRef}>
              <PageHeader />
            </div>

            <div className="hidden md:flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-200 mt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">
                    Sort By:
                  </span>
                  <FilterButton
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">
                    View:
                  </span>
                  <ViewDropdown
                    activeView={viewType}
                    viewAction={setViewType}
                  />
                </div>
              </div>

              <button
                ref={inlineCreateBtnRef}
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 text-accent-700 font-semibold rounded-xl shadow hover:scale-105 active:scale-95 border border-secondary-600"
              >
                <Plus className="w-4 h-4" />
                Create Thread
              </button>
            </div>

            <div className="md:hidden mt-4">
              <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-xl shadow-sm border border-gray-200">
                <FilterButton
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />
                <ViewDropdown activeView={viewType} viewAction={setViewType} />
                <button
                  ref={inlineCreateBtnRef}
                  onClick={handleCreateClick}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-semibold bg-secondary-500 text-accent-700 rounded-lg border border-secondary-600 shadow-sm hover:scale-[1.02] active:scale-95 transition-transform ml-auto"
                  aria-label="Create new thread"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </div>
            </div>

            {hasOverview && (
              <>
                <div
                  id="overview"
                  ref={overviewAnchorRef}
                  className="snap-start h-0"
                />
                <div ref={overviewWrapRef} className="mb-4 mt-4 relative">
                  <button
                    onClick={handleDismissOverview}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white border border-gray-200 shadow-sm transition-colors"
                    aria-label="Dismiss overview"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  <NgamOverview
                    content={currentOverview?.content}
                    images={currentOverview?.images}
                    sources={currentOverview?.sources}
                    isLoading={isAILoading}
                  />
                </div>
              </>
            )}

            <div ref={metaRowRef} className="flex items-center gap-3 py-3">
              <p className="text-base text-gray-600">
                Showing {threadsToShow.length} of {allFilteredThreads.length}{" "}
                threads
              </p>
              {hasQueryFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-neutral-300 bg-white text-gray-700">
                  <FilterIcon className="w-3 h-3" />
                  Query filter
                  {lastQuery && (
                    <span className="max-w-[160px] truncate">
                      : {lastQuery}
                    </span>
                  )}
                  <button
                    onClick={() => setLastQuery("")}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {threadsLoading ? (
              <div className="flex items-center justify-center min-h-[600px]">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
                  <span className="mt-4 text-gray-600">Loading threads...</span>
                </div>
              </div>
            ) : (
              <div
                className={
                  viewType === "grid"
                    ? "grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-4"
                }
              >
                {threadsToShow.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            )}

            {/* Loading + Empty + End State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                <span className="ml-2 text-gray-600">
                  Loading more threads...
                </span>
              </div>
            )}
            {displayedCount >= allFilteredThreads.length &&
              allFilteredThreads.length > 6 && (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  - No more items -
                </div>
              )}
            {allFilteredThreads.length === 0 && (
              <div className="flex items-center justify-center min-h-[600px] text-gray-500">
                {queryKeywords.length
                  ? "No threads matched your AI query."
                  : "No threads found."}
              </div>
            )}

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-px" />
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      {shouldShowCTA && (
        <button
          onClick={handleBottomJump}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-secondary-500 text-accent-700 border border-secondary-600 shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          {ctaState.icon === "down" && <ChevronDown className="w-4 h-4" />}
          {ctaState.icon === "up" && <ChevronUp className="w-4 h-4" />}
          {ctaState.icon === "new" && <MessageSquarePlus className="w-4 h-4" />}
          {ctaState.label}
        </button>
      )}

      {/* Overlays */}
      <CreateThreadsSection
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onThreadCreated={fetchThreads}
      />
    </>
  );
}

export default ThreadsPage;
