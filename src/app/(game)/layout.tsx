// src/app/(game)/layout.tsx — 游戏区域布局（服务端组件：获取session传给客户端，避免hydration不匹配）
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return <AppShell session={session}>{children}</AppShell>;
}
