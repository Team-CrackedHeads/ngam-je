"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CompareContextType {
  compareMode: boolean;
  setCompareMode: (mode: boolean) => void;
  selectedForCompare: string[];
  setSelectedForCompare: React.Dispatch<React.SetStateAction<string[]>>;
  toggleCompareMode: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

interface CompareProviderProps {
  children: ReactNode;
}

export function CompareProvider({ children }: CompareProviderProps) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleCompareMode = () => {
    const newMode = !compareMode;
    setCompareMode(newMode);
    if (!newMode) {
      setSelectedForCompare([]);
    }
  };

  return (
    <CompareContext.Provider
      value={{
        compareMode,
        setCompareMode,
        selectedForCompare,
        setSelectedForCompare,
        toggleCompareMode,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
