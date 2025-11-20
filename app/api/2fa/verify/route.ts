import { NextRequest, NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { getUserAndSecret } from "../_helpers";

export const runtime = "nodejs";

interface VerifyBody {
  identifier?: string;
  token?: string;
}

export async function POST(req: NextRequest) {
  let body: VerifyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const identifier = body.identifier?.trim();
  if (!identifier) {
    return NextResponse.json({ error: "identifier is required" }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token || !/^\d{6}$/.test(token)) {
    return NextResponse.json({ error: "token must be a 6-digit string" }, { status: 400 });
  }

  const result = await getUserAndSecret(identifier);
  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { user, secret } = result;
  if (!secret) {
    return NextResponse.json({ error: "2FA secret not generated" }, { status: 400 });
  }

  const isValid = speakeasy.totp.verify({
    secret: secret.secret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { googlefa: true },
    }),
    prisma.userGoogleFA.update({
      where: { userId: user.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ verified: true });
}
