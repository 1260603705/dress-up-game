// src/components/forum/PostList.tsx - 帖子列表 + 分页
'use client';
import { useEffect } from 'react';
import { useForumStore } from '@/stores/forumStore';
import PostCard from './PostCard';
import Pagination from '@/components/shared/Pagination';

export default function PostList() {
  const { posts, page, totalPages, setPosts, setPage, setTotalPages } = useForumStore();
  useEffect(() => {
    fetch(`/api/forum/posts?page=${page}&limit=10`).then(r => r.json()).then(data => {
      setPosts(data.posts); setTotalPages(data.totalPages);
    });
  }, [page, setPosts, setPage, setTotalPages]);

  return (
    <div className="space-y-4">
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
