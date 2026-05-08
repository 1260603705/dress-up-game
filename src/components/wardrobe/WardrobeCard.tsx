// src/components/wardrobe/WardrobeCard.tsx - 单件衣服卡片
'use client';
interface Props { id: string; name: string; thumbnailUrl: string | null; onClick: () => void; }
export default function WardrobeCard({ name, thumbnailUrl, onClick }: Props) {
  return (
    <button onClick={onClick} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition">
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        {thumbnailUrl ? <img src={thumbnailUrl} alt={name} className="w-full h-full object-cover" />
          : <span className="text-gray-400 text-sm">暂无预览</span>}
      </div>
      <div className="p-2 text-sm text-center truncate">{name}</div>
    </button>
  );
}
