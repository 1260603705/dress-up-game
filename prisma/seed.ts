// prisma/seed.ts - 初始化系统预设服装物品（注册后所有玩家可见）
import { PrismaClient } from '../src/generated/prisma/client.js';
const prisma = new PrismaClient({} as any);

async function main() {
  // 7件基础系统预设服装
  const items = [
    { name: '白T恤', category: 'top', layer: 3, parts: [
      { partType: 'base_shape', templateId: 'base_tshirt_01', boneAnchor: 'chest', offsetX: 0, offsetY: -30, colorHex: '#ffffff', zOrder: 0 }] },
    { name: '白衬衫', category: 'top', layer: 3, parts: [
      { partType: 'base_shape', templateId: 'base_shirt_01', boneAnchor: 'chest', offsetX: 0, offsetY: -30, colorHex: '#ffffff', zOrder: 0 },
      { partType: 'collar', templateId: 'collar_collar_01', boneAnchor: 'neck', offsetX: 0, offsetY: -5, colorHex: '#ffffff', zOrder: 1 }] },
    { name: '牛仔裤', category: 'bottom', layer: 4, parts: [
      { partType: 'base_shape', templateId: 'base_jeans_01', boneAnchor: 'waist', offsetX: 0, offsetY: 10, colorHex: '#5b7cb3', zOrder: 0 }] },
    { name: 'A字短裙', category: 'bottom', layer: 4, parts: [
      { partType: 'base_shape', templateId: 'base_skirt_short_01', boneAnchor: 'waist', offsetX: 0, offsetY: 10, colorHex: '#333333', zOrder: 0 }] },
    { name: '帆布鞋', category: 'shoes', layer: 6, parts: [
      { partType: 'base_shape', templateId: 'base_canvas_shoe_01', boneAnchor: 'left_ankle', offsetX: 0, offsetY: -5, colorHex: '#ffffff', zOrder: 0 }] },
    { name: '卫衣', category: 'top', layer: 5, parts: [
      { partType: 'base_shape', templateId: 'base_hoodie_01', boneAnchor: 'chest', offsetX: 0, offsetY: -25, colorHex: '#cccccc', zOrder: 0 }] },
    { name: '百褶长裙', category: 'bottom', layer: 4, parts: [
      { partType: 'base_shape', templateId: 'base_skirt_long_01', boneAnchor: 'waist', offsetX: 0, offsetY: 15, colorHex: '#2d2d2d', zOrder: 0 }] },
  ];

  for (const { parts, ...item } of items) {
    await prisma.wardrobeItem.create({
      data: {
        ...item,
        ownerId: null,  // null = 系统预设，所有玩家可见
        parts: { create: parts },
      },
    });
  }
  console.log('系统预设物品已创建（7件）');
}

main().catch(console.error).finally(() => prisma.$disconnect());
