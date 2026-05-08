# 2D 换装游戏 PRD

> 版本: v1.0 | 日期: 2026-05-08 | 状态: 设计完成

---

## 1. 产品概述

### 1.1 产品定位

一款 Web 端 2D 换装游戏。玩家可以创建并定制角色，收集和自制服装，为角色换装并查看上身效果，在社区论坛分享搭配作品。

### 1.2 目标用户

喜欢换装玩法、角色定制和社交分享的休闲玩家。

### 1.3 美术风格

正常人体比例的二次元卡通风格，类似奇迹暖暖。

### 1.4 平台

Web 端优先（浏览器），后续考虑移动端和桌面端。

---

## 2. 功能总览

| 模块 | 说明 | 优先级 |
|------|------|--------|
| 角色系统 | 捏人定制 + 默认预设 | P0 |
| 换装系统 | 服装穿脱、层级渲染、实时预览 | P0 |
| 仓库系统 | 服装物品管理、分类浏览 | P0 |
| 服装创作编辑器 | 基布 + 局部替换的部件拼装 | P0 |
| 论坛系统 | 发帖贴图 + 评论 + 点赞 | P1 |
| 快照分享 | 角色截图导出、一键贴到论坛 | P0 |

---

## 3. 技术架构

### 3.1 整体方案

**React + Canvas 混合方案**：React 负责 UI 层（仓库、论坛、捏人面板、编辑器面板），PixiJS (Canvas) 负责角色渲染和换装预览。

```
┌────────────────────────────────────────────┐
│                  浏览器                      │
│  ┌─────────────────────────────────────┐    │
│  │         React App (SPA)             │    │
│  │                                     │    │
│  │  ┌──────────┐  ┌──────────────┐     │    │
│  │  │  UI层     │  │  Canvas渲染层  │     │    │
│  │  │(仓库、论坛 │  │(角色展示、     │     │    │
│  │  │ 捏人面板、 │  │ 换装预览、     │     │    │
│  │  │ 服装拼装)  │  │ 部件拼装)      │     │    │
│  │  └────┬─────┘  └──────┬───────┘     │    │
│  │       │               │              │    │
│  │       └───────┬───────┘              │    │
│  │               │                      │    │
│  │       ┌───────┴───────┐              │    │
│  │       │  State Store  │              │    │
│  │       │  (Zustand ×4) │              │    │
│  │       └───────┬───────┘              │    │
│  └───────────────┼──────────────────────┘    │
│                  │                           │
└──────────────────┼───────────────────────────┘
                   │ HTTP API
┌──────────────────┼───────────────────────────┐
│                  │        服务端               │
│     ┌────────────┴────────────┐              │
│     │     Next.js (API路由)    │              │
│     │                         │              │
│     │  /api/auth  认证模块     │              │
│     │  /api/wardrobe 仓库模块  │              │
│     │  /api/avatar  角色模块  │              │
│     │  /api/design  服装创作  │              │
│     │  /api/forum   论坛模块  │              │
│     │  /api/upload  图片上传  │              │
│     └────────────┬────────────┘              │
│                  │                           │
│     ┌────────────┴────────────┐              │
│     │  PostgreSQL + S3存储    │              │
│     └─────────────────────────┘              │
└──────────────────────────────────────────────┘
```

### 3.2 前端状态管理

按子系统拆分为 4 个独立 Store（Zustand），通过事件或 getter 通信，不直接耦合：

```
stores/
  characterStore   — 角色数据（捏人参数、当前穿戴列表）
  wardrobeStore    — 仓库（拥有的服装列表、分类筛选、分页）
  designStore      — 服装创作状态（当前编辑部件、颜色、锚点偏移）
  forumStore       — 论坛状态（帖子列表、评论、分页）
```

### 3.3 静态资源策略

- 服装部件纹理打包为 spritesheet（图集），按部件类别分包
- 仓库浏览时加载缩略图（低分辨率），穿戴时加载高清纹理
- Service Worker 离线缓存静态资源
- 生产环境资源走 CDN

---

## 4. 角色系统

### 4.1 捏人参数

中等定制程度，所有参数存储为 JSON：

```json
{
  "gender": "female",
  "body": { "height": "medium", "shape": "standard" },
  "face": "oval",
  "eyes": "almond",
  "eyebrows": "willow",
  "mouth": "standard",
  "skin_tone": "natural",
  "hair": { "front": "bangs_01", "back": "long_01" }
}
```

| 参数组 | 可选值 | 数量 |
|--------|--------|------|
| 性别 | 男/女 | 2 |
| 身高 | 矮/中/高 | 3 |
| 体型 | 纤细/标准/丰满 | 3 |
| 脸型 | 圆脸/瓜子脸/方脸/鹅蛋脸 | 4 |
| 眼型 | 杏眼/丹凤眼/桃花眼 | 3 |
| 眉型 | 柳叶眉/平眉/剑眉 | 3 |
| 嘴型 | 薄唇/标准/厚唇 | 3 |
| 肤色 | 白皙/自然/小麦/深色 | 4 |
| 发型-前发 | 预设刘海样式 | 6-8 |
| 发型-后发 | 长发/短发/马尾等 | 6-8 |

### 4.2 默认预设

提供 3-5 个默认角色预设，新手可直接使用。

### 4.3 体型与服装适配（方向A：骨骼变形）

- 所有服装只需一套纹理
- 不同体型 → 骨骼位置动态计算 → 衣服纹理通过仿射变换（缩放/位移）跟随变形
- 身高差异通过骨骼间距整体缩放
- 极端体型（很胖/很瘦）需要美术验证拉伸效果，必要时对形变参数设置上下限
- 裸露皮肤区域（脖子、手臂、小腿）同样跟随骨骼变形，轮廓自动适配

### 4.4 保存搭配

```sql
saved_outfits (
  id, user_id, character_id,
  name VARCHAR,              -- "夏日清凉套装"
  outfit_data JSON,          -- [{item_id, color_overrides}, ...]
  thumbnail_url VARCHAR,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at, updated_at
)
```

与 `characters.wearing` 的区别：wearing 是当前身上穿的，outfit 是保存的搭配方案。可一键应用保存的搭配。

---

## 5. 骨骼锚点系统

### 5.1 锚点定义

约 15-20 个命名骨骼锚点，覆盖角色身体关键位置：

```
head             头顶
neck             脖子根部
left_shoulder    左肩
right_shoulder   右肩
left_elbow       左肘
right_elbow      右肘
left_wrist       左腕
right_wrist      右腕
chest            胸部中心
waist            腰部中心
left_hip         左胯
right_hip        右胯
left_knee        左膝
right_knee       右膝
left_ankle       左脚踝
right_ankle      右脚踝
```

### 5.2 部件挂载方式

每个服装部件不存绝对坐标，存储相对于骨骼的偏移：

```
item_parts:
  bone_anchor: "chest"       -- 挂在哪个骨骼
  offset_x: 0                -- 相对骨骼偏移
  offset_y: -10
  scale_x: 1.0
  scale_y: 1.0
  rotation: 0
```

渲染时根据角色参数（身高、体型）动态计算各骨骼实际像素位置，再叠加偏移。换体型时衣服自动跟随。

### 5.3 骨骼计算算法

标准骨骼坐标系定义在 **1024×1024** 的画布上，每个骨骼有固定的基准坐标：

```typescript
// 标准骨骼（体型=标准, 身高=中）
const STANDARD_SKELETON: Record<string, { x: number; y: number }> = {
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
```

体型和身高通过缩放因子改变骨骼坐标：

```typescript
function computeSkeleton(params: CharacterParams): Skeleton {
  const { shape, height } = params.body;

  // 体型影响水平方向（胖瘦）
  const shapeScaleX =
    shape === 'plump'  ? 1.12 :
    shape === 'slim'   ? 0.92 :
                         1.0;   // standard

  // 身高影响垂直方向
  const heightScaleY =
    height === 'tall'   ? 1.08 :
    height === 'short'  ? 0.92 :
                          1.0;   // medium

  const result: Skeleton = {};
  for (const [name, bone] of Object.entries(STANDARD_SKELETON)) {
    result[name] = {
      x: bone.x * shapeScaleX,
      y: bone.y * heightScaleY,
    };
  }
  return result;
}
```

渲染时所有部件引用同一份计算后的骨骼：

```typescript
const skeleton = computeSkeleton(character.params);

// 基布
drawTexture(baseCloth, skeleton[baseCloth.bone_anchor], baseCloth.offset);

// 局部替换覆层 — 引用同一骨骼，自动对齐
for (const overlay of overlays) {
  drawTexture(overlay, skeleton[overlay.bone_anchor], overlay.offset);
}

// 装饰配件
for (const deco of decorations) {
  drawTexture(deco, skeleton[deco.bone_anchor], deco.offset);
}
```

因为基布和所有覆层引用同一套骨骼坐标，缩放因子一致，所以自动对齐——就像所有衣服挂在同一个衣架上，移动衣架所有衣服跟着动。

---

## 6. 换装系统

### 6.1 渲染分层

从内到外：

| 层级 | 内容 |
|------|------|
| 0 | 皮肤（基础身体） |
| 1 | 内衣/抹胸 |
| 2 | 袜子 |
| 3 | 上衣/衬衫 |
| 4 | 裤子/裙子 |
| 5 | 外套/马甲 |
| 6 | 鞋子 |
| 7 | 首饰（项链、耳环、手链等） |
| 8 | 发型（前发/后发） |

同层级按穿戴先后排列。每件服装有 `layer` 字段，换装时按层级重排渲染。

### 6.2 单件衣服渲染管线：分层叠加（Layered Overlay）

**核心思想**：类似 Photoshop 图层叠加。基布是完整衣服的 PNG，局部替换覆层是带 alpha 通道的 PNG，只有目标区域不透明，其余区域透明，直接叠加在基布上方即可——无需 mask 或 clip 操作。

**一张覆层 PNG 的结构：**

```
┌──────────────────────────────────┐
│                                  │
│   透明区域（alpha=0）              │
│   基布纹理透过来                   │
│                                  │
│       ┌──────────┐               │
│       │ 新领口    │               │
│       │ (alpha=1) │               │
│       │          │               │
│       └──────────┘               │
│                                  │
│   透明区域（alpha=0）              │
│                                  │
└──────────────────────────────────┘
  画布尺寸: 1024×1024（与基布相同）
```

覆层的尺寸和坐标系与基布完全一致（1024×1024），叠上去像素对像素。不需要"知道基布轮廓"——覆层只在有内容的地方不透明，其他地方自然就是基布的纹理。

**渲染顺序（单件衣服内部）：**

```
1. 基布（完整衣服 PNG，含默认褶皱/阴影）
      ↓
2. 材质纹理 — 满画布平铺，用基布 alpha 做乘法蒙版
      ↓ (multiply blend 或 用基布alpha做mask)
3. 图案印花 — 同上，mask 到基布轮廓内
      ↓
4. 局部替换覆层 — 直接 drawImage，alpha 自动处理
   - 领口覆层: 仅颈部区域不透明
   - 袖口覆层: 仅袖口区域不透明
   - 下摆覆层: 仅下摆区域不透明
      ↓
5. 装饰配件 — 独立小图，画在指定骨骼锚点
      ↓
6. 整体 HSL 调色（可选，ColorMatrixFilter 统一处理）
```

**PixiJS 中的实现：**

```typescript
function renderGarment(item: WardrobeItem, skeleton: Skeleton) {
  const container = new PIXI.Container();

  // 1. 基布
  const base = PIXI.Sprite.from(item.baseTextureUrl);
  const anchor = skeleton[item.baseBone];
  base.position.set(anchor.x + item.baseOffsetX, anchor.y + item.baseOffsetY);
  container.addChild(base);

  // 基布的 alpha 纹理用于后续蒙版
  const baseAlpha = extractAlpha(base.texture);

  // 2. 材质纹理（蒙版到基布轮廓）
  if (item.materialTexture) {
    const mat = PIXI.Sprite.from(item.materialTexture);
    mat.mask = createMaskFromAlpha(baseAlpha, container.position);
    mat.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    container.addChild(mat);
  }

  // 3. 图案印花（蒙版到基布轮廓）
  if (item.patternTexture) {
    const pat = PIXI.Sprite.from(item.patternTexture);
    pat.mask = createMaskFromAlpha(baseAlpha, container.position);
    container.addChild(pat);
  }

  // 4. 局部替换覆层（alpha PNG，直接叠加）
  for (const overlay of item.overlays) {
    const ov = PIXI.Sprite.from(overlay.textureUrl);
    const bone = skeleton[overlay.boneAnchor];
    ov.position.set(bone.x + overlay.offsetX, bone.y + overlay.offsetY);
    container.addChild(ov); // alpha 自动处理，无需 mask
  }

  // 5. 装饰配件
  for (const deco of item.decorations) {
    const d = PIXI.Sprite.from(deco.textureUrl);
    const bone = skeleton[deco.boneAnchor];
    d.position.set(bone.x + deco.offsetX, bone.y + deco.offsetY);
    d.scale.set(deco.scaleX, deco.scaleY);
    d.angle = deco.rotation;
    container.addChild(d);
  }

  return container;
}
```

**要点：**
- 基布和所有覆层都是 1024×1024 PNG，坐标系一致，叠上去即对齐
- 局部替换覆层自带 alpha 通道，只覆盖目标区域，其余透明——不需要知道基布轮廓
- 材质和图案需要 mask 到基布轮廓内，防止溢出到衣服外面
- 所有部件引用同一份 `skeleton`，体型/身高变化时重新计算骨骼，所有部件跟着位移/缩放

### 6.3 染色支持

`characters.wearing` 结构支持染色覆盖：

```json
[
  {
    "item_id": "uuid-xxx",
    "color_overrides": {
      "main_body": "#ff6b6b",
      "collar": "#ffffff"
    }
  }
]
```

`item_parts.color_hex` 为默认颜色，`color_overrides` 运行时覆盖。系统预设物品也支持染色。

---

## 7. 仓库系统

### 7.1 界面布局

分类 Tab（全部/上衣/下装/裙装/鞋/饰品/发型）+ 缩略图网格 + 分页。

点击物品弹出详情卡片：大预览图、名称、分类、来源（系统/自制）、操作按钮（穿戴/卸下/编辑/删除）。

### 7.2 物品获取

- **系统预设**：注册送约 10 件基础服装（白衬衫、牛仔裤、帆布鞋等）
- **自制**：通过编辑器拼装完成后自动入库
- 后续可扩展（本期不做）：任务奖励、商城购买、限时活动

### 7.3 API

```
GET    /api/wardrobe              列表 + 分页 + 分类筛选
GET    /api/wardrobe/:id          单件详情
POST   /api/wardrobe/:id/wear     穿戴到当前角色
POST   /api/wardrobe/:id/unwear   卸下
DELETE /api/wardrobe/:id          删除（仅自制物品）
```

---

## 8. 服装创作编辑器

### 8.1 设计模型

**一件衣服 = 基布 × 1 + 局部替换部件 × N + 装饰配件 × N**

- **基布**：完整轮廓的基础版型（如"圆领泡泡袖直筒连衣裙"），轮廓连续无拼接缝
- **局部替换**：在基布之上替换特定区域纹理（换领口样式、换袖口样式、换下摆样式）
- **装饰配件**：纽扣、蝴蝶结、铆钉等独立小物件

### 8.2 操作流程

```
选择服装大分类(上衣/下装/裙装/饰品)
  → 选择基布模板(系统预设 8-12 套)
  → 从部件库添加局部替换和装饰
  → 选中部件，右侧面板调整属性(颜色、偏移、缩放)
  → 中间 Canvas 实时预览
  → 切换预览体型检查适配
  → 保存 → 前端生成缩略图 → 提交 API → 入库
```

### 8.3 编辑器三栏布局

- **左侧**：部件库（领口/袖型/下摆/图案/装饰/材质），每类可展开选择预设部件
- **中间**：Canvas 预览画布，显示骨骼锚点线框辅助定位
- **右侧**：属性面板（当前选中部件的锚点、偏移、缩放、旋转、颜色、层级）+ 已添加部件可拖拽排序列表

### 8.4 部件库规模

| 分类 | 可选部件数 | 示例 |
|------|-----------|------|
| 基布版型 | 8-12 套 | T恤、衬衫、连衣裙、卫衣、外套、牛仔裤、短裙、长裙 |
| 领口 | 4-6 种 | 圆领、V领、方领、一字领、高领、翻领 |
| 袖型 | ~12 种 | 无袖、短袖、泡泡袖、灯笼袖、长袖... |
| 下摆 | ~8 种 | 直筒、A字、鱼尾、荷叶边、不规则... |
| 图案 | ~20 种 | 条纹、格子、波点、碎花、动物纹... |
| 装饰 | ~15 种 | 蝴蝶结、纽扣、蕾丝边、铆钉、刺绣贴... |
| 材质纹理 | ~10 种 | 棉布、牛仔、丝绸、针织、皮革、薄纱... |

### 8.5 技术限制

- 单件衣服最多 15 个部件，超出提示精简
- 部件默认锚点由系统预设，玩家可微调偏移

### 8.6 保存 API

```json
POST /api/design
{
  "name": "我的碎花连衣裙",
  "category": "dress",
  "preview_thumbnail": "<base64>",
  "parts": [
    {
      "part_type": "base_shape",
      "template_id": "dress_a_line_01",
      "bone": "chest",
      "color": "#ff6b6b"
    },
    {
      "part_type": "collar",
      "template_id": "collar_round_03",
      "bone": "neck",
      "color": "#ffffff"
    },
    {
      "part_type": "pattern",
      "template_id": "pattern_floral_07",
      "bone": "chest",
      "scale": 1.2
    },
    {
      "part_type": "decoration",
      "template_id": "deco_bow_01",
      "bone": "waist",
      "color": "#ffdddd"
    }
  ]
}
```

后端生成 `wardrobe_items` + 多个 `item_parts` 记录，返回物品 ID。

---

## 9. 快照分享

### 9.1 导出策略：前端生成 + 后端统一

- 前端 Canvas 渲染角色 → 固定分辨率 **1024×1024** 导出为 PNG → 生成 base64
- 提交 API → 后端验证尺寸和格式 → 生成多尺寸版本：

| 版本 | 尺寸 | 用途 |
|------|------|------|
| 缩略图 | 200px | 仓库列表、论坛列表 |
| 展示图 | 800px | 论坛详情、分享链接 |
| 原图 | 1024px | 存档 |

- 设备 DPR 不一致问题：导出时强制使用 1024×1024 内部分辨率，忽略设备 DPR

### 9.2 三种分享场景

| 场景 | 实现 |
|------|------|
| 导出图片到本地 | Canvas → toBlob() → 触发浏览器下载 |
| 分享链接 | 上传服务器 → 生成短链 → 网页打开显示角色图片 |
| 论坛贴图 | "从当前搭配导入"→ 自动截图上传 → 嵌入帖子 |

### 9.3 网络异常处理

保存/上传失败 → 暂存 IndexedDB → 下次打开提示"有未完成的操作"→ 一键重试。

---

## 10. 论坛系统

### 10.1 功能范围（轻量级）

- 发帖（标题 + 正文 + 图片）
- 评论
- 点赞（幂等，再点取消）
- 按最新发布排序
- 分页

### 10.2 发帖流程

```
点击"发布新帖"
  → 输入标题 + 正文
  → 添加图片：
      方式一: "从当前搭配导入" → 读取 characterStore → Canvas 渲染 → 自动截图上传
      方式二: "上传本地图片" → 裁剪到规范尺寸
  → 预览 → 发布
```

### 10.3 API

```
GET    /api/forum/posts              帖子列表(分页, 按时间倒序)
GET    /api/forum/posts/:id          帖子详情 + 评论
POST   /api/forum/posts              发帖
POST   /api/forum/posts/:id/like     点赞(幂等)
DELETE /api/forum/posts/:id          删帖(仅本人)
POST   /api/forum/posts/:id/comments 评论
DELETE /api/forum/comments/:id       删评论(仅本人)
```

### 10.4 防滥用

- 每人每天最多发帖 3 次、评论 10 条（简单的频率限制）
- 图片单张最大 2MB，格式仅限 PNG/JPEG/WebP
- 保留举报入口（本期不做自动审核）

---

## 11. 数据模型

```sql
-- 用户
users (
  id UUID PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- 角色（每个用户可有多个角色）
characters (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  gender VARCHAR CHECK (gender IN ('male', 'female')),
  custom_params JSON NOT NULL,          -- 捏人参数
  wearing JSON DEFAULT '[]',            -- 当前穿戴
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- 服装物品
wardrobe_items (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),   -- NULL = 系统预设
  name VARCHAR NOT NULL,
  category VARCHAR CHECK (category IN (
    'top', 'bottom', 'dress', 'shoes', 'socks', 'accessory', 'hair'
  )),
  layer INT NOT NULL,                   -- 渲染层级
  thumbnail_url VARCHAR,
  created_by_editor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)

-- 服装部件
item_parts (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  part_type VARCHAR NOT NULL,           -- base_shape/collar/sleeve/hem/pattern/decoration/texture
  template_id VARCHAR NOT NULL,         -- 引用的系统部件模板
  texture_url VARCHAR,
  bone_anchor VARCHAR NOT NULL,         -- 骨骼锚点名称
  offset_x FLOAT DEFAULT 0,
  offset_y FLOAT DEFAULT 0,
  scale_x FLOAT DEFAULT 1.0,
  scale_y FLOAT DEFAULT 1.0,
  rotation FLOAT DEFAULT 0,
  color_hex CHAR(7),
  z_order INT DEFAULT 0,
  metadata JSON DEFAULT '{}'
)

-- 玩家仓库
user_inventory (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  item_id UUID REFERENCES wardrobe_items(id),
  obtained_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id)
)

-- 保存的搭配
saved_outfits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  character_id UUID REFERENCES characters(id),
  name VARCHAR NOT NULL,
  outfit_data JSON NOT NULL,            -- [{item_id, color_overrides}, ...]
  thumbnail_url VARCHAR,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- 论坛帖子
posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  content TEXT,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- 评论
comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- 点赞
likes (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
)
```

---

## 12. 非功能性需求

### 12.1 性能

- 仓库列表懒加载，首屏加载不超过 20 个缩略图
- 换装操作响应 < 200ms（本地渲染，不依赖网络）
- 静态资源走 CDN + Service Worker 离线缓存

### 12.2 安全

- 密码 bcrypt 哈希存储
- Session Token 认证
- 图片上传校验：格式白名单、最大 2MB、服务端重编码去除元数据
- API 频率限制（发帖 3/天、评论 10/天）
- 参数化查询防 SQL 注入

### 12.3 兼容性

- 支持 Chrome、Firefox、Safari、Edge 最近两个大版本
- 移动端响应式适配（后续迭代）
