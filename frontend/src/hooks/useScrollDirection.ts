"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type ScrollDirection = "up" | "down";

// Find the actual scrolling element by checking which one has scrollable content
function findScrollContainer(): HTMLElement | null {
  const candidates = [
    document.querySelector('[class*="overflow-y-scroll"]'),
    document.querySelector('main'),
    document.querySelector('[class*="overflow-auto"]'),
    document.documentElement,
    document.body
  ];

  for (const element of candidates) {
    if (!element) continue;
    const el = element as HTMLElement;
    // Check if element has scrollable height
    if (el.scrollHeight > el.clientHeight) {
      console.log('✅ Found scroll container:', el.tagName, el.className);
      return el;
    }
  }

  console.warn('⚠️ No scroll container found, defaulting to main');
  return document.querySelector('main') as HTMLElement;
}

export function useScrollDirection(threshold: number = 10) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("up");
  const pathname = usePathname();

  useEffect(() => {
    console.log('🔄 Route changed to:', pathname, '- Re-detecting scroll container...');

    let scrollContainer: HTMLElement | null = null;
    let onScroll: (() => void) | null = null;

    // Small delay to ensure new page DOM is ready
    const timeoutId = setTimeout(() => {
      scrollContainer = findScrollContainer();

      if (!scrollContainer) {
        console.error('No scroll container found!');
        return;
      }

      let lastScrollY = scrollContainer.scrollTop;
      let ticking = false;

      const updateScrollDirection = () => {
        if (!scrollContainer) return;
        const scrollY = scrollContainer.scrollTop;
        const diff = Math.abs(scrollY - lastScrollY);

        if (diff < threshold) {
          ticking = false;
          return;
        }

        const newDirection = scrollY > lastScrollY ? "down" : "up";
        console.log('📍 Scroll direction:', newDirection, { scrollY, lastScrollY });
        setScrollDirection(newDirection);
        lastScrollY = scrollY > 0 ? scrollY : 0;
        ticking = false;
      };

      onScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(updateScrollDirection);
          ticking = true;
        }
      };

      console.log('Adding scroll listener to:', scrollContainer.tagName);
      scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    }, 100); // 100ms delay to ensure DOM is ready

    return () => {
      clearTimeout(timeoutId);
      if (scrollContainer && onScroll) {
        scrollContainer.removeEventListener("scroll", onScroll);
      }
    };
  }, [threshold, pathname]);

  return scrollDirection;
}
