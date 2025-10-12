"use client";

import { useState } from "react";
import { Heart, Ban, Sparkles, Layers } from "lucide-react";
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
                  <div className="relative w-full h-[420px] flex items-center justify-center">
                    {/* Cards will go here */}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
