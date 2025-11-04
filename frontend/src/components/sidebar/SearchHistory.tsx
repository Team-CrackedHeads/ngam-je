"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  User,
  Bell,
  Shield,
  MessageSquare,
  Sparkles,
  Bookmark,
  HelpCircle,
  LifeBuoy,
  X,
} from "lucide-react";
import {
  mockSearchSuggestions,
  SearchSuggestion,
} from "@/utils/mock-all-data-used";

// Helper to get Lucide icon component by name
const getIconComponent = (iconName?: string) => {
  switch (iconName) {
    case "User":
      return User;
    case "Bell":
      return Bell;
    case "Shield":
      return Shield;
    case "MessageSquare":
      return MessageSquare;
    case "Sparkles":
      return Sparkles;
    case "Bookmark":
      return Bookmark;
    case "HelpCircle":
      return HelpCircle;
    case "LifeBuoy":
      return LifeBuoy;
    default:
      return Search; // Default icon
  }
};

type SearchHistoryProps = {
  onSuggestionClick: (path: string, type: string) => void; // New prop
};

export default function SearchHistory({
  onSuggestionClick,
}: SearchHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = mockSearchSuggestions.filter((suggestion) =>
        suggestion.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
      setIsDropdownOpen(true);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(""); // Clear search bar
    setIsDropdownOpen(false); // Close dropdown
    onSuggestionClick(suggestion.path, suggestion.type); // Call the prop function
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative max-w-48 mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-400" />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-3 py-2 text-xs bg-neutral-100 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent placeholder-neutral-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length > 0 && setIsDropdownOpen(true)}
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-200 text-accent-500"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isDropdownOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-primary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => {
            const Icon = getIconComponent(suggestion.icon);
            return (
              <button
                key={suggestion.id}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-accent-700 hover:bg-primary-100 transition-colors"
                onClick={() => handleSuggestionSelect(suggestion)} // Call the new handler
              >
                <Icon className="w-4 h-4 text-accent-500" />
                <span>{suggestion.title}</span>
                <span className="ml-auto text-xs text-accent-400 capitalize">
                  {suggestion.type.replace("-", " ")}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
