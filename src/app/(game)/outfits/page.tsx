// src/app/(game)/outfits/page.tsx
// 搭配方案管理页面
import OutfitGrid from '@/components/outfit/OutfitGrid';

export default function OutfitsPage() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">我的搭配方案</h2>
      <OutfitGrid />
    </div>
  );
}
