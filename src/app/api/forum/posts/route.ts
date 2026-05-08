// src/app/api/forum/posts/route.ts - 帖子列表 + 发帖（每日3帖限制）
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().max(2000).optional(),
  imageUrl: z.string().max(500).optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.count(),
  ]);
  return NextResponse.json({ posts, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = await prisma.post.count({ where: { userId, createdAt: { gte: today } } });
  if (count >= 3) return NextResponse.json({ error: '今日发帖已达上限（3篇）' }, { status: 429 });

  const { title, content, imageUrl } = parsed.data;
  const post = await prisma.post.create({
    data: { userId, title, content: content || null, imageUrl: imageUrl || null },
    include: {
      user: { select: { id: true, username: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  return NextResponse.json(post, { status: 201 });
}
