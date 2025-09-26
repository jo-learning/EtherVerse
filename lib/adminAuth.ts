import { NextRequest } from 'next/server';
import { verifyJWT } from './utils/jwt';
import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();
const COOKIE_NAME = 'admin_session';

export interface AuthAdmin {
  id: string;
  role: 'ADMIN' | 'SUPERADMIN';
  status: string;
  adminId: number;
  email: string;
  name: string | null;
}

function getCookie(req: NextRequest, name: string) {
  const raw = req.headers.get('cookie') || '';
  const part = raw.split(/; */).find(c => c.startsWith(name + '='));
  return part ? decodeURIComponent(part.split('=')[1]) : null;
}

export async function requireAdmin(req: NextRequest, opts: { super?: boolean } = {}): Promise<{ admin: AuthAdmin } | { error: string; status: number }> {
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return { error: 'Unauthorized', status: 401 };
  const { valid, payload } = verifyJWT(token);
  if (!valid || !payload?.sub) return { error: 'Invalid token', status: 401 };
  const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
  if (!admin || admin.status !== 'active') return { error: 'Unauthorized', status: 401 };
  if (opts.super && admin.role !== 'SUPERADMIN') return { error: 'Forbidden', status: 403 };
  const { hashedPassword, resetToken, resetTokenExpires, twoFactorSecret, ...safe } = admin as any;
  return { admin: safe };
}
