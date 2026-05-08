// src/components/outfit/OutfitCard.tsx
// 搭配方案卡片 — 缩略图 + 名称 + 操作按钮
'use client';

interface OutfitData {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  isShared: boolean;
  createdAt: string;
  character?: { name: string };
}

interface Props {
  outfit: OutfitData;
  onApply: () => void;
  onDelete: () => void;
}

export default function OutfitCard({ outfit, onApply, onDelete }: Props) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition">
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        {outfit.thumbnailUrl ? (
          <img src={outfit.thumbnailUrl} alt={outfit.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">暂无预览</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{outfit.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {outfit.character?.name || '未知角色'} · {new Date(outfit.createdAt).toLocaleDateString('zh-CN')}
        </p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={onApply}
            className="flex-1 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition"
          >
            应用
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 border border-red-200 text-red-500 rounded text-xs hover:bg-red-50 transition"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
