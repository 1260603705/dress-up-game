// src/app/(game)/layout.tsx — 游戏区域布局（需登录）
import AppShell from '@/components/layout/AppShell';
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
