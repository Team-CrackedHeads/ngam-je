import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductInfo {
  image: string;
  title: string;
  price: string;
}

interface ConversationItemProps {
  id: string;
  name: string;
  message: string;
  time: string;
  status: "online" | "offline" | "always";
  unread: number;
  product?: ProductInfo;
  isActive?: boolean;
  onClick: () => void;
}

export function ConversationItem({
  name,
  message,
  time,
  status,
  unread,
  product,
  isActive = false,
  onClick,
}: ConversationItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 hover:bg-muted transition-colors cursor-pointer border-b border-border last:border-b-0",
        isActive && "bg-muted"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="relative flex-shrink-0">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {name[0]}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-card",
            status === "online"
              ? "bg-success-500"
              : status === "always"
              ? "bg-secondary-600"
              : "bg-neutral-400"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <p className="font-semibold truncate">{name}</p>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {time}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{message}</p>

        {product && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-card p-2">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.title}</p>
              <p className="text-xs text-muted-foreground font-semibold">
                {product.price}
              </p>
            </div>
          </div>
        )}
      </div>

      {unread > 0 && (
        <Badge className="ml-2 flex-shrink-0 bg-secondary-500 text-neutral-white hover:bg-secondary-500">
          {unread}
        </Badge>
      )}
    </div>
  );
}
