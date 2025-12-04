import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@/lib/generated/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const admin = auth.admin;

    let stats: any = {};
    let recent: any = { users: [], chats: [], unread: [] };

    if (admin.role === 'SUPERADMIN') {
      const [userCount, adminCount, chatCount, assignmentCount, recentUsers, recentChats, unreadChats] = await Promise.all([
        prisma.user.count(),
        prisma.admin.count(),
        prisma.chat.count(),
        prisma.adminUserAssignment.count({ where: { active: true } }),
        prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.chat.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.chat.findMany({ where: { isRead: false, who: 'user' }, orderBy: { createdAt: 'asc' } })
      ]);
      stats = { users: userCount, admins: adminCount, chats: chatCount, assignments: assignmentCount };
      recent = { users: recentUsers, chats: recentChats, unread: unreadChats };
    } else {
      const assignedUserIds = (await prisma.adminUserAssignment.findMany({
        where: { adminId: admin.id, active: true },
        select: { userId: true }
      })).map(a => a.userId);

      const [userCount, chatCount, recentUsers, recentChats, unreadChats] = await Promise.all([
        prisma.user.count({ where: { id: { in: assignedUserIds } } }),
        prisma.chat.count({ where: { userId: { in: assignedUserIds } } }),
        prisma.user.findMany({ where: { id: { in: assignedUserIds } }, orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.chat.findMany({ where: { userId: { in: assignedUserIds } }, orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.chat.findMany({ where: { userId: { in: assignedUserIds }, isRead: false, who: 'user' }, orderBy: { createdAt: 'asc' } })
      ]);
      stats = { users: userCount, chats: chatCount };
      recent = { users: recentUsers, chats: recentChats, unread: unreadChats };
    }

    return NextResponse.json({
      scope: admin.role === 'SUPERADMIN' ? 'global' : 'assigned',
      stats,
      recent,
    });

  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
