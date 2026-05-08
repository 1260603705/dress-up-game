// src/components/character/CharacterCanvas.tsx
// 用 PixiJS 渲染当前角色的穿戴效果 + 骨骼调试点
// 通过 ref 暴露 getSnapshot() 方法供外部调用
'use client';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as PIXI from 'pixi.js';
import { useCharacterStore } from '@/stores/characterStore';
import { CANVAS_SIZE } from '@/lib/constants';
import { computeSkeleton } from '@/engine/skeleton';

export interface CharacterCanvasHandle {
  getSnapshot: () => string;
}

const CharacterCanvas = forwardRef<CharacterCanvasHandle>(function CharacterCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const { params, wearing } = useCharacterStore();

  // 暴露快照方法
  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      const app = appRef.current;
      if (!app) return '';
      app.render();
      return (app.view as HTMLCanvasElement).toDataURL('image/png');
    },
  }));

  // PixiJS 初始化（仅挂载时执行一次）
  useEffect(() => {
    if (!canvasRef.current) return;
    const app = new PIXI.Application({
      view: canvasRef.current,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: 0xe8e8e8,
      antialias: true,
      resolution: 1,
      autoDensity: false,
    });
    appRef.current = app;
    return () => { app.destroy(true); };
  }, []);

  // 参数或穿戴变化 → 重新绘制
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    app.stage.removeChildren();

    const skeleton = computeSkeleton(params);

    // 绘制骨骼调试点（红色圆点）
    const g = new PIXI.Graphics();
    for (const pos of Object.values(skeleton)) {
      g.beginFill(0xff0000, 0.6);
      g.drawCircle(pos.x, pos.y, 4);
      g.endFill();
    }
    app.stage.addChild(g);

    // 加载每件穿戴物品的部件纹理并渲染
    wearing.forEach(async (entry) => {
      try {
        const res = await fetch(`/api/wardrobe/${entry.item_id}`);
        if (!res.ok) return;
        const item = await res.json();
        if (!item.parts) return;

        const container = new PIXI.Container();
        const sorted = [...item.parts].sort((a: any, b: any) => (a.zOrder || 0) - (b.zOrder || 0));

        for (const part of sorted) {
          const bone = skeleton[part.boneAnchor];
          if (!bone) continue;

          const dir = part.partType === 'base_shape' ? 'base_shapes'
            : `${part.partType}s`;
          const textureUrl = `/assets/system/${dir}/${part.templateId}.png`;

          try {
            const texture = await PIXI.Assets.load(textureUrl);
            const sprite = new PIXI.Sprite(texture);
            sprite.position.set(bone.x + (part.offsetX || 0), bone.y + (part.offsetY || 0));
            sprite.scale.set(part.scaleX || 1, part.scaleY || 1);
            sprite.angle = part.rotation || 0;

            const colorHex = entry.color_overrides?.[part.partType] || part.colorHex;
            if (colorHex) sprite.tint = parseInt(colorHex.replace('#', ''), 16);

            container.addChild(sprite);
          } catch {
            // 纹理加载失败跳过该部件
          }
        }
        app.stage.addChild(container);
      } catch {
        // 物品加载失败跳过
      }
    });
  }, [params, wearing]);

  return (
    <canvas ref={canvasRef}
      className="border rounded-lg shadow"
      style={{ width: CANVAS_SIZE / 2, height: CANVAS_SIZE / 2 }}
    />
  );
});

export default CharacterCanvas;
