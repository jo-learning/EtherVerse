"use client";
import CoinWalletClient from './CoinWalletClient';
import { useParams } from "next/navigation";

export default async function CoinWalletPage() {
  const { coin } = useParams<{ coin: string }>();
  // Awaiting params is a safe pattern
  // const awaitedParams = await Promise.resolve(params);
  // const coin = awaitedParams.coin;

  return <CoinWalletClient coin={coin} />;
}
