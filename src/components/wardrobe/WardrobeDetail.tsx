// src/components/wardrobe/WardrobeDetail.tsx - 衣服详情弹窗
'use client';
import Modal from '@/components/shared/Modal';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { GarmentCategory } from '@/lib/types';

interface Props {
  item: { id: string; name: string; category: GarmentCategory; thumbnailUrl: string | null; createdByEditor: boolean };
  onClose: () => void; onWear: () => void;
}

export default function WardrobeDetail({ item, onClose, onWear }: Props) {
  return (
    <Modal onClose={onClose}>
      <div className="flex gap-6">
        <div className="w-64 h-64 bg-gray-100 rounded flex items-center justify-center">
          {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
            : <span className="text-gray-400">暂无预览</span>}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">{item.name}</h3>
          <p className="text-sm text-gray-500 mb-1">分类: {CATEGORY_LABELS[item.category]}</p>
          <p className="text-sm text-gray-500 mb-4">来源: {item.createdByEditor ? '自制' : '系统预设'}</p>
          <div className="flex gap-2">
            <button onClick={onWear} className="px-6 py-2 bg-purple-600 text-white rounded text-sm">穿戴</button>
            <button onClick={onClose} className="px-6 py-2 border rounded text-sm">关闭</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
