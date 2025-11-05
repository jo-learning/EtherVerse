import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

const WALLET_FIELDS = [
  'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'DAI', 'MATIC', 'XRP', 'SOL', 'ADA', 'DOGE', 'DOT', 'SHIB', 'TRX',
  'LTC', 'AVAX', 'WBTC', 'LINK', 'UNI', 'BCH', 'XLM', 'VET', 'THETA', 'FIL', 'ICP', 'AAVE', 'EOS', 'XMR',
  'ZEC', 'ALGO', 'ATOM', 'MKR', 'NEO', 'KSM', 'FTM', 'EGLD'
] as const;

type WalletField = typeof WALLET_FIELDS[number];

type Body = {
  address?: unknown;
  network?: unknown;
  balance?: unknown;
};

function normalizeSymbol(network: string): WalletField | null {
  const candidate = network.split('/')[0].trim().toUpperCase();
  return WALLET_FIELDS.includes(candidate as WalletField) ? (candidate as WalletField) : null;
}

function normalizePositiveDecimal(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(trimmed)) return null;
  const normalized = trimmed.startsWith('.') ? `0${trimmed}` : trimmed;
  const [intPartRaw, fracPartRaw = ''] = normalized.split('.');
  const intPart = intPartRaw.replace(/^0+(?!$)/, '') || '0';
  const fracPart = fracPartRaw.replace(/0+$/, '');
  return fracPart.length ? `${intPart}.${fracPart}` : intPart;
}

function addDecimalStrings(a: string, b: string): string {
  const [aInt, aFracRaw = ''] = a.split('.');
  const [bInt, bFracRaw = ''] = b.split('.');
  const maxFrac = Math.max(aFracRaw.length, bFracRaw.length);
  const base = BigInt(10) ** BigInt(maxFrac);
  const aFrac = maxFrac ? aFracRaw.padEnd(maxFrac, '0') : '';
  const bFrac = maxFrac ? bFracRaw.padEnd(maxFrac, '0') : '';
  const aScaled = BigInt(aInt) * base + BigInt(aFrac || '0');
  const bScaled = BigInt(bInt) * base + BigInt(bFrac || '0');
  const sum = aScaled + bScaled;
  if (maxFrac === 0) {
    return sum.toString();
  }
  const intPart = (sum / base).toString();
  const fracValue = sum % base;
  const fracStr = fracValue.toString().padStart(maxFrac, '0').replace(/0+$/, '');
  return fracStr.length ? `${intPart}.${fracStr}` : intPart;
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, { super: true });
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let address: string | undefined;
  let network: string | undefined;
  let balanceRaw: string | undefined;

  try {
    const body: Body = await req.json();
  address = typeof body.address === 'string' ? body.address.trim() : undefined;
    network = typeof body.network === 'string' ? body.network.trim() : undefined;
    if (typeof body.balance === 'number') {
      balanceRaw = body.balance.toString();
    } else if (typeof body.balance === 'string') {
      const trimmed = body.balance.trim();
      balanceRaw = trimmed.length ? trimmed : undefined;
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!address || !network || !balanceRaw) {
    return NextResponse.json({ error: 'address, network, and balance are required' }, { status: 400 });
  }
  const normalizedBalance = normalizePositiveDecimal(balanceRaw);
  if (!normalizedBalance || normalizedBalance === '0') {
    return NextResponse.json({ error: 'balance must be a positive decimal number' }, { status: 400 });
  }

  const symbol = normalizeSymbol(network);
  if (!symbol) {
    return NextResponse.json({ error: 'Unsupported network symbol' }, { status: 400 });
  }

  try {
  const lowered = address.toLowerCase();
  const user = await prisma.user.findFirst({ where: { OR: [ { email: address }, { email: lowered } ] } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wallet = await prisma.userWallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      return NextResponse.json({ error: 'User wallet not initialized' }, { status: 404 });
    }

    const walletData = wallet as unknown as Record<string, unknown>;
    if (!(symbol in walletData)) {
      return NextResponse.json({ error: 'Symbol not supported in user wallet' }, { status: 400 });
    }
    const currentRaw = walletData[symbol];
    const currentString = typeof currentRaw === 'string'
      ? currentRaw.trim()
      : typeof currentRaw === 'number'
        ? currentRaw.toString()
        : '0';
    const normalizedCurrent = normalizePositiveDecimal(currentString);
    if (normalizedCurrent === null) {
      return NextResponse.json({ error: 'Existing balance is invalid' }, { status: 500 });
    }

    const nextBalance = addDecimalStrings(normalizedCurrent, normalizedBalance);
    const updateData = { [symbol]: nextBalance } as Record<string, string>;

    const updatedWallet = await prisma.userWallet.update({
      where: { id: wallet.id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        [symbol]: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
      symbol,
      previousBalance: normalizedCurrent,
      newBalance: updatedWallet[symbol as keyof typeof updatedWallet],
      updatedAt: updatedWallet.updatedAt,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
