import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../lib/generated/prisma';
import { requireAdmin } from '../../../../../lib/adminAuth';

const prisma = new PrismaClient();

/*
POST /api/(admin)/chat/assign
Body: { userId?: string, userEmail?: string, adminId?: string }
- super admin only
- if adminId omitted, unassign (set active=false) for user's active assignment
*/
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, { super: true });
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { userId, userEmail, adminId } = await req.json();
    if (!userId && !userEmail) {
      return NextResponse.json({ error: 'userId or userEmail required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { OR: [ userId ? { id: userId } : undefined, userEmail ? { email: userEmail } : undefined ].filter(Boolean) as any } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // deactivate existing active assignment
    await prisma.adminUserAssignment.updateMany({ where: { userId: user.id, active: true }, data: { active: false } });

    if (!adminId) {
      return NextResponse.json({ ok: true, unassigned: true });
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    const assignment = await prisma.adminUserAssignment.create({ data: { userId: user.id, adminId: admin.id } });
    return NextResponse.json({ assignment });
  } catch (e:any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
