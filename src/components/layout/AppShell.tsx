// src/components/layout/AppShell.tsx — 游戏外壳（接收服务端session避免hydration不匹配）
'use client';
import { SessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Session } from 'next-auth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function AuthGuard({ children }: { children: React.ReactNode }) {
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

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </>
  );
}

export default function AppShell({ children, session }: { children: React.ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session}>
      <AuthGuard>{children}</AuthGuard>
    </SessionProvider>
  );
}
