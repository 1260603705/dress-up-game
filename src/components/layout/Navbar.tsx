// src/components/layout/Navbar.tsx — 顶部导航栏
'use client';
import { signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="h-14 bg-white border-b flex items-center justify-between px-6">
      <h1 className="font-bold text-lg text-purple-700">DressUp</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user?.name}</span>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-gray-500 hover:text-gray-700">退出</button>
      </div>
    </nav>
  );
}
