import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { Prisma } from "@/lib/generated/prisma";
import {
  buildSearchFilter,
  extractWalletPayload,
  getUserWithWallet,
  normalizeStatus,
  serializeUser,
  UserWithWallet,
} from "./_helpers";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const pageParam = Number(searchParams.get("page") ?? "1");
  const pageSizeParam = Number(searchParams.get("pageSize") ?? "1000");

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize =
    Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 100
      ? pageSizeParam
      : 300;

  const where = buildSearchFilter(search);
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { userWallet: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
  users: users.map((u) => serializeUser(u as UserWithWallet)),
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, { super: false });
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : undefined;
  const status = normalizeStatus(payload.status);
  const requestedUserId =
    typeof payload.userId === "number" && Number.isInteger(payload.userId)
      ? payload.userId
      : undefined;
  const walletUpdates = extractWalletPayload(payload.wallet ?? payload.balances);

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Email is invalid" }, { status: 400 });
  }

  if (requestedUserId !== undefined && requestedUserId <= 0) {
    return NextResponse.json({ error: "userId must be a positive integer" }, { status: 400 });
  }

  const nextUserId = await prisma.user
    .aggregate({
      _max: { userId: true },
    })
    .then((res) => (res._max.userId ?? 0) + 1);

  const userId = requestedUserId ?? nextUserId;

  try {
    const createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          status,
          userId,
        },
      });

      await tx.userWallet.create({
        data: {
          userId: user.id,
          ...(walletUpdates ?? {}),
        },
      });

      return user;
    });

    const fullUser = await getUserWithWallet({ id: createdUser.id });
    if (!fullUser) {
      return NextResponse.json({ error: "Failed to load created user" }, { status: 500 });
    }
    return NextResponse.json({ user: serializeUser(fullUser as UserWithWallet) }, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A user with this email or userId already exists" },
          { status: 409 },
        );
      }
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
