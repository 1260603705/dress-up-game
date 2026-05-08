// src/app/(game)/character/page.tsx — 角色列表页
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  gender: string;
  createdAt: string;
}

export default function CharacterListPage() {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    fetch('/api/avatar')
      .then((r) => r.json())
      .then(setCharacters)
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">我的角色</h2>
        <Link href="/character/create" className="px-4 py-2 bg-purple-600 text-white rounded text-sm">
          创建角色
        </Link>
      </div>

      {characters.length === 0 ? (
        <p className="text-gray-400 text-center py-12">暂无角色，点击右上角创建</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {characters.map((char) => (
            <Link
              key={char.id}
              href={`/character/create?id=${char.id}`}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="w-full aspect-square bg-gray-100 rounded mb-3 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">
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
