// src/app/api/design/route.ts
// POST: 保存玩家创作的服装（创建 wardrobeItem + N 个 itemParts + 自动入库，事务保证原子性）
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';
import { z } from 'zod';
import { GARMENT_LAYERS } from '@/lib/constants';
import type { GarmentCategory } from '@/lib/types';

const partSchema = z.object({
  partType: z.string(), templateId: z.string(), textureUrl: z.string().nullable().optional(),
  boneAnchor: z.string(), offsetX: z.number(), offsetY: z.number(),
  scaleX: z.number(), scaleY: z.number(), rotation: z.number(),
  colorHex: z.string().nullable().optional(), zOrder: z.number(),
});

const designSchema = z.object({
  name: z.string().min(1).max(30),
  category: z.enum(['top', 'bottom', 'dress', 'shoes', 'socks', 'accessory', 'hair']),
  previewThumbnail: z.string().optional(),
  parts: z.array(partSchema).min(1).max(15),  // 最少1个，最多15个部件
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = designSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, category, parts } = parsed.data;
  const layer = GARMENT_LAYERS[category as GarmentCategory] || 3;

  // 事务：创建衣服 + 部件 + 自动入库，任一失败全部回滚
  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.wardrobeItem.create({
      data: {
        ownerId: userId, name, category, layer,
        parts: { create: parts.map(p => ({
          partType: p.partType, templateId: p.templateId, textureUrl: p.textureUrl || null,
          boneAnchor: p.boneAnchor, offsetX: p.offsetX, offsetY: p.offsetY,
          scaleX: p.scaleX, scaleY: p.scaleY, rotation: p.rotation,
          colorHex: p.colorHex || null, zOrder: p.zOrder,
        }))},
      },
      include: { parts: true },
    });

    await tx.userInventory.create({ data: { userId, itemId: created.id } });

    return created;
  });

  return NextResponse.json(item, { status: 201 });
}
