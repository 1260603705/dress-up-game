// src/app/api/forum/posts/[id]/comments/route.ts - 评论（每日10条限制）
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';
import { z } from 'zod';

const schema = z.object({ content: z.string().min(1).max(500) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const count = await prisma.comment.count({ where: { userId, createdAt: { gte: today } } });
  if (count >= 10) return NextResponse.json({ error: '今日评论已达上限（10条）' }, { status: 429 });

  const comment = await prisma.comment.create({
    data: { postId: params.id, userId, content: parsed.data.content },
    include: { user: { select: { id: true, username: true } } },
  });
  return NextResponse.json(comment, { status: 201 });
}
