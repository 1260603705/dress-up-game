# 首页 & 仓库交互重设计 — 设计文档

## 概述

重新设计首页右栏信息架构和仓库交互流程，优化缩略图尺寸层级、增加搜索/撤回/脱衣功能、改进分页样式。

## 布局比例

首页左右分栏从 `flex:1` + `w-[360px]` 改为 **左 45% / 右 55%**。

## 右栏从上到下

### 1. 人物简介 + 记忆相册（并排一行）

- 左侧：头像圆形 + 角色名 + Lv/签名
- 右侧：记忆相册，标题"记忆相册"+ "查看全部"链接
- 相册缩略图：极小（max 30-32px），5 列排列，仅占一行高度
- 目的是让简介和相册一起保持轻薄，不过度占用垂直空间

### 2. 我的仓库

自上而下排列：

#### a. 分类标签

全部、上衣、下装、连衣裙、鞋、袜。当前选中高亮（`--game-accent` 背景）。

#### b. 搜索行

左侧一个**搜索范围按钮**（折叠图标 + 文字），文字显示当前搜索范围：
- 默认显示"全部"
- 选中某分类后显示该分类名（如"上衣"）
- 点击在"全部"和"当前分类"间切换

右侧一个搜索输入框，按衣服名称搜索。

#### c. 操作按钮行

四个按钮：**撤回、脱当前、脱全部、保存**

- 四按钮总宽度 = 下方仓库网格第一件衣服左边缘到第三件衣服格子一半处
- 按钮之间有间隔（gap: 8px）
- 保存按钮用 `--game-accent` 背景高亮

按钮行为：
| 按钮 | 行为 |
|------|------|
| 撤回 | 撤销最近一次穿戴操作（移除 wearing 数组最后一项） |
| 脱当前 | 见下方"脱当前"详细逻辑 |
| 脱全部 | 清空角色所有穿戴，只剩 body base |
| 保存 | 保存当前穿搭方案（原"保存当前穿搭"） |

#### d. 仓库网格（白色外框）

整个仓库网格共用一个 **白色圆角外框**（`bg-white border rounded-[10px]`）：
- 外框 padding：上下 14px，左右 28px
- 内部缩略图：4 列，`border-radius: 8px`（明显圆角），gap: 8px
- 缩略图与外框保持明显间距
- 缩略图尺寸比原记忆相册（~150px）小，约 100-120px

#### e. 分页

圆形按钮样式：
- 左侧 `<` 圆形按钮
- 中间 `当前页 / 总页数` 文字
- 右侧 `>` 圆形按钮
- 按钮 `w-[26px] h-[26px] rounded-full border`

## 交互变更

### 点击衣服 → 直接穿戴（去掉弹窗）

点击 `WardrobeCard` 直接调用 `addWearing`，不再弹出 `WardrobeDetail` 的 Modal 确认框。

**同类别互斥：** 角色每个类别（上衣、下装、连衣裙等）只能穿一件。穿戴新衣服时，同类别旧衣服自动被替换。

**选中高亮：** 点击穿戴后，该卡片边框变亮（如 `border-game-accent` 或 ring），记录为 `selectedItemId`。同一分类下只有一件高亮。

`WardrobeDetail` 组件可以移除。

### 脱当前

"脱当前"分三种情况（优先级从高到低）：

1. **有选中的衣服（selectedItemId 存在）** → 脱掉这件选中的衣服（`removeWearing(selectedItemId)`），清除高亮
2. **没有选中衣服，但角色在当前分类下穿了衣服** → 脱掉当前分类下穿的那件（如当前在"上衣"tab，角色穿着上衣，则脱掉上衣）
3. **当前分类下也没有穿衣服** → 无反应

"脱当前"只影响当前分类下的衣物，不会跨类别脱衣。

### 搜索功能

在 `WardrobeGrid` 中新增搜索状态 `searchQuery`：
- 输入框 onChange 更新 searchQuery
- 请求 `/api/wardrobe` 时附加 `?search=xxx` 参数
- API 端按名称模糊匹配过滤

### 撤回功能

在 `characterStore` 中新增/修改：

- **`addWearing`** — 改为按 category 替换：穿戴新 item 时，自动移除同 category（top/bottom/dress 等）的旧 item，保证每类别最多一件
- **`undoLastWear()`** — 移除 `wearing` 数组最后一项（撤销最近穿戴），同时清除 `selectedItemId`
- **`clearWearing()`** — 将 `wearing` 设为 `[]`（脱全部），清除 `selectedItemId`

## 影响范围

### 需修改的文件

| 文件 | 改动 |
|------|------|
| `src/app/(game)/home/page.tsx` | 布局比例 45/55；新增四个按钮逻辑；调整 MemoryAlbum + ProfileCard 布局 |
| `src/components/home/ProfileCard.tsx` | 缩小以适应与相册并排 |
| `src/components/home/MemoryAlbum.tsx` | 缩略图缩小到 30-32px，5列，与简介并排 |
| `src/components/wardrobe/WardrobeCard.tsx` | 点击直接调用 addWearing（去掉 Modal 触发） |
| `src/components/wardrobe/WardrobeGrid.tsx` | 新增搜索栏；外框包裹网格；4列；新分页样式 |
| `src/components/shared/Pagination.tsx` | 改为 `<` `当前/总页` `>` 圆形按钮样式 |
| `src/stores/characterStore.ts` | `addWearing` 改为同类别替换；新增 `undoLastWear`、`clearWearing` 方法 |

### 可移除的文件

| 文件 | 说明 |
|------|------|
| `src/components/wardrobe/WardrobeDetail.tsx` | 弹窗确认被去掉后可删除（或保留备用） |

## 配色

全部沿用现有 CSS 变量体系（`--game-*`），白天夜间自动切换，不新增变量。
