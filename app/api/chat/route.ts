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
            message,
            who: 'user'
        }
    });
    
                try {
                        const broadcastUrl = process.env.WS_BROADCAST_URL;
                        const broadcastSecret = process.env.WS_BROADCAST_SECRET;
                        const payloads = [
                            { channel: `user:${user.id}`, payload: { type: 'message', chat } },
                            { channel: `userEmail:${user.email}`, payload: { type: 'message', chat } },
                        ];
                        if (broadcastUrl && broadcastSecret) {
                            await Promise.all(payloads.map(p => fetch(broadcastUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'x-ws-secret': broadcastSecret },
                                body: JSON.stringify(p),
                            }).catch(() => undefined)));
                        } else {
                            const broadcast = (global as any).chatBroadcast as ((ch: string, payload: any) => void) | undefined;
                            payloads.forEach(p => broadcast?.(p.channel, p.payload));
                        }
                } catch {}
        return NextResponse.json({ chat });
}