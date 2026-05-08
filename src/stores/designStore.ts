// src/stores/designStore.ts
// 管理编辑器状态：当前编辑的服装分类、名称、部件列表、选中部件、部件模板库
import { create } from 'zustand';
import type { EditorPart, PartType, GarmentCategory, BoneName } from '@/lib/types';

// 部件模板（从系统配置加载）
interface PartTemplate {
  id: string; partType: PartType; name: string; label: string;
  defaultBone: BoneName; textureUrl?: string;
}

interface DesignStore {
  category: GarmentCategory;       // 当前编辑的服装大分类
  name: string;                     // 衣服名称
  parts: EditorPart[];              // 已添加的部件列表
  selectedPartId: string | null;    // 当前选中部件ID

  setCategory: (cat: GarmentCategory) => void;
  setName: (name: string) => void;
  addPart: (template: PartTemplate) => void;   // 从模板库添加一个部件
  removePart: (id: string) => void;
  selectPart: (id: string | null) => void;
  updatePart: (id: string, data: Partial<EditorPart>) => void;  // 修改部件属性
  reorderPart: (id: string, newZOrder: number) => void;         // 调整同层内的顺序
  clearDesign: () => void;
}

let tempId = 0;  // 客户端临时ID生成器

export const useDesignStore = create<DesignStore>((set) => ({
  category: 'dress', name: '', parts: [], selectedPartId: null,

  setCategory: (cat) => set({ category: cat }),
  setName: (name) => set({ name }),

  addPart: (template) => {
    if (useDesignStore.getState().parts.length >= 15) {
      alert('单件衣服最多15个部件'); return;
    }
    const newPart: EditorPart = {
      id: `part_${++tempId}`,
      partType: template.partType,
      templateId: template.id,
      textureUrl: template.textureUrl,
      boneAnchor: template.defaultBone,
      offsetX: 0, offsetY: 0, scaleX: 1.0, scaleY: 1.0,
      rotation: 0, colorHex: '#ffffff', zOrder: 0,
    };
    set((s) => ({ parts: [...s.parts, newPart], selectedPartId: newPart.id }));
  },

  removePart: (id) =>
    set((s) => ({
      parts: s.parts.filter(p => p.id !== id),
      selectedPartId: s.selectedPartId === id ? null : s.selectedPartId,
    })),

  selectPart: (id) => set({ selectedPartId: id }),
  updatePart: (id, data) =>
    set((s) => ({ parts: s.parts.map(p => p.id === id ? { ...p, ...data } : p) })),

  reorderPart: (id, newZOrder) =>
    set((s) => ({ parts: s.parts.map(p => p.id === id ? { ...p, zOrder: newZOrder } : p) })),

  clearDesign: () => set({ name: '', parts: [], selectedPartId: null }),
}));
