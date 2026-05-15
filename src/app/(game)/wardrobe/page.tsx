// src/app/(game)/wardrobe/page.tsx — 衣橱：左预览 + 右仓库
'use client';
import dynamic from 'next/dynamic';
import WardrobeGrid from '@/components/wardrobe/WardrobeGrid';
import { useCharacterStore } from '@/stores/characterStore';

const CharacterCanvas = dynamic(
  () => import('@/components/character/CharacterCanvas'),
  { ssr: false },
);

export default function WardrobePage() {
  const wearing = useCharacterStore((s) => s.wearing);
  const characterId = useCharacterStore((s) => s.characterId);

  const handleSaveOutfit = () => {
    // wardrobe 独立页面暂不支持保存穿搭，跳转到首页操作
    alert('请前往首页保存穿搭');
  };

  return (
    <div className="flex gap-8 h-full ml-2">
      {/* 左栏：角色穿上效果预览 */}
      <div className="w-[280px] flex-shrink-0 flex flex-col gap-3">
        <h3 className="text-base font-bold text-[#715a4c]">穿搭预览</h3>
        <div className="bg-white rounded-2xl p-3 shadow-sm flex items-center justify-center">
          <CharacterCanvas />
        </div>
        {wearing.length > 0 && (
          <p className="text-xs text-gray-600 text-center">
            已穿戴 {wearing.length} 件
          </p>
        )}
      </div>

      {/* 右栏：仓库网格 */}
      <div className="flex-1 min-w-0 overflow-auto">
        <h2 className="text-base font-bold mb-3 text-[#715a4c]">我的仓库</h2>
        <WardrobeGrid characterId={characterId} onSaveOutfit={handleSaveOutfit} />
      </div>
    </div>
  );
}
