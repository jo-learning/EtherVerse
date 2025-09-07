import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coins } from "@/lib/data";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export async function POST(req: Request) {
  try {
    const { address, network, addBalance } = await req.json();
    if (!address || !addBalance || !network) {
      return NextResponse.json({ error: "Address (email) is required" }, { status: 400 });
    }


    const oldUser = await prisma.user.findFirst({where: {email: address}})
    if (!oldUser){
        return NextResponse.json({error: "the User doesn't exists"})
    }
    const trimmedNetwork = network.split("/")[0];
    
    const wallet = await prisma.wallet.findFirst({
        where: { userId: oldUser.id, symbol: trimmedNetwork }
    });

    if (!wallet) {
        console.error("Wallet not found for user:", oldUser.id, "and network:", network);
        return NextResponse.json({ error: "Wallet not found for this user and network" }, { status: 404 });
    }

    const updatedUser = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
            balance: {
                increment: addBalance
            }

        }
    })
    return NextResponse.json({ updatedUser }, { status:  200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
