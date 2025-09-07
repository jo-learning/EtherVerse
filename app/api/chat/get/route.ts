import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust import paths as needed

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    if (!address) {
        return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
    }

    // Fetch user by email (address)
    const user = await prisma.user.findFirst({ where: { email: address } });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all chats for the user
    const chats = await prisma.chat.findMany({ where: {userId: user.id}  });

    return NextResponse.json({ chats });
}