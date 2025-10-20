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
type FilterType = "All"| "Best" | "Hot" | "New" | "Top" | "Rising";

type FilterDropdownProps = {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
};

export default function FilterDropdown({
  activeFilter,
  onFilterChange,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-1 text-sm font-medium"
        >
          {activeFilter}
          <ChevronDown size={16} className="opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end" 
        sideOffset={8}
        className="min-w-fit bg-background/95 backdrop-blur-md border border-border shadow-lg px-2 py-1"
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
                filter === activeFilter ? "text-black" : ""
              }`}
              style={{
                backgroundColor:
                  filter === activeFilter
                    ? "var(--color-secondary-500)"
                    : "transparent",
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