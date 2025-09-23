import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coins, walletsData } from "@/lib/data";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: "Address (email) is required" }, { status: 400 });
    }


    const oldUser = await prisma.user.findFirst({where: {email: address}})
    if (oldUser){
        return NextResponse.json({error: "the User already exists"})
    }

    const random = (Math.random()*100000000).toString()
    const userId = parseInt(random)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: address,
        userId,
        // password: "", // You may want to handle password differently
        status: "active",
      },
    });

    // Create a consolidated userWallet row with default zero balances.
    const userWallet = await prisma.userWallet.create({
      data: { userId: user.id },
    });

    // Return static wallet metadata (addresses empty because not generated individually now)
    const walletMetadata = walletsData.map(w => ({
      symbol: w.symbol,
      name: w.name,
      logo: w.logo,
      balance: "0",
    }));

    return NextResponse.json({ user, userWallet, wallets: walletMetadata });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
