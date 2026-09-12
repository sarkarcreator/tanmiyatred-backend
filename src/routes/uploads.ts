import { Router, type Request } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { requireAuth } from '@/middleware/auth';

const router = Router();

const uploadRoot = path.resolve(process.env.MEDIA_UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
const configuredPublicBase = (process.env.MEDIA_PUBLIC_BASE_URL || '').replace(/\/$/, '');
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;
const ALLOWED_PREFIXES = ['image/', 'video/'];
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
  'image/avif': '.avif', 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
  'application/pdf': '.pdf', 'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
};
const ALLOWED_DOCUMENTS = new Set([
  'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

function safeName(original: string, mime: string) {
  const base = original.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(-80) || 'media';
  const originalExt = path.extname(base);
  const ext = EXTENSIONS[mime] || originalExt;
  const stem = path.basename(base, originalExt).slice(0, 60) || 'media';
  return `${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${stem}${ext}`;
}

function mediaBaseUrl(req: Request) {
  if (configuredPublicBase) return configuredPublicBase;
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  return `${protocol}://${req.get('host')}`;
}

async function parseMultipart(req: NodeJS.ReadableStream & { headers: Record<string, string | string[] | undefined> }) {
  const contentType = String(req.headers['content-type'] || '');
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!match) throw new Error('Multipart boundary is missing.');
  const boundary = Buffer.from(`--${match[1] || match[2]}`);
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req as AsyncIterable<Buffer>) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > MAX_TOTAL_BYTES) throw new Error('Total upload size exceeds 100 MB.');
    chunks.push(buf);
  }
  const body = Buffer.concat(chunks);
  const parts: Array<{ filename: string; mime: string; data: Buffer }> = [];
  let cursor = 0;
  while (cursor < body.length) {
    const start = body.indexOf(boundary, cursor);
    if (start === -1) break;
    const partStart = start + boundary.length;
    if (body.subarray(partStart, partStart + 2).toString() === '--') break;
    const headerStart = partStart + (body.subarray(partStart, partStart + 2).toString() === '\r\n' ? 2 : 0);
    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), headerStart);
    if (headerEnd === -1) break;
    const headers = body.subarray(headerStart, headerEnd).toString('utf8');
    const disposition = headers.match(/Content-Disposition:[^\r\n]*filename="([^"]*)"/i);
    const mimeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
    const nextBoundary = body.indexOf(boundary, headerEnd + 4);
    if (nextBoundary === -1) break;
    const dataEnd = nextBoundary - 2;
    if (disposition?.[1] && mimeMatch?.[1]) {
      const data = body.subarray(headerEnd + 4, dataEnd);
      parts.push({ filename: disposition[1], mime: mimeMatch[1].trim().toLowerCase(), data });
    }
    cursor = nextBoundary;
  }
  return parts;
}

router.post('/', requireAuth, async (req, res) => {
  try {
    const parts = await parseMultipart(req);
    if (!parts.length) return res.status(400).json({ success: false, error: 'No media file was uploaded.' });
    await fs.mkdir(uploadRoot, { recursive: true });
    const files: Array<{ url: string; filename: string; mime: string; size: number }> = [];
    for (const part of parts) {
      const isMedia = ALLOWED_PREFIXES.some((prefix) => part.mime.startsWith(prefix));
      const isDocument = ALLOWED_DOCUMENTS.has(part.mime);
      if (!isMedia && !isDocument) return res.status(400).json({ success: false, error: `Unsupported file type: ${part.mime}` });
      if (!EXTENSIONS[part.mime]) return res.status(400).json({ success: false, error: `Unsupported file format: ${part.mime}` });
      if (part.data.length > MAX_FILE_BYTES) return res.status(413).json({ success: false, error: `${part.filename} exceeds the 50 MB per-file limit.` });
      const filename = safeName(part.filename, part.mime);
      await fs.writeFile(path.join(uploadRoot, filename), part.data);
      files.push({ url: `${mediaBaseUrl(req)}/uploads/${encodeURIComponent(filename)}`, filename, mime: part.mime, size: part.data.length });
    }
    return res.status(201).json({ success: true, data: files.length === 1 ? files[0] : { files } });
  } catch (error) {
    console.error('[Tanmiyat Upload]', error);
    return res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Upload failed.' });
  }
});

export default router;
