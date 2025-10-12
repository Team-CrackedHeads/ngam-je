"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { AIMatchingProps } from "./types";
import { AIMatchingSwipe } from "./mobile/AIMatchingSwipe";
import { AIMatchingKanban } from "./desktop/AIMatchingKanban";

export function AIMatchingContainer(props: AIMatchingProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <AIMatchingSwipe {...props} />
      ) : (
        <AIMatchingKanban {...props} />
      )}
    </>
  );
}
