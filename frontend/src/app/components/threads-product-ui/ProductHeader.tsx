import { Heart, Share2, MoreVertical, ArrowLeft } from "lucide-react";
import { COLORS } from "@/app/theme";

// Move the shared styles directly into this file
const buttonClasses = `
  p-2 rounded-full transition-all
  hover:bg-gray-100 hover:shadow-md hover:ring-1
  active:scale-95 active:shadow-lg active:ring-1
`;

const glowStyle: React.CSSProperties = {
  color: COLORS.text,
  ["--tw-ring-color" as any]: COLORS.text, // override ring color
};

interface ProductHeaderProps {
  onBack?: () => void;
}

export const ProductHeader = ({ onBack }: ProductHeaderProps) => (
  <div
    className="sticky top-0 z-50 flex items-center justify-between p-4 shadow-sm"
    style={{ backgroundColor: COLORS.background }}
  >
    <button
      className={buttonClasses}
      style={glowStyle}
      onClick={onBack}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
    <div className="flex gap-2">
      {[Heart, Share2, MoreVertical].map((Icon, i) => (
        <button key={i} className={buttonClasses} style={glowStyle}>
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  </div>
);
