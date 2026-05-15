// src/app/(game)/home/page.tsx — 首页（左预览 + 右：档案/相册/仓库/保存）
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
  const [saving, setSaving] = useState(false);
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
    setSaving(true);
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
    setSaving(false);
  };

  return (
    <div className="flex gap-6 h-full max-w-6xl mx-auto">
      {/* 左栏：角色预览 */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <CharacterPreview
          characters={characters}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {/* 右栏：档案 + 记忆相册 + 仓库 + 保存 */}
      <div className="w-[360px] flex-shrink-0 overflow-y-auto flex flex-col gap-4 max-h-[calc(100vh-56px-3rem)] pb-4">
        <ProfileCard character={selectedChar} />

        {/* 记忆相册 */}
        <div className="bg-game-surface rounded-2xl p-5 shadow-md border-2 border-game-border">
          <MemoryAlbum key={albumKey} characterId={selectedId} />
        </div>

        {/* 我的仓库 */}
        <div className="bg-game-surface rounded-2xl p-5 shadow-md border-2 border-game-border">
          <h3 className="text-base font-bold mb-3 text-game-text-secondary">我的仓库</h3>
          <WardrobeGrid characterId={selectedId} onSaveOutfit={handleSaveOutfit} />
        </div>
      </div>
    </div>
  );
}
