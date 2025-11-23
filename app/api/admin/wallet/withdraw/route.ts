import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { address, network, balance } = await req.json();

    if (!address || !network || !balance) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userWallet = await prisma.userWallet.findFirst({
      where: {
        OR: [
          { user: { email: address } },
        ],
      },
    });

    if (!userWallet) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

   

    const currentBalance = Number(userWallet[network as keyof typeof userWallet]);
    if (currentBalance < balance) {
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 }
      );
    }

    const finalBalance = String(currentBalance - balance);
    if (isNaN(Number(finalBalance)) || Number(finalBalance) < 0) {
      return NextResponse.json(
        { error: "Invalid balance calculation" },
        { status: 400 }
      );
    }

    const updatedWallet = await prisma.userWallet.update({
      where: {
        id: userWallet.id,
      },
      data: {
        [network]: finalBalance,
      },
    });

    return NextResponse.json(updatedWallet);
  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
