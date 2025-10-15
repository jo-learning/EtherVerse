import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsResponse, corsOptions } from "@/lib/cors";

export function OPTIONS() {
  return corsOptions();
}
// Per-user consolidated balances now live in userWallet table.

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
    const symbol = network.split("/")[0].toUpperCase();
    const allowed = symbol.match(/^[A-Z0-9]{2,10}$/);
    if (!allowed) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }

    const uw = await prisma.userWallet.findUnique({ where: { userId: oldUser.id } });
    if (!uw) {
      return NextResponse.json({ error: "User wallet not initialized" }, { status: 404 });
    }

    if (!(symbol in uw)) {
      return NextResponse.json({ error: "Symbol not supported in userWallet" }, { status: 400 });
    }

    const current = parseFloat((uw as any)["USDT"] || "0");
    const inc = Number(addBalance);
    if (isNaN(inc)) {
      return NextResponse.json({ error: "addBalance must be numeric" }, { status: 400 });
    }
    const data: Record<string, any> = {};
    data['USDT'] = (current + inc).toString();

    const updated = await prisma.userWallet.update({
      where: { userId: oldUser.id },
      data,
    });

    return NextResponse.json({ updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
