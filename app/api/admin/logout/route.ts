import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );
    response.cookies.set("admin_session", "", { maxAge: 0 });
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred during logout." },
      { status: 500 }
    );
  }
}

