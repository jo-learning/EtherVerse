import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../lib/generated/prisma";
import { verifyJWT } from "../../../../lib/utils/jwt";

const prisma = new PrismaClient();
const COOKIE_NAME = "admin_session";

type AuthContext = {
  adminId: string;
  role: string;
};

function extractCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") || "";
  const found = cookie.split(/; */).find(c => c.startsWith(name + "="));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
}

async function requireAuth(request: Request): Promise<{ ok: boolean; ctx?: AuthContext; response?: NextResponse }> {
  const token = extractCookie(request, COOKIE_NAME);
  if (!token) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { valid, payload } = verifyJWT(token);
  if (!valid || !payload?.sub) return { ok: false, response: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
  if (!admin || admin.status !== "active") {
    return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true, ctx: { adminId: admin.id, role: admin.role } };
}

// GET: list wallets or single wallet by id
export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response!;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const symbol = searchParams.get("symbol");

  if (id) {
    const wallet = await prisma.wallet.findUnique({ where: { id } });
    if (!wallet) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ wallet });
  }

  const wallets = await prisma.wallet.findMany({
    where: symbol ? { symbol: symbol.toUpperCase() } : {},
    orderBy: { createdAt: "desc" },
  });

  // Sanitize (omit privateKey)
  const sanitized = wallets.map(({ privateKey, ...w }) => w);
  return NextResponse.json({ count: sanitized.length, wallets: sanitized });
}

// POST: create wallet
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response!;
  try {
    const body = await request.json();
    const {
      coinId,
      symbol,
      name,
      network,
      address,
      publicKey,
      actualBalance = "0",
      balance = 0,
      profits = 0,
      frozen = 0,
      logo,
    } = body;

    if (!coinId || !symbol || !name || !network || !address || !publicKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const wallet = await prisma.wallet.create({
      data: {
        coinId,
        symbol: symbol.toUpperCase(),
        name,
        network,
        address,
        publicKey,
        actualBalance,
        balance,
        profits,
        frozen,
        logo,
      },
    });

    return NextResponse.json({ wallet }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Symbol already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH: update wallet fields
export async function PATCH(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response!;
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    // Prevent symbol uniqueness issues if changing
    if (updates.symbol) updates.symbol = updates.symbol.toUpperCase();

    const wallet = await prisma.wallet.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ wallet });
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (e.code === "P2002") return NextResponse.json({ error: "Duplicate symbol" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: only SUPERADMIN can delete
export async function DELETE(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response!;
  if (auth.ctx!.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query param required" }, { status: 400 });
  try {
    await prisma.wallet.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
