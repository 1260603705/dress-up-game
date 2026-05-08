// src/components/forum/PostDetail.tsx - 帖子详情（含点赞按钮）
'use client';
import { useEffect } from 'react';
import { useForumStore } from '@/stores/forumStore';
import CommentSection from './CommentSection';

export default function PostDetail({ postId }: { postId: string }) {
  const { currentPost, setCurrentPost, comments, setComments } = useForumStore();

  useEffect(() => {
    fetch(`/api/forum/posts/${postId}`).then(r => r.json()).then(data => {
      setCurrentPost(data.post); setComments(data.comments);
    });
  }, [postId, setCurrentPost, setComments]);

  if (!currentPost) return <p className="text-gray-400 text-center py-12">加载中...</p>;

  async function handleLike() {
    await fetch(`/api/forum/posts/${postId}/like`, { method: 'POST' });
    const r = await fetch(`/api/forum/posts/${postId}`);
    const data = await r.json(); setCurrentPost(data.post);
  }

  return (
    <div>
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h1 className="text-xl font-bold mb-2">{currentPost.title}</h1>
        <p className="text-sm text-gray-500 mb-4">
          {currentPost.user.username} · {new Date(currentPost.createdAt).toLocaleDateString('zh-CN')}
        </p>
        {currentPost.imageUrl && <img src={currentPost.imageUrl} alt={currentPost.title} className="max-w-full rounded mb-4" />}
        {currentPost.content && <p className="text-gray-700">{currentPost.content}</p>}
        <button onClick={handleLike} className="mt-4 px-4 py-2 border rounded text-sm hover:bg-pink-50">
          ♡ {currentPost._count.likes}
        </button>
      </div>
      <CommentSection postId={postId} comments={comments} />
    </div>
  );
}
