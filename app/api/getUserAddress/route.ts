import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      select: {
        coinId: true,
        address: true,
        network: true,
        symbol: true,
        balance: true
      },
    });

    return NextResponse.json({ userId, wallets });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
