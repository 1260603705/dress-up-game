// src/engine/renderer.ts
// ===== PixiJS 渲染引擎 =====
// 核心职责：
//   1. 将部件列表渲染为一个 PIXI.Container（单件衣服）
//   2. 将穿戴列表 + 皮肤渲染为完整角色画面
//   3. 所有部件引用同一份骨骼 → 自动对齐

import * as PIXI from 'pixi.js';
import type { Skeleton, EditorPart, WearingEntry, BoneName, CharacterParams } from '@/lib/types';
import { CANVAS_SIZE } from '@/lib/constants';
import { computeSkeleton } from './skeleton';
import { GARMENT_PART_Z } from './layers';

// 单件衣服的完整渲染数据
export interface GarmentRenderData {
  parts: EditorPart[];
}

// 角色完整渲染数据
export interface CharacterRenderData {
  params: CharacterParams;
  wearing: Array<{
    item: GarmentRenderData;
    entry: WearingEntry;
    layer: number;
  }>;
  skinTextureUrl: string;  // 皮肤/身体底图URL
}

// 创建 PixiJS 应用实例，绑定到给定 canvas
export function createRenderApp(canvas: HTMLCanvasElement): PIXI.Application {
  const app = new PIXI.Application({
    view: canvas,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: 0xf0f0f0,
    antialias: true,
    resolution: 1,
    autoDensity: false,
  });
  return app;
}

// 渲染单件衣服 —— 按 partType 的 z 排序，逐个叠加到容器
export function renderGarment(
  parts: EditorPart[],
  skeleton: Skeleton,
  colorOverrides: Record<string, string> = {},  // 染色覆盖 { "main_body": "#ff0000" }
): PIXI.Container {
  const container = new PIXI.Container();

  // 按 partType 预定义 z + 用户调整的 zOrder 排序
  const sorted = [...parts].sort((a, b) => {
    const za = GARMENT_PART_Z[a.partType] ?? 0;
    const zb = GARMENT_PART_Z[b.partType] ?? 0;
    if (za !== zb) return za - zb;
    return a.zOrder - b.zOrder;
  });

  for (const part of sorted) {
    const textureUrl = part.textureUrl
      || `/assets/system/${part.partType}s/${part.templateId}.png`;
    const sprite = PIXI.Sprite.from(textureUrl);
    const bone = skeleton[part.boneAnchor as BoneName];
    if (!bone) continue;

    // 骨骼位置 + 用户微调偏移
    sprite.position.set(bone.x + part.offsetX, bone.y + part.offsetY);
    sprite.scale.set(part.scaleX, part.scaleY);
    sprite.angle = part.rotation;

    // 颜色优先用染色覆盖，其次用部件默认色
    const color = colorOverrides[part.partType] || part.colorHex;
    if (color) sprite.tint = parseInt(color.replace('#', ''), 16);

    container.addChild(sprite);
  }

  return container;
}

// 渲染完整角色 → 清空 stage → 按层级画皮肤 → 穿上的衣服
export function renderCharacter(
  app: PIXI.Application,
  data: CharacterRenderData,
): PIXI.Container {
  const stage = new PIXI.Container();
  const skeleton = computeSkeleton(data.params);  // 所有部件共享此骨骼

  // 层级 0: 画皮肤（身体底图）
  const skin = PIXI.Sprite.from(data.skinTextureUrl);
  const neck = skeleton.neck;
  skin.position.set(neck.x - skin.texture.width / 2, neck.y - 20);
  stage.addChild(skin);

  // 按 layer 排序后在皮肤上逐件叠加衣服
  const sortedWearing = [...data.wearing].sort((a, b) => a.layer - b.layer);
  for (const { item, entry } of sortedWearing) {
    const garmentContainer = renderGarment(item.parts, skeleton, entry.color_overrides);
    stage.addChild(garmentContainer);
  }

  app.stage.removeChildren();
  app.stage.addChild(stage);
  return stage;
}
