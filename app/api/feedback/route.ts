import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { adminAuth } from "../../../lib/adminAuth";

export async function POST(req: Request) {
  try {
    const admin = await adminAuth();
    const { message, type, userId } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        message,
        type,
        userId: admin ? undefined : userId,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
