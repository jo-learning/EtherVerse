import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const prisma = new PrismaClient();

// GET /api/(admin)/dashboard
// SUPERADMIN: global metrics
// ADMIN: scoped metrics to their assigned users and their own chats
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const me = auth.admin;

  try {
    if (me.role === 'SUPERADMIN') {
      const [users, admins, chats, assignments, recentUsers, recentChats] = await Promise.all([
        prisma.user.count(),
        prisma.admin.count(),
        prisma.chat.count(),
        prisma.adminUserAssignment.count({ where: { active: true } }),
        prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, email: true, name: true, createdAt: true } }),
        prisma.chat.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, userId: true, who: true, message: true, createdAt: true, adminId: true } }),
      ]);
      return NextResponse.json({
        scope: 'global',
        stats: { users, admins, chats, assignments },
        recent: { users: recentUsers, chats: recentChats },
      });
    }

    // ADMIN scope: assigned users + chats linked to them
    const assignedUserIds = (await prisma.adminUserAssignment.findMany({ where: { adminId: me.id, active: true }, select: { userId: true } })).map(a => a.userId);
    const [users, chats, recentUsers, recentChats] = await Promise.all([
      prisma.user.count({ where: { id: { in: assignedUserIds.length ? assignedUserIds : ['__none__'] } } }),
      prisma.chat.count({ where: { OR: [ { userId: { in: assignedUserIds.length ? assignedUserIds : ['__none__'] } }, { adminId: me.id } ] } }),
      prisma.user.findMany({ where: { id: { in: assignedUserIds.length ? assignedUserIds : ['__none__'] } }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, email: true, name: true, createdAt: true } }),
      prisma.chat.findMany({ where: { OR: [ { userId: { in: assignedUserIds.length ? assignedUserIds : ['__none__'] } }, { adminId: me.id } ] }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, userId: true, who: true, message: true, createdAt: true, adminId: true } }),
    ]);
    return NextResponse.json({
      scope: 'assigned',
      stats: { users, chats },
      recent: { users: recentUsers, chats: recentChats },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
