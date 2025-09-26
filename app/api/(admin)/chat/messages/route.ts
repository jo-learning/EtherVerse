import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../lib/generated/prisma';
import { requireAdmin } from '../../../../../lib/adminAuth';

const prisma = new PrismaClient();

// GET /api/(admin)/chat/messages?userId=...&cursor=...&limit=50
// SUPERADMIN: can view any user chats
// ADMIN: only chats for users assigned to them (active assignment) or where chat.adminId == admin.id
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const me = auth.admin;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const cursor = searchParams.get('cursor');
  const take = parseInt(searchParams.get('limit') || '50', 10);
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  // access control
  if (me.role !== 'SUPERADMIN') {
    const assignment = await prisma.adminUserAssignment.findFirst({ where: { userId, adminId: me.id, active: true } });
    if (!assignment) {
      // allow if any chat already linked to this admin for this user
      const anyChat = await prisma.chat.findFirst({ where: { userId, adminId: me.id } });
      if (!anyChat) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const where = { userId } as any;
  const orderBy = { createdAt: 'desc' } as const;
  let chats;
  if (cursor) {
    chats = await prisma.chat.findMany({ where, orderBy, take, skip: 1, cursor: { id: cursor } });
  } else {
    chats = await prisma.chat.findMany({ where, orderBy, take });
  }

  return NextResponse.json({ chats, nextCursor: chats.length === take ? chats[chats.length - 1].id : null });
}

// POST /api/(admin)/chat/messages { userId, message }
// who = 'admin'; also stamp adminId
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const me = auth.admin;
  try {
    const { userId, message } = await req.json();
    if (!userId || !message) return NextResponse.json({ error: 'userId & message required' }, { status: 400 });

    if (me.role !== 'SUPERADMIN') {
      const assignment = await prisma.adminUserAssignment.findFirst({ where: { userId, adminId: me.id, active: true } });
      if (!assignment) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const chat = await prisma.chat.create({ data: { userId, message, who: 'admin', adminId: me.id } });
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const broadcast = (global as any).chatBroadcast as ((ch: string, payload: any) => void) | undefined;
      broadcast?.(`user:${userId}`, { type: 'message', chat });
      if (user?.email) broadcast?.(`userEmail:${user.email}`, { type: 'message', chat });
      broadcast?.(`admin:${me.id}`, { type: 'message', chat });
    } catch {}
    return NextResponse.json({ chat });
  } catch (e:any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
