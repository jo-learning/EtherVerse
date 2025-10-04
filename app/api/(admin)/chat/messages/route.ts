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
    console.log('[ADMIN CHAT] created chat', { id: chat.id, userId: chat.userId, adminId: me.id });
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const broadcastUrl = process.env.WS_BROADCAST_URL;
      const broadcastSecret = process.env.WS_BROADCAST_SECRET;
      const payloads = [
        { channel: `user:${userId}`, payload: { type: 'message', chat } },
        ...(user?.email ? [{ channel: `userEmail:${user.email}`, payload: { type: 'message', chat } }] : []),
        { channel: `admin:${me.id}`, payload: { type: 'message', chat } },
      ];
      if (broadcastUrl && broadcastSecret) {
        console.log('[ADMIN CHAT] broadcasting via standalone server', payloads.map(p => p.channel));
        await Promise.all(payloads.map(p => fetch(broadcastUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-ws-secret': broadcastSecret },
          body: JSON.stringify(p),
        }).then(r => { 
          // console.log(r)
          return { ok: r.ok, status: r.status }
        }).catch((e) => { console.warn('[ADMIN CHAT] broadcast fetch error', e?.message || e); return undefined; })));
      } else {
        console.warn('[ADMIN CHAT] WS_BROADCAST_URL/SECRET not set; using in-process broadcast (will NOT reach standalone WS server)');
        const broadcast = (global as any).chatBroadcast as ((ch: string, payload: any) => void) | undefined;
        payloads.forEach(p => broadcast?.(p.channel, p.payload));
      }
    } catch {}
    return NextResponse.json({ chat });
  } catch (e:any) {
    console.log(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
