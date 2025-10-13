"use client";

import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Puzzle, ExternalLink, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

export interface NgamOverviewProps {
  /** Full/long content (used in expanded mode). If absent, uses `content`. */
  longContent?: string;
  /** Optional short summary. If absent, a 100–250 word truncation of `content` is used. */
  shortContent?: string;
  /** Original full content (fallback for long mode and truncation source for short mode). */
  content?: string;

  /** Images for long mode (fallback to `images`) */
  longImages?: string[];
  /** Images for short mode (fallback to first 1–2 of `images`) */
  shortImages?: string[];
  /** All images (fallback for both modes) */
  images?: string[];

  /** Simple list of sources (shown at the end of the content area) */
  sources?: string[];

  /** Loading state for the summary/long content generation */
  isLoading?: boolean;

  /** Called when user submits "Continue asking…" (only visible in expanded mode) */
  onAsk?: (query: string) => void;
  /** Spinner state for the Ask button (expanded mode) */
  isAsking?: boolean;

  /** Optional quick suggestions (expanded mode) */
  suggestions?: string[];
  /** Optional handler when a suggestion bubble is clicked (expanded mode) */
  onSelectSuggestion?: (query: string) => void;
}

/** Truncate plain text to ~N words. */
function truncateWords(text: string, min = 100, max = 250): string {
  const target = Math.min(Math.max(180, min), max);
  const words = text.split(/\s+/);
  if (words.length <= target) return text;
  return words.slice(0, target).join(" ") + "…";
}

export default function NgamOverview({
  longContent,
  shortContent,
  content,
  longImages,
  shortImages,
  images,
  sources,
  isLoading,
  onAsk,
  isAsking,
  suggestions,
  onSelectSuggestion,
}: NgamOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [askValue, setAskValue] = useState("");

  // Defaults for suggestion bubbles (expanded mode only)
  const bubbles = useMemo(
    () =>
      suggestions && suggestions.length > 0
        ? suggestions
        : [
            "Show me more details",
            "Is the price fair right now?",
            "Common defects to check?",
            "How to verify authenticity?",
          ],
    [suggestions]
  );

  // Determine which content/images to show based on mode
  const effectiveShortContent = useMemo(() => {
    if (shortContent && shortContent.trim()) return shortContent.trim();
    const base = (content ?? longContent ?? "").trim();
    return base ? truncateWords(base, 100, 250) : "";
  }, [shortContent, content, longContent]);

  const effectiveLongContent = useMemo(() => {
    return (longContent ?? content ?? "").trim();
  }, [longContent, content]);

  const baseImages = images ?? [];
  const effectiveShortImages =
    shortImages ?? baseImages.slice(0, Math.min(2, baseImages.length));
  const effectiveLongImages = longImages ?? baseImages;

  const displayedContent = isExpanded ? effectiveLongContent : effectiveShortContent;
  const displayedImages = isExpanded ? effectiveLongImages : effectiveShortImages;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = askValue.trim();
    if (!q) return;
    onAsk?.(q);
    setAskValue("");
  };

  const handleBubbleClick = (q: string) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(q);
    } else if (onAsk) {
      onAsk(q);
    } else {
      setAskValue(q);
    }
  };

  return (
    <div className="bg-card backdrop-blur-md rounded-2xl shadow-lg border-2 border-border overflow-hidden mb-6">
      {/* Header (clean, no separator) */}
      <div className="w-full bg-secondary-subtle px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-secondary-500">
            <Puzzle className="w-4 h-4 md:w-5 md:h-5 text-accent-700" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground">Ngam Overview</h3>
        </div>
      </div>

      {/* Collapsible content panel */}
      <div className="relative">
        <div
          className={[
            "p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 transition-[max-height] duration-300 ease-out",
            isExpanded ? "max-h-[60vh] overflow-y-auto" : "max-h-64 overflow-hidden",
          ].join(" ")}
        >
          {/* Loading state */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
              <div className="text-center space-y-1.5">
                <p className="text-lg font-medium text-foreground">Ngam is thinking...</p>
                <p className="text-sm text-muted-foreground">Generating summary</p>
              </div>
            </div>
          ) : (
            <>
              {/* Markdown content FIRST */}
              {displayedContent && (
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
                    {displayedContent}
                  </ReactMarkdown>
                </div>
              )}

              {/* Images AFTER content, BEFORE sources */}
              {displayedImages && displayedImages.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {displayedImages.map((image, index) => (
                    <img
                      key={`img-${index}`}
                      src={image}
                      alt={`Reference image ${index + 1}`}
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border border-border"
                    />
                  ))}
                </div>
              )}

              {/* Sources (always shown at end of content area if provided) */}
              {sources && sources.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Sources
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source, index) => (
                      <a
                        key={`src-${index}`}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-card text-xs text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Source {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Teaser fade when collapsed */}
        {!isExpanded && !isLoading && (
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 bottom-0 h-16"
            style={{ background: "linear-gradient(to top, var(--color-card) 60%, transparent)" }}
          />
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-4 md:px-6 lg:px-8 pb-4 md:pb-6">
        {/* Expand/Collapse */}
        <div className="flex justify-center mb-3">
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border border-border bg-card hover:bg-secondary/60"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ask more & expand
              </>
            )}
          </button>
        </div>

        {/* Continue asking (ONLY in expanded mode) */}
        {isExpanded && (
          <>
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={askValue}
                onChange={(e) => setAskValue(e.target.value)}
                placeholder="Continue asking…"
                className="flex-1 px-3 py-2 rounded-xl bg-card text-foreground border border-border placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                disabled={!!isAsking}
              />
              <button
                type="submit"
                disabled={!!isAsking || !askValue.trim()}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border border-border bg-card hover:bg-secondary/60 disabled:opacity-60"
                aria-label="Ask follow-up"
              >
                <Sparkles className="w-4 h-4" />
                {isAsking ? "Asking…" : "Ask"}
              </button>
            </form>

            {/* Suggestion bubbles */}
            <div className="flex flex-wrap gap-2 mt-2">
              {bubbles.map((s, i) => (
                <button
                  key={`${s}-${i}`}
                  type="button"
                  onClick={() => handleBubbleClick(s)}
                  className="px-3 py-1 rounded-full border border-border bg-card text-foreground text-xs md:text-sm hover:bg-secondary/60"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Tiny disclaimer (always visible) */}
        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          AI-generated content may contain inaccuracies.
        </p>
      </div>
    </div>
  );
}