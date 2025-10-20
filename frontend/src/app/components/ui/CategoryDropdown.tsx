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

type CategoryDropdownProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

export default function CategoryDropdown({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryDropdownProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 h-auto hover:bg-secondary-600 bg-secondary-500 text-accent-700 rounded-full border border-secondary-600"
        >
          {selectedCategory || "All Categories"}
          <ChevronDown size={16} className="opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={8}
        avoidCollisions={false}
        className="min-w-fit bg-primary-50 border border-primary-200 shadow-lg px-2 py-1 z-[9999]"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2">
          Sort by Category
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onSelectCategory(null)}
          className={`cursor-pointer transition-colors flex items-center gap-2 ${
            !selectedCategory ? "text-black" : ""
          }`}
          style={{
            backgroundColor:
              !selectedCategory
                ? "var(--color-secondary-500)"
                : "transparent",
          }}
        >
          All Categories
        </DropdownMenuItem>
        {categories.map((category) => (
          <DropdownMenuItem
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`cursor-pointer transition-colors flex items-center gap-2 ${
              selectedCategory === category ? "text-black" : ""
            }`}
            style={{
              backgroundColor:
                selectedCategory === category
                  ? "var(--color-secondary-500)"
                  : "transparent",
            }}
          >
            {category}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
