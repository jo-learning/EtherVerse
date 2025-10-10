import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();
const FLAG_KEY = 'trade-profit';

// GET /api/flags/trade-profit
// Response: plain text 'true' or 'false'
export async function GET(_req: NextRequest) {
  try {
    const flag = await prisma.featureFlag.findUnique({ where: { key: FLAG_KEY } });
    const enabled = !!flag?.enabled;
    return new NextResponse(enabled ? 'true' : 'false', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return new NextResponse('false', { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
