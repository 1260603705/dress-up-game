// src/app/(game)/character/page.tsx — 角色列表页
import Link from 'next/link';
export default function CharacterListPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">我的角色</h2>
        <Link href="/character/create" className="px-4 py-2 bg-purple-600 text-white rounded text-sm">创建角色</Link>
      </div>
      <p className="text-gray-500">暂无角色（接入API后从数据库加载）</p>
    </div>
  );
}
