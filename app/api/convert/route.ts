import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Using consolidated userWallet balances

export async function POST(req: NextRequest) {
  const { from, to, amount, email } = await req.json();

  if (!from || !to || !amount || !email) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch consolidated balances row
  const uw = await prisma.userWallet.findUnique({ where: { userId: user.id } });
  if (!uw) {
    return NextResponse.json({ error: "User wallet not initialized" }, { status: 404 });
  }

  const fromKey = from.toUpperCase();
  const toKey = to.toUpperCase();
  if (!(fromKey in uw) || !(toKey in uw)) {
    return NextResponse.json({ error: "Unsupported asset symbol" }, { status: 400 });
  }

  const fromBalance = parseFloat((uw as any)[fromKey] || "0");
  const amt = Number(amount);
  if (isNaN(amt) || amt <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (fromBalance < amt) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // Simple 1:1 conversion (placeholder)
  const convertedAmount = amt;

  const data: Record<string, any> = {};
  data[fromKey] = (fromBalance - convertedAmount).toString();
  const toBalance = parseFloat((uw as any)[toKey] || "0");
  data[toKey] = (toBalance + convertedAmount).toString();

  const updated = await prisma.userWallet.update({
    where: { userId: user.id },
    data,
  });

  return NextResponse.json({
    success: true,
    from: { symbol: fromKey, balance: data[fromKey] },
    to: { symbol: toKey, balance: data[toKey] },
    wallet: updated,
  });
}
