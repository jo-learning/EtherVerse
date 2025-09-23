import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "../../../../lib/utils/password";
import { PrismaClient } from "../../../../lib/generated/prisma";

const prisma = new PrismaClient();

// Plain demo passwords (DO NOT use in production)
const plainAdminPassword = "AdminPassword123!";
const plainSuperPassword = "SuperAdminPassword123!";

// Seed (idempotent)
async function ensureSeedAdmins() {
  await prisma.admin.upsert({
    where: { email: "admin@example.com" },
    update: {}, // keep existing data
    create: {
      adminId: 1,
      email: "admin@example.com",
      name: "Regular Admin",
      role: "ADMIN",
      status: "active",
      hashedPassword: hashPassword(plainAdminPassword),
    },
  });

  await prisma.admin.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      adminId: 2,
      email: "superadmin@example.com",
      name: "Super Admin",
      role: "SUPERADMIN",
      status: "active",
      hashedPassword: hashPassword(plainSuperPassword),
    },
  });
}

export async function GET(request: Request) {
  await ensureSeedAdmins();

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role")?.toUpperCase();
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (role && role !== "ADMIN" && role !== "SUPERADMIN") {
    return NextResponse.json(
      { error: "Invalid role. Use role=admin or role=superadmin." },
      { status: 400 }
    );
  }

  // Filter by role if provided
  const admins = await prisma.admin.findMany({
    where: role ? { role: role as any } : {},
    orderBy: { adminId: "asc" },
  });

  // Credential verification path
  if (email && password) {
    const admin = admins.find(a => a.email === email);
    if (!admin) {
      return NextResponse.json(
        { ok: false, reason: "Email not found" },
        { status: 404 }
      );
    }
    const valid = verifyPassword(password, admin.hashedPassword);
    return NextResponse.json({
      ok: valid,
      email: admin.email,
      role: admin.role,
      status: admin.status,
    });
  }

  const sanitized = admins.map(({ hashedPassword, ...rest }) => rest);
  return NextResponse.json({
    count: sanitized.length,
    admins: sanitized,
  });
}
