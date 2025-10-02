import { Button } from "@/components/ui/button";
import { COLORS } from "../../theme";

// the different ways users can sort/filter threads
type FilterType = "All" | "Hot" | "Top" | "New";

// what data this component needs to work
type FilterButtonProps = {
  activeFilter: FilterType; // which filter is currently selected
  onFilterChange: (filter: FilterType) => void; // function to call when user clicks a filter
};

// component that shows filter buttons (all, hot, top, new)
function FilterButton({ activeFilter, onFilterChange }: FilterButtonProps) {
  return (
    // container for all the filter buttons
    <div className="p-3 sm:p-4 flex flex-wrap gap-2 bg-white rounded-xl shadow-sm mb-6 mt-6">
      {/* create a button for each filter option */}
      {(["All", "Hot", "Top", "New"] as FilterType[]).map((filter) => (
        <Button
          key={filter}
          variant={filter === activeFilter ? "default" : "ghost"} // active button looks different
          size="sm"
          onClick={() => onFilterChange(filter)} // tell parent component when clicked
          className={`rounded-full text-xs sm:text-sm font-medium sm:font-semibold transition-colors duration-200 ${
            filter === activeFilter
              ? "shadow-inner" // active button has inner shadow
              : "text-gray-600 hover:bg-gray-50" // inactive buttons are gray
          }`}
          style={
            filter === activeFilter
              ? {
                  // active button uses your custom colors
                  backgroundColor: COLORS.accentFrom,
                  color: COLORS.text,
                }
              : {} // inactive buttons use default styling
          }
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}

export default FilterButton;
