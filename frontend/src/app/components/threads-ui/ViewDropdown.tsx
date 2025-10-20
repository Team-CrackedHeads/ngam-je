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
import { ChevronDown, Grid3x3, List } from "lucide-react";

type ViewType = "grid" | "list";

type ViewDropdownProps = {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
};

export default function ViewDropdown({
  activeView,
  onViewChange,
}: ViewDropdownProps) {
  const viewLabel = activeView === "grid" ? "Grid" : "List";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 h-auto hover:bg-secondary-600 bg-secondary-500 text-accent-700 rounded-full border border-secondary-600"
        >
          {viewLabel}
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
          View as
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onViewChange("grid")}
          className={`cursor-pointer transition-colors flex items-center gap-2 ${
            activeView === "grid" ? "text-black" : ""
          }`}
          style={{
            backgroundColor:
              activeView === "grid"
                ? "var(--color-secondary-500)"
                : "transparent",
          }}
        >
          <Grid3x3 className="w-4 h-4" />
          Grid
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onViewChange("list")}
          className={`cursor-pointer transition-colors flex items-center gap-2 ${
            activeView === "list" ? "text-black" : ""
          }`}
          style={{
            backgroundColor:
              activeView === "list"
                ? "var(--color-secondary-500)"
                : "transparent",
          }}
        >
          <List className="w-4 h-4" />
          List
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
