import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../lib/generated/prisma';
import { requireAdmin } from '../../../../../lib/adminAuth';

const prisma = new PrismaClient();

// GET /api/(admin)/chat/users
// SUPERADMIN: list all users optionally filter assigned=true|false
// ADMIN: list only users assigned to this admin
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const me = auth.admin;
  const { searchParams } = new URL(req.url);
  const assignedFilter = searchParams.get('assigned');

  try {
    if (me.role === 'SUPERADMIN') {
      // optionally filter assignment presence
      if (assignedFilter === 'true') {
        const users = await prisma.user.findMany({
          where: { assignments: { some: { active: true } } },
          include: { assignments: { where: { active: true }, include: { admin: true } } },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ users });
      } else if (assignedFilter === 'false') {
        const users = await prisma.user.findMany({
          where: { assignments: { none: { active: true } } },
          orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ users });
      }
      const users = await prisma.user.findMany({
        include: { assignments: { where: { active: true }, include: { admin: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ users });
    }

    // ADMIN role: only their assigned users
    const users = await prisma.user.findMany({
      where: { assignments: { some: { adminId: me.id, active: true } } },
      include: { assignments: { where: { adminId: me.id, active: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ users });
  } catch (e:any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
