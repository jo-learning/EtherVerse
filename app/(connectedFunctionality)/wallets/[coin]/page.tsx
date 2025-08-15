import CoinWalletClient from './CoinWalletClient';

interface Props {
  params: { coin: string };
}

export default async function CoinWalletPage({ params }: Props) {
  // Awaiting params is a safe pattern
  const awaitedParams = await Promise.resolve(params);
  const coin = awaitedParams.coin;

  return <CoinWalletClient coin={coin} />;
}
