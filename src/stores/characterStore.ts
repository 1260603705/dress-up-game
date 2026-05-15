// src/stores/characterStore.ts
// ===== 角色状态管理 =====
// 管理：捏人参数、当前穿戴列表、当前角色ID
// 与 wardrobeStore 联动：穿戴/卸下物品时更新 wearing
import { create } from 'zustand';
import type { CharacterParams, GarmentCategory, WearingEntry } from '@/lib/types';

// 默认角色参数（标准体型女性）
export const DEFAULT_CHARACTER_PARAMS: CharacterParams = {
  gender: 'female',
  body: { height: 'medium', shape: 'standard' },
  face: 'oval', eyes: 'almond', eyebrows: 'willow', mouth: 'standard',
  skin_tone: 'natural', hair: { front: 'canvas', back: 'long_01' },
};

// 3个新手预设角色
export const DEFAULT_PRESETS: Array<{ name: string; params: CharacterParams }> = [
  { name: '默认少女', params: DEFAULT_CHARACTER_PARAMS },
  {
    name: '运动少女',
    params: { ...DEFAULT_CHARACTER_PARAMS, body: { height: 'tall', shape: 'slim' },
      eyes: 'phoenix', hair: { front: 'canvas', back: 'pony_01' } },
  },
  {
    name: '甜美少女',
    params: { ...DEFAULT_CHARACTER_PARAMS, body: { height: 'short', shape: 'standard' },
      face: 'round', eyes: 'peach', hair: { front: 'canvas', back: 'twin_01' } },
  },
];

interface CharacterStore {
  params: CharacterParams;        // 捏人参数
  wearing: WearingEntry[];        // 当前穿戴 [{item_id, color_overrides, category}, ...]
  characterId: string | null;     // 当前编辑的角色ID（null=未保存）

  setParams: (partial: Partial<CharacterParams>) => void;
  resetParams: () => void;
  setWearing: (wearing: WearingEntry[]) => void;
  addWearing: (entry: WearingEntry, category: string) => void;  // 按 category 替换穿戴
  removeWearing: (itemId: string) => void;                      // 卸下一件
  undoLastWear: () => void;                                     // 撤回最后一件穿戴
  clearWearing: () => void;                                     // 脱全部
  setCharacterId: (id: string | null) => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  params: DEFAULT_CHARACTER_PARAMS,
  wearing: [],
  characterId: null,

  setParams: (partial) => set((s) => ({ params: { ...s.params, ...partial } })),
  resetParams: () => set({ params: DEFAULT_CHARACTER_PARAMS }),
  setWearing: (wearing) => set({ wearing }),
  addWearing: (entry, category) =>
    set((s) => {
      // 同 category 先移除再添加，实现同类别互斥替换
      const filtered = s.wearing.filter((w) => w.category !== category);
      return { wearing: [...filtered, { ...entry, category: category as GarmentCategory }] };
    }),
  removeWearing: (itemId) =>
    set((s) => ({ wearing: s.wearing.filter((w) => w.item_id !== itemId) })),
  undoLastWear: () =>
    set((s) => {
      if (s.wearing.length === 0) return s;
      return { wearing: s.wearing.slice(0, -1) };
    }),
  clearWearing: () => set({ wearing: [] }),
  setCharacterId: (id) => set({ characterId: id }),
}));
