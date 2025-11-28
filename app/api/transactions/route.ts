
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, coin, amount } = body;

    if (!userId || !type || !coin || !amount) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email: userId } // Assuming userId from frontend is the email/address
    });

    if (!user) {
        return new NextResponse('User not found', { status: 404 });
    }

    const transaction = await prisma.transactionRecord.create({
      data: {
        userId: user.id,
        type,
        coin,
        amount,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
