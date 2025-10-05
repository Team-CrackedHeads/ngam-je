"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Plus, Filter as FilterIcon, X, ChevronDown, ChevronUp, MessageSquarePlus } from "lucide-react";
import ThreadCard from "../components/threads-ui/ThreadCard";
import { MOCK_THREADS, ThreadData } from "../../utils/mock-threads-data";
import AIAgentOverlay from "../components/threads-ui/AIAgentOverlay";
import CreateThreadsSection from "../components/threads-ui/CreateThreadsSection";
import AIAgentSearch from "../components/threads-ui/AIAgentSearch";
import NgamOverview from "../components/threads-ui/NgamOverview";
import FilterButton from "../components/threads-ui/FilterButton";
import PageHeader from "../components/threads-ui/PageHeader";
import { MockAIResponse } from "../../utils/mock-ai-data";

type FilterType = "All" | "Hot" | "Top" | "New";

function ThreadsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
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

  const searchSectionRef = useRef<HTMLElement | null>(null);     // AI Agent section
  const threadsSectionRef = useRef<HTMLElement | null>(null);    // Community section
  const metaRowRef = useRef<HTMLDivElement | null>(null);        // Listings meta row
  const overviewWrapRef = useRef<HTMLDivElement | null>(null);   // Visual overview card
  const overviewAnchorRef = useRef<HTMLDivElement | null>(null); // Invisible overview anchor
  const headerRef = useRef<HTMLDivElement | null>(null);         // PageHeader line

  // FAB visibility (Create Thread)
  const [showFab, setShowFab] = useState(false);
  const [inlineBtnVisible, setInlineBtnVisible] = useState(true);
  const [inThreadsSection, setInThreadsSection] = useState(false);
  const FAB_SCROLL_THRESHOLD = 200;

  // Section detection for bottom CTA
  const [inSearchView, setInSearchView] = useState(false);
  const [inOverviewView, setInOverviewView] = useState(false);
  const [isMetaInView, setIsMetaInView] = useState(false);

  // --- helpers: derive keywords from the AI query ---
  const queryKeywords = useMemo(() => {
    const base = (lastQuery || "").toLowerCase();
    const words = base.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    const set = new Set<string>(words);

    if (/[^\w](sneaker|sneakers|shoe|shoes)\b/.test(" " + base)) {
      ["sneaker","sneakers","shoe","shoes","yeezy","jordan","nike","adidas","new balance","nb","asics","salomon"].forEach(k => set.add(k));
    }
    if (/\biphone|ios|apple\b/.test(base)) {
      ["iphone","apple","ios"].forEach(k => set.add(k));
    }
    if (/\bmacbook|mac\s?book\b/.test(base)) {
      ["macbook","mac book","apple"].forEach(k => set.add(k));
    }

    return Array.from(set);
  }, [lastQuery]);

  // base filter/sort
  const getBaseFilteredThreads = useCallback((): ThreadData[] => {
    let filtered = [...MOCK_THREADS];
    switch (activeFilter) {
      case "Hot":
        return filtered.filter(t => t.isHot).sort((a, b) => b.upvotes - a.upvotes);
      case "Top":
        return filtered.sort((a, b) => b.upvotes - a.upvotes);
      case "New": {
        const toMin = (t: string) =>
          t.includes("d") ? parseInt(t) * 1440 :
          t.includes("h") ? parseInt(t) * 60 : parseInt(t);
        return filtered.sort((a, b) => toMin(a.timeAgo) - toMin(b.timeAgo));
      }
      default:
        return filtered;
    }
  }, [activeFilter]);

  // apply query keywords
  const getFilteredThreads = useCallback((): ThreadData[] => {
    const base = getBaseFilteredThreads();
    if (!queryKeywords.length) return base;
    const matched = base.filter(t => {
      const hay = `${t.title ?? ""} ${t.category ?? ""}`.toLowerCase();
      return queryKeywords.some(kw => hay.includes(kw));
    });
    return matched.length ? matched : base;
  }, [getBaseFilteredThreads, queryKeywords]);

  const allFilteredThreads = getFilteredThreads();
  const threadsToShow = allFilteredThreads.slice(0, displayedCount);

  // pagination
  useEffect(() => setDisplayedCount(6), [activeFilter, lastQuery]);

  const loadMoreItems = useCallback(() => {
    if (isLoading || displayedCount >= allFilteredThreads.length) return;
    setIsLoading(true);
    setTimeout(() => {
      setDisplayedCount(p => Math.min(p + 6, allFilteredThreads.length));
      setIsLoading(false);
    }, 500);
  }, [isLoading, displayedCount, allFilteredThreads.length]);

  // infinite scroll sentinel
  useEffect(() => {
    const root = snapContainerRef.current, sent = sentinelRef.current;
    if (!root || !sent) return;
    const io = new IntersectionObserver(e => e[0].isIntersecting && loadMoreItems(), {
      root, rootMargin: "200px 0px 200px 0px", threshold: 0
    });
    io.observe(sent);
    return () => io.disconnect();
  }, [loadMoreItems]);

  // Watch top-level sections for bottom CTA logic (search, overview, meta)
  useEffect(() => {
    const root = snapContainerRef.current;
    const ios: IntersectionObserver[] = [];
    if (!root) return;

    if (searchSectionRef.current) {
      const ioSearch = new IntersectionObserver(e => setInSearchView(e[0].isIntersecting), { root, threshold: 0.1 });
      ioSearch.observe(searchSectionRef.current);
      ios.push(ioSearch);
    }

    if (overviewAnchorRef.current) {
      const ioOverview = new IntersectionObserver(e => setInOverviewView(e[0].isIntersecting), { root, threshold: 0.01 });
      ioOverview.observe(overviewAnchorRef.current);
      ios.push(ioOverview);
    } else {
      setInOverviewView(false);
    }

    if (metaRowRef.current) {
      const ioMeta = new IntersectionObserver(e => setIsMetaInView(e[0].isIntersecting), { root, threshold: 0.01 });
      ioMeta.observe(metaRowRef.current);
      ios.push(ioMeta);
    }

    return () => ios.forEach(o => o.disconnect());
  }, [currentOverview, isAILoading]);

  // Track entire threads section (for FAB logic)
  useEffect(() => {
    const root = snapContainerRef.current, sec = threadsSectionRef.current;
    if (!root || !sec) return;
    const io = new IntersectionObserver(e => setInThreadsSection(e[0].isIntersecting), { root, threshold: 0.01 });
    io.observe(sec);
    return () => io.disconnect();
  }, []);

  // inline create visibility watcher
  useEffect(() => {
    const root = snapContainerRef.current, target = inlineCreateBtnRef.current;
    if (!root || !target) return;
    const io = new IntersectionObserver(e => setInlineBtnVisible(e[0].isIntersecting), { root, threshold: 0.01 });
    io.observe(target);
    return () => io.disconnect();
  }, [threadsToShow.length]);

  // FAB show/hide from scroll
  useEffect(() => {
    const root = snapContainerRef.current, sec = threadsSectionRef.current;
    if (!root || !sec) return;
    const onScroll = () => {
      if (!inThreadsSection) return setShowFab(false);
      const secTop = sec.offsetTop, dist = Math.max(0, root.scrollTop - secTop);
      setShowFab(!inlineBtnVisible && dist > FAB_SCROLL_THRESHOLD);
    };
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [inThreadsSection, inlineBtnVisible]);

  // AI events
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
    setLastQuery((r as any)?.prompt || "");
  };

  const hasQueryFilter = queryKeywords.length > 0;
  const hasOverview = !!(currentOverview || isAILoading);

  // --- Conditional CTA: compute target + whether it's visible ---
  const ctaState = useMemo(() => {
    // Decide label/icon + target ref + "is target visible" using our visibility flags
    if (inSearchView) {
      return {
        label: "See Listings",
        icon: "down" as const,
        targetRef: metaRowRef,
        targetVisible: isMetaInView,
      };
    }
    if (inOverviewView) {
      return {
        label: "See Listings",
        icon: "down" as const,
        targetRef: metaRowRef,
        targetVisible: isMetaInView,
      };
    }
    // Listings view
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
    ctaState.targetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shouldShowCTA = !ctaState.targetVisible; // Hide when the target is already on screen

  return (
    <>
      {/* SNAP/SCROLL CONTAINER */}
      <div
        ref={snapContainerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      >
        {/* SECTION 1: AI AGENT (Hero) */}
        <section id="search" ref={searchSectionRef} className="h-screen snap-start">
          <AIAgentSearch
            onOpenAI={() => setIsAIOpen(true)}
            onSearchStart={handleAISearchStart}
            onSearchComplete={handleAISearchComplete}
          />
        </section>

        {/* SECTION 2: COMMUNITY THREADS (Overview + Listings in one visual section) */}
        <section
          id="ngam-overview"
          ref={threadsSectionRef}
          className="min-h-screen snap-start bg-gray-50"
        >
          <div className="container mx-auto px-4 md:px-8 py-8 pb-32 md:pb-40">
            {/* Page header — scroll target */}
            <div ref={headerRef}>
              <PageHeader />
            </div>

            {/* Invisible snap anchor for true Overview section (no visual space added) */}
            {hasOverview && <div id="overview" ref={overviewAnchorRef} className="snap-start h-0" />}

            {/* AI Overview (shown when present) */}
            {hasOverview && (
              <div ref={overviewWrapRef} className="mb-4 relative">
                <NgamOverview
                  content={currentOverview?.content}
                  images={currentOverview?.images}
                  sources={currentOverview?.sources}
                  isLoading={isAILoading}
                />
              </div>
            )}

            {/* Filters */}
            <FilterButton
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {/* Meta + Inline Create (anchor for listings) */}
            <div
              ref={metaRowRef}
              className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 mt-4"
            >
              <div className="flex items-center gap-3">
                <p className="text-sm sm:text-base text-gray-600">
                  Showing {threadsToShow.length} of {allFilteredThreads.length} threads
                  {activeFilter !== "All" && ` • Filter: ${activeFilter}`}
                </p>

                {hasQueryFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-neutral-300 bg-white text-gray-700">
                    <FilterIcon className="w-3 h-3" />
                    Query filter
                    {lastQuery && (
                      <span className="max-w-[160px] truncate">: {lastQuery}</span>
                    )}
                    <button
                      aria-label="Clear query filter"
                      className="ml-1 hover:opacity-70"
                      onClick={() => setLastQuery("")}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
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

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {threadsToShow.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                <span className="ml-2 text-gray-600">Loading more threads...</span>
              </div>
            )}

            {/* End state */}
            {displayedCount >= allFilteredThreads.length &&
              allFilteredThreads.length > 6 && (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  -No more items-
                </div>
              )}

            {/* Empty state */}
            {allFilteredThreads.length === 0 && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                {queryKeywords.length
                  ? "No threads matched your AI query."
                  : "No threads found."}
              </div>
            )}

            {/* Infinite-scroll sentinel */}
            <div ref={sentinelRef} className="h-px" />
          </div>
        </section>
      </div>

      {/* Floating Create Thread Button (right) */}
      {showFab && (
        <button
          onClick={() => setIsCreateOpen(true)}
          aria-label="Create Thread"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 shadow-xl bg-secondary-500 text-accent-700 border border-secondary-600 hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold">Create Thread</span>
        </button>
      )}

      {/* Bottom-center navigation CTA — now CONDITIONAL */}
      {shouldShowCTA && (
        <button
          onClick={handleBottomJump}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-secondary-500 text-accent-700 border border-secondary-600 shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          {ctaState.icon === "down" && <ChevronDown className="w-4 h-4" />}
          {ctaState.icon === "up" && <ChevronUp className="w-4 h-4" />}
          {ctaState.icon === "new" && <MessageSquarePlus className="w-4 h-4" />}
          {ctaState.label}
        </button>
      )}

      {/* Overlays */}
      <AIAgentOverlay isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <CreateThreadsSection isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}

export default ThreadsPage;
