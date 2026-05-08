// src/components/outfit/SaveOutfitForm.tsx
// 保存搭配弹窗 — 输入名称 + 快照缩略图 + 提交
'use client';
import { useState } from 'react';
import { useOutfitStore } from '@/stores/outfitStore';

interface Props {
  characterId: string | null;
  outfitData: any;           // WearingEntry[] — 当前角色的穿戴数据
  snapshotBase64?: string;   // Canvas 快照 base64（可选）
  onClose: () => void;
}

export default function SaveOutfitForm({ characterId, outfitData, snapshotBase64, onClose }: Props) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const addOutfit = useOutfitStore((s) => s.addOutfit);

  // 将 base64 快照上传到服务器
  async function handleCapture() {
    if (!snapshotBase64) return;
    setUploading(true);
    try {
      const blob = await (await fetch(snapshotBase64)).blob();
      const form = new FormData();
      form.append('file', blob, 'outfit_snapshot.png');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        setThumbnailUrl(data.thumbnail);
      }
    } catch {
      // 上传失败不影响保存
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!name.trim() || !characterId) return;
    setSaving(true);
    const res = await fetch('/api/outfits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterId,
        name: name.trim(),
        outfitData,
        thumbnailUrl: thumbnailUrl || null,
      }),
    });
    if (res.ok) {
      const outfit = await res.json();
      addOutfit(outfit);
      onClose();
    } else {
      const data = await res.json();
      alert(data.error || '保存失败');
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">保存搭配方案</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="搭配名称（如：夏日清凉）"
          className="w-full border rounded px-3 py-2 mb-3 text-sm"
          maxLength={30}
          required
        />

        {/* 快照预览 + 上传按钮 */}
        {snapshotBase64 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={handleCapture}
                disabled={uploading}
                className="px-3 py-1 border rounded text-xs hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? '上传中...' : thumbnailUrl ? '重新上传' : '上传快照做封面'}
              </button>
            </div>
            {thumbnailUrl && (
              <img src={thumbnailUrl} alt="预览" className="w-full h-32 object-contain rounded bg-gray-50" />
            )}
            {!thumbnailUrl && snapshotBase64 && (
              <img src={snapshotBase64} alt="快照" className="w-full h-32 object-contain rounded bg-gray-50 opacity-60" />
            )}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 py-2 bg-purple-600 text-white rounded text-sm font-medium disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button onClick={onClose} className="px-6 py-2 border rounded text-sm text-gray-500">
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
