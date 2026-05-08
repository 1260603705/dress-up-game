// src/app/api/avatar/[id]/route.ts
// GET: 获取角色详情 / PATCH: 更新参数或穿戴 / DELETE: 删除角色
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = parseInt((session.user as any).id, 10);
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: '无效的 ID' }, { status: 400 });

  const character = await prisma.character.findFirst({ where: { id, userId } });
  if (!character) return NextResponse.json({ error: '未找到' }, { status: 404 });
  return NextResponse.json(character);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = parseInt((session.user as any).id, 10);
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: '无效的 ID' }, { status: 400 });

  const body = await req.json();

  const result = await prisma.character.updateMany({
    where: { id, userId },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.custom_params && { customParams: body.custom_params }),
      ...(body.wearing !== undefined && { wearing: body.wearing }),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = parseInt((session.user as any).id, 10);
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ error: '无效的 ID' }, { status: 400 });

  await prisma.character.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
