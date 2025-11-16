import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { Prisma } from "@/lib/generated/prisma";
import { extractWalletPayload, getUserWithWallet, normalizeStatus, serializeUser } from "../_helpers";

type RouteContext = {
  params: {
    id: string;
  };
};

function normalizeString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function parseUserId(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isInteger(parsed)) return parsed;
  }
  return undefined;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const user = await getUserWithWallet({ id: params.id });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: serializeUser(user) });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const userId = params.id;
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const email = normalizeString(payload.email);
  const name = payload.name === null ? null : normalizeString(payload.name);
  const statusProvided = Object.prototype.hasOwnProperty.call(payload, "status");
  const numericUserId = parseUserId(payload.userId);
  const walletUpdates = extractWalletPayload(payload.wallet ?? payload.balances);

  const updates: Record<string, unknown> = {};
  if (email) updates.email = email;
  if (name !== undefined) updates.name = name;
  if (statusProvided) {
    updates.status = normalizeStatus(payload.status, normalizeStatus(existingUser.status));
  }
  if (numericUserId !== undefined) updates.userId = numericUserId;

  if (!Object.keys(updates).length && !walletUpdates) {
    return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (Object.keys(updates).length) {
        await tx.user.update({
          where: { id: userId },
          data: updates,
        });
      }

      if (walletUpdates) {
        await tx.userWallet.upsert({
          where: { userId },
          create: {
            userId,
            ...walletUpdates,
          },
          update: walletUpdates,
        });
      }
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A user with this email or userId already exists" },
          { status: 409 },
        );
      }
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }

  const updatedUser = await getUserWithWallet({ id: userId });
  if (!updatedUser) {
    return NextResponse.json({ error: "Failed to load updated user" }, { status: 500 });
  }

  return NextResponse.json({ user: serializeUser(updatedUser) });
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(req);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = params.id;
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.chat.deleteMany({ where: { userId } });
      await tx.transaction.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.settings.deleteMany({ where: { userId } });
      await tx.kYC.deleteMany({ where: { userId } });
      await tx.adminUserAssignment.deleteMany({ where: { userId } });
      await tx.userWallet.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
