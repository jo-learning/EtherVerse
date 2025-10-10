import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

// TODO: protect this endpoint (authz: super admin only)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const status = (url.searchParams.get('status') || '').toLowerCase(); // pending|approved|rejected|''

    const where: any = {};
    if (status && ['pending','approved','rejected'].includes(status)) {
      where.status = status;
    }

    // Basic query; refine if your schema differs
    const items = await prisma.kYC.findMany({
      where,
      include: {
        user: { select: { id: true, email: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 500,
    });

    const filtered = q
      ? items.filter(i => {
          const blob = [
            i.user?.email || '',
            i.firstName || '',
            i.lastName || '',
            i.Email || '',
            i.certificateNumber || '',
            i.country || '',
          ].join(' ').toLowerCase();
          return blob.includes(q);
        })
      : items;

    return NextResponse.json({ items: filtered }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}