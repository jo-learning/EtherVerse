
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Re-using price fetching logic from the other API route.
// In a real clean architecture, this would be in a shared service.
const FX_METALS = new Set(["XAU", "XAG", "XPT", "GBP", "JPY", "EUR", "AUD", "CAD", "CHF", "NZD"]);
const CG_IDS: Record<string, string> = { BTC: "bitcoin", ETH: "ethereum", USDT: "tether", BNB: "binancecoin", XRP: "ripple", SOL: "solana", AAVE: "aave", DOT: "polkadot", LINK: "chainlink", UNI: "uniswap", LTC: "litecoin", ADA: "cardano", DOGE: "dogecoin", EOS: "eos" };

async function fetchUsdFromBinance(sym: string): Promise<number | null> {
  try {
    const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym.toUpperCase()}USDT`, { cache: "no-store" });
    if (!r.ok) return null;
    const j: any = await r.json();
    return Number.isFinite(Number(j?.price)) ? Number(j.price) : null;
  } catch { return null; }
}

async function fetchUsdFromCoinGecko(sym: string): Promise<number | null> {
  const id = CG_IDS[sym.toUpperCase()];
  if (!id) return null;
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`, { cache: "no-store" });
    if (!r.ok) return null;
    const j: any = await r.json();
    return Number.isFinite(j?.[id]?.usd) ? j[id].usd : null;
  } catch { return null; }
}

async function fetchUsdFromAlltick(sym: string): Promise<number | null> {
    const pair = sym === "JPY" ? "USDJPY" : `${sym}USD`;
    const invert = sym === "JPY";
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/market/alltick?pairs=${encodeURIComponent(pair)}`;
    try {
        const r = await fetch(url, { cache: "no-store" });
        if (r.ok) {
            const j: any = await r.json();
            const rows: any[] = j?.quotes || j?.data || (Array.isArray(j) ? j : []);
            const row = rows.find((x: any) => String(x?.instrument || x?.symbol).toUpperCase() === pair);
            if (row) {
                const midCandidate =
                    row.mid ??
                    (row.bid != null && row.ask != null ? (Number(row.bid) + Number(row.ask)) / 2 : undefined) ??
                    row.price ??
                    row.close;
                const mid = Number(midCandidate);
                if (Number.isFinite(mid)) return invert ? (mid !== 0 ? 1 / mid : 0) : mid;
            }
        }
    } catch {}
    return null;
}

async function getUsdPrice(symbol: string): Promise<number | null> {
  const sym = symbol.toUpperCase();
  if (sym === "USDT") return 1;
  if (FX_METALS.has(sym)) return await fetchUsdFromAlltick(sym);
  return (await fetchUsdFromBinance(sym)) ?? (await fetchUsdFromCoinGecko(sym));
}


export async function POST(req: NextRequest) {
  try {
    const { userId, toSymbol, amount } = await req.json();
    if (!userId || !toSymbol || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const to = String(toSymbol).toUpperCase();
    if (to === "USDT") {
      return NextResponse.json({ error: "cannot_convert_to_usdt_use_other_endpoint" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: String(userId) }, include: { userWallet: true } });
    if (!user) {
        return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }
    // console.log("User found:", user);
    // const userWallet = await prisma.userWallet.findUnique({ where: { userId: String(userId) } });
    // if (!userWallet) {
    //   return NextResponse.json({ error: "user_wallet_not_found" }, { status: 404 });
    // }

    const usdtBalance = Number(user.userWallet[0]?.USDT ?? "0");
    if (!Number.isFinite(usdtBalance) || usdtBalance < amount) {
      return NextResponse.json({ error: "insufficient_usdt_balance" }, { status: 400 });
    }

    const priceOfTo = await getUsdPrice(to);
    if (priceOfTo == null || priceOfTo === 0) {
      return NextResponse.json({ error: "price_unavailable", symbol: to }, { status: 502 });
    }

    const amountToCredit = amount / priceOfTo;

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.userWallet.findUnique({ where: { userId: String(user.id) } });
      if (!current) throw new Error("wallet_missing");

      const currentUsdt = Number(current.USDT ?? "0");
      if (!Number.isFinite(currentUsdt) || currentUsdt < amount) throw new Error("insufficient_usdt_balance");

      const currentTo = Number((current as any)[to] ?? "0");

      const newUSDT = (currentUsdt - amount).toString();
      const newTo = (currentTo + amountToCredit).toString();

      const data: any = { USDT: newUSDT };
      data[to] = newTo;

      return tx.userWallet.update({ where: { userId: String(user.id) }, data });
    });

    return NextResponse.json({
      ok: true,
      from: "USDT",
      to: to,
      usdtDebited: amount,
      amountCredited: amountToCredit,
      balances: {
        USDT: updated.USDT,
        [to]: (updated as any)[to],
      },
      priceUsd: priceOfTo,
    });
  } catch (e: any) {
    const msg = String(e?.message || "server_error");
    const code = msg.includes("insufficient") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status: code });
  }
}
