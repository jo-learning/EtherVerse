import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const prisma = new PrismaClient();
const FLAG_KEY = 'trade-profit';

// GET admin view: returns JSON { key, enabled, updatedAt, updatedBy }
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const flag = await prisma.featureFlag.findFirst({ where: { key: FLAG_KEY } });
  return NextResponse.json({ key: FLAG_KEY, enabled: !!flag?.enabled, updatedAt: flag?.updatedAt ?? null, updatedBy: flag?.updatedBy ?? null });
}

// POST body: { enabled: boolean }
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const me = auth.admin;

  try {
    const data = await req.json().catch(() => ({}));
    if (typeof data.enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled boolean required' }, { status: 400 });
    }

    const saved = await prisma.featureFlag.upsert({
      where: { key: FLAG_KEY },
      update: { enabled: data.enabled, updatedBy: me.id },
      create: { key: FLAG_KEY, enabled: data.enabled, updatedBy: me.id },
    });

    return NextResponse.json({ key: saved.key, enabled: saved.enabled, updatedAt: saved.updatedAt, updatedBy: saved.updatedBy });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH body: { enabled?: boolean }
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const me = auth.admin;
  const data = await req.json().catch(() => ({}));
  if (typeof data.enabled !== 'boolean') return NextResponse.json({ error: 'enabled boolean required' }, { status: 400 });

  const saved = await prisma.featureFlag.upsert({
    where: { key: FLAG_KEY },
    update: { enabled: data.enabled, updatedBy: me.id },
    create: { key: FLAG_KEY, enabled: data.enabled, updatedBy: me.id },
  });
  return NextResponse.json({ key: saved.key, enabled: saved.enabled, updatedAt: saved.updatedAt, updatedBy: saved.updatedBy });
}

// DELETE: remove the flag entirely
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    await prisma.featureFlag.delete({ where: { key: FLAG_KEY } });
  } catch (e) {
    // If it doesn't exist, ignore
  }
  return NextResponse.json({ key: FLAG_KEY, deleted: true });
}
