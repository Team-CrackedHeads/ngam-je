import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductInfo {
  image: string;
  title: string;
  price: string;
}

interface MessageBubbleProps {
  sender: "me" | "them";
  content: string;
  timestamp: string;
  isCurrentUser?: boolean;
  product?: ProductInfo;
}

export function MessageBubble({
  sender,
  content,
  timestamp,
  isCurrentUser = false,
  product,
}: MessageBubbleProps) {
  if (product) {
    return (
      <div className="flex justify-start">
        <div className="bg-muted rounded-2xl p-3 max-w-[75%]">
          <div className="relative h-32 w-full rounded-lg overflow-hidden mb-2">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="font-semibold">{product.title}</div>
          <div className="text-sm text-muted-foreground">{product.price}</div>
          <div className="text-xs text-muted-foreground mt-1">{timestamp}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex", isCurrentUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] px-4 py-2 rounded-2xl text-sm",
          isCurrentUser
            ? "bg-secondary-600 text-primary-foreground rounded-br-none"
            : "bg-muted text-foreground rounded-bl-none"
        )}
      >
        <div>{content}</div>
        <div
          className={cn(
            "text-xs mt-1",
            isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
}
