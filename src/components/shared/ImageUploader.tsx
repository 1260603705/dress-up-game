// src/components/shared/ImageUploader.tsx - 通用图片上传组件
'use client';
import { useState } from 'react';

export default function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('图片不能超过2MB'); return; }
    setUploading(true);
    const form = new FormData(); form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (res.ok) { const data = await res.json(); onUploaded(data.display); setPreview(data.display); }
    else { alert('上传失败'); }
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">图片（可选）</label>
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="text-sm" />
      {uploading && <p className="text-sm text-purple-500 mt-1">上传中...</p>}
      {preview && <img src={preview} alt="preview" className="mt-2 max-h-32 rounded" />}
    </div>
  );
}
