import { useState, useEffect, useMemo } from "react";
import { MatchedListing, SortOption } from "../types";

interface UseMatchingLogicProps {
  userMode: "buyer" | "seller";
  userListings: unknown[];
  availableListings: unknown[];
}

export function useMatchingLogic({
  userMode,
  userListings,
  availableListings,
}: UseMatchingLogicProps) {
  const [allMatches, setAllMatches] = useState<MatchedListing[]>([]);
  const [unswipedMatches, setUnswipedMatches] = useState<MatchedListing[]>([]);
  const [likedMatches, setLikedMatches] = useState<MatchedListing[]>([]);
  const [passedMatches, setPassedMatches] = useState<MatchedListing[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("match-score");

  // Generate AI matches based on user's listings
  useEffect(() => {
    const generateMatches = (): MatchedListing[] => {
      const oppositeType = userMode === "buyer" ? "sell" : "buy";
      const relevantListings = availableListings.filter(
        (listing: any) => listing.type === oppositeType
      );

      return relevantListings
        .map((listing: any) => {
          const reasons: string[] = [];
          let score = 0;

          // Category matching
          const userCategories = userListings.map((l: any) => l.category);
          if (userCategories.includes(listing.category)) {
            score += 30;
            reasons.push(`Matches your interest in ${listing.category}`);
          }

          // Tag overlap
          const userTags = userListings.flatMap((l: any) => l.tags || []);
          const commonTags = listing.tags?.filter((tag: string) =>
            userTags.includes(tag)
          );
          if (commonTags && commonTags.length > 0) {
            score += 20 * Math.min(commonTags.length, 2);
            reasons.push(`${commonTags.length} matching preferences`);
          }

          // Price compatibility
          if (userListings.length > 0) {
            const parsePrice = (priceStr: unknown) => {
              if (typeof priceStr !== 'string') return 0;
              return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
            };

            const userBudgets = userListings.map((l: any) => parsePrice(l.price || l.budget));
            const avgBudget = userBudgets.reduce((a, b) => a + b, 0) / userBudgets.length;
            const listingPrice = parsePrice((listing as any).price || (listing as any).budget);
            const priceDiff = Math.abs(listingPrice - avgBudget);
            const priceScore = avgBudget > 0 ? Math.max(0, 20 - (priceDiff / avgBudget) * 20) : 0;
            score += priceScore;
            if (priceScore > 10) {
              reasons.push("Within your budget range");
            }
          }

          // Location proximity
          const userLocations = userListings.map((l: any) => l.location);
          if (userLocations.some((loc) => loc === listing.location)) {
            score += 15;
            reasons.push("Same location as you");
          }

          // Recency bonus
          if (listing.timestamp && listing.timestamp.includes("hour")) {
            score += 10;
            reasons.push("Recently posted");
          }

          // Randomness for variety
          score += Math.random() * 5;

          return {
            id: listing.id.toString(),
            title: listing.title,
            description: listing.description,
            price: listing.price || listing.budget,
            images: listing.images || ["/placeholder.png"],
            tags: listing.tags || [],
            location: listing.location,
            timeAgo: listing.timestamp || "Recently",
            seller: listing.seller || "Unknown",
            type: listing.type,
            category: listing.category,
            matchScore: Math.min(Math.round(score), 99),
            matchReasons: reasons.length > 0 ? reasons : ["Recommended for you"],
          } as MatchedListing;
        })
        .filter((listing) => listing.matchScore > 20)
        .sort((a, b) => b.matchScore - a.matchScore);
    };

    const initialMatches = generateMatches();
    setAllMatches(initialMatches);
    setUnswipedMatches(initialMatches);
  }, [userMode, userListings, availableListings]);

  // Filter and sort function
  const filterAndSort = (listings: MatchedListing[]) => {
    let filtered = listings;

    if (searchQuery) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case "match-score":
        sorted.sort((a, b) => b.matchScore - a.matchScore);
        break;
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "recent":
        sorted.sort((a, b) => {
          const aIsRecent = a.timeAgo.includes("hour");
          const bIsRecent = b.timeAgo.includes("hour");
          if (aIsRecent && !bIsRecent) return -1;
          if (!aIsRecent && bIsRecent) return 1;
          return 0;
        });
        break;
      case "location":
        sorted.sort((a, b) => a.location.localeCompare(b.location));
        break;
    }

    return sorted;
  };

  return {
    allMatches,
    unswipedMatches,
    setUnswipedMatches,
    likedMatches,
    setLikedMatches,
    passedMatches,
    setPassedMatches,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterAndSort,
  };
}
