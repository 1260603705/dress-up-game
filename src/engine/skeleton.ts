// src/engine/skeleton.ts
// ===== 骨骼系统核心 =====
// 标准骨骼定义在 1024×1024 画布上。体型变化 → 缩放因子 → 所有骨骼坐标跟随变化。
// 衣服部件挂在骨骼上，所有部件共享同一份骨骼 → 自动对齐。

import type { Skeleton, BoneName, BoneCoords, CharacterParams } from '@/lib/types';

// 标准骨骼（体型=standard, 身高=medium）的固定基准坐标
export const STANDARD_SKELETON: Skeleton = {
  head:            { x: 512, y: 80 },
  neck:            { x: 512, y: 180 },
  left_shoulder:   { x: 370, y: 200 },
  right_shoulder:  { x: 654, y: 200 },
  left_elbow:      { x: 310, y: 350 },
  right_elbow:     { x: 714, y: 350 },
  left_wrist:      { x: 270, y: 500 },
  right_wrist:     { x: 754, y: 500 },
  chest:           { x: 512, y: 280 },
  waist:           { x: 512, y: 420 },
  left_hip:        { x: 400, y: 440 },
  right_hip:       { x: 624, y: 440 },
  left_knee:       { x: 390, y: 660 },
  right_knee:      { x: 634, y: 660 },
  left_ankle:      { x: 385, y: 880 },
  right_ankle:     { x: 639, y: 880 },
};

// 体型 → X轴缩放因子（胖瘦影响宽度）
const SHAPE_SCALE_X: Record<string, number> = {
  plump: 1.12, slim: 0.92, standard: 1.0,
};

// 身高 → Y轴缩放因子（高矮影响高度）
const HEIGHT_SCALE_Y: Record<string, number> = {
  tall: 1.08, short: 0.92, medium: 1.0,
};

// 根据角色参数计算变形后的骨骼坐标集
export function computeSkeleton(params: CharacterParams): Skeleton {
  const shapeScaleX = SHAPE_SCALE_X[params.body.shape] ?? 1.0;
  const heightScaleY = HEIGHT_SCALE_Y[params.body.height] ?? 1.0;

  const result: Record<string, BoneCoords> = {};
  for (const [name, bone] of Object.entries(STANDARD_SKELETON)) {
    result[name] = {
      x: bone.x * shapeScaleX,
      y: bone.y * heightScaleY,
    };
  }
  return result as Skeleton;
}

// 获取某个骨骼在应用部件偏移后的最终位置
export function getBonePosition(
  skeleton: Skeleton,
  bone: BoneName,
  offsetX = 0,
  offsetY = 0,
): BoneCoords {
  const b = skeleton[bone];
  return { x: b.x + offsetX, y: b.y + offsetY };
}
