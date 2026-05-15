// 仓库 API - 获取服装列表
// 系统预设（ownerId=null）+ 当前用户的物品，支持分页和分类筛选

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  const where: any = { OR: [{ ownerId: null }, { ownerId: userId }] };
  if (category) where.category = category;
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [items, total] = await Promise.all([
    prisma.wardrobeItem.findMany({
      where, include: { parts: true },
      skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.wardrobeItem.count({ where }),
  ]);

  return NextResponse.json({ items, totalPages: Math.ceil(total / limit) });
}
