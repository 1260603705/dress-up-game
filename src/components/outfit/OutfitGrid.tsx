// src/components/outfit/OutfitGrid.tsx
// 搭配方案网格 — 从API加载列表 + 分页
'use client';
import { useEffect } from 'react';
import { useOutfitStore } from '@/stores/outfitStore';
import { useCharacterStore } from '@/stores/characterStore';
import OutfitCard from './OutfitCard';

export default function OutfitGrid() {
  const { outfits, setOutfits, removeOutfit } = useOutfitStore();
  const setWearing = useCharacterStore((s) => s.setWearing);

  useEffect(() => {
    fetch('/api/outfits')
      .then((r) => r.json())
      .then(setOutfits);
  }, []);

  async function handleApply(outfit: any) {
    // 将搭配数据应用到当前角色穿戴
    if (outfit.outfitData && Array.isArray(outfit.outfitData)) {
      setWearing(outfit.outfitData);
    }
    alert('搭配已应用，前往角色页面查看效果');
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除这套搭配方案？')) return;
    const res = await fetch(`/api/outfits/${id}`, { method: 'DELETE' });
    if (res.ok) removeOutfit(id);
  }

  if (outfits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">暂无搭配方案</p>
        <p className="text-sm mt-1">在角色页面保存当前的穿戴搭配</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {outfits.map((o) => (
        <OutfitCard
          key={o.id}
          outfit={o}
          onApply={() => handleApply(o)}
          onDelete={() => handleDelete(o.id)}
        />
      ))}
    </div>
  );
}
