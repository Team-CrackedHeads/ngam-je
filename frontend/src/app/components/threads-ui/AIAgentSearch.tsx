import { Search, Sparkles } from "lucide-react";
import { COLORS } from "../../theme";

type AIAgentSearchProps = {
  onOpenAI: () => void;
  isScrolled?: boolean;
};

function AIAgentSearch({ onOpenAI, isScrolled = false }: AIAgentSearchProps) {
  return (
    <div
      onClick={onOpenAI}
      className={`
        w-full bg-gradient-to-r rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 group
        ${
          isScrolled
            ? "fixed top-0 left-0 right-0 z-50 p-2 lg:p-3 mb-0 shadow-lg rounded-none sm:rounded-none lg:rounded-none mx-0" // thin sticky version
            : "mb-6 p-4 lg:p-8 lg:mb-10 lg:rounded-2xl lg:hover:shadow-2xl" // full size version
        }
      `} // mrym take note cuba ubah
      style={{
        background: COLORS.accentTo,
        borderColor: COLORS.accentFrom,
      }}
    >
      <div
        className={`flex items-center ${
          isScrolled ? "space-x-2 lg:space-x-4" : "space-x-3 lg:space-x-6"
        }`}
      >
        {/* sparkles icon - smaller when sticky */}
        <div
          className={`flex items-center justify-center rounded-full group-hover:opacity-90 transition-colors ${
            isScrolled
              ? "w-8 h-8 lg:w-10 lg:h-10" // smaller when sticky
              : "w-10 h-10 lg:w-16 lg:h-16" // full size
          }`}
          style={{ backgroundColor: COLORS.accentTo }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              COLORS.activeBg;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              COLORS.accentFrom;
          }}
        >
          <Sparkles
            className={
              isScrolled ? "w-4 h-4 lg:w-5 lg:h-5" : "w-5 h-5 lg:w-8 lg:h-8"
            }
            style={{ color: COLORS.text }}
          />
        </div>
        <div className="flex-1">
          {/* search text - shorter when sticky */}
          <div
            className={`flex items-center ${
              isScrolled ? "space-x-2" : "space-x-2 lg:space-x-4"
            }`}
          >
            <Search
              className={`text-gray-400 ${
                isScrolled ? "w-4 h-4" : "w-4 h-4 lg:w-6 lg:h-6"
              }`}
            />
            <span
              className={`text-gray-${
                isScrolled
                  ? "text-sm lg:text-base" // smaller when sticky
                  : "text-sm sm:text-base lg:text-xl lg:font-medium" // full size
              }`}
            >
              {
                isScrolled
                  ? "Ask AI anything..." // shorter text when sticky
                  : "Ask AI anything about marketplace trends, products, or get personalized recommendations..." // full text
              }
            </span>
          </div>
          {/* status indicator - hide when sticky on mobile, smaller on desktop */}
          {!isScrolled && (
            <p
              className="text-xs lg:text-base mt-1 lg:mt-3 flex items-center lg:font-medium"
              style={{ color: COLORS.text }}
            >
              <span className="w-2 h-2 lg:w-3 lg:h-3 bg-green-400 rounded-full mr-2 lg:mr-3 animate-pulse"></span>
              AI Agent ready • Proactive mode enabled
            </p>
          )}
          {/* simplified status when sticky */}
          {isScrolled && (
            <p
              className="hidden lg:flex text-xs mt-1 items-center"
              style={{ color: COLORS.text }}
            >
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              AI ready
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIAgentSearch;
