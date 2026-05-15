// src/components/home/MemoryAlbum.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface OutfitItem {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  character?: { name: string } | null;
}

interface Props {
  characterId: string | null;
}

export default function MemoryAlbum({ characterId }: Props) {
  const [outfits, setOutfits] = useState<OutfitItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = characterId ? `?characterId=${characterId}` : '';
    fetch(`/api/outfits${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOutfits(data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [characterId]);

  return (
    <div className="flex-1 min-w-0">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold" style={{ color: 'var(--game-text-secondary)' }}>
          记忆相册
        </span>
        <Link
          href="/outfits"
          className="text-xs hover:underline"
          style={{ color: 'var(--game-accent)' }}
        >
          查看全部
        </Link>
      </div>

      {/* 相册网格 — 5列，极小缩略图 */}
      {loading ? (
        <div className="grid grid-cols-5 gap-1">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-sm bg-gray-100 animate-pulse"
              style={{ maxWidth: 30, maxHeight: 30 }}
            />
          ))}
        </div>
      ) : outfits.length === 0 ? (
        <p className="text-[10px]" style={{ color: 'var(--game-text-muted)' }}>
          暂无记忆
        </p>
      ) : (
        <div className="grid grid-cols-5 gap-1">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="aspect-square rounded-sm flex items-center justify-center overflow-hidden"
              style={{
                maxWidth: 30,
                maxHeight: 30,
                background: 'var(--game-sidebar-icon-bg)',
              }}
            >
              {outfit.thumbnailUrl ? (
                <img
                  src={outfit.thumbnailUrl}
                  alt={outfit.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--game-text-muted)">
                  <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>
                </svg>
              )}
            </div>
          ))}
          {outfits.length < 5 && (
            <Link
              href="/outfits"
              className="aspect-square rounded-sm border border-dashed flex items-center justify-center text-xs"
              style={{
                maxWidth: 30,
                maxHeight: 30,
                borderColor: 'var(--game-border-hover)',
                color: 'var(--game-text-muted)',
              }}
            >
              +
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
