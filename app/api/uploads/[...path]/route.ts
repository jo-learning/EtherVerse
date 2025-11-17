import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import path from 'path';
import { stat } from 'fs/promises';
import { Readable } from 'stream';

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

export async function GET(req: Request, context: any) {
  const params = await context.params;
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  const segments = Array.isArray(params?.path) ? params.path : [];
  const requestedPath = path.resolve(uploadsDir, ...segments);

  if (!requestedPath.startsWith(uploadsDir)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  let fileStat;
  try {
    fileStat = await stat(requestedPath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const ext = path.extname(requestedPath).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[ext] ?? 'application/octet-stream';
  const nodeStream = createReadStream(requestedPath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new Response(webStream, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': fileStat.size.toString(),
    },
  });
}
