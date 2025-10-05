"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Puzzle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface NgamOverviewProps {
  content?: string;
  sources?: string[];
  images?: string[];
  isLoading?: boolean;
}

function NgamOverview({ content, sources, images, isLoading }: NgamOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden mb-6">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-gray-200 hover:from-gray-100 hover:to-gray-150 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#F1D688" }}
            >
              <Puzzle className="w-4 h-4 md:w-5 md:h-5 text-[#333353]" />
            </div>
            <h3 className="text-lg md:text-xl font-bold" style={{ color: "#333353" }}>
              Ngam Overview
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 hidden sm:block">
              {isExpanded ? "Collapse" : "Expand"}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </button>

      {/* Content - Collapsible */}
      {isExpanded && (
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 animate-in slide-in-from-top duration-200">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-800">
                  Ngam is thinking...
                </p>
                <p className="text-sm text-gray-600">
                  Generating comprehensive summary
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Images */}
              {images && images.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Reference image ${index + 1}`}
                      className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}

              {/* Markdown Content */}
              {content && (
                <div className="prose prose-gray max-w-none">
                  <ReactMarkdown
                    components={{
                      // Style headings
                      h1: ({ children }) => (
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base md:text-lg font-medium text-gray-800 mb-2">
                          {children}
                        </h3>
                      ),
                      // Style paragraphs
                      p: ({ children }) => (
                        <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-4">
                          {children}
                        </p>
                      ),
                      // Style lists
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm md:text-base leading-relaxed">
                          {children}
                        </li>
                      ),
                      // Style code blocks
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                          {children}
                        </pre>
                      ),
                      // Style blockquotes
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 mb-4">
                          {children}
                        </blockquote>
                      ),
                      // Style links
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
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

              {/* Sources */}
              {sources && sources.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Sources
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((source, index) => (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full text-xs text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Source {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="bg-gray-50 px-4 md:px-6 lg:px-8 py-3 md:py-4 border-t border-gray-200 -mx-4 md:-mx-6 lg:-mx-8 -mb-4 md:-mb-6 lg:-mb-8 mt-6">
                <p className="text-xs md:text-sm text-gray-500 text-center">
                  AI-generated content may contain inaccuracies. Always verify information independently.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default NgamOverview;