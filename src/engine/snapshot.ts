// src/engine/snapshot.ts
// Canvas → Base64 PNG 导出（固定分辨率 1024×1024）
import * as PIXI from 'pixi.js';

// 导出当前 Canvas 为 base64 data URL
export function exportSnapshot(app: PIXI.Application): string {
  const oldResolution = app.renderer.resolution;
  app.renderer.resolution = 1;   // 强制 1x 分辨率，忽略设备DPR
  app.render();
  const dataUrl = app.view instanceof HTMLCanvasElement
    ? (app.view as HTMLCanvasElement).toDataURL('image/png') : '';
  app.renderer.resolution = oldResolution;
  app.render();
  return dataUrl;
}

// 触发浏览器下载
export function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename; link.href = dataUrl;
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}
