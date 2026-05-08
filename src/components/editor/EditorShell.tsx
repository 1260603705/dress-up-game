// src/components/editor/EditorShell.tsx
// 编辑器三栏布局 + 顶部工具栏（名称/分类/保存/清空）
'use client';
import PartLibrary from './PartLibrary';
import PropertyPanel from './PropertyPanel';
import EditorCanvas from './EditorCanvas';
import { useDesignStore } from '@/stores/designStore';
import { useRouter } from 'next/navigation';
import { GARMENT_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
import type { GarmentCategory } from '@/lib/types';

export default function EditorShell() {
  const { category, name, parts, setCategory, setName, clearDesign } = useDesignStore();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) { alert('请输入衣服名称'); return; }
    if (parts.length === 0) { alert('请至少添加一个部件'); return; }

    const body = { name: name.trim(), category, previewThumbnail: '',
      parts: parts.map(({ id, ...rest }) => rest),
    };

    const res = await fetch('/api/design', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { alert('保存失败'); return; }
    clearDesign();
    router.push('/wardrobe');
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部工具栏 */}
      <div className="flex items-center gap-4 px-3 py-2 bg-white border-b">
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="输入衣服名称..." className="border rounded px-3 py-1 text-sm flex-1 max-w-xs" />
        <select value={category} onChange={e => setCategory(e.target.value as GarmentCategory)}
          className="border rounded px-2 py-1 text-sm">
          {GARMENT_CATEGORIES.filter(c => c !== 'hair' && c !== 'socks' && c !== 'accessory').map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <button onClick={handleSave} className="px-6 py-1.5 bg-purple-600 text-white rounded text-sm">保存</button>
        <button onClick={clearDesign} className="px-4 py-1.5 border rounded text-sm text-gray-500">清空</button>
      </div>
      {/* 三栏编辑区 */}
      <div className="flex flex-1 overflow-hidden">
        <PartLibrary />
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-4">
          <EditorCanvas />
        </div>
        <PropertyPanel />
      </div>
    </div>
  );
}
