// 仓库 API - 单个物品详情 / 删除
// GET: 返回物品详情（含部件列表）
// DELETE: 仅 ownerId 匹配当前用户时允许删除

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.wardrobeItem.findUnique({
    where: { id: params.id }, include: { parts: true },
  });
  if (!item) return NextResponse.json({ error: '未找到' }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const item = await prisma.wardrobeItem.findUnique({ where: { id: params.id } });
  if (!item || item.ownerId !== userId) return NextResponse.json({ error: '无权删除' }, { status: 403 });
  await prisma.wardrobeItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
