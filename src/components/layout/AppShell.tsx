// src/components/layout/AppShell.tsx — 游戏外壳（SessionProvider + Navbar + Sidebar）
'use client';
import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </SessionProvider>
  );
}
