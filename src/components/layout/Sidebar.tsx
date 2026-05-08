// src/components/layout/Sidebar.tsx — 左侧导航栏
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/home', label: '我的角色' },
  { href: '/wardrobe', label: '仓库' },
  { href: '/editor', label: '服装创作' },
  { href: '/forum', label: '社区' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-48 bg-gray-50 border-r min-h-[calc(100vh-56px)] p-4">
      <nav className="flex flex-col gap-1">
        {links.map(link => (
          <Link key={link.href} href={link.href}
            className={`px-3 py-2 rounded text-sm font-medium transition ${
              pathname === link.href ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-200'
            }`}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
