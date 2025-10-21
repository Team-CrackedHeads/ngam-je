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
import ThreadCard from "../components/threads-ui/ThreadCard";
import { MOCK_THREADS, ThreadData } from "../../utils/mock-threads-data";

import CreateThreadsSection from "../components/threads-ui/CreateThreadsSection";
import AIAgentSearch from "../components/threads-ui/AIAgentSearch";
import NgamOverview from "../components/threads-ui/NgamOverview";
import FilterButton, { FilterType } from "../components/threads-ui/FilterButton";
import ViewDropdown from "../components/threads-ui/ViewDropdown";
import PageHeader from "../components/threads-ui/PageHeader";
import BreadcrumbNav from "./BreadcrumbNav"; // ✅ Added import
import { MockAIResponse } from "../../utils/mock-ai-data";

type ViewType = "grid" | "list";

function ThreadsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  // AI overview / query
  const [currentOverview, setCurrentOverview] = useState<MockAIResponse | null>(null);
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

  // Derived query keywords
  const queryKeywords = useMemo(() => {
    const base = (lastQuery || "").toLowerCase();
    const words = base.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    const set = new Set<string>(words);

    if (/[^\w](sneaker|sneakers|shoe|shoes)\b/.test(" " + base)) {
      ["sneaker", "sneakers", "shoe", "shoes", "yeezy", "jordan", "nike", "adidas", "new balance", "nb", "asics", "salomon"].forEach((k) => set.add(k));
    }
    if (/\biphone|ios|apple\b/.test(base)) {
      ["iphone", "apple", "ios"].forEach((k) => set.add(k));
    }
    if (/\bmacbook|mac\s?book\b/.test(base)) {
      ["macbook", "mac book", "apple"].forEach((k) => set.add(k));
    }

    return Array.from(set);
  }, [lastQuery]);

  const getBaseFilteredThreads = useCallback((): ThreadData[] => {
    const filtered = [...MOCK_THREADS];
    switch (activeFilter) {
      case "Hot":
        return filtered.filter((t) => t.isHot).sort((a, b) => b.upvotes - a.upvotes);
      case "Top":
        return filtered.sort((a, b) => b.upvotes - a.upvotes);
      case "New": {
        const toMin = (t: string) =>
          t.includes("d") ? parseInt(t) * 1440 : t.includes("h") ? parseInt(t) * 60 : parseInt(t);
        return filtered.sort((a, b) => toMin(a.timeAgo) - toMin(b.timeAgo));
      }
      default:
        return filtered;
    }
  }, [activeFilter]);

  const getFilteredThreads = useCallback((): ThreadData[] => {
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
          if (entry.target === overviewEl) setInOverviewView(entry.isIntersecting);
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
    const container = snapContainerRef.current, target = threadsSectionRef.current;
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

  const handleDismissOverview = () => {
    setCurrentOverview(null);
    setIsAILoading(false);
    setLastQuery("");
  };

  // CTA State
  const hasOverview = !!(currentOverview || isAILoading);
  const hasQueryFilter = queryKeywords.length > 0 || lastQuery.length > 0;

  const ctaState = useMemo(() => {
    if (inSearchView || inOverviewView) {
      return { label: "See Listings", icon: "down" as const, targetRef: metaRowRef, targetVisible: isMetaInView };
    }
    if (hasOverview) {
      return { label: "Back to AI", icon: "up" as const, targetRef: overviewAnchorRef, targetVisible: inOverviewView };
    }
    return { label: "New AI Chat", icon: "new" as const, targetRef: searchSectionRef, targetVisible: inSearchView };
  }, [inSearchView, inOverviewView, isMetaInView, hasOverview]);

  const handleBottomJump = () => {
    ctaState.targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shouldShowCTA = !ctaState.targetVisible;

  return (
    <>
      {/* SNAP CONTAINER */}
      <div ref={snapContainerRef} className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        {/* SECTION 1: AI Agent */}
        <section id="search" ref={searchSectionRef} className="h-full snap-start">
          <AIAgentSearch
            onOpenAI={() => setIsAIOpen(true)}
            onSearchStart={handleAISearchStart}
            onSearchComplete={handleAISearchComplete}
          />
        </section>

        {/* SECTION 2: Threads */}
        <section id="ngam-overview" ref={threadsSectionRef} className="snap-start bg-gray-50">
          <div className="container mx-auto px-4 md:px-8 py-8 pb-32 md:pb-40">

            {/* ✅ Breadcrumb Navigation */}
            <BreadcrumbNav />

            {/* Page Header */}
            <div ref={headerRef}>
              <PageHeader />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl shadow-sm border border-gray-200 mt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Sort By:</span>
                  <FilterButton activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">View:</span>
                  <ViewDropdown activeView={viewType} onViewChange={setViewType} />
                </div>
              </div>

              <button
                ref={inlineCreateBtnRef}
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 text-accent-700 font-semibold rounded-xl shadow hover:scale-105 active:scale-95 border border-secondary-600"
              >
                <Plus className="w-4 h-4" />
                Create Thread
              </button>
            </div>

            {hasOverview && (
              <>
                <div id="overview" ref={overviewAnchorRef} className="snap-start h-0" />
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
                Showing {threadsToShow.length} of {allFilteredThreads.length} threads
              </p>
              {hasQueryFilter && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-neutral-300 bg-white text-gray-700">
                  <FilterIcon className="w-3 h-3" />
                  Query filter
                  {lastQuery && <span className="max-w-[160px] truncate">: {lastQuery}</span>}
                  <button onClick={() => setLastQuery("")} className="ml-1 hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className={viewType === "grid"
              ? "grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-4"
            }>
              {threadsToShow.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>

            {/* Loading + Empty + End State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                <span className="ml-2 text-gray-600">Loading more threads...</span>
              </div>
            )}
            {displayedCount >= allFilteredThreads.length && allFilteredThreads.length > 6 && (
              <div className="flex items-center justify-center py-8 text-gray-500">- No more items -</div>
            )}
            {allFilteredThreads.length === 0 && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                {queryKeywords.length ? "No threads matched your AI query." : "No threads found."}
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
      <CreateThreadsSection isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}

export default ThreadsPage;