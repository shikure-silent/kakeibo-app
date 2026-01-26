"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { SavingSupportCard } from "../../lib/savingSupport";

type SupportBellContextValue = {
  cards: SavingSupportCard[];
  setCards: (cards: SavingSupportCard[]) => void;
};

const SupportBellContext = createContext<SupportBellContextValue | null>(null);

export function SupportBellProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<SavingSupportCard[]>([]);
  const value = useMemo(() => ({ cards, setCards }), [cards]);

  return (
    <SupportBellContext.Provider value={value}>
      {children}
    </SupportBellContext.Provider>
  );
}

export function useSupportBell() {
  const ctx = useContext(SupportBellContext);
  if (!ctx) {
    throw new Error("useSupportBell must be used within SupportBellProvider");
  }
  return ctx;
}
