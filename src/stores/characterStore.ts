// src/stores/characterStore.ts
// ===== 角色状态管理 =====
// 管理：捏人参数、当前穿戴列表、当前角色ID
// 与 wardrobeStore 联动：穿戴/卸下物品时更新 wearing
import { create } from 'zustand';
import type { CharacterParams, WearingEntry } from '@/lib/types';

// 默认角色参数（标准体型女性）
export const DEFAULT_CHARACTER_PARAMS: CharacterParams = {
  gender: 'female',
  body: { height: 'medium', shape: 'standard' },
  face: 'oval', eyes: 'almond', eyebrows: 'willow', mouth: 'standard',
  skin_tone: 'natural', hair: { front: 'bangs_01', back: 'long_01' },
};

// 3个新手预设角色
export const DEFAULT_PRESETS: Array<{ name: string; params: CharacterParams }> = [
  { name: '默认少女', params: DEFAULT_CHARACTER_PARAMS },
  {
    name: '运动少女',
    params: { ...DEFAULT_CHARACTER_PARAMS, body: { height: 'tall', shape: 'slim' },
      eyes: 'phoenix', hair: { front: 'bangs_03', back: 'pony_01' } },
  },
  {
    name: '甜美少女',
    params: { ...DEFAULT_CHARACTER_PARAMS, body: { height: 'short', shape: 'standard' },
      face: 'round', eyes: 'peach', hair: { front: 'bangs_01', back: 'twin_01' } },
  },
];

interface CharacterStore {
  params: CharacterParams;        // 捏人参数
  wearing: WearingEntry[];        // 当前穿戴 [{item_id, color_overrides}, ...]
  characterId: string | null;     // 当前编辑的角色ID（null=未保存）

  setParams: (partial: Partial<CharacterParams>) => void;
  resetParams: () => void;
  setWearing: (wearing: WearingEntry[]) => void;
  addWearing: (entry: WearingEntry) => void;     // 穿戴一件（同item_id先卸再穿）
  removeWearing: (itemId: string) => void;       // 卸下一件
  setCharacterId: (id: string | null) => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  params: DEFAULT_CHARACTER_PARAMS,
  wearing: [],
  characterId: null,

  setParams: (partial) => set((s) => ({ params: { ...s.params, ...partial } })),
  resetParams: () => set({ params: DEFAULT_CHARACTER_PARAMS }),
  setWearing: (wearing) => set({ wearing }),
  addWearing: (entry) =>
    set((s) => {
      // 同 item_id 先移除再添加，实现"重新穿戴/更新染色"
      const filtered = s.wearing.filter((w) => w.item_id !== entry.item_id);
      return { wearing: [...filtered, entry] };
    }),
  removeWearing: (itemId) =>
    set((s) => ({ wearing: s.wearing.filter((w) => w.item_id !== itemId) })),
  setCharacterId: (id) => set({ characterId: id }),
}));
