import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Trade = {
  id: number; // I’d recommend making this a timestamp instead of number if it’s a Date
  pair: string;
  date: string;
  purchaseAmount: number;
  direction: "Buy short" | "Buy long";
  purchasePrice: number;
  contract: number;
  accountType: string;
  profit: number;
  deliveryPrice: number;
  deliveryTime: number; // ⬅️ make this a number (seconds or ms), easier to compare
  status: "wait" | "finished";
};

type TradeStore = {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  updateTrade: (id: number, updates: Partial<Trade>) => void;
};

export const useTradeStore = create<TradeStore>()(
  persist(
    (set) => ({
      trades: [],
      addTrade: (trade) =>
        set((state) => ({
          trades: [...state.trades, trade],
        })),
      updateTrade: (id, updates) =>
        set((state) => ({
          trades: state.trades.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
    }),
    {
      name: "trade-storage", // localStorage key
    }
  )
);
