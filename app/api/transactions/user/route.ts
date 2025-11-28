
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: userId } // Assuming userId from frontend is the email/address
    });

    if (!user) {
        return new NextResponse('User not found', { status: 404 });
    }

    const transactions = await prisma.transactionRecord.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
