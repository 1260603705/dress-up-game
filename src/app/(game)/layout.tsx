// src/app/(game)/layout.tsx — 游戏区域布局（需登录）
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return <AppShell>{children}</AppShell>;
}
