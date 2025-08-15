import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Trade = {
  id: number;
  pair: string;
  date: string;
  purchaseAmount: number;
  direction: "Buy short" | "Buy long";
  purchasePrice: number;
  contract: number;
  profit: number;
  deliveryPrice: number;
  deliveryTime: string;
  status: "wait" | "finished";
};

type TradeStore = {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
};

export const useTradeStore = create<TradeStore>()(
  persist(
    (set) => ({
      trades: [],
      addTrade: (trade) =>
        set((state) => ({
          trades: [...state.trades, trade],
        })),
    }),
    {
      name: "trade-storage", // localStorage key
    }
  )
);
