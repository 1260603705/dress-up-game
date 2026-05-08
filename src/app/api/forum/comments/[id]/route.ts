// src/app/api/forum/comments/[id]/route.ts - 删评论（仅本人）
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment || comment.userId !== userId) return NextResponse.json({ error: '无权删除' }, { status: 403 });
  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
