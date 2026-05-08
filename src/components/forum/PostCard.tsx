// src/components/forum/PostCard.tsx - 帖子卡片（缩略图+标题+用户名+点赞/评论数）
'use client';
import Link from 'next/link';
import type { PostData } from '@/lib/types';

export default function PostCard({ post }: { post: PostData }) {
  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition flex gap-4">
      {post.imageUrl && (
        <Link href={`/forum/${post.id}`} className="flex-shrink-0">
          <img src={post.imageUrl.replace('/uploads/', '/uploads/thumb_')}
            alt={post.title} className="w-40 h-40 object-cover rounded" />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <Link href={`/forum/${post.id}`} className="text-lg font-semibold hover:text-purple-600">{post.title}</Link>
        <p className="text-sm text-gray-500 mt-1">{post.user.username} · {new Date(post.createdAt).toLocaleDateString('zh-CN')}</p>
        {post.content && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.content}</p>}
        <div className="flex gap-4 mt-3 text-sm text-gray-400">
          <span>♡ {post._count.likes}</span><span>💬 {post._count.comments}</span>
        </div>
      </div>
    </div>
  );
}
