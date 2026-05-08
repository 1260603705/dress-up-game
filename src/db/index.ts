// Prisma 客户端单例
// 防止 Next.js 热重载时创建多个实例

import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 后续接入真实数据库时配置 adapter 或 accelerateUrl
  } as any);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
