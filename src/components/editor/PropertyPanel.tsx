// src/components/editor/PropertyPanel.tsx
// 右栏：选中部件的属性编辑 — 骨骼锚点、偏移、缩放、旋转、颜色
'use client';
import { useDesignStore } from '@/stores/designStore';

const BONE_OPTIONS = ['head', 'neck', 'left_shoulder', 'right_shoulder', 'chest', 'waist',
  'left_hip', 'right_hip', 'left_wrist', 'right_wrist'];

export default function PropertyPanel() {
  const { parts, selectedPartId, selectPart, updatePart, removePart, reorderPart } = useDesignStore();
  const selected = parts.find(p => p.id === selectedPartId);

  return (
    <div className="w-72 bg-white border-l p-3 overflow-y-auto h-full">
      <h3 className="font-semibold text-sm mb-3">属性面板</h3>
      {selected ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block">锚点骨骼</label>
            <select value={selected.boneAnchor}
              onChange={e => updatePart(selected.id, { boneAnchor: e.target.value as any })}
              className="w-full border rounded px-2 py-1 text-sm">
              {BONE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block">X偏移</label>
              <input type="number" value={selected.offsetX} step={1}
                onChange={e => updatePart(selected.id, { offsetX: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Y偏移</label>
              <input type="number" value={selected.offsetY} step={1}
                onChange={e => updatePart(selected.id, { offsetY: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block">X缩放</label>
              <input type="number" value={selected.scaleX} step={0.05} min={0.5} max={2}
                onChange={e => updatePart(selected.id, { scaleX: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Y缩放</label>
              <input type="number" value={selected.scaleY} step={0.05} min={0.5} max={2}
                onChange={e => updatePart(selected.id, { scaleY: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block">旋转 (°)</label>
            <input type="number" value={selected.rotation} step={1}
              onChange={e => updatePart(selected.id, { rotation: Number(e.target.value) })}
              className="w-full border rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block">颜色</label>
            <div className="flex items-center gap-2">
              <input type="color" value={selected.colorHex || '#ffffff'}
                onChange={e => updatePart(selected.id, { colorHex: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border" />
              <input type="text" value={selected.colorHex || ''}
                onChange={e => updatePart(selected.id, { colorHex: e.target.value })}
                className="flex-1 border rounded px-2 py-1 text-sm" />
            </div>
          </div>
          <button onClick={() => removePart(selected.id)}
            className="w-full py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50">
            删除此部件
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">点击选中一个部件进行编辑</p>
      )}
      {/* 已添加部件列表（带上下排序按钮） */}
      <div className="mt-6">
        <h4 className="text-xs text-gray-500 mb-2">已添加部件</h4>
        <div className="space-y-1">
          {[...parts].sort((a, b) => a.zOrder - b.zOrder).map((part, idx) => (
            <button key={part.id} onClick={() => selectPart(part.id)}
              className={`w-full text-left text-xs px-2 py-1.5 rounded flex items-center justify-between ${
                selectedPartId === part.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}>
              <span>{part.templateId}</span>
              <span className="flex gap-1">
                <button onClick={e => { e.stopPropagation(); reorderPart(part.id, idx - 1); }}
                  disabled={idx === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">↑</button>
                <button onClick={e => { e.stopPropagation(); reorderPart(part.id, idx + 1); }}
                  disabled={idx === parts.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">↓</button>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
