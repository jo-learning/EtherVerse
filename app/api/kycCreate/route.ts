import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coins } from "@/lib/data";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

export async function POST(req: Request) {
  try {
    const { address, firstName, lastName, Email, Birthdate, Place } = await req.json();
    if (!address || !firstName || !lastName || !Email || !Birthdate || !Place) {
      return NextResponse.json({ error: "Address (email) is required" }, { status: 400 });
    }


    const oldUser = await prisma.user.findFirst({where: {email: address}})
    if (!oldUser){
        return NextResponse.json({error: "the User doesn't exists"})
    }

    const kyc = await prisma.kYC.findFirst({where: {userId: oldUser.id}});
    if (kyc) {
      return NextResponse.json({ error: "KYC already exists for this user" }, { status: 400 });
    }
    const newKyc = await prisma.kYC.create({
      data: {
        userId: oldUser.id,
        firstName,
        lastName,
        Email,
        Brithdate: Birthdate,
        Place,
      }
  });



    return NextResponse.json({ kyc: newKyc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
