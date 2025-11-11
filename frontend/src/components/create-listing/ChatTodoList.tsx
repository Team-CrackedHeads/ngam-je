"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, ClipboardList } from "lucide-react";

export interface TodoItem {
  id: string;
  label: string;
  completed: boolean;
}

interface ChatTodoListProps {
  items: TodoItem[];
  title?: string;
}

export default function ChatTodoList({ items, title = "Product Details Checklist" }: ChatTodoListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="my-3 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[var(--color-secondary-500)] to-[var(--color-secondary-600)] hover:from-[var(--color-secondary-600)] hover:to-[var(--color-secondary-700)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-black" />
          <span className="font-semibold text-black text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-black">
            {completedCount}/{totalCount} completed
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-black" />
          ) : (
            <ChevronDown className="w-4 h-4 text-black" />
          )}
        </div>
      </button>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Todo Items */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-2 rounded transition-colors ${
                item.completed ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${
                  item.completed
                    ? "text-gray-700 line-through"
                    : "text-gray-900 font-medium"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
