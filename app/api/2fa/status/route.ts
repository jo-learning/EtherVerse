import { NextRequest, NextResponse } from "next/server";
import { getUserAndSecret } from "../_helpers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const identifier = searchParams.get("identifier")?.trim();

  if (!identifier) {
    return NextResponse.json({ error: "identifier is required" }, { status: 400 });
  }

  const result = await getUserAndSecret(identifier);
  if (!result) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { user, secret } = result;

  return NextResponse.json({
    enabled: Boolean(user.googlefa),
    pending: Boolean(secret && !secret.verified),
    hasSecret: Boolean(secret),
    verifiedAt: secret?.verifiedAt ?? null,
  });
}
