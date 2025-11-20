import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const runtime = "nodejs";

interface GenerateBody {
  identifier?: string;
  label?: string;
}

async function getUserByIdentifier(identifier: string) {
    return prisma.user.findFirst({
        where: {
            OR: [
                { email: { equals: identifier, mode: "insensitive" } },
                { id: identifier },
            ],
        },
    });
}

export async function POST(req: NextRequest) {
  let body: GenerateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const identifier = body.identifier?.trim();
  if (!identifier) {
    return NextResponse.json({ error: "identifier is required" }, { status: 400 });
  }

  const user = await getUserByIdentifier(identifier);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.googlefa) {
    return NextResponse.json({ error: "2FA already enabled" }, { status: 409 });
  }

  const accountLabel = body.label?.trim() || `procryptotrading (${identifier})`;

  const secret = speakeasy.generateSecret({
    length: 20,
    name: accountLabel,
    issuer: "procryptotrading",
  });

  const otpauthUrl = secret.otpauth_url || speakeasy.otpauthURL({
    secret: secret.base32,
    label: accountLabel,
    issuer: "procryptotrading",
    encoding: "base32",
  });

  await prisma.userGoogleFA.upsert({
    where: { userId: user.id },
    update: {
      secret: secret.base32,
      verified: false,
      verifiedAt: null,
    },
    create: {
      userId: user.id,
      secret: secret.base32,
      verified: false,
    },
  });

  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return NextResponse.json({
    secret: secret.base32,
    otpauthUrl,
    qrCodeDataUrl,
  });
}
