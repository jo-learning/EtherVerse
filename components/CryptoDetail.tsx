import { Coin } from "@/types";

function formatUsd(n: number) {
  return n < 1 ? `$${n.toFixed(5)}` : n < 1000 ? `$${n.toFixed(2)}` : `$${n.toLocaleString()}`;
}

export default function CryptoDetail({ coin }: { coin: Coin }) {
  const up = coin.change24hPct >= 0;
  return (
    <section className="container-safe pt-6 pb-12">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Wallet / balance card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90">Available</div>
            <div className="text-sm opacity-90">Frozen: 0.00000000</div>
          </div>
          <div className="mt-3 text-3xl font-bold">US$ {formatUsd(coin.priceUsd * 3.24).replace("$", "")}</div>
          <div className="mt-1 text-sm opacity-90">3.24000000 {coin.symbol}</div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 rounded-xl shadow hover:shadow-lg transition-all">Receive</button>
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 rounded-xl shadow hover:shadow-lg transition-all">Send</button>
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 rounded-xl shadow hover:shadow-lg transition-all">Convert</button>
          </div>
          <div className="mt-6 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow p-4 text-gray-800 dark:text-gray-200">
            <div className="text-sm font-medium mb-2">Deposit funds</div>
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1 rounded-xl text-xs mb-3">ERC20</div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl grid place-items-center text-4xl text-purple-600 dark:text-purple-400">&#9634;</div>
              <div className="text-sm truncate">0xAC7f193bDD0E...A3956a9A20E8A0</div>
            </div>
          </div>
        </div>
        {/* Right side: market info */}
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{coin.name}</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{formatUsd(coin.priceUsd)}</div>
            </div>
            <div className={`bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1 rounded-xl text-xs font-semibold ${up ? "" : "opacity-70"}`}>
              {(up ? "+" : "") + (coin.change24hPct * 100).toFixed(2)}%
            </div>
          </div>
          {/* Add more info here as needed */}
        </div>
      </div>
    </section>
  );
}