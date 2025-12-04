import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@/lib/generated/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const admin = auth.admin;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const cursor = searchParams.get("cursor");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const take = 20;
    const chats = await prisma.chat.findMany({
      where: { userId },
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Mark messages as read
    await prisma.chat.updateMany({
      where: {
        userId,
        who: 'user',
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    let nextCursor: typeof cursor | null = null;
    if (chats.length === take) {
      nextCursor = chats[take - 1].id;
    }

    return NextResponse.json({ chats, nextCursor });

  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
