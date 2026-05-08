// src/stores/wardrobeStore.ts
// 管理：物品列表、分类筛选、分页、选中详情
import { create } from 'zustand';
import type { GarmentCategory } from '@/lib/types';

interface WardrobeItem {
  id: string; name: string; category: GarmentCategory;
  layer: number; thumbnailUrl: string | null; createdByEditor: boolean; parts: any[];
}

interface WardrobeStore {
  items: WardrobeItem[];
  selectedCategory: GarmentCategory | 'all';
  page: number; totalPages: number;
  selectedItem: WardrobeItem | null;

  setItems: (items: WardrobeItem[]) => void;
  setCategory: (cat: GarmentCategory | 'all') => void;  // 切换分类时重置到第1页
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setSelectedItem: (item: WardrobeItem | null) => void;
  removeItem: (id: string) => void;
}

export const useWardrobeStore = create<WardrobeStore>((set) => ({
  items: [], selectedCategory: 'all', page: 1, totalPages: 1, selectedItem: null,
  setItems: (items) => set({ items }),
  setCategory: (cat) => set({ selectedCategory: cat, page: 1 }),  // 切分类 → 重置页
  setPage: (page) => set({ page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  removeItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
}));
