// src/app/(game)/home/page.tsx — 首页（角色展示）
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  gender: string;
  createdAt: string;
}

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/avatar')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCharacters(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">我的角色</h2>
        <Link href="/character/create" className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition">
          创建角色
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center py-12">加载中...</p>
      ) : characters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">还没有角色</p>
          <Link href="/character/create" className="text-purple-600 hover:underline text-sm">
            创建你的第一个角色
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {characters.map((char) => (
            <Link
              key={char.id}
              href={`/character/create?id=${char.id}`}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded mb-3 flex items-center justify-center">
                <span className="text-gray-500 text-3xl font-bold">
                  {char.gender === 'female' ? '♀' : '♂'}
                </span>
              </div>
              <p className="text-sm font-medium text-center truncate">{char.name}</p>
              <p className="text-xs text-gray-400 text-center mt-1">
                {new Date(char.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
