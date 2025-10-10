"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Puzzle } from "lucide-react";

export interface AISummaryProps {
  /** Original full content (fallback for long mode and truncation source for short mode). */
  content?: string;
  /** Loading state for the summary/long content generation */
  isLoading?: boolean;
}

export default function AISummary({ content, isLoading }: AISummaryProps) {
  return (
    <div className="bg-card backdrop-blur-md rounded-2xl shadow-lg border-2 border-border overflow-hidden mb-6">
      {/* Header (clean, no separator) */}
      <div className="w-full bg-secondary-subtle px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-secondary-500">
            <Puzzle className="w-4 h-4 md:w-5 md:h-5 text-accent-700" />
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground">
            AI Summary
          </h3>
        </div>
      </div>

      {/* Collapsible content panel */}
      <div className="relative">
        <div
          className={[
            "p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 transition-[max-height] duration-300 ease-out",
            "max-h-[60vh] overflow-y-auto",
          ].join(" ")}
        >
          {/* Loading state */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
              <div className="text-center space-y-1.5">
                <p className="text-lg font-medium text-foreground">
                  Ngam is thinking...
                </p>
                <p className="text-sm text-muted-foreground">
                  Generating summary
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Markdown content FIRST */}
              {content && (
                <div className="max-w-none text-foreground text-base leading-relaxed font-sans whitespace-pre-wrap break-words">
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
                        <li className="text-sm md:text-base leading-relaxed">
                          {children}
                        </li>
                      ),
                      code: ({ children }) => (
                        <span className="font-sans bg-transparent">
                          {children}
                        </span>
                      ),
                      pre: ({ children }) => (
                        <div className="font-sans whitespace-pre-wrap break-words">
                          {children}
                        </div>
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
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-4 md:px-6 lg:px-8 pb-4 md:pb-6">
        {/* Tiny disclaimer (always visible) */}
        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          AI-generated content may contain inaccuracies.
        </p>
      </div>
    </div>
  );
}
