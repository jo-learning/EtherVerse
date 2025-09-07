import { NextResponse } from "next/server";
import { coins } from "@/lib/data";
import { PrismaClient } from "@/lib/generated/prisma"; // Import PrismaClient, not Prisma

export async function GET() {
  // Create Prisma client instance inside the function
  const prisma = new PrismaClient();
  
  try {
    for (const coin of coins) {
      await prisma.coin.upsert({ // Use lowercase 'prisma.coin' not 'Prisma.Coin'
        where: { symbol: coin.symbol },
        update: {
          name: coin.name,
          logo: coin.logo,
        },
        create: {
          symbol: coin.symbol,
          name: coin.name,
          logo: coin.logo,
        },
      });
    }

    await prisma.$disconnect();
    return NextResponse.json({ success: true });
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