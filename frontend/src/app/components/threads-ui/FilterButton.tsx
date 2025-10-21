"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

// the different ways users can sort/filter threads
export type FilterType = "All" | "Best" | "Hot" | "New" | "Top" | "Rising";

type FilterDropdownProps = {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

export default function FilterDropdown({
  activeFilter,
  onFilterChange,
}: FilterDropdownProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 h-auto hover:bg-secondary-600 bg-secondary-500 text-accent-700 rounded-full border border-secondary-600"
        >
          {activeFilter}
          <ChevronDown size={16} className="opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={8}
        avoidCollisions={false}
        className="min-w-fit bg-primary-50 border border-primary-200 shadow-lg px-2 py-1 z-[9999]"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2">
          Sort by
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["Best", "Hot", "New", "Top", "Rising"] as FilterType[]).map(
          (filter) => (
            <DropdownMenuItem
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`cursor-pointer transition-colors ${
                filter === activeFilter ? "font-semibold text-black" : ""
              }`}
              style={{
                backgroundColor:
                  filter === activeFilter
                    ? "var(--color-secondary-500)"
                    : "transparent",
              }}
              onMouseEnter={(e) => {
                if (filter !== activeFilter) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "var(--color-secondary-500)";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== activeFilter) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                }
              }}
            >
              {filter}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}