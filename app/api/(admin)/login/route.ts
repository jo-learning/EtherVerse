import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../lib/generated/prisma";
import { verifyPassword } from "../../../../lib/utils/password";
import { signJWT, verifyJWT } from "../../../../lib/utils/jwt";

const prisma = new PrismaClient();
const COOKIE_NAME = "admin_session";
const SESSION_SECONDS = 60 * 60 * 4; // 4h

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json().catch(() => ({}));
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials admin" },
        { status: 401 }
      );
    }
    if (admin.status !== "active") {
      return NextResponse.json(
        { error: "Account disabled" },
        { status: 403 }
      );
    }

    const valid = verifyPassword(password, admin.hashedPassword);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login (non-blocking best-effort)
    prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    }).catch(() => {});

    const token = signJWT(
      { sub: admin.id, role: admin.role, aid: admin.adminId },
      SESSION_SECONDS
    );

    const { hashedPassword, resetToken, resetTokenExpires, twoFactorSecret, ...safe } = admin;
    const res = NextResponse.json({ ok: true, admin: safe, token });
    setSessionCookie(res, token);
    return res;
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Optional: validate existing session
export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie
    .split(/; */)
    .find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const token = match.split("=")[1];
  const { valid, payload, reason } = verifyJWT(token);
  if (!valid || !payload) {
    return NextResponse.json(
      { authenticated: false, reason },
      { status: 401 }
    );
  }
  // Fetch latest admin (sanitized)
  const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
  if (!admin) {
    return NextResponse.json(
      { authenticated: false, reason: "not-found" },
      { status: 401 }
    );
  }
  const { hashedPassword, resetToken, resetTokenExpires, twoFactorSecret, ...safe } = admin;
  return NextResponse.json({ authenticated: true, admin: safe });
}
