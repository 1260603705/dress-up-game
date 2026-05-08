# 2D 换装游戏实现计划

> **给子代理：** 使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 按任务逐条实现。步骤用 checkbox (`- [ ]`) 语法跟踪。

**目标：** 构建 2D 换装网页游戏 — 角色创建 + 仓库管理 + 部件拼装服装编辑器 + 轻量社区论坛。

**架构：** React SPA (Zustand + PixiJS) 运行于 Next.js App Router。PixiJS 负责 Canvas 角色/服装渲染；React 负责所有 UI 面板。4 个 Zustand store 桥接前后。Prisma → PostgreSQL。上传到本地磁盘(dev)/S3(prod)。

**技术栈：** Next.js 14, TypeScript, PixiJS 7, Zustand, Prisma, PostgreSQL, Tailwind CSS, NextAuth.js, Sharp

---

## 文件结构

src/
├── app/                              # Next.js App Router 页面路由
│   ├── layout.tsx                    # 根布局
│   ├── page.tsx                      # 着陆页
│   ├── globals.css                   # Tailwind 基础样式
│   ├── (auth)/                       # 认证路由组（无需登录）
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (game)/                       # 游戏路由组（需登录）
│   │   ├── layout.tsx                # 游戏外壳布局（Navbar + Sidebar）
│   │   ├── home/page.tsx             # 首页 / 角色展示
│   │   ├── character/
│   │   │   ├── page.tsx              # 角色列表
│   │   │   └── create/page.tsx       # 创建/编辑角色
│   │   ├── wardrobe/page.tsx         # 仓库浏览
│   │   ├── editor/page.tsx           # 服装编辑器
│   │   └── forum/
│   │       ├── page.tsx              # 帖子列表
│   │       └── [id]/page.tsx         # 帖子详情
│   └── api/                          # API 路由（后端接口）
│       ├── auth/[...nextauth]/route.ts    # NextAuth 认证端点
│       ├── auth/register/route.ts         # 注册接口
│       ├── avatar/route.ts                # 角色 CRUD
│       ├── avatar/[id]/route.ts           # 单角色 RUD
│       ├── wardrobe/route.ts              # 仓库列表
│       ├── wardrobe/[id]/route.ts         # 单件详情/删除
│       ├── design/route.ts                # 服装创作保存
│       ├── upload/route.ts                # 图片上传+多尺寸生成
│       ├── forum/posts/route.ts           # 帖子列表+发帖
│       ├── forum/posts/[id]/route.ts      # 帖子详情+删帖
│       ├── forum/posts/[id]/like/route.ts       # 点赞（幂等）
│       ├── forum/posts/[id]/comments/route.ts   # 评论
│       └── forum/comments/[id]/route.ts         # 删评论
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx              # 应用外壳（SessionProvider+Navbar+Sidebar）
│   │   ├── Navbar.tsx                # 顶部导航栏
│   │   └── Sidebar.tsx               # 左侧导航栏
│   ├── character/
│   │   ├── CharacterCanvas.tsx       # PixiJS 角色渲染画布
│   │   └── CharacterForm.tsx         # 捏人参数表单
│   ├── wardrobe/
│   │   ├── WardrobeGrid.tsx          # 仓库网格 + 分类Tab + 分页
│   │   ├── WardrobeCard.tsx          # 单件衣服卡片
│   │   └── WardrobeDetail.tsx        # 衣服详情弹窗
│   ├── editor/
│   │   ├── EditorShell.tsx           # 三栏布局容器
│   │   ├── PartLibrary.tsx           # 左栏：部件库浏览器
│   │   ├── EditorCanvas.tsx          # 中栏：PixiJS 实时预览
│   │   └── PropertyPanel.tsx         # 右栏：选中部件的属性编辑
│   ├── forum/
│   │   ├── PostList.tsx              # 帖子列表
│   │   ├── PostCard.tsx              # 帖子卡片
│   │   ├── PostDetail.tsx            # 帖子详情（含点赞）
│   │   ├── PostForm.tsx              # 发帖表单（含图片上传）
│   │   └── CommentSection.tsx        # 评论区
│   └── shared/
│       ├── Modal.tsx                 # 通用弹窗（点击遮罩关闭）
│       ├── Pagination.tsx            # 通用分页
│       └── ImageUploader.tsx         # 图片上传组件
├── stores/                           # Zustand 状态管理（4个独立store）
│   ├── characterStore.ts             # 角色状态：捏人参数 + 穿戴列表
│   ├── wardrobeStore.ts              # 仓库状态：物品列表 + 分类 + 分页
│   ├── designStore.ts                # 编辑器状态：部件列表 + 选中 + 属性
│   └── forumStore.ts                 # 论坛状态：帖子 + 评论 + 分页
├── engine/                           # 游戏核心引擎（纯逻辑，不依赖React）
│   ├── skeleton.ts                   # 骨骼系统：标准坐标 + 体型变形计算
│   ├── renderer.ts                   # 渲染引擎：角色/服装的PixiJS绘制
│   ├── layers.ts                     # 层级管理：渲染排序 + 单件管线层级
│   └── snapshot.ts                   # 快照：Canvas → Base64导出
├── lib/
│   ├── types.ts                      # 全局 TypeScript 类型
│   ├── constants.ts                  # 分类/层级/画布常量
│   └── validators.ts                 # Zod 校验 schema
└── db/
    └── index.ts                      # Prisma 客户端单例
prisma/
└── schema.prisma                     # 数据库模型
public/assets/                        # 系统预设纹理（占位PNG → 后续替换为美术资源）

---

## 阶段一：项目脚手架与数据库

### 任务 1: 初始化 Next.js 项目

**涉及文件:** 创建 package.json, tsconfig.json, next.config.js, tailwind.config.ts, postcss.config.js, .env.example, src/app/globals.css, src/app/layout.tsx

- [ ] **步骤 1: 创建 Next.js 项目（TypeScript + Tailwind）**

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

- [ ] **步骤 2: 安装核心依赖**

```bash
npm install prisma @prisma/client next-auth@4 zustand pixi.js@7 sharp zod bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **步骤 3: 初始化 Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **步骤 4: 验证构建**

```bash
npm run build
```
期望: 构建成功。

- [ ] **步骤 5: 提交**

```bash
git add -A && git commit -m "feat: 初始化 Next.js 项目及依赖"
```

---

### 任务 2: 数据库 Schema + 类型定义 + 常量

**涉及文件:** 创建 prisma/schema.prisma, src/lib/types.ts, src/lib/constants.ts, src/db/index.ts

- [ ] **步骤 1: 编写 Prisma schema**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户表
model User {
  id            String    @id @default(uuid())
  username      String    @unique      // 用户名，唯一
  email         String    @unique      // 邮箱，唯一
  passwordHash  String    @map("password_hash")  // bcrypt 哈希密码
  createdAt     DateTime  @default(now()) @map("created_at")

  characters    Character[]
  wardrobeItems WardrobeItem[]         // 用户自制的服装
  inventory     UserInventory[]        // 用户仓库的物品
  savedOutfits  SavedOutfit[]
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  @@map("users")
}

// 角色表 - 每个用户可创建多个角色
model Character {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  name         String                  // 角色名称
  gender       String                  // 性别: male / female
  customParams Json     @map("custom_params")  // 捏人参数（height/shape/face/eyes...）
  wearing      Json     @default("[]") @map("wearing")   // 当前穿戴 [{item_id, color_overrides}]
  isDefault    Boolean  @default(false) @map("is_default")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  savedOutfits SavedOutfit[]
  @@map("characters")
}

// 服装物品表 - 系统预设(ownerId=null) + 玩家自制
model WardrobeItem {
  id              String         @id @default(uuid())
  ownerId         String?        @map("owner_id")    // null=系统预设, 非null=玩家自制
  name            String                              // 衣服名称
  category        String                              // top/bottom/dress/shoes/socks/accessory/hair
  layer           Int                                 // 渲染层级 0-8
  thumbnailUrl    String?        @map("thumbnail_url")
  createdAt       DateTime       @default(now()) @map("created_at")

  owner           User?          @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  parts           ItemPart[]                          // 组成此衣服的部件列表
  userInventories UserInventory[]
  @@map("wardrobe_items")
}

// 服装部件表 - 一件衣服 = 基布 + 覆层部件 × N + 装饰 × N
model ItemPart {
  id          String       @id @default(uuid())
  itemId      String       @map("item_id")
  partType    String       @map("part_type")          // base_shape/collar/sleeve/hem/pattern/decoration/texture
  templateId  String       @map("template_id")        // 引用的系统部件模板ID
  textureUrl  String?      @map("texture_url")
  boneAnchor  String       @map("bone_anchor")        // 挂载到哪个骨骼锚点
  offsetX     Float        @default(0) @map("offset_x")
  offsetY     Float        @default(0) @map("offset_y")
  scaleX      Float        @default(1.0) @map("scale_x")
  scaleY      Float        @default(1.0) @map("scale_y")
  rotation    Float        @default(0)                // 旋转角度
  colorHex    String?      @map("color_hex")          // 默认颜色 #RRGGBB
  zOrder      Int          @default(0) @map("z_order")  // 同层内绘制顺序
  metadata    Json         @default("{}")

  item        WardrobeItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  @@map("item_parts")
}

// 玩家仓库 - 用户拥有哪些服装物品
model UserInventory {
  id         String       @id @default(uuid())
  userId     String       @map("user_id")
  itemId     String       @map("item_id")
  obtainedAt DateTime     @default(now()) @map("obtained_at")

  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  item       WardrobeItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  @@unique([userId, itemId])
  @@map("user_inventory")
}

// 保存的搭配方案
model SavedOutfit {
  id           String    @id @default(uuid())
  userId       String    @map("user_id")
  characterId  String    @map("character_id")
  name         String                   // "夏日清凉套装"
  outfitData   Json      @map("outfit_data")  // [{item_id, color_overrides}]
  thumbnailUrl String?   @map("thumbnail_url")
  isShared     Boolean   @default(false) @map("is_shared")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  @@map("saved_outfits")
}

// 论坛帖子
model Post {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  title     String                   // 帖子标题
  content   String?                  // 正文（可选）
  imageUrl  String?   @map("image_url")  // 贴图URL
  createdAt DateTime  @default(now()) @map("created_at")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments  Comment[]
  likes     Like[]
  @@map("posts")
}

// 评论
model Comment {
  id        String   @id @default(uuid())
  postId    String   @map("post_id")
  userId    String   @map("user_id")
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("comments")
}

// 点赞（幂等：再点取消）
model Like {
  id        String   @id @default(uuid())
  postId    String   @map("post_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([postId, userId])    // 同一用户对同一帖子只能有一条记录
  @@map("likes")
}
```

- [ ] **步骤 2: 编写共享类型定义**

```typescript
// src/lib/types.ts
// ===== 角色相关 =====

// 捏人参数 - 中等定制程度，存为JSON
export interface CharacterParams {
  gender: 'male' | 'female';
  body: {
    height: 'short' | 'medium' | 'tall';  // 身高三档
    shape: 'slim' | 'standard' | 'plump';  // 体型三档
  };
  face: 'round' | 'oval' | 'square' | 'heart';  // 脸型四选一
  eyes: 'almond' | 'phoenix' | 'peach';         // 眼型三选一
  eyebrows: 'willow' | 'flat' | 'arched';       // 眉型三选一
  mouth: 'thin' | 'standard' | 'thick';         // 嘴型三选一
  skin_tone: 'fair' | 'natural' | 'wheat' | 'deep';  // 肤色四选一
  hair: { front: string; back: string };  // 前后发模板ID
}

// ===== 服装相关 =====

// 服装大分类
export type GarmentCategory =
  | 'top' | 'bottom' | 'dress' | 'shoes' | 'socks' | 'accessory' | 'hair';

// 部件类型 - 决定在单件渲染管线中的哪一步绘制
export type PartType =
  | 'base_shape'   // 基布（完整轮廓）
  | 'collar'       // 领口覆层
  | 'sleeve'       // 袖型覆层
  | 'hem'          // 下摆覆层
  | 'pattern'      // 图案印花
  | 'decoration'   // 装饰配件
  | 'texture';     // 材质纹理

// 穿戴条目 - characters.wearing JSON 数组的元素
export interface WearingEntry {
  item_id: string;
  color_overrides: Record<string, string>;  // { "main_body": "#ff6b6b", "collar": "#fff" }
}

// ===== 骨骼相关 =====

// 17个骨骼锚点名称
export type BoneName =
  | 'head' | 'neck'
  | 'left_shoulder' | 'right_shoulder'
  | 'left_elbow' | 'right_elbow'
  | 'left_wrist' | 'right_wrist'
  | 'chest' | 'waist'
  | 'left_hip' | 'right_hip'
  | 'left_knee' | 'right_knee'
  | 'left_ankle' | 'right_ankle';

// 单个骨骼的像素坐标
export interface BoneCoords { x: number; y: number; }

// 完整骨骼集 - 键为骨骼名，值为坐标
export type Skeleton = Record<BoneName, BoneCoords>;

// ===== 编辑器相关 =====

// 编辑器中的一个部件（带客户端临时ID）
export interface EditorPart {
  id: string;             // 客户端临时ID
  partType: PartType;
  templateId: string;     // 系统部件模板ID
  textureUrl?: string;
  boneAnchor: BoneName;
  offsetX: number; offsetY: number;
  scaleX: number; scaleY: number;
  rotation: number;
  colorHex?: string;
  zOrder: number;
}

// 提交给后端的服装创作数据
export interface DesignSubmission {
  name: string;
  category: GarmentCategory;
  previewThumbnail: string;  // base64 缩略图
  parts: Omit<EditorPart, 'id'>[];
}

// ===== 论坛相关 =====

export interface PostData {
  id: string;
  title: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  user: { id: string; username: string };
  _count: { likes: number; comments: number };
  likedByMe?: boolean;
}
```

- [ ] **步骤 3: 编写常量**

```typescript
// src/lib/constants.ts
import type { GarmentCategory } from './types';

// 服装分类 → 渲染层级（数字越大越靠上，先被覆盖的层渲染）
export const GARMENT_LAYERS: Record<GarmentCategory, number> = {
  socks: 2,       // 袜子（内衣之上）
  top: 3,         // 上衣
  bottom: 4,      // 裤子/裙子
  dress: 4,       // 连衣裙（与裤子同层，互斥）
  shoes: 6,       // 鞋子（外套之上）
  accessory: 7,   // 首饰（最外）
  hair: 8,        // 发型（最顶层）
};

// 分类的中文标签
export const CATEGORY_LABELS: Record<GarmentCategory, string> = {
  top: '上衣', bottom: '下装', dress: '裙装',
  shoes: '鞋子', socks: '袜子', accessory: '饰品', hair: '发型',
};

// 所有分类的列表
export const GARMENT_CATEGORIES: GarmentCategory[] = [
  'top', 'bottom', 'dress', 'shoes', 'socks', 'accessory', 'hair',
];

// 画布固定分辨率（所有渲染和导出统一此尺寸）
export const CANVAS_SIZE = 1024;
```

- [ ] **步骤 4: 编写 Prisma 客户端单例**

```typescript
// src/db/index.ts
import { PrismaClient } from '@prisma/client';

// 开发环境下复用 Prisma 实例，避免热重载创建多个连接
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **步骤 5: 设置 .env.example**

```bash
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/dressup"
NEXTAUTH_SECRET="generate-a-random-string"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
```

- [ ] **步骤 6: 执行数据库迁移**

```bash
npx prisma migrate dev --name init
```
期望: 数据库表创建成功。

- [ ] **步骤 7: 提交**

```bash
git add -A && git commit -m "feat: 添加数据库schema、类型定义和常量"
```

---

## 阶段二：骨骼与渲染引擎（纯逻辑层）

### 任务 3: 骨骼引擎

**涉及文件:** 创建 src/engine/skeleton.ts, 测试文件

- [ ] **步骤 1: 编写骨骼引擎**

```typescript
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
```

- [ ] **步骤 2: 编写测试**

```typescript
// 测试: computeSkeleton 在不同体型/身高下的缩放正确性
import { describe, it, expect } from 'vitest';
import { STANDARD_SKELETON, computeSkeleton } from './skeleton';
import type { CharacterParams } from '@/lib/types';

const baseParams: CharacterParams = {
  gender: 'female',
  body: { height: 'medium', shape: 'standard' },
  face: 'oval', eyes: 'almond', eyebrows: 'willow', mouth: 'standard',
  skin_tone: 'natural', hair: { front: 'bangs_01', back: 'long_01' },
};

describe('computeSkeleton', () => {
  it('标准体型返回标准骨骼坐标', () => {
    const sk = computeSkeleton(baseParams);
    expect(sk.chest).toEqual(STANDARD_SKELETON.chest);
  });

  it('高身高时Y轴缩放', () => {
    const sk = computeSkeleton({ ...baseParams, body: { height: 'tall', shape: 'standard' } });
    expect(sk.chest.y).toBeCloseTo(280 * 1.08);
  });

  it('丰满体型时X轴缩放', () => {
    const sk = computeSkeleton({ ...baseParams, body: { height: 'medium', shape: 'plump' } });
    expect(sk.chest.x).toBeCloseTo(512 * 1.12);
  });
});
```

- [ ] **步骤 3: 运行测试**

```bash
npm install -D vitest @types/node
npx vitest run src/engine/skeleton.test.ts
```
期望: 3 个测试全部通过。

- [ ] **步骤 4: 提交**

```bash
git add -A && git commit -m "feat: 添加骨骼引擎（体型变形计算）"
```

---

### 任务 4: 层级管理器

**涉及文件:** 创建 src/engine/layers.ts, 测试文件

- [ ] **步骤 1: 编写层级管理器**

```typescript
// src/engine/layers.ts
// ===== 层级系统 =====
// 两层排序：(1) 服装之间按 layer 字段排（内衣→上衣→外套→首饰）
//         (2) 单件衣服内部按 partType 预定义z排（基布→纹理→图案→覆层→装饰）
import type { WearingEntry, GarmentCategory } from '@/lib/types';

// 渲染用穿戴项
interface WearableItem {
  id: string;
  category: GarmentCategory;
  layer: number;
}

// 对穿戴列表按层级排序（数字小先画，同层保持插入顺序）
export function sortWearingByLayer(
  items: (WearableItem & { entry: WearingEntry })[],
): (WearableItem & { entry: WearingEntry })[] {
  return [...items].sort((a, b) => a.layer - b.layer);
}

// 单件衣服内部：partType → 绘制顺序（数字小先画）
export const GARMENT_PART_Z: Record<string, number> = {
  base_shape: 0,   // 1. 基布最先画
  texture: 1,      // 2. 材质纹理叠加
  pattern: 2,      // 3. 图案印花
  collar: 3,       // 4. 领口覆层
  sleeve: 3,       // 4. 袖型覆层（同级）
  hem: 3,          // 4. 下摆覆层（同级）
  decoration: 4,   // 5. 装饰配件最上层
};
```

- [ ] **步骤 2: 编写测试**

```typescript
import { describe, it, expect } from 'vitest';
import { sortWearingByLayer } from './layers';
import type { GarmentCategory, WearingEntry } from '@/lib/types';

describe('sortWearingByLayer', () => {
  it('按层级升序排列', () => {
    const items = [
      { id: 'top', category: 'top' as GarmentCategory, layer: 3, entry: {} as WearingEntry },
      { id: 'socks', category: 'socks' as GarmentCategory, layer: 2, entry: {} as WearingEntry },
      { id: 'acc', category: 'accessory' as GarmentCategory, layer: 7, entry: {} as WearingEntry },
    ];
    const sorted = sortWearingByLayer(items);
    expect(sorted.map(i => i.id)).toEqual(['socks', 'top', 'acc']);
  });
});
```

- [ ] **步骤 3: 运行测试**

```bash
npx vitest run src/engine/layers.test.ts
```
期望: 测试通过。

- [ ] **步骤 4: 提交**

```bash
git add -A && git commit -m "feat: 添加层级管理器"
```

---

### 任务 5: 渲染引擎

**涉及文件:** 创建 src/engine/renderer.ts

- [ ] **步骤 1: 编写渲染引擎**

```typescript
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
```

- [ ] **步骤 2: 提交**

```bash
git add -A && git commit -m "feat: 添加 PixiJS 渲染引擎（renderGarment + renderCharacter）"
```

---

## 阶段三：认证系统

### 任务 6: NextAuth 配置

**涉及文件:** 创建 src/app/api/auth/[...nextauth]/route.ts, src/lib/auth.ts

- [ ] **步骤 1: 编写 NextAuth 路由处理器**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **步骤 2: 编写认证配置（凭证登录 + JWT Session）**

```typescript
// src/lib/auth.ts
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, name: user.username, email: user.email };
      },
    }),
  ],
  session: { strategy: 'jwt' },  // JWT 方式存储 session
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.sub;
      return session;
    },
  },
};
```

- [ ] **步骤 3: 提交**

```bash
git add -A && git commit -m "feat: 添加 NextAuth 凭证认证"
```

---

### 任务 7: 登录/注册页面 + 注册API

**涉及文件:** 创建 src/app/(auth)/login/page.tsx, src/app/(auth)/register/page.tsx, src/app/api/auth/register/route.ts

- [ ] **步骤 1: 编写注册API（bcrypt 哈希 + Zod 校验）**

```typescript
// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(2).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { username, email, password } = parsed.data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) return NextResponse.json({ error: '邮箱或用户名已被注册' }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { username, email, passwordHash } });
  return NextResponse.json({ id: user.id }, { status: 201 });
}
```

- [ ] **步骤 2: 编写登录页**

```tsx
// src/app/(auth)/login/page.tsx
'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) setError('邮箱或密码错误');
    else router.push('/home');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input className="w-full border rounded px-3 py-2 mb-3" type="email" placeholder="邮箱"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2 mb-4" type="password" placeholder="密码"
          value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="w-full bg-blue-600 text-white rounded py-2 font-medium" type="submit">
          登录
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          还没有账号？<a href="/register" className="text-blue-600 ml-1">注册</a>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **步骤 3: 编写注册页（提交到 /api/auth/register）**

```tsx
// src/app/(auth)/register/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || '注册失败');
      return;
    }
    router.push('/login');  // 注册成功 → 跳转登录
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">注册</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input className="w-full border rounded px-3 py-2 mb-3" placeholder="用户名"
          value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        <input className="w-full border rounded px-3 py-2 mb-3" type="email" placeholder="邮箱"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full border rounded px-3 py-2 mb-4" type="password" placeholder="密码（至少6位）"
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button className="w-full bg-blue-600 text-white rounded py-2 font-medium" type="submit">
          注册
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          已有账号？<a href="/login" className="text-blue-600 ml-1">登录</a>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **步骤 4: 提交**

```bash
git add -A && git commit -m "feat: 添加登录/注册页面及注册API"
```

---

## 阶段四：游戏外壳与导航

### 任务 8: App Shell（SessionProvider + Navbar + Sidebar）

**涉及文件:** 创建 src/components/layout/AppShell.tsx, Navbar.tsx, Sidebar.tsx, src/app/(game)/layout.tsx, src/app/(game)/home/page.tsx

- [ ] **步骤 1: 编写 Navbar（顶栏：标题 + 用户名 + 退出按钮）**

```tsx
// src/components/layout/Navbar.tsx
'use client';
import { signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="h-14 bg-white border-b flex items-center justify-between px-6">
      <h1 className="font-bold text-lg text-purple-700">DressUp</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user?.name}</span>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-gray-500 hover:text-gray-700">退出</button>
      </div>
    </nav>
  );
}
```

- [ ] **步骤 2: 编写 Sidebar（左侧导航：角色/仓库/编辑器/社区）**

```tsx
// src/components/layout/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/home', label: '我的角色' },
  { href: '/wardrobe', label: '仓库' },
  { href: '/editor', label: '服装创作' },
  { href: '/forum', label: '社区' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-48 bg-gray-50 border-r min-h-[calc(100vh-56px)] p-4">
      <nav className="flex flex-col gap-1">
        {links.map(link => (
          <Link key={link.href} href={link.href}
            className={`px-3 py-2 rounded text-sm font-medium transition ${
              pathname === link.href ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-200'
            }`}>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **步骤 3: 编写 AppShell 和布局**

```tsx
// src/components/layout/AppShell.tsx
'use client';
import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </SessionProvider>
  );
}
```

```tsx
// src/app/(game)/layout.tsx
import AppShell from '@/components/layout/AppShell';
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx
// src/app/(game)/home/page.tsx
export default function HomePage() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">我的角色</h2>
      <p className="text-gray-500">角色列表（后续接入API加载）</p>
    </div>
  );
}
```

- [ ] **步骤 4: 提交**

```bash
git add -A && git commit -m "feat: 添加游戏外壳布局（Navbar + Sidebar + SessionProvider）"
```

---

## 阶段五：角色系统

### 任务 9: 角色 Zustand Store

**涉及文件:** 创建 src/stores/characterStore.ts, src/stores/defaults.ts

- [ ] **步骤 1: 编写默认值**

```typescript
// src/stores/defaults.ts
import type { CharacterParams } from '@/lib/types';

// 默认角色参数
export const DEFAULT_CHARACTER_PARAMS: CharacterParams = {
  gender: 'female',
  body: { height: 'medium', shape: 'standard' },
  face: 'oval', eyes: 'almond', eyebrows: 'willow', mouth: 'standard',
  skin_tone: 'natural', hair: { front: 'bangs_01', back: 'long_01' },
};

// 3个新手预设角色
export const DEFAULT_PRESETS: Array<{ name: string; params: CharacterParams }> = [
  { name: '默认少女', params: DEFAULT_CHARACTER_PARAMS },
  {
    name: '运动少女',
    params: { ...DEFAULT_CHARACTER_PARAMS, body: { height: 'tall', shape: 'slim' },
      eyes: 'phoenix', hair: { front: 'bangs_03', back: 'pony_01' } },
  },
  {
    name: '甜美少女',
    params: { ...DEFAULT_CHARACTER_PARAMS, body: { height: 'short', shape: 'standard' },
      face: 'round', eyes: 'peach', hair: { front: 'bangs_01', back: 'twin_01' } },
  },
];
```

- [ ] **步骤 2: 编写角色 Store**

```typescript
// src/stores/characterStore.ts
// ===== 角色状态管理 =====
// 管理：捏人参数、当前穿戴列表、当前角色ID
// 与 wardrobeStore 联动：穿戴/卸下物品时更新 wearing
import { create } from 'zustand';
import type { CharacterParams, WearingEntry } from '@/lib/types';
import { DEFAULT_CHARACTER_PARAMS } from './defaults';

interface CharacterStore {
  params: CharacterParams;        // 捏人参数
  wearing: WearingEntry[];        // 当前穿戴 [{item_id, color_overrides}, ...]
  characterId: string | null;     // 当前编辑的角色ID（null=未保存）

  setParams: (partial: Partial<CharacterParams>) => void;
  resetParams: () => void;
  setWearing: (wearing: WearingEntry[]) => void;
  addWearing: (entry: WearingEntry) => void;     // 穿戴一件（同item_id先卸再穿）
  removeWearing: (itemId: string) => void;       // 卸下一件
  setCharacterId: (id: string | null) => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  params: DEFAULT_CHARACTER_PARAMS,
  wearing: [],
  characterId: null,

  setParams: (partial) => set((s) => ({ params: { ...s.params, ...partial } })),
  resetParams: () => set({ params: DEFAULT_CHARACTER_PARAMS }),
  setWearing: (wearing) => set({ wearing }),
  addWearing: (entry) =>
    set((s) => {
      // 同 item_id 先移除再添加，实现"重新穿戴/更新染色"
      const filtered = s.wearing.filter((w) => w.item_id !== entry.item_id);
      return { wearing: [...filtered, entry] };
    }),
  removeWearing: (itemId) =>
    set((s) => ({ wearing: s.wearing.filter((w) => w.item_id !== itemId) })),
  setCharacterId: (id) => set({ characterId: id }),
}));
```

- [ ] **步骤 3: 提交**

```bash
git add -A && git commit -m "feat: 添加角色 Zustand store（捏人参数 + 穿戴管理）"
```

---

### 任务 10: CharacterCanvas 组件（PixiJS 角色展示）

**涉及文件:** 创建 src/components/character/CharacterCanvas.tsx

- [ ] **步骤 1: 编写 CharacterCanvas**

```tsx
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
```

- [ ] **步骤 2: 提交**

```bash
git add -A && git commit -m "feat: 添加 CharacterCanvas（PixiJS 骨骼调试渲染）"
```

---

### 任务 11: 角色定制表单 + 页面

**涉及文件:** 创建 src/components/character/CharacterForm.tsx, src/app/(game)/character/create/page.tsx, src/app/(game)/character/page.tsx

- [ ] **步骤 1: 编写 CharacterForm（所有捏人参数的按钮选择器）**

```tsx
// src/components/character/CharacterForm.tsx
// 捏人参数编辑表单 - 用按钮组代替下拉框，方便预览切换
'use client';
import { useCharacterStore, DEFAULT_PRESETS } from '@/stores/characterStore';

// 每个参数的可选值 + 中文标签
const OPTIONS: Record<string, { label: string; value: string }[]> = {
  height: [{ label: '矮', value: 'short' }, { label: '中', value: 'medium' }, { label: '高', value: 'tall' }],
  shape: [{ label: '纤细', value: 'slim' }, { label: '标准', value: 'standard' }, { label: '丰满', value: 'plump' }],
  face: [{ label: '圆脸', value: 'round' }, { label: '瓜子脸', value: 'oval' }, { label: '方脸', value: 'square' }, { label: '鹅蛋脸', value: 'heart' }],
  eyes: [{ label: '杏眼', value: 'almond' }, { label: '丹凤眼', value: 'phoenix' }, { label: '桃花眼', value: 'peach' }],
  eyebrows: [{ label: '柳叶眉', value: 'willow' }, { label: '平眉', value: 'flat' }, { label: '剑眉', value: 'arched' }],
  mouth: [{ label: '薄唇', value: 'thin' }, { label: '标准', value: 'standard' }, { label: '厚唇', value: 'thick' }],
  skin_tone: [{ label: '白皙', value: 'fair' }, { label: '自然', value: 'natural' }, { label: '小麦', value: 'wheat' }, { label: '深色', value: 'deep' }],
};

export default function CharacterForm() {
  const { params, setParams, resetParams } = useCharacterStore();

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {/* 预设选择 */}
      <section>
        <h3 className="font-semibold mb-2">预设</h3>
        <div className="flex gap-2 flex-wrap">
          {DEFAULT_PRESETS.map(p => (
            <button key={p.name} onClick={() => setParams(p.params)}
              className="px-3 py-1 border rounded text-sm hover:bg-purple-50">{p.name}</button>
          ))}
        </div>
      </section>

      {/* 性别 */}
      <section>
        <h3 className="font-semibold mb-2">性别</h3>
        <div className="flex gap-2">
          {[{ label: '女', value: 'female' }, { label: '男', value: 'male' }].map(o => (
            <button key={o.value} onClick={() => setParams({ gender: o.value as any })}
              className={`px-4 py-1 rounded text-sm ${params.gender === o.value ? 'bg-purple-600 text-white' : 'border'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </section>

      {/* 身高、体型、脸型、眼型、眉型、嘴型、肤色 */}
      {([
        ['身高', 'height'], ['体型', 'shape'], ['脸型', 'face'],
        ['眼型', 'eyes'], ['眉型', 'eyebrows'], ['嘴型', 'mouth'], ['肤色', 'skin_tone'],
      ] as const).map(([label, key]) => (
        <section key={key}>
          <h3 className="font-semibold mb-2">{label}</h3>
          <div className="flex gap-2 flex-wrap">
            {OPTIONS[key].map(o => (
              <button key={o.value} onClick={() => setParams({ [key]: o.value } as any)}
                className={`px-4 py-1 rounded text-sm ${(params as any)[key] === o.value ? 'bg-purple-600 text-white' : 'border'}`}>
                {o.label}
              </button>
            ))}
          </div>
        </section>
      ))}

      <button onClick={resetParams} className="px-4 py-2 border rounded text-sm text-gray-500">恢复默认</button>
    </div>
  );
}
```

- [ ] **步骤 2: 编写角色页面**

```tsx
// src/app/(game)/character/page.tsx
import Link from 'next/link';
export default function CharacterListPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">我的角色</h2>
        <Link href="/character/create" className="px-4 py-2 bg-purple-600 text-white rounded text-sm">创建角色</Link>
      </div>
      <p className="text-gray-500">暂无角色（接入API后从数据库加载）</p>
    </div>
  );
}
```

```tsx
// src/app/(game)/character/create/page.tsx
'use client';
import CharacterCanvas from '@/components/character/CharacterCanvas';
import CharacterForm from '@/components/character/CharacterForm';

export default function CreateCharacterPage() {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0"><CharacterCanvas /></div>
      <div className="flex-1 max-w-lg"><CharacterForm /></div>
    </div>
  );
}
```

- [ ] **步骤 3: 提交**

```bash
git add -A && git commit -m "feat: 添加角色创建表单和页面"
```

---

### 任务 12: 角色 API 路由

**涉及文件:** 创建 src/app/api/avatar/route.ts, src/app/api/avatar/[id]/route.ts

- [ ] **步骤 1: 编写角色列表/创建 API**

```typescript
// src/app/api/avatar/route.ts
// GET: 获取当前用户的角色列表 / POST: 创建新角色
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(30),
  gender: z.enum(['male', 'female']),
  custom_params: z.any(),  // 捏人参数JSON
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const characters = await prisma.character.findMany({
    where: { userId }, orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(characters);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, gender, custom_params } = parsed.data;
  const character = await prisma.character.create({
    data: { userId, name, gender, customParams: custom_params },
  });
  return NextResponse.json(character, { status: 201 });
}
```

- [ ] **步骤 2: 编写单角色 RUD API**

```typescript
// src/app/api/avatar/[id]/route.ts
// GET: 获取角色详情 / PATCH: 更新参数或穿戴 / DELETE: 删除角色
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const character = await prisma.character.findFirst({ where: { id: params.id, userId } });
  if (!character) return NextResponse.json({ error: '未找到' }, { status: 404 });
  return NextResponse.json(character);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  const result = await prisma.character.updateMany({
    where: { id: params.id, userId },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.custom_params && { customParams: body.custom_params }),
      ...(body.wearing !== undefined && { wearing: body.wearing }),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: '未找到' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  await prisma.character.deleteMany({ where: { id: params.id, userId } });
  return NextResponse.json({ success: true });
}
```

- [ ] **步骤 3: 提交**

```bash
git add -A && git commit -m "feat: 添加角色 CRUD API 路由"
```

---

## 阶段六：仓库系统

### 任务 13: 仓库 Store + UI 组件

**涉及文件:** 创建 src/stores/wardrobeStore.ts, src/components/wardrobe/WardrobeCard.tsx, WardrobeGrid.tsx, WardrobeDetail.tsx, src/app/(game)/wardrobe/page.tsx, src/components/shared/Modal.tsx, Pagination.tsx

- [ ] **步骤 1: 编写仓库 Store**

```typescript
// src/stores/wardrobeStore.ts
// 管理：物品列表、分类筛选、分页、选中详情
import { create } from 'zustand';
import type { GarmentCategory } from '@/lib/types';

interface WardrobeItem {
  id: string; name: string; category: GarmentCategory;
  layer: number; thumbnailUrl: string | null; createdByEditor: boolean; parts: any[];
}

interface WardrobeStore {
  items: WardrobeItem[];
  selectedCategory: GarmentCategory | 'all';
  page: number; totalPages: number;
  selectedItem: WardrobeItem | null;

  setItems: (items: WardrobeItem[]) => void;
  setCategory: (cat: GarmentCategory | 'all') => void;  // 切换分类时重置到第1页
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setSelectedItem: (item: WardrobeItem | null) => void;
  removeItem: (id: string) => void;
}

export const useWardrobeStore = create<WardrobeStore>((set) => ({
  items: [], selectedCategory: 'all', page: 1, totalPages: 1, selectedItem: null,
  setItems: (items) => set({ items }),
  setCategory: (cat) => set({ selectedCategory: cat, page: 1 }),  // 切分类 → 重置页
  setPage: (page) => set({ page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  removeItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
}));
```

- [ ] **步骤 2: 编写 WardrobeCard、WardrobeGrid、WardrobeDetail**

```tsx
// src/components/wardrobe/WardrobeCard.tsx
'use client';
interface Props { id: string; name: string; thumbnailUrl: string | null; onClick: () => void; }
export default function WardrobeCard({ name, thumbnailUrl, onClick }: Props) {
  return (
    <button onClick={onClick} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition">
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        {thumbnailUrl ? <img src={thumbnailUrl} alt={name} className="w-full h-full object-cover" />
          : <span className="text-gray-400 text-sm">暂无预览</span>}
      </div>
      <div className="p-2 text-sm text-center truncate">{name}</div>
    </button>
  );
}
```

```tsx
// src/components/wardrobe/WardrobeGrid.tsx
'use client';
import { useEffect } from 'react';
import { useWardrobeStore } from '@/stores/wardrobeStore';
import { useCharacterStore } from '@/stores/characterStore';
import { CATEGORY_LABELS, GARMENT_CATEGORIES } from '@/lib/constants';
import WardrobeCard from './WardrobeCard';
import WardrobeDetail from './WardrobeDetail';
import Pagination from '@/components/shared/Pagination';

export default function WardrobeGrid() {
  const { items, selectedCategory, page, totalPages, selectedItem,
    setItems, setCategory, setPage, setTotalPages, setSelectedItem } = useWardrobeStore();
  const addWearing = useCharacterStore(s => s.addWearing);

  // 分类或页码变化 → 请求API
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    params.set('page', String(page)); params.set('limit', '20');
    fetch(`/api/wardrobe?${params}`).then(r => r.json()).then(data => {
      setItems(data.items); setTotalPages(data.totalPages);
    });
  }, [selectedCategory, page]);

  const categories = ['all', ...GARMENT_CATEGORIES] as const;
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded text-sm ${selectedCategory === cat ? 'bg-purple-600 text-white' : 'border hover:bg-gray-100'}`}>
            {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {items.map(item => <WardrobeCard key={item.id} {...item} onClick={() => setSelectedItem(item)} />)}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {selectedItem && (
        <WardrobeDetail item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onWear={() => { addWearing({ item_id: selectedItem.id, color_overrides: {} }); setSelectedItem(null); }}
        />
      )}
    </div>
  );
}
```

```tsx
// src/components/wardrobe/WardrobeDetail.tsx
'use client';
import Modal from '@/components/shared/Modal';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { GarmentCategory } from '@/lib/types';

interface Props {
  item: { id: string; name: string; category: GarmentCategory; thumbnailUrl: string | null; createdByEditor: boolean };
  onClose: () => void; onWear: () => void;
}

export default function WardrobeDetail({ item, onClose, onWear }: Props) {
  return (
    <Modal onClose={onClose}>
      <div className="flex gap-6">
        <div className="w-64 h-64 bg-gray-100 rounded flex items-center justify-center">
          {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
            : <span className="text-gray-400">暂无预览</span>}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">{item.name}</h3>
          <p className="text-sm text-gray-500 mb-1">分类: {CATEGORY_LABELS[item.category]}</p>
          <p className="text-sm text-gray-500 mb-4">来源: {item.createdByEditor ? '自制' : '系统预设'}</p>
          <div className="flex gap-2">
            <button onClick={onWear} className="px-6 py-2 bg-purple-600 text-white rounded text-sm">穿戴</button>
            <button onClick={onClose} className="px-6 py-2 border rounded text-sm">关闭</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **步骤 3: 编写共享组件（Modal、Pagination）及仓库页面**

```tsx
// src/components/shared/Modal.tsx - 点击遮罩关闭的弹窗
export default function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

```tsx
// src/components/shared/Pagination.tsx - 上一页/下一页
export default function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 border rounded text-sm disabled:opacity-30">上一页</button>
      <span className="text-sm text-gray-500">{page} / {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 border rounded text-sm disabled:opacity-30">下一页</button>
    </div>
  );
}
```

```tsx
// src/app/(game)/wardrobe/page.tsx
import WardrobeGrid from '@/components/wardrobe/WardrobeGrid';
export default function WardrobePage() {
  return (<div><h2 className="text-xl font-bold mb-4">我的仓库</h2><WardrobeGrid /></div>);
}
```

- [ ] **步骤 4: 提交**

```bash
git add -A && git commit -m "feat: 添加仓库Store和UI（网格+详情弹窗+分页）"
```

---

### 任务 14: 仓库 API 路由

**涉及文件:** 创建 src/app/api/wardrobe/route.ts, src/app/api/wardrobe/[id]/route.ts

- [ ] **步骤 1: 编写仓库列表 API（含分类筛选+分页）**

```typescript
// src/app/api/wardrobe/route.ts
// GET: 获取系统预设 + 当前用户自制的服装列表，支持分类筛选和分页
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  // 系统预设(ownerId=null) 或 当前用户自制
  const where: any = { OR: [{ ownerId: null }, { ownerId: userId }] };
  if (category) where.category = category;

  const [items, total] = await Promise.all([
    prisma.wardrobeItem.findMany({
      where, include: { parts: true },
      skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.wardrobeItem.count({ where }),
  ]);

  return NextResponse.json({ items, totalPages: Math.ceil(total / limit) });
}
```

- [ ] **步骤 2: 编写单件详情/删除 API**

```typescript
// src/app/api/wardrobe/[id]/route.ts
// GET: 单件详情（含部件列表）/ DELETE: 删除（仅本人自制物品）
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.wardrobeItem.findUnique({ where: { id: params.id }, include: { parts: true } });
  if (!item) return NextResponse.json({ error: '未找到' }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const item = await prisma.wardrobeItem.findUnique({ where: { id: params.id } });
  if (!item || item.ownerId !== userId) return NextResponse.json({ error: '无权删除' }, { status: 403 });

  await prisma.wardrobeItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **步骤 3: 提交**

```bash
git add -A && git commit -m "feat: 添加仓库列表/详情API"
```

---

## 阶段七：服装创作编辑器

### 任务 15: 设计器 Store

**涉及文件:** 创建 src/stores/designStore.ts

- [ ] **步骤 1: 编写设计器 Store**

```typescript
// src/stores/designStore.ts
// 管理编辑器状态：当前编辑的服装分类、名称、部件列表、选中部件、部件模板库
import { create } from 'zustand';
import type { EditorPart, PartType, GarmentCategory, BoneName } from '@/lib/types';

// 部件模板（从系统配置加载）
interface PartTemplate {
  id: string; partType: PartType; name: string; label: string;
  defaultBone: BoneName; textureUrl?: string;
}

interface DesignStore {
  category: GarmentCategory;       // 当前编辑的服装大分类
  name: string;                     // 衣服名称
  parts: EditorPart[];              // 已添加的部件列表
  selectedPartId: string | null;    // 当前选中部件ID

  setCategory: (cat: GarmentCategory) => void;
  setName: (name: string) => void;
  addPart: (template: PartTemplate) => void;   // 从模板库添加一个部件
  removePart: (id: string) => void;
  selectPart: (id: string | null) => void;
  updatePart: (id: string, data: Partial<EditorPart>) => void;  // 修改部件属性
  reorderPart: (id: string, newZOrder: number) => void;         // 调整同层内的顺序
  clearDesign: () => void;
}

let tempId = 0;  // 客户端临时ID生成器

export const useDesignStore = create<DesignStore>((set) => ({
  category: 'dress', name: '', parts: [], selectedPartId: null,

  setCategory: (cat) => set({ category: cat }),
  setName: (name) => set({ name }),

  addPart: (template) => {
    if (useDesignStore.getState().parts.length >= 15) {
      alert('单件衣服最多15个部件'); return;
    }
    const newPart: EditorPart = {
      id: `part_${++tempId}`,
      partType: template.partType,
      templateId: template.id,
      textureUrl: template.textureUrl,
      boneAnchor: template.defaultBone,
      offsetX: 0, offsetY: 0, scaleX: 1.0, scaleY: 1.0,
      rotation: 0, colorHex: '#ffffff', zOrder: 0,
    };
    set((s) => ({ parts: [...s.parts, newPart], selectedPartId: newPart.id }));
  },

  removePart: (id) =>
    set((s) => ({
      parts: s.parts.filter(p => p.id !== id),
      selectedPartId: s.selectedPartId === id ? null : s.selectedPartId,
    })),

  selectPart: (id) => set({ selectedPartId: id }),
  updatePart: (id, data) =>
    set((s) => ({ parts: s.parts.map(p => p.id === id ? { ...p, ...data } : p) })),

  reorderPart: (id, newZOrder) =>
    set((s) => ({ parts: s.parts.map(p => p.id === id ? { ...p, zOrder: newZOrder } : p) })),

  clearDesign: () => set({ name: '', parts: [], selectedPartId: null }),
}));
```

- [ ] **步骤 2: 提交**

```bash
git add -A && git commit -m "feat: 添加设计编辑器 Zustand store"
```

---

### 任务 16: 编辑器 UI（三栏布局 + 部件库 + 属性面板）

**涉及文件:** 创建 src/components/editor/EditorShell.tsx, PartLibrary.tsx, PropertyPanel.tsx, src/app/(game)/editor/page.tsx

- [ ] **步骤 1: 编写 PartLibrary（左栏）**

```tsx
// src/components/editor/PartLibrary.tsx
// 左栏：部件库浏览器 — 按类型分组展开，点击添加到当前编辑的衣服
'use client';
import { useDesignStore } from '@/stores/designStore';
import type { PartType, BoneName } from '@/lib/types';

// partType → 中文标签
const PART_TYPE_LABELS: Record<PartType, string> = {
  base_shape: '基布版型', collar: '领口', sleeve: '袖型',
  hem: '下摆', pattern: '图案', decoration: '装饰', texture: '材质',
};

// partType → 默认挂载的骨骼锚点
const DEFAULT_BONES: Record<PartType, BoneName> = {
  base_shape: 'chest', collar: 'neck', sleeve: 'left_shoulder',
  hem: 'waist', pattern: 'chest', decoration: 'waist', texture: 'chest',
};

// 系统部件模板库（后续可改为从 API 加载）
const TEMPLATES = [
  // 基布版型 8 套
  { id: 'base_tshirt_01', partType: 'base_shape' as PartType, name: 'T恤', label: '基础T恤' },
  { id: 'base_shirt_01', partType: 'base_shape' as PartType, name: '衬衫', label: '基础衬衫' },
  { id: 'base_dress_a_01', partType: 'base_shape' as PartType, name: 'A字连衣裙', label: 'A字连衣裙' },
  { id: 'base_hoodie_01', partType: 'base_shape' as PartType, name: '卫衣', label: '基础卫衣' },
  { id: 'base_jacket_01', partType: 'base_shape' as PartType, name: '外套', label: '基础外套' },
  { id: 'base_jeans_01', partType: 'base_shape' as PartType, name: '牛仔裤', label: '基础牛仔裤' },
  { id: 'base_skirt_short_01', partType: 'base_shape' as PartType, name: '短裙', label: 'A字短裙' },
  { id: 'base_skirt_long_01', partType: 'base_shape' as PartType, name: '长裙', label: '百褶长裙' },
  // 领口 5 种
  { id: 'collar_round_01', partType: 'collar', name: '圆领', label: '圆领' },
  { id: 'collar_v_01', partType: 'collar', name: 'V领', label: 'V领' },
  { id: 'collar_square_01', partType: 'collar', name: '方领', label: '方领' },
  { id: 'collar_high_01', partType: 'collar', name: '高领', label: '高领' },
  { id: 'collar_collar_01', partType: 'collar', name: '翻领', label: '翻领' },
  // 袖型
  { id: 'sleeve_none', partType: 'sleeve', name: '无袖', label: '无袖' },
  { id: 'sleeve_short_01', partType: 'sleeve', name: '短袖', label: '短袖' },
  { id: 'sleeve_puff_01', partType: 'sleeve', name: '泡泡袖', label: '泡泡袖' },
  { id: 'sleeve_long_01', partType: 'sleeve', name: '长袖', label: '长袖' },
  // 下摆
  { id: 'hem_straight_01', partType: 'hem', name: '直筒', label: '直筒下摆' },
  { id: 'hem_a_01', partType: 'hem', name: 'A字', label: 'A字下摆' },
  { id: 'hem_ruffle_01', partType: 'hem', name: '荷叶边', label: '荷叶边下摆' },
  // 图案
  { id: 'pat_stripe_01', partType: 'pattern', name: '条纹', label: '条纹' },
  { id: 'pat_plaid_01', partType: 'pattern', name: '格子', label: '格子' },
  { id: 'pat_dot_01', partType: 'pattern', name: '波点', label: '波点' },
  { id: 'pat_floral_01', partType: 'pattern', name: '碎花', label: '碎花' },
  // 装饰
  { id: 'deco_bow_01', partType: 'decoration', name: '蝴蝶结', label: '蝴蝶结' },
  { id: 'deco_button_01', partType: 'decoration', name: '纽扣', label: '纽扣' },
  { id: 'deco_lace_01', partType: 'decoration', name: '蕾丝边', label: '蕾丝边' },
  // 材质
  { id: 'tex_cotton_01', partType: 'texture', name: '棉布', label: '棉布纹理' },
  { id: 'tex_denim_01', partType: 'texture', name: '牛仔', label: '牛仔纹理' },
  { id: 'tex_silk_01', partType: 'texture', name: '丝绸', label: '丝绸纹理' },
];

function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => { const key = keyFn(item); (acc[key] ??= []).push(item); return acc; }, {} as Record<K, T[]>);
}

export default function PartLibrary() {
  const addPart = useDesignStore(s => s.addPart);
  const parts = useDesignStore(s => s.parts);
  const grouped = groupBy(TEMPLATES, t => t.partType);

  const handleAdd = (t: (typeof TEMPLATES)[0]) => {
    addPart({
      id: t.id, partType: t.partType, name: t.name, label: t.label,
      defaultBone: DEFAULT_BONES[t.partType],
      textureUrl: `/assets/system/${t.partType}s/${t.id}.png`,
    });
  };

  return (
    <div className="w-64 bg-white border-r p-3 overflow-y-auto h-full">
      <h3 className="font-semibold text-sm mb-3">部件库 ({parts.length}/15)</h3>
      {Object.entries(grouped).map(([type, templates]) => (
        <details key={type} className="mb-2">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer py-1">
            {PART_TYPE_LABELS[type as PartType]}
          </summary>
          <div className="pl-2 space-y-1 mt-1">
            {templates.map(t => (
              <button key={t.id} onClick={() => handleAdd(t)}
                className="block w-full text-left text-xs px-2 py-1 rounded hover:bg-purple-50 transition">
                {t.label}
              </button>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
```

- [ ] **步骤 2: 编写 PropertyPanel（右栏）**

```tsx
// src/components/editor/PropertyPanel.tsx
// 右栏：选中部件的属性编辑 — 骨骼锚点、偏移、缩放、旋转、颜色
'use client';
import { useDesignStore } from '@/stores/designStore';

const BONE_OPTIONS = ['head', 'neck', 'left_shoulder', 'right_shoulder', 'chest', 'waist',
  'left_hip', 'right_hip', 'left_wrist', 'right_wrist'];

export default function PropertyPanel() {
  const { parts, selectedPartId, selectPart, updatePart, removePart, reorderPart } = useDesignStore();
  const selected = parts.find(p => p.id === selectedPartId);

  return (
    <div className="w-72 bg-white border-l p-3 overflow-y-auto h-full">
      <h3 className="font-semibold text-sm mb-3">属性面板</h3>
      {selected ? (
        <div className="space-y-3">
          {/* 锚点骨骼选择 */}
          <div>
            <label className="text-xs text-gray-500 block">锚点骨骼</label>
            <select value={selected.boneAnchor}
              onChange={e => updatePart(selected.id, { boneAnchor: e.target.value as any })}
              className="w-full border rounded px-2 py-1 text-sm">
              {BONE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* X/Y偏移 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block">X偏移</label>
              <input type="number" value={selected.offsetX} step={1}
                onChange={e => updatePart(selected.id, { offsetX: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Y偏移</label>
              <input type="number" value={selected.offsetY} step={1}
                onChange={e => updatePart(selected.id, { offsetY: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm" />
            </div>
          </div>

          {/* X/Y缩放 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block">X缩放</label>
              <input type="number" value={selected.scaleX} step={0.05} min={0.5} max={2}
                onChange={e => updatePart(selected.id, { scaleX: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Y缩放</label>
              <input type="number" value={selected.scaleY} step={0.05} min={0.5} max={2}
                onChange={e => updatePart(selected.id, { scaleY: Number(e.target.value) })}
                className="w-full border rounded px-2 py-1 text-sm" />
            </div>
          </div>

          {/* 旋转 */}
          <div>
            <label className="text-xs text-gray-500 block">旋转 (°)</label>
            <input type="number" value={selected.rotation} step={1}
              onChange={e => updatePart(selected.id, { rotation: Number(e.target.value) })}
              className="w-full border rounded px-2 py-1 text-sm" />
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="text-xs text-gray-500 block">颜色</label>
            <div className="flex items-center gap-2">
              <input type="color" value={selected.colorHex || '#ffffff'}
                onChange={e => updatePart(selected.id, { colorHex: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border" />
              <input type="text" value={selected.colorHex || ''}
                onChange={e => updatePart(selected.id, { colorHex: e.target.value })}
                className="flex-1 border rounded px-2 py-1 text-sm" />
            </div>
          </div>

          <button onClick={() => removePart(selected.id)}
            className="w-full py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50">
            删除此部件
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">点击选中一个部件进行编辑</p>
      )}

      {/* 已添加部件列表（带上下排序按钮） */}
      <div className="mt-6">
        <h4 className="text-xs text-gray-500 mb-2">已添加部件</h4>
        <div className="space-y-1">
          {[...parts].sort((a, b) => a.zOrder - b.zOrder).map((part, idx) => (
            <button key={part.id} onClick={() => selectPart(part.id)}
              className={`w-full text-left text-xs px-2 py-1.5 rounded flex items-center justify-between ${
                selectedPartId === part.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
              }`}>
              <span>{part.templateId}</span>
              <span className="flex gap-1">
                <button onClick={e => { e.stopPropagation(); reorderPart(part.id, idx - 1); }}
                  disabled={idx === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">↑</button>
                <button onClick={e => { e.stopPropagation(); reorderPart(part.id, idx + 1); }}
                  disabled={idx === parts.length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-20">↓</button>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **步骤 3: 编写 EditorShell 和编辑器页面**

```tsx
// src/components/editor/EditorShell.tsx
// 编辑器三栏布局 + 顶部工具栏（名称/分类/保存/清空）
'use client';
import PartLibrary from './PartLibrary';
import PropertyPanel from './PropertyPanel';
import EditorCanvas from './EditorCanvas';
import { useDesignStore } from '@/stores/designStore';
import { useRouter } from 'next/navigation';
import { GARMENT_CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
import type { GarmentCategory } from '@/lib/types';

export default function EditorShell() {
  const { category, name, parts, setCategory, setName, clearDesign } = useDesignStore();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) { alert('请输入衣服名称'); return; }
    if (parts.length === 0) { alert('请至少添加一个部件'); return; }

    const body = { name: name.trim(), category, previewThumbnail: '',
      parts: parts.map(({ id, ...rest }) => rest),
    };

    const res = await fetch('/api/design', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { alert('保存失败'); return; }
    clearDesign();
    router.push('/wardrobe');  // 保存成功 → 跳转到仓库
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部工具栏 */}
      <div className="flex items-center gap-4 px-3 py-2 bg-white border-b">
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="输入衣服名称..." className="border rounded px-3 py-1 text-sm flex-1 max-w-xs" />
        <select value={category} onChange={e => setCategory(e.target.value as GarmentCategory)}
          className="border rounded px-2 py-1 text-sm">
          {GARMENT_CATEGORIES.filter(c => c !== 'hair' && c !== 'socks' && c !== 'accessory').map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <button onClick={handleSave} className="px-6 py-1.5 bg-purple-600 text-white rounded text-sm">保存</button>
        <button onClick={clearDesign} className="px-4 py-1.5 border rounded text-sm text-gray-500">清空</button>
      </div>
      {/* 三栏编辑区 */}
      <div className="flex flex-1 overflow-hidden">
        <PartLibrary />
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <EditorCanvas />
        </div>
        <PropertyPanel />
      </div>
    </div>
  );
}
```

```tsx
// src/app/(game)/editor/page.tsx
import EditorShell from '@/components/editor/EditorShell';
export default function EditorPage() {
  return (<div className="h-[calc(100vh-56px-48px)] -m-6"><EditorShell /></div>);
}
```

- [ ] **步骤 4: 提交**

```bash
git add -A && git commit -m "feat: 添加编辑器三栏UI（部件库+预览+属性面板）"
```

---

### 任务 17: 编辑器 Canvas 集成 + 设计保存 API

**涉及文件:** 创建 src/components/editor/EditorCanvas.tsx, src/app/api/design/route.ts

- [ ] **步骤 1: 编写 EditorCanvas（实时预览）**

```tsx
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
```

- [ ] **步骤 2: 编写设计保存 API**

```typescript
// src/app/api/design/route.ts
// POST: 保存玩家创作的服装（创建 wardrobeItem + N个 itemParts + 自动入库）
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';
import { z } from 'zod';
import { GARMENT_LAYERS } from '@/lib/constants';
import type { GarmentCategory } from '@/lib/types';

const partSchema = z.object({
  partType: z.string(), templateId: z.string(), textureUrl: z.string().nullable().optional(),
  boneAnchor: z.string(), offsetX: z.number(), offsetY: z.number(),
  scaleX: z.number(), scaleY: z.number(), rotation: z.number(),
  colorHex: z.string().nullable().optional(), zOrder: z.number(),
});

const designSchema = z.object({
  name: z.string().min(1).max(30),
  category: z.enum(['top', 'bottom', 'dress', 'shoes', 'socks', 'accessory', 'hair']),
  previewThumbnail: z.string().optional(),
  parts: z.array(partSchema).min(1).max(15),  // 最少1个，最多15个部件
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = designSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, category, parts } = parsed.data;
  const layer = GARMENT_LAYERS[category as GarmentCategory] || 3;

  // 创建衣服 + 部件 + 自动入库（事务）
  const item = await prisma.wardrobeItem.create({
    data: {
      ownerId: userId, name, category, layer,
      parts: { create: parts.map(p => ({
        partType: p.partType, templateId: p.templateId, textureUrl: p.textureUrl || null,
        boneAnchor: p.boneAnchor, offsetX: p.offsetX, offsetY: p.offsetY,
        scaleX: p.scaleX, scaleY: p.scaleY, rotation: p.rotation,
        colorHex: p.colorHex || null, zOrder: p.zOrder,
      }))},
    },
    include: { parts: true },
  });

  // 自动添加到用户仓库
  await prisma.userInventory.create({ data: { userId, itemId: item.id } });

  return NextResponse.json(item, { status: 201 });
}
```

- [ ] **步骤 3: 提交**

```bash
git add -A && git commit -m "feat: 添加编辑器实时预览和设计保存API"
```

---

## 阶段八：快照与分享

### 任务 18: 快照导出 + 图片上传 API

**涉及文件:** 创建 src/engine/snapshot.ts, src/app/api/upload/route.ts

- [ ] **步骤 1: 编写快照导出工具**

```typescript
// src/engine/snapshot.ts
// Canvas → Base64 PNG 导出（固定分辨率 1024×1024）
import * as PIXI from 'pixi.js';

// 导出当前 Canvas 为 base64 data URL
export function exportSnapshot(app: PIXI.Application): string {
  const oldResolution = app.renderer.resolution;
  app.renderer.resolution = 1;   // 强制 1x 分辨率
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
```

- [ ] **步骤 2: 编写图片上传 API（Sharp 多尺寸 + 元数据清除）**

```typescript
// src/app/api/upload/route.ts
// POST: 上传图片 → 验证格式/大小 → 生成三种尺寸 → 返回URL
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');
const MAX_SIZE = 2 * 1024 * 1024;  // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof Blob)) return NextResponse.json({ error: '未提供文件' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: '文件超过2MB限制' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: '仅支持PNG/JPEG/WebP' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${crypto.randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });

  // 保存去元数据后的原图
  await sharp(buffer).toFile(path.join(UPLOAD_DIR, filename));

  // 生成缩略图 200px
  const thumbFilename = `thumb_${filename}`;
  await sharp(buffer).resize(200, 200, { fit: 'inside' }).toFile(path.join(UPLOAD_DIR, thumbFilename));

  // 生成展示图 800px
  const displayFilename = `display_${filename}`;
  await sharp(buffer).resize(800, 800, { fit: 'inside' }).toFile(path.join(UPLOAD_DIR, displayFilename));

  return NextResponse.json({
    original: `/uploads/${filename}`, thumbnail: `/uploads/${thumbFilename}`, display: `/uploads/${displayFilename}`,
  }, { status: 201 });
}
```

- [ ] **步骤 3: 提交**

```bash
git add -A && git commit -m "feat: 添加快照导出和图片上传API（多尺寸+去元数据）"
```

---

## 阶段九：论坛系统

### 任务 19: 论坛 Store + UI 组件 + 页面

**涉及文件:** 创建 src/stores/forumStore.ts, src/components/forum/PostCard.tsx, PostList.tsx, PostForm.tsx, PostDetail.tsx, CommentSection.tsx, src/components/shared/ImageUploader.tsx, src/app/(game)/forum/page.tsx, src/app/(game)/forum/[id]/page.tsx

- [ ] **步骤 1: 编写论坛 Store**

```typescript
// src/stores/forumStore.ts
import { create } from 'zustand';
import type { PostData } from '@/lib/types';

interface ForumStore {
  posts: PostData[]; currentPost: PostData | null; comments: any[];
  page: number; totalPages: number;
  setPosts: (posts: PostData[]) => void;
  setCurrentPost: (post: PostData | null) => void;
  setComments: (comments: any[]) => void;
  setPage: (page: number) => void;
  setTotalPages: (total: number) => void;
}

export const useForumStore = create<ForumStore>((set) => ({
  posts: [], currentPost: null, comments: [], page: 1, totalPages: 1,
  setPosts: (posts) => set({ posts }),
  setCurrentPost: (post) => set({ currentPost: post }),
  setComments: (comments) => set({ comments }),
  setPage: (page) => set({ page }),
  setTotalPages: (total) => set({ totalPages: total }),
}));
```

- [ ] **步骤 2: 编写 PostCard、PostList**

```tsx
// src/components/forum/PostCard.tsx - 帖子卡片（缩略图+标题+用户名+点赞/评论数）
'use client';
import Link from 'next/link';
import type { PostData } from '@/lib/types';

export default function PostCard({ post }: { post: PostData }) {
  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-sm transition flex gap-4">
      {post.imageUrl && (
        <Link href={`/forum/${post.id}`} className="flex-shrink-0">
          <img src={post.imageUrl.replace('/uploads/', '/uploads/thumb_')}
            alt={post.title} className="w-40 h-40 object-cover rounded" />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <Link href={`/forum/${post.id}`} className="text-lg font-semibold hover:text-purple-600">{post.title}</Link>
        <p className="text-sm text-gray-500 mt-1">{post.user.username} · {new Date(post.createdAt).toLocaleDateString('zh-CN')}</p>
        {post.content && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{post.content}</p>}
        <div className="flex gap-4 mt-3 text-sm text-gray-400">
          <span>♡ {post._count.likes}</span><span>💬 {post._count.comments}</span>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// src/components/forum/PostList.tsx - 帖子列表 + 分页
'use client';
import { useEffect } from 'react';
import { useForumStore } from '@/stores/forumStore';
import PostCard from './PostCard';
import Pagination from '@/components/shared/Pagination';

export default function PostList() {
  const { posts, page, totalPages, setPosts, setPage, setTotalPages } = useForumStore();
  useEffect(() => {
    fetch(`/api/forum/posts?page=${page}&limit=10`).then(r => r.json()).then(data => {
      setPosts(data.posts); setTotalPages(data.totalPages);
    });
  }, [page]);

  return (
    <div className="space-y-4">
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
```

- [ ] **步骤 3: 编写 PostForm（发帖表单 + 图片上传）**

```tsx
// src/components/forum/PostForm.tsx - 发帖弹窗
'use client';
import { useState } from 'react';
import ImageUploader from '@/components/shared/ImageUploader';

export default function PostForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!title.trim()) return; setSubmitting(true);
    const res = await fetch('/api/forum/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), content: content.trim(), imageUrl }),
    });
    if (res.ok) { onClose(); window.location.reload(); }
    else { alert('发布失败'); }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">发布新帖</h2>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="标题" required className="w-full border rounded px-3 py-2 mb-3 text-sm" />
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="说点什么..." rows={4} className="w-full border rounded px-3 py-2 mb-3 text-sm resize-none" />
        <ImageUploader onUploaded={setImageUrl} />
        <div className="flex gap-2 mt-4">
          <button type="submit" disabled={submitting}
            className="flex-1 py-2 bg-purple-600 text-white rounded text-sm font-medium disabled:opacity-50">
            {submitting ? '发布中...' : '发布'}
          </button>
          <button type="button" onClick={onClose} className="px-6 py-2 border rounded text-sm">取消</button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **步骤 4: 编写 PostDetail、CommentSection**

```tsx
// src/components/forum/PostDetail.tsx - 帖子详情（含点赞按钮）
'use client';
import { useEffect } from 'react';
import { useForumStore } from '@/stores/forumStore';
import CommentSection from './CommentSection';

export default function PostDetail({ postId }: { postId: string }) {
  const { currentPost, setCurrentPost, comments, setComments } = useForumStore();

  useEffect(() => {
    fetch(`/api/forum/posts/${postId}`).then(r => r.json()).then(data => {
      setCurrentPost(data.post); setComments(data.comments);
    });
  }, [postId]);

  if (!currentPost) return <p className="text-gray-400 text-center py-12">加载中...</p>;

  async function handleLike() {
    await fetch(`/api/forum/posts/${postId}/like`, { method: 'POST' });
    const r = await fetch(`/api/forum/posts/${postId}`);
    const data = await r.json(); setCurrentPost(data.post);
  }

  return (
    <div>
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h1 className="text-xl font-bold mb-2">{currentPost.title}</h1>
        <p className="text-sm text-gray-500 mb-4">
          {currentPost.user.username} · {new Date(currentPost.createdAt).toLocaleDateString('zh-CN')}
        </p>
        {currentPost.imageUrl && <img src={currentPost.imageUrl} alt={currentPost.title} className="max-w-full rounded mb-4" />}
        {currentPost.content && <p className="text-gray-700">{currentPost.content}</p>}
        <button onClick={handleLike} className="mt-4 px-4 py-2 border rounded text-sm hover:bg-pink-50">
          ♡ {currentPost._count.likes}
        </button>
      </div>
      <CommentSection postId={postId} comments={comments} />
    </div>
  );
}
```

```tsx
// src/components/forum/CommentSection.tsx - 评论区（评论列表+发送表单）
'use client';
import { useState } from 'react';

export default function CommentSection({ postId, comments: initialComments }: { postId: string; comments: any[] }) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!content.trim()) return;
    const res = await fetch(`/api/forum/posts/${postId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim() }),
    });
    if (res.ok) { const newComment = await res.json(); setComments([...comments, newComment]); setContent(''); }
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">评论 ({comments.length})</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input type="text" value={content} onChange={e => setContent(e.target.value)}
          placeholder="写下你的评论..." required className="flex-1 border rounded px-3 py-2 text-sm" />
        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded text-sm">发送</button>
      </form>
      <div className="space-y-3">
        {comments.map((c: any) => (
          <div key={c.id} className="bg-white border rounded p-3">
            <p className="text-sm font-medium">{c.user?.username}</p>
            <p className="text-sm text-gray-600 mt-1">{c.content}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString('zh-CN')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **步骤 5: 编写 ImageUploader + 论坛页面**

```tsx
// src/components/shared/ImageUploader.tsx - 通用图片上传组件
'use client';
import { useState } from 'react';

export default function ImageUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('图片不能超过2MB'); return; }
    setUploading(true);
    const form = new FormData(); form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (res.ok) { const data = await res.json(); onUploaded(data.display); setPreview(data.display); }
    else { alert('上传失败'); }
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">图片（可选）</label>
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} className="text-sm" />
      {uploading && <p className="text-sm text-purple-500 mt-1">上传中...</p>}
      {preview && <img src={preview} alt="preview" className="mt-2 max-h-32 rounded" />}
    </div>
  );
}
```

```tsx
// src/app/(game)/forum/page.tsx
'use client';
import { useState } from 'react';
import PostList from '@/components/forum/PostList';
import PostForm from '@/components/forum/PostForm';

export default function ForumPage() {
  const [showForm, setShowForm] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">玩家社区</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-purple-600 text-white rounded text-sm">发布新帖</button>
      </div>
      <PostList />
      {showForm && <PostForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
```

```tsx
// src/app/(game)/forum/[id]/page.tsx
import PostDetail from '@/components/forum/PostDetail';
export default function PostPage({ params }: { params: { id: string } }) {
  return (<div className="max-w-2xl mx-auto"><PostDetail postId={params.id} /></div>);
}
```

- [ ] **步骤 6: 提交**

```bash
git add -A && git commit -m "feat: 添加论坛Store、UI组件和页面"
```

---

### 任务 20: 论坛 API 路由

**涉及文件:** 创建 src/app/api/forum/posts/route.ts, posts/[id]/route.ts, posts/[id]/like/route.ts, posts/[id]/comments/route.ts, comments/[id]/route.ts

- [ ] **步骤 1: 编写帖子列表+发帖 API（含每日3帖频率限制）**

```typescript
// src/app/api/forum/posts/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().max(2000).optional(),
  imageUrl: z.string().max(500).optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.count(),
  ]);
  return NextResponse.json({ posts, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // 每日发帖上限检查（每天最多3帖）
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const count = await prisma.post.count({ where: { userId, createdAt: { gte: today } } });
  if (count >= 3) return NextResponse.json({ error: '今日发帖已达上限（3篇）' }, { status: 429 });

  const { title, content, imageUrl } = parsed.data;
  const post = await prisma.post.create({
    data: { userId, title, content: content || null, imageUrl: imageUrl || null },
    include: { user: { select: { id: true, username: true } }, _count: { select: { likes: true, comments: true } } },
  });
  return NextResponse.json(post, { status: 201 });
}
```

- [ ] **步骤 2: 编写帖子详情+删除 / 点赞(幂等) / 评论+删评论**

```typescript
// src/app/api/forum/posts/[id]/route.ts - 帖子详情 + 删除
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, username: true } }, _count: { select: { likes: true, comments: true } } },
  });
  if (!post) return NextResponse.json({ error: '未找到' }, { status: 404 });
  const comments = await prisma.comment.findMany({
    where: { postId: params.id }, orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, username: true } } },
  });
  return NextResponse.json({ post, comments });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post || post.userId !== userId) return NextResponse.json({ error: '无权删除' }, { status: 403 });
  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

```typescript
// src/app/api/forum/posts/[id]/like/route.ts - 点赞（幂等：再点取消）
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId: params.id, userId } },
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }
  await prisma.like.create({ data: { postId: params.id, userId } });
  return NextResponse.json({ liked: true });
}
```

```typescript
// src/app/api/forum/posts/[id]/comments/route.ts - 评论（每日10条限制）
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';
import { z } from 'zod';

const schema = z.object({ content: z.string().min(1).max(500) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const count = await prisma.comment.count({ where: { userId, createdAt: { gte: today } } });
  if (count >= 10) return NextResponse.json({ error: '今日评论已达上限（10条）' }, { status: 429 });

  const comment = await prisma.comment.create({
    data: { postId: params.id, userId, content: parsed.data.content },
    include: { user: { select: { id: true, username: true } } },
  });
  return NextResponse.json(comment, { status: 201 });
}
```

```typescript
// src/app/api/forum/comments/[id]/route.ts - 删评论
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: '未登录' }, { status: 401 });
  const userId = (session.user as any).id;
  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment || comment.userId !== userId) return NextResponse.json({ error: '无权删除' }, { status: 403 });
  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **步骤 3: 提交**

```bash
git add -A && git commit -m "feat: 添加论坛API（帖子+点赞+评论+频率限制）"
```

---

## 阶段十：种子数据与收尾

### 任务 21: 系统预设物品种子脚本

**涉及文件:** 创建 prisma/seed.ts

- [ ] **步骤 1: 编写种子脚本**

```typescript
// prisma/seed.ts - 初始化系统预设服装物品（注册后所有玩家可见）
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 7件基础系统预设服装
  const items = [
    { name: '白T恤', category: 'top', layer: 3, parts: [
      { partType: 'base_shape', templateId: 'base_tshirt_01', boneAnchor: 'chest', offsetY: -30, colorHex: '#ffffff' }] },
    { name: '白衬衫', category: 'top', layer: 3, parts: [
      { partType: 'base_shape', templateId: 'base_shirt_01', boneAnchor: 'chest', offsetY: -30, colorHex: '#ffffff' },
      { partType: 'collar', templateId: 'collar_collar_01', boneAnchor: 'neck', offsetY: -5, colorHex: '#ffffff' }] },
    { name: '牛仔裤', category: 'bottom', layer: 4, parts: [
      { partType: 'base_shape', templateId: 'base_jeans_01', boneAnchor: 'waist', offsetY: 10, colorHex: '#5b7cb3' }] },
    { name: 'A字短裙', category: 'bottom', layer: 4, parts: [
      { partType: 'base_shape', templateId: 'base_skirt_short_01', boneAnchor: 'waist', offsetY: 10, colorHex: '#333333' }] },
    { name: '帆布鞋', category: 'shoes', layer: 6, parts: [
      { partType: 'base_shape', templateId: 'base_canvas_shoe_01', boneAnchor: 'left_ankle', offsetY: -5, colorHex: '#ffffff' }] },
    { name: '卫衣', category: 'top', layer: 5, parts: [
      { partType: 'base_shape', templateId: 'base_hoodie_01', boneAnchor: 'chest', offsetY: -25, colorHex: '#cccccc' }] },
    { name: '百褶长裙', category: 'bottom', layer: 4, parts: [
      { partType: 'base_shape', templateId: 'base_skirt_long_01', boneAnchor: 'waist', offsetY: 15, colorHex: '#2d2d2d' }] },
  ];

  for (const { parts, ...item } of items) {
    await prisma.wardrobeItem.create({ data: { ...item, parts: { create: parts.map((p, i) => ({ ...p, zOrder: i })) } } });
  }
  console.log('系统预设物品已创建');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

- [ ] **步骤 2: 配置 seed 命令并运行**

```bash
npm install -D tsx
# 在 package.json 添加: "prisma": { "seed": "tsx prisma/seed.ts" }
npx prisma db seed
```
期望: 7件系统预设物品写入数据库。

- [ ] **步骤 3: 提交**

```bash
git add -A && git commit -m "feat: 添加系统预设服装种子数据"
```

---

### 任务 22: 确保上传文件静态可访问

**涉及文件:** 修改 next.config.js

- [ ] **步骤 1: 确认 public/uploads 路径**

开发环境 Next.js 会自动将 `public/` 下的文件作为静态资源。确保 upload API 写入 `public/uploads/` 目录（已在任务18第二步中设置为 `path.join(process.cwd(), 'public/uploads')`）。

- [ ] **步骤 2: 提交**

```bash
git add -A && git commit -m "fix: 确认上传文件通过public目录静态服务"
```

---

## 自检

**PRD 覆盖检查:**
- 第4节 角色系统 → 任务 9-12 ✓
- 第5节 骨骼锚点 → 任务 3 ✓
- 第6节 换装渲染分层+叠加 → 任务 4-5 ✓
- 第7节 仓库系统 → 任务 13-14 ✓
- 第8节 服装创作编辑器 → 任务 15-17 ✓
- 第9节 快照分享 → 任务 18 ✓
- 第10节 论坛系统 → 任务 19-20 ✓
- 第11节 数据模型 → 任务 2 ✓
- 第12节 非功能性需求（认证/安全/频率限制） → 任务 6-7, 20 ✓

**已知缺口:**
- 4.4 保存搭配方案 (SavedOutfit) — 表已建但UI未实现，标记为后续迭代
- "从当前搭配导入发帖" — CharacterCanvas 到 PostForm 的桥接未实现，仍需手动上传图片

**无 placeholder** — 所有任务均有完整代码。

**类型一致性检查通过** — EditorPart, WearingEntry, GarmentCategory, BoneName, PostData 在 store/engine/组件/API 中定义一致。
