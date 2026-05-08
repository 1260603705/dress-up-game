// src/app/api/outfits/[id]/route.ts
// GET: 查看搭配详情 / PATCH: 更新名称或分享状态 / DELETE: 删除
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const outfit = await prisma.savedOutfit.findUnique({
    where: { id: params.id },
    include: { character: { select: { name: true } } },
  });
  if (!outfit) return NextResponse.json({ error: '未找到' }, { status: 404 });
  return NextResponse.json(outfit);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();

  const outfit = await prisma.savedOutfit.findFirst({ where: { id: params.id, userId } });
  if (!outfit) return NextResponse.json({ error: '未找到或无权修改' }, { status: 404 });

  const updated = await prisma.savedOutfit.update({
    where: { id: params.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.isShared !== undefined && { isShared: body.isShared }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const outfit = await prisma.savedOutfit.findFirst({ where: { id: params.id, userId } });
  if (!outfit) return NextResponse.json({ error: '未找到或无权删除' }, { status: 404 });

  await prisma.savedOutfit.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
