"use client";

import React, { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Puzzle, Send, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export interface AISummaryProps {
  /** Original full content (fallback for long mode and truncation source for short mode). */
  content?: string | null; // Can be null if not yet generated or failed
  /** Loading state for the summary/long content generation */
  isLoading: boolean; // True when fetching/generating
  error?: string | null; // Error message if generation failed
  onGenerateSummary: () => void; // Callback to trigger summary generation from parent
}

/** Truncate plain text to ~N words. */
function truncateWords(text: string, min = 100, max = 250): string {
  const target = Math.min(Math.max(180, min), max);
  const words = text.split(/\s+/);
  if (words.length <= target) return text;
  return words.slice(0, target).join(" ") + "…";
}

export default function AISummary({
  content,
  isLoading,
  error,
  onGenerateSummary, // Destructure the new prop
}: AISummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if the summary content area should be visible.
  // It's visible if content exists, or if we are currently loading, or if there was an error.
  // It's NOT visible only if no content, not loading, and no error (meaning the "Generate" button should be shown).
  const showContentArea = content || isLoading || error;

  const shortContent = useMemo(() => {
    return content ? truncateWords(content, 100, 250) : "";
  }, [content]);

  const handleSendQuestion = () => {
    if (question.trim()) {
      // TODO: Implement the logic to send the question to AI (for AI FAQ Correspondent)
      console.log("Question sent:", question);
      setQuestion("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const handleExpandToggle = () => {
    setIsExpanded((prev) => {
      if (prev && containerRef.current) {
        // scroll top on collapse
        containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return !prev;
    });
  };

  return (
    <div
      ref={containerRef}
      className="bg-card backdrop-blur-md rounded-2xl shadow-lg border-2 border-border overflow-hidden mb-6"
    >
      {/* Header */}
      <div className="w-full bg-secondary-subtle px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-secondary-500">
            <Puzzle className="w-4 h-4 md:w-5 md:h-5 text-accent-700" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground">AI Summary</h3>
        </div>
      </div>

      {/* Initial state: Generate button (shown only when no content, not loading, and no error) */}
      {!showContentArea && (
        <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <button
            onClick={onGenerateSummary} // Use the prop callback
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary-500 text-white hover:bg-secondary-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Sparkles className="w-5 h-5" />
            Generate AI Summary
          </button>
        </div>
      )}

      {/* Loading state (shown whenever isLoading is true) */}
      {isLoading && (
        <div className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center py-8 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
          <div className="text-center space-y-1.5">
            <p className="text-lg font-medium text-foreground">Ngam is thinking...</p>
            <p className="text-sm text-muted-foreground">Generating summary</p>
          </div>
        </div>
      )}

      {/* Error state (shown when error is present and not loading) */}
      {error && !isLoading && (
        <div className="p-4 md:p-6 lg:p-8 text-red-600 bg-red-50 border border-red-200 rounded-b-lg">
          <p className="font-medium">Error generating AI summary:</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Please try again or contact support if the issue persists.</p>
        </div>
      )}

      {/* After content is available (or was available and now error/loading is gone) */}
      {showContentArea && !isLoading && !error && (
        <>
          <div className="relative">
            <div
              className={[
                "p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 transition-[max-height] duration-300 ease-out",
                isExpanded ? "max-h-[60vh] overflow-y-auto" : "max-h-64 overflow-hidden",
              ].join(" ")}
            >
              {content ? (
                <div className="prose prose-invert:dark max-w-none text-foreground">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base md:text-lg font-medium text-foreground mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-foreground/90 text-base md:text-lg leading-relaxed mb-4">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground/90">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm md:text-base leading-relaxed">{children}</li>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-foreground">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-secondary-500 pl-4 italic text-foreground/80 mb-4">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary-700 underline hover:opacity-80"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {isExpanded ? content : shortContent}
                  </ReactMarkdown>
                </div>
              ) : (
                // If there's no content yet (e.g., after an error, or if the AI returned nothing)
                <div className="text-center text-muted-foreground">
                  <p>No summary available. Click “Generate AI Summary” to create one.</p>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              AI-generated content may contain inaccuracies.
            </p>
          </div>
        </>
      )}
    </div>
  );
}