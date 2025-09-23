import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { walletsData } from "@/lib/data";

/**
 * GET /api/userWallet?userId=<email>&symbol=OPTIONAL
 * Combines static wallet metadata (walletsData / global Wallet table) with per-user balances stored in userWallet row.
 * If symbol provided, filters to that symbol only.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId"); // email
  const symbolFilter = searchParams.get("symbol")?.toUpperCase();

  if (!userId) {
    return NextResponse.json({ error: "userId (email) required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: userId }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const uw = await prisma.userWallet.findUnique({ where: { userId: user.id } });
  if (!uw) {
    return NextResponse.json({ error: "userWallet not initialized" }, { status: 404 });
  }

  const merged = walletsData
    .filter(w => !symbolFilter || w.symbol === symbolFilter)
    .map(w => ({
      symbol: w.symbol,
      name: w.name,
      logo: w.logo,
      balance: (uw as any)[w.symbol] ?? "0",
      network: w.network,
    }));

  return NextResponse.json({ userId, wallets: merged });
}
