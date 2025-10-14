"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CompareContextType {
  selectedForCompare: string[];
  setSelectedForCompare: React.Dispatch<React.SetStateAction<string[]>>;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

interface CompareProviderProps {
  children: ReactNode;
}

export function CompareProvider({ children }: CompareProviderProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  return (
    <CompareContext.Provider
      value={{
        selectedForCompare,
        setSelectedForCompare,
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
