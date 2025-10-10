import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import path from 'path';
import { promises as fs } from 'fs';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

async function saveFile(dir: string, file: File | null, name: string) {
  if (!file) return undefined;
  await fs.mkdir(dir, { recursive: true });
  const ext = path.extname((file as any).name || '') || '.jpg';
  const fname = `${name}-${Date.now()}${ext}`;
  const filePath = path.join(dir, fname);
  const arr = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arr));
  // Public URL path (served from /public)
  const publicPath = filePath.split(`${path.sep}public${path.sep}`)[1];
  return `/${publicPath.replace(/\\/g, '/')}`;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // Identify user (require existing user)
    const email = String(form.get('email') || '').trim();
    const userId = String(form.get('userId') || '').trim();

    let user: any = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }
    if (!user) {
      return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
    }

    // Fields from UI
    const firstName = String(form.get('firstName') || '').trim();
    const lastName = String(form.get('lastName') || '').trim();
    const country = String(form.get('country') || '').trim();
    const certificateType = String(form.get('certificateType') || '').trim();
    const certificateNumber = String(form.get('certificateNumber') || '').trim();
    const phone = String(form.get('idPhone') || '').trim();

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 });
    }

    // Files
    const idFront = form.get('idFront') as unknown as File | null;
    const idBack = form.get('idBack') as unknown as File | null;
    const handHeld = form.get('handHeld') as unknown as File | null;

    const baseDir = path.join(process.cwd(), 'public', 'uploads', 'kyc', user.id);
    const idFrontPath = await saveFile(baseDir, idFront, 'id-front');
    const idBackPath = await saveFile(baseDir, idBack, 'id-back');
    const handHeldPath = await saveFile(baseDir, handHeld, 'hand-held');

    // Create or update KYC for user (status stays pending)
    const kyc = await prisma.kYC.upsert({
      where: { userId: user.id },
      update: {
        firstName,
        lastName,
        Email: email || user.email,
        Place: country || '',
        country,
        certificateType,
        certificateNumber,
        phone,
        idFrontPath,
        idBackPath,
        handHeldPath,
        status: 'pending',
        submittedAt: new Date(),
        metadata: {
          set: {
            userAgent: req.headers.get('user-agent') || '',
            country,
            certificateType,
          },
        },
      },
      create: {
        userId: user.id,
        firstName,
        lastName,
        Email: email || user.email,
        Place: country || '',
        Brithdate: '',
        country,
        certificateType,
        certificateNumber,
        phone,
        idFrontPath,
        idBackPath,
        handHeldPath,
        status: 'pending',
      },
    });

    return NextResponse.json({ ok: true, status: kyc.status, kycId: kyc.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'kyc_submit_failed' }, { status: 500 });
  }
}