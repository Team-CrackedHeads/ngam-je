"use client";

import React from "react";
import { CheckCircle2, Circle, ClipboardList } from "lucide-react";

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
  return (
    <div className="max-w-xs">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-bold text-black text-base">{title}</h3>
      </div>

      {/* Todo Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2"
          >
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
            <span
              className={`text-sm text-[var(--color-secondary-500)] ${
                item.completed ? "line-through" : ""
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
