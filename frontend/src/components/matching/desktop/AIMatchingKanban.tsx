"use client";

import { useState } from "react";
import { Heart, Ban, Sparkles, Layers, X, Undo2 } from "lucide-react";
import { AIMatchingProps, ColumnType } from "../types";

interface ColumnData {
  id: ColumnType;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const columns: ColumnData[] = [
  {
    id: "passed",
    title: "Passed",
    icon: <Ban size={18} />,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "queue",
    title: "For You",
    icon: <Sparkles size={18} />,
    color: "text-secondary-600",
    bgColor: "bg-secondary-100",
  },
  {
    id: "liked",
    title: "Liked",
    icon: <Heart size={18} />,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

export function AIMatchingKanban({
  userMode,
  userListings,
  availableListings,
  onMatch,
  onMessage,
  onViewDetails,
  onClose,
}: AIMatchingProps) {
  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-200">
        <span className="text-sm font-medium text-accent-600">
          3 new matches
        </span>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full grid grid-cols-3 gap-4">
          {columns.map((column) => {
            return (
              <div
                key={column.id}
                className="flex flex-col rounded-xl border-2 border-neutral-200 overflow-hidden"
              >
                {/* Column Header */}
                <div className="p-4 bg-white border-b border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={column.color}>{column.icon}</div>
                      <h3 className="font-semibold text-accent-700">
                        {column.title}
                      </h3>
                    </div>
                    <span className="text-sm font-medium text-accent-500">
                      0
                    </span>
                  </div>
                </div>

                {/* Column Content - Container for stacked cards */}
                <div className={`flex-1 p-4 ${column.bgColor}`}>
                  <div className="relative w-full h-[420px]">
                    {/* Empty state */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center text-center text-accent-400">
                        <div className={`mb-3 ${column.color}`}>
                          <Layers size={48} />
                        </div>
                        <p className="text-sm">
                          {column.id === "queue" && "No more matches"}
                          {column.id === "liked" && "No liked matches yet"}
                          {column.id === "passed" && "No passed matches yet"}
                        </p>
                      </div>
                    </div>

                    {/* Stacked cards - max 3 visible */}
                    {[1, 2, 3].map((index) => {
                      // Mock match scores for demo
                      const matchScores = [85, 60, 30];
                      const matchScore = matchScores[index - 1];

                      // Traffic light system
                      const getMatchColor = (score: number) => {
                        if (score >= 75) return { bg: 'from-green-100 to-green-200', text: 'text-green-700', border: 'border-green-300' };
                        if (score >= 50) return { bg: 'from-secondary-100 to-secondary-200', text: 'text-secondary-700', border: 'border-secondary-300' };
                        return { bg: 'from-red-100 to-red-200', text: 'text-red-700', border: 'border-red-300' };
                      };

                      const colors = getMatchColor(matchScore);

                      return (
                        <div
                          key={index}
                          className="absolute top-0 left-0 right-0 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                          style={{
                            transform: `translateY(${(index - 1) * 12}px) scale(${1 - (index - 1) * 0.04}) rotateZ(${(index - 1) * 1}deg)`,
                            zIndex: 10 - index,
                          }}
                        >
                          <div className="bg-white rounded-xl shadow-xl border border-neutral-300 overflow-hidden">
                            {/* Card Image */}
                            <div className="relative w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                              <span className="text-accent-400 text-sm">Image</span>
                              {/* Match Score Badge - only show on top card */}
                              {index === 1 && (
                                <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r ${colors.bg} ${colors.text} border ${colors.border} shadow-md`}>
                                  <Sparkles size={12} />
                                  <span className="text-xs font-bold">{matchScore}%</span>
                                </div>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="p-4">
                              <h3 className="font-bold text-base text-accent-700 mb-2 line-clamp-2">
                                MacBook Pro M3 16-inch - Excellent Condition
                              </h3>
                              <div className="text-xl font-bold text-secondary-600 mb-3">
                                RM 8,500
                              </div>
                              <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-200 text-accent-600 font-medium mb-3">
                                Electronics
                              </span>
                              <p className="text-xs text-accent-500 line-clamp-2">
                                Need for video editing work. Willing to pay good price for excellent condition.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Floating Action Buttons */}
                    {column.id === "queue" && (
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Pass');
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-red-300 hover:bg-red-50 transition-colors shadow-lg"
                        >
                          <X size={18} className="text-red-500" />
                          <span className="text-sm font-medium text-red-600">Pass</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Like');
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-green-300 hover:bg-green-50 transition-colors shadow-lg"
                        >
                          <Heart size={18} className="text-green-500" />
                          <span className="text-sm font-medium text-green-600">Like</span>
                        </button>
                      </div>
                    )}

                    {/* Undo Button - for Liked and Passed columns */}
                    {(column.id === "liked" || column.id === "passed") && (
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Undo');
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-accent-300 hover:bg-primary-50 transition-colors shadow-lg"
                        >
                          <Undo2 size={18} className="text-accent-600" />
                          <span className="text-sm font-medium text-accent-700">Undo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
