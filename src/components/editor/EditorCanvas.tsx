// src/components/editor/EditorCanvas.tsx
// 中栏：PixiJS 实时预览 — 每次部件列表变化时重新渲染
'use client';
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useDesignStore } from '@/stores/designStore';
import { CANVAS_SIZE } from '@/lib/constants';
import { computeSkeleton } from '@/engine/skeleton';
import { renderGarment } from '@/engine/renderer';
import { DEFAULT_CHARACTER_PARAMS } from '@/stores/characterStore';

export default function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const { parts } = useDesignStore();

  useEffect(() => {
    if (!canvasRef.current) return;
    const app = new PIXI.Application({
      view: canvasRef.current, width: CANVAS_SIZE, height: CANVAS_SIZE,
      backgroundColor: 0xe8e8e8, antialias: true, resolution: 1, autoDensity: false,
    });
    appRef.current = app;
    return () => { app.destroy(true); };
  }, []);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    app.stage.removeChildren();

    const skeleton = computeSkeleton(DEFAULT_CHARACTER_PARAMS);

    // 画骨骼调试点（灰色）
    const g = new PIXI.Graphics();
    for (const pos of Object.values(skeleton)) {
      g.beginFill(0x999999, 0.5); g.drawCircle(pos.x, pos.y, 3); g.endFill();
    }
    app.stage.addChild(g);

    // 渲染当前部件列表
    if (parts.length > 0) {
      const container = renderGarment(parts, skeleton);
      app.stage.addChild(container);
    }
  }, [parts]);

  return (
    <canvas ref={canvasRef} className="border rounded-lg shadow"
      style={{ width: CANVAS_SIZE / 2, height: CANVAS_SIZE / 2 }} />
  );
}
