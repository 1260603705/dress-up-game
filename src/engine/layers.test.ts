// src/engine/layers.test.ts
// ===== 层级引擎单元测试 =====

import { describe, it, expect } from 'vitest';
import { sortWearingByLayer, GARMENT_PART_Z } from './layers';
import type { WearingEntry, GarmentCategory } from '@/lib/types';

function makeItem(
  id: string,
  layer: number,
  category: GarmentCategory = 'top',
): { id: string; category: GarmentCategory; layer: number; entry: WearingEntry } {
  return {
    id,
    category,
    layer,
    entry: { item_id: id, color_overrides: {} },
  };
}

describe('层级管理器', () => {
  it('按层级升序排列', () => {
    const items = [
      makeItem('a', 3),
      makeItem('b', 2),
      makeItem('c', 7),
    ];
    const sorted = sortWearingByLayer(items);
    expect(sorted.map(i => i.layer)).toEqual([2, 3, 7]);
  });

  it('空数组返回空数组', () => {
    expect(sortWearingByLayer([])).toEqual([]);
  });

  it('同层级保持插入顺序', () => {
    const items = [
      makeItem('a', 1),
      makeItem('b', 1),
      makeItem('c', 1),
    ];
    const sorted = sortWearingByLayer(items);
    expect(sorted.map(i => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('不修改原始数组', () => {
    const items = [
      makeItem('a', 3),
      makeItem('b', 2),
    ];
    const sorted = sortWearingByLayer(items);
    expect(items.map(i => i.layer)).toEqual([3, 2]);
    expect(sorted.map(i => i.layer)).toEqual([2, 3]);
  });

  it('层级为负数也能正确排序', () => {
    const items = [
      makeItem('a', 0),
      makeItem('b', -1),
      makeItem('c', -5),
    ];
    const sorted = sortWearingByLayer(items);
    expect(sorted.map(i => i.layer)).toEqual([-5, -1, 0]);
  });

  it('GARMENT_PART_Z 定义了所有预期部件类型', () => {
    expect(GARMENT_PART_Z.base_shape).toBe(0);
    expect(GARMENT_PART_Z.texture).toBe(1);
    expect(GARMENT_PART_Z.pattern).toBe(2);
    expect(GARMENT_PART_Z.decoration).toBe(4);
  });
});
