// src/components/forum/ShareOutfitForm.tsx
// 从换装页分享穿搭到论坛 — 快照自动作为帖子图片
'use client';
import { useState } from 'react';

interface Props {
  imageUrl: string;          // 已上传的快照URL
  onClose: () => void;
}

export default function ShareOutfitForm({ imageUrl, onClose }: Props) {
  const [title, setTitle] = useState('我的新穿搭');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const res = await fetch('/api/forum/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim() || null,
        imageUrl,
      }),
    });
    if (res.ok) {
      onClose();
      alert('分享成功！前往社区页面查看');
    } else {
      const data = await res.json();
      alert(data.error || '发布失败');
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">分享穿搭到社区</h2>

        {/* 快照预览 */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt="穿搭快照"
            className="w-full h-48 object-contain rounded bg-gray-50 mb-4"
          />
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="帖子标题"
          required
          className="w-full border rounded px-3 py-2 mb-3 text-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说说你的穿搭灵感..."
          rows={3}
          className="w-full border rounded px-3 py-2 mb-3 text-sm resize-none"
        />

        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 bg-purple-600 text-white rounded text-sm font-medium disabled:opacity-50"
          >
            {submitting ? '发布中...' : '发布到社区'}
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2 border rounded text-sm text-gray-500">
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
