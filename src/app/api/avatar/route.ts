// src/app/api/avatar/route.ts
// GET: 获取当前用户的角色列表 / POST: 创建新角色
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(30),             // 角色名 1-30 字符
  gender: z.enum(['male', 'female']),
  custom_params: z.any(),                       // 捏人参数JSON
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = parseInt((session.user as any).id, 10);
  const characters = await prisma.character.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },              // 最新角色排前面
  });
  return NextResponse.json(characters);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = parseInt((session.user as any).id, 10);
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, gender, custom_params } = parsed.data;
  const character = await prisma.character.create({
    data: { userId, name, gender, customParams: custom_params },
  });
  return NextResponse.json(character, { status: 201 });
}
