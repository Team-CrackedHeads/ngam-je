"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CompareContextType {
  selectedForCompare: string[];
  setSelectedForCompare: React.Dispatch<React.SetStateAction<string[]>>;
  compareMode: boolean;
  toggleCompareMode: () => void;
  isSelected: (id: string) => boolean;
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

interface CompareProviderProps {
  children: ReactNode;
}

export function CompareProvider({ children }: CompareProviderProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  const toggleCompareMode = () => setCompareMode(prev => !prev);
  const isSelected = (id: string) => selectedForCompare.includes(id);
  const addToCompare = (id: string) => {
    if (!selectedForCompare.includes(id)) {
      setSelectedForCompare(prev => [...prev, id]);
    }
  };
  const removeFromCompare = (id: string) => {
    setSelectedForCompare(prev => prev.filter(listingId => listingId !== id));
  };

  return (
    <CompareContext.Provider
      value={{
        selectedForCompare,
        setSelectedForCompare,
        compareMode,
        toggleCompareMode,
        isSelected,
        addToCompare,
        removeFromCompare,
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
