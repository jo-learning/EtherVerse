import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.name);
    const originalName = file.name.replace(fileExtension, "");
    const newFilename = `${originalName}-${uniqueSuffix}${fileExtension}`;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chat");
    
    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const uploadPath = path.join(uploadDir, newFilename);

    await writeFile(uploadPath, buffer);

    const filePath = `/uploads/chat/${newFilename}`;
    return NextResponse.json({ success: true, filePath });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}