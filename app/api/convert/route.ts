import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path if needed

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

  // Find wallets
  const fromWallet = await prisma.wallet.findFirst({
    where: { userId: user.id, symbol: from }
  });
  const toWallet = await prisma.wallet.findFirst({
    where: { userId: user.id, symbol: to }
  });

  if (!fromWallet || !toWallet) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  }

  if (fromWallet.balance < Number(amount)) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // Simple conversion: 1:1 ratio (replace with actual conversion logic if needed)
  const convertedAmount = Number(amount);

  // Update balances
  await prisma.wallet.update({
    where: { id: fromWallet.id },
    data: { balance: { decrement: convertedAmount } }
  });
  await prisma.wallet.update({
    where: { id: toWallet.id },
    data: { balance: { increment: convertedAmount } }
  });

  return NextResponse.json({
    success: true,
    from: { symbol: fromWallet.symbol, balance: fromWallet.balance - convertedAmount },
    to: { symbol: toWallet.symbol, balance: toWallet.balance + convertedAmount }
  });
}
