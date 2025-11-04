"use client";

import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // removes empty strings

  return (
    <Breadcrumb className="hidden md:block">
      <BreadcrumbList className="flex items-center space-x-1 py-3">
        {/*  Always show Home --- */}
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <Home className="w-4 h-4" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.length > 0 && <BreadcrumbSeparator />}

        {/* Generate rest of breadcrumb dynamically */}
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;

          // capitalize first letter
          const label =
            segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

          return (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <span className="text-foreground font-semibold">{label}</span>
                ) : (
                  <BreadcrumbLink href={href} className="hover:text-foreground">
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
