"use client";

import React, { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Puzzle, Send, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export interface AISummaryProps {
  /** Original full content (fallback for long mode and truncation source for short mode). */
  content?: string;
  /** Loading state for the summary/long content generation */
  isLoading?: boolean;
}

/** Truncate plain text to ~N words. */
function truncateWords(text: string, min = 100, max = 250): string {
  const target = Math.min(Math.max(180, min), max);
  const words = text.split(/\s+/);
  if (words.length <= target) return text;
  return words.slice(0, target).join(" ") + "…";
}

export default function AISummary({ content, isLoading }: AISummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  // IMPORTANT: start false so the initial UI shows the Generate button
  const [hasGenerated, setHasGenerated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shortContent = useMemo(() => {
    return content ? truncateWords(content, 100, 250) : "";
  }, [content]);

  const handleSendQuestion = () => {
    if (question.trim()) {
      // TODO: Implement the logic to send the question to AI
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

  const handleGenerateAI = () => {
    // mark that user asked to generate — parent can start isLoading and then supply `content`
    setHasGenerated(true);
    console.log("Generate AI Summary triggered");
    // TODO: trigger parent's generation action (via prop callback) if needed
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

      {/* Initial state: Generate button (shown only when not generated and not loading) */}
      {!hasGenerated && !isLoading && (
        <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <button
            onClick={handleGenerateAI}
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

      {/* After user clicked Generate (hasGenerated) and not loading -> show collapsible content area */}
      {hasGenerated && !isLoading && (
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
                // If there's no content yet (parent might generate later), show a small placeholder
                <div className="text-center text-muted-foreground">
                  <p>No summary available yet. Click “Generate AI Summary” to create one.</p>
                </div>
              )}
            </div>

            {/* Teaser fade when collapsed */}
            {!isExpanded && content && (
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 bottom-0 h-16"
                style={{ background: "linear-gradient(to top, var(--color-card) 60%, transparent)" }}
              />
            )}
          </div>

          {/* Ask AI (only expanded) */}
          {isExpanded && (
            <div className="px-4 my-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask AI about this product..."
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleSendQuestion}
                  disabled={!question.trim()}
                  className="p-2.5 rounded-lg bg-secondary-500 text-white hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Send question"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom controls */}
          <div className="px-4 md:px-6 lg:px-8 pb-4 md:pb-6">
            {/* Expand/Collapse */}
            <div className="flex justify-center mb-3">
              <button
                onClick={handleExpandToggle}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border border-border bg-card hover:bg-secondary/60"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show More
                  </>
                )}
              </button>
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
