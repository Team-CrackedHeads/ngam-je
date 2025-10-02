// src/app/components/threads-product-ui/ActionButtons.tsx
import { MessageCircle, HelpCircle, ShoppingCart } from "lucide-react";
import { COLORS } from "@/app/theme";
// Import shared styles from the ProductDetails file
import { wideButtonClasses, glowStyle } from "./ProductDetails";

interface ActionButtonsProps {
  onChat?: () => void;
  onFAQ?: () => void;
  onBuyNow?: () => void;
}

export const ActionButtons = ({
  onChat,
  onFAQ,
  onBuyNow,
}: ActionButtonsProps) => (
  <div className="flex flex-col sm:flex-row gap-3 mt-6">
    <button
      className={wideButtonClasses + " outline-solid outline-1"}
      style={{ ...glowStyle, borderColor: COLORS.hoverBg }}
      onClick={onChat}
    >
      <MessageCircle className="w-5 h-5" style={{ color: COLORS.text }} />
      <span>Chat</span>
    </button>
    <button
      className={wideButtonClasses + " outline-solid outline-1"}
      style={{ ...glowStyle, borderColor: COLORS.hoverBg }}
      onClick={onFAQ}
    >
      <HelpCircle className="w-5 h-5" style={{ color: COLORS.text }} />
      <span>FAQ</span>
    </button>
    <button
      className={
        wideButtonClasses + " font-semibold shadow-md outline-solid outline-1"
      }
      style={{
        background: `linear-gradient(to right, ${COLORS.accentFrom}, ${COLORS.accentTo})`,
        color: COLORS.textActive,
        ["--tw-ring-color" as any]: COLORS.text,
      }}
      onClick={onBuyNow}
    >
      <ShoppingCart className="w-5 h-5" />
      <span>Buy Now</span>
    </button>
  </div>
);
