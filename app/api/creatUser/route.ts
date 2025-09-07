import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coins } from "@/lib/data";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { deriveCoinWallet, generateMnemonic12 } from "@/lib/derive";

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

    const coinIds = await prisma.coin.findMany();

    // Create wallets for each coin
    const wallets = [];
    var index = 0
    const mnemonic = generateMnemonic12();
    for (const coin of coins) {
      // const privateKey = generatePrivateKey();
      // const account = privateKeyToAccount(privateKey);
      

      const deriveWallet =  deriveCoinWallet(mnemonic, coin.symbol)
      console.log(deriveWallet);
      const wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          coinId: coinIds[index].id, // Use the coin ID from the database
          actualBalance: "0", // Initialize actualBalance as a string
          balance: 0,
          frozen: 0,
          privateKey: deriveWallet.privateKeyHex ?? "", // Store private key securely
          publicKey: deriveWallet.publicKey ?? "",
          address: deriveWallet.address,
          network: deriveWallet.chain,
          symbol: coin.symbol,
        },
      });

      wallets.push({
        coin: coin.symbol,
        address: wallet.address,
      });
      index++;
    }

    // console.log({ user, wallets });

    return NextResponse.json({ user, wallets });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
