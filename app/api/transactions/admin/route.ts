
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const transactions = await prisma.transactionRecord.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            userId: true,
          }
        }
      }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
