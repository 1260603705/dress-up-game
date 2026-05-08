// src/app/(game)/forum/page.tsx - 论坛主页面
'use client';
import { useState } from 'react';
import PostList from '@/components/forum/PostList';
import PostForm from '@/components/forum/PostForm';

export default function ForumPage() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">玩家社区</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-purple-600 text-white rounded text-sm">发布新帖</button>
      </div>
      <PostList />
      {showForm && <PostForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
