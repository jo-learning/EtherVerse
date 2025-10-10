import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Symbols we’ll resolve via Alltick (USD-based pairs)
const FX_METALS = new Set([
  "XAU",
  "XAG",
  "XPT",
  "GBP",
  "JPY",
  "EUR",
  "AUD",
  "CAD",
  "CHF",
  "NZD",
]);

// Basic CoinGecko ids for common cryptos (fallback)
const CG_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  XRP: "ripple",
  SOL: "solana",
  AAVE: "aave",
  DOT: "polkadot",
  LINK: "chainlink",
  UNI: "uniswap",
  LTC: "litecoin",
  ADA: "cardano",
  DOGE: "dogecoin",
  EOS: "eos",
};

async function fetchUsdFromBinance(sym: string): Promise<number | null> {
  try {
    const r = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${sym.toUpperCase()}USDT`,
      { cache: "no-store" }
    );
    if (!r.ok) return null;
    const j: any = await r.json();
    const p = Number(j?.price);
    return Number.isFinite(p) ? p : null;
  } catch {
    return null;
  }
}

async function fetchUsdFromCoinGecko(sym: string): Promise<number | null> {
  const id = CG_IDS[sym.toUpperCase()];
  if (!id) return null;
  try {
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      { cache: "no-store" }
    );
    if (!r.ok) return null;
    const j: any = await r.json();
    const p = Number(j?.[id]?.usd);
    return Number.isFinite(p) ? p : null;
  } catch {
    return null;
  }
}

async function fetchUsdFromAlltick(sym: string): Promise<number | null> {
  // Map symbol → pair; invert USDJPY to JPY/USD
  const pair = sym === "JPY" ? "USDJPY" : `${sym}USD`;
  const invert = sym === "JPY";

  // Prefer your proxy if you created /api/market/alltick
  try {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/market/alltick?pairs=${encodeURIComponent(
        pair
      )}`,
      { cache: "no-store" }
    );
    if (r.ok) {
      const j: any = await r.json();
      const rows: any[] = Array.isArray(j?.quotes)
        ? j.quotes
        : Array.isArray(j?.data)
        ? j.data
        : Array.isArray(j)
        ? j
        : [];
      const row = rows.find(
        (x: any) => String(x?.instrument || x?.symbol).toUpperCase() === pair
      );
      if (row) {
        const bid = Number(row?.bid),
          ask = Number(row?.ask);
        const mid = Number(
          row?.mid ??
            ((Number.isFinite(bid) && Number.isFinite(ask))
              ? (bid + ask) / 2
              : row?.price ?? row?.close)
        );
        if (Number.isFinite(mid))
          return invert ? (mid !== 0 ? 1 / mid : 0) : mid;
      }
    }
  } catch {
    /* fall through to direct */
  }

  // Or call upstream directly if proxy not set (requires server env)
  const LIVE_URL = process.env.ALLTICK_LIVE_URL;
  const API_KEY = process.env.ALLTICK_API_KEY;
  if (!LIVE_URL || !API_KEY) return null;

  try {
    const url = new URL(LIVE_URL);
    if (!url.searchParams.has("symbols") && !url.searchParams.has("currency"))
      url.searchParams.set("symbols", pair);
    if (!url.searchParams.has("api_key") && !url.searchParams.has("apikey"))
      url.searchParams.set("api_key", API_KEY);
    const r = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok) return null;
    const j: any = await r.json();
    const rows: any[] = Array.isArray(j?.quotes)
      ? j.quotes
      : Array.isArray(j?.data)
      ? j.data
      : Array.isArray(j)
      ? j
      : [];
    const row = rows.find(
      (x: any) => String(x?.instrument || x?.symbol).toUpperCase() === pair
    );
    if (!row) return null;
    const bid = Number(row?.bid),
      ask = Number(row?.ask);
    const mid = Number(
      row?.mid ??
        ((Number.isFinite(bid) && Number.isFinite(ask))
          ? (bid + ask) / 2
          : row?.price ?? row?.close)
    );
    if (!Number.isFinite(mid)) return null;
    return invert ? (mid !== 0 ? 1 / mid : 0) : mid;
  } catch {
    return null;
  }
}

async function getUsdPrice(symbol: string): Promise<number | null> {
  const sym = symbol.toUpperCase();
  if (sym === "USDT") return 1;

  // FX/Metals via Alltick
  if (FX_METALS.has(sym)) {
    const p = await fetchUsdFromAlltick(sym);
    if (p != null) return p;
    return null;
  }

  // Try Binance first for crypto, then CoinGecko
  const b = await fetchUsdFromBinance(sym);
  if (b != null) return b;
  const cg = await fetchUsdFromCoinGecko(sym);
  return cg;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fromSymbol, amount } = await req.json();
    if (
      (!userId && !email) ||
      !fromSymbol ||
      typeof amount !== "number" ||
      amount <= 0
    ) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const from = String(fromSymbol).toUpperCase();
    if (from === "USDT") {
      return NextResponse.json(
        { error: "cannot_convert_usdt_to_usdt" },
        { status: 400 }
      );
    }

    // Resolve userWallet by userId or email
    let uw = null as any;
    if (email) {
      uw = await prisma.userWallet.findUnique({
        where: { userId: String(userId) },
      });
    } else if (userId) {
      const user = await prisma.user.findUnique({
        where: { email: String(userId) },
        select: { id: true },
      });
      if (user)
        uw = await prisma.userWallet.findUnique({ where: { userId: user.id } });
    }
    if (!uw) return NextResponse.json({ error: "user_wallet_not_found" }, { status: 404 });

    // Validate symbol field exists on model
    if (!(from in uw)) {
      return NextResponse.json({ error: 'unsupported_symbol', detail: from }, { status: 400 });
    }

    const fromBal = Number(uw[from] ?? "0");
    if (!Number.isFinite(fromBal) || fromBal < amount) {
      return NextResponse.json({ error: "insufficient_balance" }, { status: 400 });
    }

    const usdPrice = await getUsdPrice(from);
    if (usdPrice == null) {
      return NextResponse.json({ error: "price_unavailable", symbol: from }, { status: 502 });
    }

    const usdtCredit = amount * usdPrice;

    // Atomic update
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.userWallet.findUnique({
        where: { userId: uw.userId },
      });
      if (!current) throw new Error("wallet_missing");

      const curFrom = Number((current as unknown as Record<string, string | null | undefined>)[from] ?? "0");
      if (!Number.isFinite(curFrom) || curFrom < amount) throw new Error("insufficient_balance");

      const curUSDT = Number(current.USDT ?? "0");

      const newFrom = (curFrom - amount).toString();
      const newUSDT = (curUSDT + usdtCredit).toString();

      const data: any = { USDT: newUSDT };
      data[from] = newFrom;

      return tx.userWallet.update({
        where: { userId: uw.userId },
        data,
      });
    });

    return NextResponse.json({
      ok: true,
      symbol: from,
      debited: amount,
      usdtCredited: usdtCredit,
      balances: {
        [from]: (updated as unknown as Record<string, string>)[from],
        USDT: updated.USDT,
      },
      priceUsd: usdPrice,
    });
  } catch (e: any) {
    const msg = String(e?.message || "server_error");
    const code = msg === "insufficient_balance" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
