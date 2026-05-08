// src/components/character/CharacterCanvas.tsx
// 用 PixiJS 渲染当前角色的穿戴效果 + 骨骼调试点
'use client';
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useCharacterStore } from '@/stores/characterStore';
import { CANVAS_SIZE } from '@/lib/constants';
import { computeSkeleton } from '@/engine/skeleton';

export default function CharacterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const { params, wearing } = useCharacterStore();

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

    // 绘制骨骼调试点（红色圆点 → 后续替换为实际皮肤渲染）
    const g = new PIXI.Graphics();
    for (const pos of Object.values(skeleton)) {
      g.beginFill(0xff0000, 0.6);
      g.drawCircle(pos.x, pos.y, 4);
      g.endFill();
    }
    app.stage.addChild(g);

    // TODO: 实际服装渲染 → 等 wardrobe 接入后从 API 加载部件数据
  }, [params, wearing]);

  // Canvas 以 512px 显示（内部渲染 1024×1024，CSS 缩放 50%）
  return (
    <canvas ref={canvasRef}
      className="border rounded-lg shadow"
      style={{ width: CANVAS_SIZE / 2, height: CANVAS_SIZE / 2 }}
    />
  );
}
