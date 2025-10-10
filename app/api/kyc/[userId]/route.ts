import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

// Get one user's KYC
export async function GET(_req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const kyc = await prisma.kYC.findFirst({
    where: { Email: userId },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!kyc) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(kyc, { status: 200 });
}
// Approve/Reject/Pending
// TODO: protect this endpoint (authz: super admin only)
export async function PATCH(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;
    const body = await req.json();
    const next = String(body?.status || '').toLowerCase();
    if (!['approved', 'rejected', 'pending'].includes(next)) {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
    }
    const updated = await prisma.kYC.update({
      where: { userId },
      data: {
        status: next,
        verifiedAt: next === 'approved' ? new Date() : null,
      },
    });
    return NextResponse.json({ status: updated.status, verifiedAt: updated.verifiedAt }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }
} 