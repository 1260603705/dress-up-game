// src/components/character/CharacterCanvas.tsx
// 用 PixiJS 渲染当前角色的穿戴效果 + 骨骼调试点
// 通过 ref 暴露 getSnapshot() 方法供外部调用
'use client';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { CANVAS_SIZE } from '@/lib/constants';

export interface CharacterCanvasHandle {
  getSnapshot: () => string;
}

async function initPixi() {
  const PIXI = await import('pixi.js');
  return PIXI;
}

const CharacterCanvas = forwardRef<CharacterCanvasHandle>(function CharacterCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);
  const { params, wearing } = useCharacterStore();

  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      const app = appRef.current;
      if (!app) return '';
      app.render();
      return (app.view as HTMLCanvasElement).toDataURL('image/png');
    },
  }));

  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const PIXI = await initPixi();
      if (cancelled || !canvasRef.current) return;

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

      // 绘制骨骼点
      const { computeSkeleton } = await import('@/engine/skeleton');
      const skeleton = computeSkeleton(params);

      const g = new PIXI.Graphics();
      for (const pos of Object.values(skeleton)) {
        g.beginFill(0xff0000, 0.6);
        g.drawCircle(pos.x, pos.y, 4);
        g.endFill();
      }
      app.stage.addChild(g);
    })();

    return () => { cancelled = true; };
  }, []);

  // wearing 变化时重新绘制
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    let cancelled = false;

    (async () => {
      const PIXI = await initPixi();
      if (cancelled) return;

      app.stage.removeChildren();

      const { computeSkeleton } = await import('@/engine/skeleton');
      const skeleton = computeSkeleton(params);

      const g = new PIXI.Graphics();
      for (const pos of Object.values(skeleton)) {
        g.beginFill(0xff0000, 0.6);
        g.drawCircle(pos.x, pos.y, 4);
        g.endFill();
      }
      app.stage.addChild(g);

      for (const entry of wearing) {
        if (cancelled) return;
        try {
          const res = await fetch(`/api/wardrobe/${entry.item_id}`);
          if (!res.ok) continue;
          const item = await res.json();
          if (!item.parts) continue;

          const container = new PIXI.Container();
          const sorted = [...item.parts].sort((a: any, b: any) => (a.zOrder || 0) - (b.zOrder || 0));

          for (const part of sorted) {
            if (cancelled) return;
            const bone = (skeleton as any)[part.boneAnchor];
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
              if (colorHex) {
                sprite.tint = parseInt(colorHex.replace('#', ''), 16);
              }
              container.addChild(sprite);
            } catch {
              // skip
            }
          }
          if (!cancelled) app.stage.addChild(container);
        } catch {
          // skip
        }
      }
    })();

    return () => { cancelled = true; };
  }, [params, wearing]);

  return (
    <canvas ref={canvasRef}
      className="border rounded-lg shadow"
      style={{ width: CANVAS_SIZE / 2, height: CANVAS_SIZE / 2 }}
    />
  );
});

export default CharacterCanvas;
