// API: Seed / Upsert initial wallet rows based on static wallet seed list.
// If a Coin model is introduced later, extend this route to seed coins first and map wallet.coinId to that table.
import { NextResponse } from "next/server";
import { walletsSeed } from "@/lib/data";
import { PrismaClient } from "@/lib/generated/prisma"; // Import PrismaClient, not Prisma

export async function GET() {
  // Create Prisma client instance inside the function
  const prisma = new PrismaClient();
  
  try {
    // NOTE: There is no Coin model in schema.prisma, so we only seed Wallet entries.
    // If you later add a Coin model, reintroduce a coin upsert loop here.

    for (const w of walletsSeed) {
      await prisma.wallet.upsert({
        where: { symbol: w.symbol },
        update: {
          logo: w.logo,
          name: w.name,
          network: w.network,
          address: w.address,
          actualBalance: w.actualBalance,
          publicKey: w.publicKey,
        },
        create: {
          coinId: w.coinId,
          balance: w.balance,
          profits: w.profits,
          frozen: w.frozen,
          symbol: w.symbol,
          name: w.name,
          logo: w.logo,
          address: w.address,
          actualBalance: w.actualBalance,
          privateKey: w.privateKey,
          publicKey: w.publicKey,
          network: w.network,
        },
      });
    }

    await prisma.$disconnect();
  return NextResponse.json({ success: true, wallets: walletsSeed.length });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  } finally {
    // Ensure disconnection even if error occurs
    await prisma.$disconnect();
  }
}