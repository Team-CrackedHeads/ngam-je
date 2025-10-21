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

type ListingType = "wtb" | "wts" | "general";

type ListingTypeDropdownProps = {
  activeType: ListingType;
  onTypeChange: (type: ListingType) => void;
};

export default function ListingTypeDropdown({
  activeType,
  onTypeChange,
}: ListingTypeDropdownProps) {
  const getTypeLabel = (type: ListingType) => {
    switch (type) {
      case "wtb":
        return "Want to Buy";
      case "wts":
        return "Want to Sell";
      case "general":
        return "All";
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 h-auto hover:bg-secondary-600 bg-secondary-500 text-accent-700 rounded-full border border-secondary-600"
        >
          {getTypeLabel(activeType)}
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
          Listing Type
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["general", "wtb", "wts"] as ListingType[]).map(
          (type) => (
            <DropdownMenuItem
              key={type}
              onClick={() => onTypeChange(type)}
              className={`cursor-pointer transition-colors ${
                type === activeType ? "text-black" : ""
              }`}
              style={{
                backgroundColor:
                  type === activeType
                    ? "var(--color-secondary-500)"
                    : "transparent",
              }}
            >
              {getTypeLabel(type)}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
