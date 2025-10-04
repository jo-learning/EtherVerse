import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = new URL('https://api.coingecko.com/api/v3/simple/price');
  for (const k of ['ids', 'vs_currencies', 'include_24hr_change']) {
    const v = searchParams.get(k);
    if (v) url.searchParams.set(k, v);
  }
  try {
    const r = await fetch(url.toString(), { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: r.ok ? 200 : r.status });
  } catch {
    return NextResponse.json({ error: 'upstream_unreachable' }, { status: 502 });
  }
}