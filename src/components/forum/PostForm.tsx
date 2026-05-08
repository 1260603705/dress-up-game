// src/components/forum/PostForm.tsx - 发帖弹窗
'use client';
import { useState } from 'react';
import ImageUploader from '@/components/shared/ImageUploader';

export default function PostForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!title.trim()) return; setSubmitting(true);
    const res = await fetch('/api/forum/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), content: content.trim(), imageUrl }),
    });
    if (res.ok) { onClose(); window.location.reload(); }
    else { alert('发布失败'); }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">发布新帖</h2>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="标题" required className="w-full border rounded px-3 py-2 mb-3 text-sm" />
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="说点什么..." rows={4} className="w-full border rounded px-3 py-2 mb-3 text-sm resize-none" />
        <ImageUploader onUploaded={setImageUrl} />
        <div className="flex gap-2 mt-4">
          <button type="submit" disabled={submitting}
            className="flex-1 py-2 bg-purple-600 text-white rounded text-sm font-medium disabled:opacity-50">
            {submitting ? '发布中...' : '发布'}
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2 border rounded text-sm">取消</button>
        </div>
      </form>
    </div>
  );
}
