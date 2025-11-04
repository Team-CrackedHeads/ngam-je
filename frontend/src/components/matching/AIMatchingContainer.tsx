"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { AIMatchingProps } from "./types";
import { AIMatchingSwipe } from "./mobile/AIMatchingSwipe";
import { AIMatchingKanban } from "./desktop/AIMatchingKanban";
import { CompareProvider } from "./contexts/CompareContext";

export function AIMatchingContainer(props: AIMatchingProps) {
  const isMobile = useIsMobile();

  return (
    <CompareProvider>
      {isMobile ? (
        <AIMatchingSwipe {...props} />
      ) : (
        <AIMatchingKanban {...props} />
      )}
    </CompareProvider>
  );
}
