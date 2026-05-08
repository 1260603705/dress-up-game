// src/app/api/upload/route.ts
// POST: 上传图片 → 验证格式/大小 → 生成三种尺寸 → 返回URL
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');
const MAX_SIZE = 2 * 1024 * 1024;  // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) return NextResponse.json({ error: '未提供文件' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: '文件超过2MB限制' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: '仅支持PNG/JPEG/WebP' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });

  // 保存去元数据后的原图
  await sharp(buffer).toFile(path.join(UPLOAD_DIR, filename));

  // 生成缩略图 200px
  const thumbFilename = `thumb_${filename}`;
  await sharp(buffer).resize(200, 200, { fit: 'inside' }).toFile(path.join(UPLOAD_DIR, thumbFilename));

  // 生成展示图 800px
  const displayFilename = `display_${filename}`;
  await sharp(buffer).resize(800, 800, { fit: 'inside' }).toFile(path.join(UPLOAD_DIR, displayFilename));

  return NextResponse.json({
    original: `/uploads/${filename}`,
    thumbnail: `/uploads/${thumbFilename}`,
    display: `/uploads/${displayFilename}`,
  }, { status: 201 });
}
