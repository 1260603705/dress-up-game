// src/app/api/forum/posts/[id]/route.ts - 帖子详情 + 删除
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, username: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  if (!post) return NextResponse.json({ error: '未找到' }, { status: 404 });

  const comments = await prisma.comment.findMany({
    where: { postId: params.id },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, username: true } } },
  });
  return NextResponse.json({ post, comments });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post || post.userId !== userId) return NextResponse.json({ error: '无权删除' }, { status: 403 });
  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
