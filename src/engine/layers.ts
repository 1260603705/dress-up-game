// src/engine/layers.ts
// ===== 层级系统 =====
// 两层排序：(1) 服装之间按 layer 字段排（内衣→上衣→外套→首饰）
//         (2) 单件衣服内部按 partType 预定义z排（基布→纹理→图案→覆层→装饰）
import type { WearingEntry, GarmentCategory } from '@/lib/types';

// 渲染用穿戴项
interface WearableItem {
  id: string;
  category: GarmentCategory;
  layer: number;
}

// 对穿戴列表按层级排序（数字小先画，同层保持插入顺序）
export function sortWearingByLayer(
  items: (WearableItem & { entry: WearingEntry })[],
): (WearableItem & { entry: WearingEntry })[] {
  return [...items].sort((a, b) => a.layer - b.layer);
}

// 单件衣服内部：partType → 绘制顺序（数字小先画）
export const GARMENT_PART_Z: Record<string, number> = {
  base_shape: 0,   // 1. 基布最先画
  texture: 1,      // 2. 材质纹理叠加
  pattern: 2,      // 3. 图案印花
  collar: 3,       // 4. 领口覆层
  sleeve: 3,       // 4. 袖型覆层（同级）
  hem: 3,          // 4. 下摆覆层（同级）
  decoration: 4,   // 5. 装饰配件最上层
};
