// src/stores/forumStore.ts - 论坛状态管理
import { create } from 'zustand';
import type { PostData } from '@/lib/types';

interface ForumStore {
  posts: PostData[]; currentPost: PostData | null; comments: any[];
  page: number; totalPages: number;
  setPosts: (posts: PostData[]) => void;
  setCurrentPost: (post: PostData | null) => void;
  setComments: (comments: any[]) => void;
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
}

export const useForumStore = create<ForumStore>((set) => ({
  posts: [], currentPost: null, comments: [], page: 1, totalPages: 1,
  setPosts: (posts) => set({ posts }),
  setCurrentPost: (post) => set({ currentPost: post }),
  setComments: (comments) => set({ comments }),
  setPage: (page) => set({ page }),
  setTotalPages: (total) => set({ totalPages: total }),
}));
