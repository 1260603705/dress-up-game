// src/app/api/forum/posts/[id]/like/route.ts - 点赞（幂等：再点取消）
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId: params.id, userId } },
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }
  await prisma.like.create({ data: { postId: params.id, userId } });
  return NextResponse.json({ liked: true });
}
