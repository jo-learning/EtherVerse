import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust path if needed

export async function POST(req: NextRequest) {
    const { message, address } = await req.json();

    if (!message || !address) {
        return NextResponse.json({ error: 'Missing message or address' }, { status: 400 });
    }

    // Find user by email (address)
    const user = await prisma.user.findUnique({
        where: { email: address }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create chat
    const chat = await prisma.chat.create({
        data: {
            userId: user.id,
            message
        }
    });

    return NextResponse.json({ chat });
}