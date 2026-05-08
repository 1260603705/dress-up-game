// src/stores/outfitStore.ts
// 搭配方案状态管理 — 保存/加载搭配、列表、选中项
import { create } from 'zustand';

interface SavedOutfit {
  id: string;
  characterId: string;
  name: string;
  outfitData: any;          // WearingEntry[]
  thumbnailUrl: string | null;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
  character?: { name: string };
}

interface OutfitStore {
  outfits: SavedOutfit[];
  selectedOutfit: SavedOutfit | null;

  setOutfits: (outfits: SavedOutfit[]) => void;
  setSelectedOutfit: (outfit: SavedOutfit | null) => void;
  addOutfit: (outfit: SavedOutfit) => void;
  removeOutfit: (id: string) => void;
}

export const useOutfitStore = create<OutfitStore>((set) => ({
  outfits: [],
  selectedOutfit: null,

  setOutfits: (outfits) => set({ outfits }),
  setSelectedOutfit: (outfit) => set({ selectedOutfit: outfit }),
  addOutfit: (outfit) => set((s) => ({ outfits: [outfit, ...s.outfits] })),
  removeOutfit: (id) => set((s) => ({ outfits: s.outfits.filter(o => o.id !== id) })),
}));
