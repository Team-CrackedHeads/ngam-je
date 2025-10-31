"use client";

import React, { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { ChevronUp, ChevronDown } from "lucide-react";

interface MatchCardCarouselProps {
  children: React.ReactNode[];
  height?: string;
}

export function MatchCardCarousel({ children, height = "500px" }: MatchCardCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      orientation="vertical"
      setApi={setCarouselApi}
      className="w-full"
    >
      <CarouselContent className="-mt-1" style={{ height }}>
        {children.map((child, index) => (
          <CarouselItem key={index} className="pt-1">
            <div className="w-full h-full">
              {child}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Carousel Navigation Buttons */}
      {children.length > 1 && (
        <>
          <button
            onClick={() => carouselApi?.scrollPrev()}
            disabled={!carouselApi?.canScrollPrev()}
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-white border-2 border-neutral-300 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <ChevronUp size={20} className="text-accent-600" />
          </button>
          <button
            onClick={() => carouselApi?.scrollNext()}
            disabled={!carouselApi?.canScrollNext()}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 p-2 rounded-full bg-white border-2 border-neutral-300 hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <ChevronDown size={20} className="text-accent-600" />
          </button>
        </>
      )}
    </Carousel>
  );
}
