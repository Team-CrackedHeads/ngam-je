import { Suspense } from "react";
import ChatHistoryDisplay from "@/components/sidebar/ChatHistoryPage";

export default function ChatHistoryPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="text-accent-700">Loading...</div></div>}>
        <ChatHistoryDisplay />
      </Suspense>
    </div>
  );
}
