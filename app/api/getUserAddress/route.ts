import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { walletsData } from "@/lib/data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {email: userId},
    select: {
      id: true
    }
  })

  if (!user){
    return NextResponse.json({error: "user not founded"}, {status: 400})
  }

  try {

    const user1 = await prisma.user.findUnique({ where: { email: userId } });
    if (!user1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const uw = await prisma.userWallet.findUnique({ where: { userId: user1.id } });
    if (!uw) {
      return NextResponse.json({ error: "userWallet not initialized" }, { status: 404 });
    }

    const addresses = await prisma.wallet.findMany();
    console.log("addresses:", addresses, walletsData);

    const wallets = walletsData.map(w => ({
      symbol: w.symbol,
      name: w.name,
      logo: w.logo,
      balance: (uw as any)[w.symbol] ?? "0",
      address: addresses.find(a => a.coinId == w.symbol)?.address || "",
      network: w.network,
    }));

    return NextResponse.json({ userId, wallets });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
