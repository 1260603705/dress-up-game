// src/app/(game)/home/page.tsx — 首页（左45%预览 + 右55%面板）
'use client';
import { useEffect, useState, useCallback } from 'react';
import CharacterPreview from '@/components/home/CharacterPreview';
import ProfileCard from '@/components/home/ProfileCard';
import MemoryAlbum from '@/components/home/MemoryAlbum';
import WardrobeGrid from '@/components/wardrobe/WardrobeGrid';
import { useCharacterStore } from '@/stores/characterStore';

interface CharItem {
  id: string;
  name: string;
  gender: string;
}

export default function HomePage() {
  const [characters, setCharacters] = useState<CharItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [albumKey, setAlbumKey] = useState(0);
  const selectedChar = characters.find((c) => c.id === selectedId) ?? null;
  const { setParams, setWearing, setCharacterId, wearing } = useCharacterStore();

  // 加载角色列表
  useEffect(() => {
    fetch('/api/avatar')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCharacters(data);
          setSelectedId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // 选中角色时同步 store
  useEffect(() => {
    if (!selectedId) return;
    setCharacterId(selectedId);
    fetch(`/api/avatar/${selectedId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.customParams) setParams(data.customParams);
        if (data.wearing) setWearing(data.wearing);
      })
      .catch(() => {});
  }, [selectedId, setParams, setWearing, setCharacterId]);

  // 保存穿搭
  const handleSaveOutfit = async () => {
    if (!selectedId) { alert('请先创建角色'); return; }
    if (wearing.length === 0) { alert('请先从仓库穿戴衣服'); return; }
    const name = prompt('给这套搭配起个名字：');
    if (!name?.trim()) return;
    try {
      const res = await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: selectedId,
          name: name.trim(),
          outfitData: wearing,
        }),
      });
      if (res.ok) {
        setAlbumKey((k) => k + 1);
      } else {
        const data = await res.json();
        alert(data.error || '保存失败');
      }
    } catch {
      alert('网络错误');
    }
  };

  return (
    <div className="flex gap-3 h-full max-w-6xl mx-auto">
      {/* 左栏：角色预览 45% */}
      <div className="min-w-0 flex flex-col gap-4" style={{ width: '45%' }}>
        <CharacterPreview
          characters={characters}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {/* 右栏 55% */}
      <div
        className="min-w-0 overflow-y-auto flex flex-col gap-3 max-h-[calc(100vh-56px-3rem)] pb-4"
        style={{ width: '55%' }}
      >
        {/* 1. 简介 + 记忆相册 并排一行 */}
        <div
          className="flex items-center gap-4 rounded-2xl p-4"
          style={{
            background: 'var(--game-surface)',
            border: '2px solid var(--game-border)',
          }}
        >
          <ProfileCard character={selectedChar} />
          <MemoryAlbum key={albumKey} characterId={selectedId} />
        </div>

        {/* 2. 我的仓库 */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'var(--game-surface)',
            border: '2px solid var(--game-border)',
          }}
        >
          <h3
            className="text-base font-bold mb-3"
            style={{ color: 'var(--game-text-secondary)' }}
          >
            我的仓库
          </h3>
          <WardrobeGrid characterId={selectedId} onSaveOutfit={handleSaveOutfit} />
        </div>
      </div>
    </div>
  );
}
