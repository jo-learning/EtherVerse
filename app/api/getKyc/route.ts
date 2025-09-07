import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const uId = await prisma.user.findUnique({
      where: { email: userId },
      select: {
        id: true,
        userId: true
      },
    });

    if (!uId){
        return NextResponse.json({error: "user not found"}, {status: 400})
    }

    const getKYC = await prisma.kYC.findUnique({
        where: { userId: uId.id},

    })

    return NextResponse.json({ userId, getKYC });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
