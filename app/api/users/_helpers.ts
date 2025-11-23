import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";

export const COIN_FIELDS = [
  "BTC",
  "ETH",
  "USDT",
  "USDC",
  "BNB",
  "DAI",
  "MATIC",
  "XRP",
  "SOL",
  "ADA",
  "DOGE",
  "DOT",
  "SHIB",
  "TRX",
  "LTC",
  "AVAX",
  "WBTC",
  "LINK",
  "UNI",
  "BCH",
  "XLM",
  "VET",
  "THETA",
  "FIL",
  "ICP",
  "AAVE",
  "EOS",
  "XMR",
  "ZEC",
  "ALGO",
  "ATOM",
  "MKR",
  "NEO",
  "KSM",
  "FTM",
  "EGLD",
] as const;

export type CoinKey = (typeof COIN_FIELDS)[number];

export const USER_STATUS = ["active", "suspended", "banned"] as const;

export type UserStatus = (typeof USER_STATUS)[number];

const STATUS_SET = new Set<string>(USER_STATUS);

export async function getUserWithWallet(where: { id?: string; userId?: number; email?: string }) {
  if (!where.id && !where.userId && !where.email) return null;

  return prisma.user.findFirst({
    where,
    include: {
      userWallet: true,
    },
  });
}

export type UserWithWallet = NonNullable<Awaited<ReturnType<typeof getUserWithWallet>>>;

export type SerializableWallet = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  balances: Record<CoinKey, number>;
};

export type SerializableUser = {
  id: string;
  userId: number;
  email: string;
  name: string | null;
  avatar: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  googlefa: boolean;
  balances: Record<CoinKey, number>;
  wallet: SerializableWallet | null;
};

type WalletShape = UserWithWallet["userWallet"][number];

function extractBalances(wallet: WalletShape | null) {
  return COIN_FIELDS.reduce<Record<CoinKey, number>>((acc, coin) => {
    if (!wallet) {
      acc[coin] = 0;
      return acc;
    }
    const value = wallet[coin as keyof WalletShape];
    const parsed = typeof value === "string" ? Number(value) : Number(value ?? 0);
    acc[coin] = Number.isFinite(parsed) ? parsed : 0;
    return acc;
  }, {} as Record<CoinKey, number>);
}

export function serializeUser(user: UserWithWallet): SerializableUser {
  const walletRecord = user.userWallet[0] ?? null;
  const balances = extractBalances(walletRecord);

  return {
    id: user.id,
    userId: user.userId,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    googlefa: user.googlefa,
    status: normalizeStatus(user.status),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    balances,
    wallet: walletRecord
      ? {
          id: walletRecord.id,
          createdAt: walletRecord.createdAt,
          updatedAt: walletRecord.updatedAt,
          balances,
        }
      : null,
  };
}

export function buildSearchFilter(search: string | null): Prisma.UserWhereInput | undefined {
  if (!search) return undefined;

  const terms = search.trim();
  if (!terms) return undefined;

  const maybeNumber = Number(terms);

  const filter: Prisma.UserWhereInput = {
    OR: [
      { email: { contains: terms, mode: "insensitive" } },
      { name: { contains: terms, mode: "insensitive" } },
      ...(Number.isFinite(maybeNumber) ? [{ userId: maybeNumber as number }] : []),
    ],
  };

  return filter;
}

export function normalizeStatus(input: unknown, fallback: UserStatus = "active"): UserStatus {
  if (typeof input !== "string") return fallback;
  const next = input.trim().toLowerCase();
  return STATUS_SET.has(next) ? (next as UserStatus) : fallback;
}

export function extractWalletPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const balances = (payload as any).balances ?? payload;
  if (!balances || typeof balances !== "object") return null;

  const updates: Record<string, string> = {};
  let hasUpdate = false;

  for (const coin of COIN_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(balances, coin)) {
      const value = (balances as Record<string, unknown>)[coin];
      if (typeof value === "number" || typeof value === "string") {
        updates[coin] = String(value);
        hasUpdate = true;
      }
    }
  }

  return hasUpdate ? updates : null;
}
