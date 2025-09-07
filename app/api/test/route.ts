import { NextResponse } from "next/server";
import { coins } from "@/lib/data";
import { PrismaClient } from "@/lib/generated/prisma"; // Import PrismaClient, not Prisma
import { deriveBundle, generateMnemonic12 } from "@/lib/derive";
import { getBalance } from "@/lib/getBalance";

export async function GET() {
  // Create Prisma client instance inside the function
const mnemonic = generateMnemonic12();


const bundle = deriveBundle(mnemonic);
// const bundle = deriveBundle("drip mesh bag wood smile first useless impulse grass want today category");
// const walletAddress = getBalance("ETH", "0x4d27B66c0B05d9E4Bff0D0850E59FeBDDb8b2f80");
try{

    const walletAddress = await getBalance("ETH", bundle.evm.address);
    // console.log(walletAddress);
    return NextResponse.json({ bundle, mnemonic, walletAddress });
    // return NextResponse.json({ bundle, mnemonic });
}catch(e){
    console.log(e);
    return NextResponse.json({error: e}, {status: 500})
}
}