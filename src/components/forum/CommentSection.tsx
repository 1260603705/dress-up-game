// src/components/forum/CommentSection.tsx - 评论区（评论列表+发送表单）
'use client';
import { useState } from 'react';

export default function CommentSection({ postId, comments: initialComments }: { postId: string; comments: any[] }) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!content.trim()) return;
    const res = await fetch(`/api/forum/posts/${postId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim() }),
    });
    if (res.ok) { const newComment = await res.json(); setComments([...comments, newComment]); setContent(''); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">评论 ({comments.length})</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input type="text" value={content} onChange={e => setContent(e.target.value)}
          placeholder="写下你的评论..." required className="flex-1 border rounded px-3 py-2 text-sm" />
        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded text-sm">发送</button>
      </form>
      <div className="space-y-3">
        {comments.map((c: any) => (
          <div key={c.id} className="bg-white border rounded p-3">
            <p className="text-sm font-medium">{c.user?.username}</p>
            <p className="text-sm text-gray-600 mt-1">{c.content}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString('zh-CN')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
