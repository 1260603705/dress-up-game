import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(2).max(30),       // 用户名 2-30 字符
  email: z.string().email(),                  // 有效邮箱
  password: z.string().min(6),                // 密码至少 6 位
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { username, email, password } = parsed.data;

  // 检查重复
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) return NextResponse.json({ error: '邮箱或用户名已被注册' }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { username, email, passwordHash } });
  return NextResponse.json({ id: user.id }, { status: 201 });
}
