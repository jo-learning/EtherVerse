// components/loadingPage.tsx
"use client";

import { createContext, useContext } from "react";

type LoadingContextType = {
  loading: boolean;
  setLoading: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <LoadingContext.Provider value={{ loading, setLoading: () => {} }}>
      {loading && <div className="fixed inset-0 flex items-center justify-center bg-black/50 text-white">Loading...</div>}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used inside LoadingProvider");
  return ctx;
}
