import type { GarmentCategory } from './types';

/**
 * 服装分类 → 渲染层级
 * 层级编号决定绘制顺序（数字越大的越靠上）
 */
export const GARMENT_LAYERS: Record<GarmentCategory, number> = {
  socks: 2,
  top: 3,
  bottom: 4,
  dress: 4,
  shoes: 6,
  accessory: 7,
  hair: 8,
};

/**
 * 服装分类 → 中文显示名
 */
export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  top: '上衣',
  bottom: '下装',
  dress: '裙装',
  shoes: '鞋子',
  socks: '袜子',
  accessory: '饰品',
  hair: '发型',
};

/**
 * 所有服装分类列表
 */
export const GARMENT_CATEGORIES: GarmentCategory[] = [
  'top',
  'bottom',
  'dress',
  'shoes',
  'socks',
  'accessory',
  'hair',
];

/**
 * 画布尺寸（px）
 */
export const CANVAS_SIZE = 1024;
