// src/app/api/outfits/route.ts
// GET: 获取当前用户的搭配方案列表 / POST: 保存新搭配
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';
import { z } from 'zod';

const createSchema = z.object({
  characterId: z.string().uuid(),
  name: z.string().min(1).max(30),
  outfitData: z.any(),
  thumbnailUrl: z.string().max(500).optional().nullable(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const characterId = searchParams.get('characterId');

  const where: any = { userId };
  if (characterId) where.characterId = characterId;

  const outfits = await prisma.savedOutfit.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { character: { select: { name: true } } },
  });
  return NextResponse.json(outfits);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // 验证角色归属
  const character = await prisma.character.findFirst({
    where: { id: parsed.data.characterId, userId },
  });
  if (!character) return NextResponse.json({ error: '角色不存在' }, { status: 404 });

  const outfit = await prisma.savedOutfit.create({
    data: {
      userId,
      characterId: parsed.data.characterId,
      name: parsed.data.name,
      outfitData: parsed.data.outfitData,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
    },
  });
  return NextResponse.json(outfit, { status: 201 });
}
