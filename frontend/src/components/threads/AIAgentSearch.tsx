"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Sparkles } from "lucide-react";
import { mockAIResponses, MockAIResponse } from "@/utils/mock-ai-data";

type AIAgentSearchProps = {
  onOpenAI: () => void;
  onSearchStart?: () => void;
  onSearchComplete?: (response: MockAIResponse) => void;
  overviewSectionId?: string; // default "ngam-overview"
};

export default function AIAgentSearch({
  onOpenAI,
  onSearchStart,
  onSearchComplete,
  overviewSectionId = "ngam-overview",
}: AIAgentSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    onSearchStart?.();

    setTimeout(() => {
      let selected = mockAIResponses[0];
      const q = prompt.toLowerCase();

      if (/(price|cost|value|pay|market|chicago)/.test(q)) selected = mockAIResponses[1];
      else if (/(invest|profit|money|roi|worth)/.test(q)) selected = mockAIResponses[2];
      else if (/(where|buy|shop|store|malaysia)/.test(q)) selected = mockAIResponses[3];
      else if (/(authentic|verify|real|fake|check|legit)/.test(q)) selected = mockAIResponses[0];

      const responseData: MockAIResponse = {
        prompt,
        content: selected.content,
        images: selected.images,
        sources: selected.sources,
      };

      setIsLoading(false);
      onSearchComplete?.(responseData);

      const target = document.getElementById(overviewSectionId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });

      if (inputRef.current) inputRef.current.value = "";
    }, 800);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch((e.target as HTMLInputElement).value);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start bg-primary-subtle pt-16 md:pt-20 pb-10 overflow-hidden">
      <div
        className={`relative z-10 flex flex-col items-center justify-start text-center px-4 md:px-8 w-full max-w-4xl space-y-6 transform transition-all duration-1000 ease-out ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Illustration - image overlay */}
        <div className="flex justify-center">
          <Image
            src="/images/ai-image.png"
            alt="Marketplace illustration"
            width={192}
            height={192}
            className="w-32 md:w-40 lg:w-48 h-auto object-contain transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-900">
            Ask <span className="text-secondary-500">Ngam</span> Anything!
          </h1>
          {!isLoading && (
            <p className="text-base md:text-lg text-foreground/70 font-medium">
              Your trusted secondhand helper
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div
          className={`bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-border p-3 md:p-4 flex items-center space-x-3 md:space-x-4 hover:shadow-xl transition-all duration-500 w-full max-w-3xl mx-auto ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Add Button */}
          <div className="flex-shrink-0">
            <button
              type="button"
              className="w-10 h-10 md:w-12 md:h-12 bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-200 rounded-xl flex items-center justify-center transition-colors duration-200"
              onClick={onOpenAI}
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-accent-600" />
            </button>
          </div>

          {/* Input */}
          <div className="flex-grow min-w-0">
            <input
              ref={inputRef}
              type="text"
              placeholder="How do I verify if sneakers are authentic..."
              className="w-full text-sm md:text-base lg:text-lg text-foreground placeholder-muted-foreground bg-transparent border-none outline-none focus:ring-0"
              onKeyDown={onKeyDown}
              disabled={isLoading}
            />
          </div>

          {/* Search Button */}
          <div className="flex-shrink-0">
            <button
              type="button"
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors duration-200 bg-secondary-400 hover:bg-secondary-300"
              onClick={() => inputRef.current && handleSearch(inputRef.current.value)}
              disabled={isLoading}
            >
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-accent-700" />
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div
          className={`flex justify-center flex-wrap gap-3 md:gap-4 mt-4 transition-all duration-1000 ${
            fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {["Buy", "Browse", "Sell"].map((label) => (
            <button
              key={label}
              className="px-5 py-2 md:px-8 md:py-3 bg-card rounded-full text-sm md:text-base text-accent-700 font-semibold shadow-xl hover:bg-secondary-500 hover:text-accent-700 hover:scale-105 active:scale-95 transition-all duration-200 border border-border"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
