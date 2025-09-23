import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../lib/generated/prisma";
import { verifyJWT } from "../../../../lib/utils/jwt";
import { hashPassword } from "../../../../lib/utils/password";

const prisma = new PrismaClient();
const COOKIE_NAME = "admin_session";

function getCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  const part = raw.split(/; */).find(c => c.startsWith(name + "="));
  return part ? decodeURIComponent(part.split("=")[1]) : null;
}

async function requireSuperAdmin(req: Request) {
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return { error: "Unauthorized", status: 401 } as const;
  const { valid, payload } = verifyJWT(token);
  if (!valid || !payload?.sub) return { error: "Invalid token", status: 401 } as const;
  const me = await prisma.admin.findUnique({ where: { id: payload.sub } });
  if (!me || me.status !== "active") return { error: "Unauthorized", status: 401 } as const;
  if (me.role !== "SUPERADMIN") return { error: "Forbidden", status: 403 } as const;
  return { me };
}

function sanitize(a: any) {
  // remove sensitive fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hashedPassword, resetToken, resetTokenExpires, twoFactorSecret, ...safe } = a;
  return safe;
}

async function nextAdminId() {
  const r = await prisma.admin.findFirst({
    orderBy: { adminId: "desc" },
    select: { adminId: true },
  });
  return (r?.adminId || 0) + 1;
}

// GET /api/(admin)/admin?role=ADMIN|SUPERADMIN&id=...&email=...
export async function GET(req: Request) {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const role = searchParams.get("role")?.toUpperCase();

  const where: any = {};
  if (id) where.id = id;
  if (email) where.email = email;
  if (role) where.role = role;

  try {
    if (id || email) {
      const admin = await prisma.admin.findFirst({ where });
      if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ admin: sanitize(admin) });
    }
    const admins = await prisma.admin.findMany({
      where,
      orderBy: { adminId: "asc" },
    });
    return NextResponse.json({
      count: admins.length,
      admins: admins.map(sanitize),
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST create admin { email, password, role, name, status }
export async function POST(req: Request) {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const { email, password, role = "ADMIN", name, status = "active" } = body;
    if (!email || !password) {
      return NextResponse.json({ error: "email & password required" }, { status: 400 });
    }
    if (!["ADMIN", "SUPERADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const admin = await prisma.admin.create({
      data: {
        adminId: await nextAdminId(),
        email,
        hashedPassword: hashPassword(password),
        role,
        name,
        status,
      },
    });
    return NextResponse.json({ admin: sanitize(admin) }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH update admin { id, name?, role?, status?, password? }
export async function PATCH(req: Request) {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const { id, name, role, status, password } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (status !== undefined) data.status = status;
    if (role !== undefined) {
      if (!["ADMIN", "SUPERADMIN"].includes(role))
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      data.role = role;
    }
    if (password) data.hashedPassword = hashPassword(password);

    // prevent removing last SUPERADMIN
    if (role === "ADMIN") {
      const target = await prisma.admin.findUnique({ where: { id } });
      if (target?.role === "SUPERADMIN") {
        const superCount = await prisma.admin.count({ where: { role: "SUPERADMIN" } });
        if (superCount <= 1) {
          return NextResponse.json({ error: "Cannot demote last SUPERADMIN" }, { status: 400 });
        }
      }
    }

    const updated = await prisma.admin.update({ where: { id }, data });
    return NextResponse.json({ admin: sanitize(updated) });
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/(admin)/admin?id=...
export async function DELETE(req: Request) {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query param required" }, { status: 400 });

  if (id === auth.me!.id) {
    return NextResponse.json({ error: "Cannot delete own account" }, { status: 400 });
  }

  try {
    const target = await prisma.admin.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (target.role === "SUPERADMIN") {
      const count = await prisma.admin.count({ where: { role: "SUPERADMIN" } });
      if (count <= 1) {
        return NextResponse.json({ error: "Cannot delete last SUPERADMIN" }, { status: 400 });
      }
    }

    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
