# 方格纸背景 + 居中容器布局 — 设计文档

## 需求

所有游戏页面（`(game)` 路由组）应用经典方格纸背景 + 居中纯色容器的布局方案。

### 视觉效果

- 页面背景：经典方格纸（浅灰细线，22px 格子），向左右无限延伸
- 中间容器：纯色背景（无格子），`max-w-[1200px]`，居中
- 窄窗口（< 1200px）：容器 100% 宽度
- 宽窗口（>= 1200px）：容器保持 1200px 并居中，拉宽只延伸格子背景
- 容器顶部留约 7px（~1/3 格）间隙露出微量格子
- 容器无阴影、无边框，纯靠颜色对比区分

### 影响范围

- **适用**：`src/app/(game)/*` 所有页面（home、character、editor、wardrobe、outfits、forum 及其子路由）
- **不适用**：`/` 着陆页、`/login` 登录页

## 架构

纯 CSS 实现，零额外 DOM 元素。格子图案用 `body` 的 `background-image`（两层 `linear-gradient`）叠加生成。容器是 `AppShell` 最外层的 `<div>`。

改动仅涉及 2 个文件：

| 文件 | 改动 |
|------|------|
| `src/app/globals.css` | 新增格子 CSS 变量；`body.game-layout` 格子背景规则 |
| `src/components/layout/AppShell.tsx` | 包裹 max-w 容器 div；管理 body class 挂载/卸载 |

## 配色

### 白天模式

| 变量 | 值 | 用途 |
|------|-----|------|
| `--game-grid-bg` | `#f5f0e8` | 格子底色 |
| `--game-grid-line` | `rgba(0,0,0,0.07)` | 格子线色 |
| `--game-grid-size` | `22px` | 格子大小 |
| `--game-container-bg` | `var(--game-bg)` → `#fffdf5` | 容器纯色底（复用现有） |

### 夜间模式

| 变量 | 值 | 用途 |
|------|-----|------|
| `--game-grid-bg` | `#151224` | 格子底色 |
| `--game-grid-line` | `rgba(255,255,255,0.05)` | 格子线色 |
| `--game-grid-size` | `22px` | 格子大小 |
| `--game-container-bg` | `var(--game-bg)` → `#1E1B2E` | 容器纯色底（复用现有） |

所有变量走 `:root` / `.dark` 双套体系，主题切换时自动响应。

## 组件结构变更

### AppShell 结构

```
<div className="w-full max-w-[1200px] mx-auto min-h-screen"
     style={{ background: 'var(--game-container-bg)' }}>
  <Navbar />
  <div className="flex">
    <Sidebar />
    <main className="flex-1 p-6 min-h-[calc(100vh-56px)]">{children}</main>
  </div>
</div>
```

- 容器 div 包裹 Navbar + Sidebar + main，全部在纯色背景内
- `useEffect` 在 mount 时 `document.body.classList.add('game-layout')`，unmount 时移除

### RootLayout / GameLayout

无需改动。`body` 挂载 class 后自动启用格子。

## 兼容性

- **PixiJS Canvas**：在容器内 `<main>` 渲染，容器背景为纯色 CSS 变量，不与格子图案产生视觉冲突
- **Zustand stores**：不受影响（纯 CSS + 一个 div 包裹）
- **主题切换**：`ThemeToggle` 切换 `.dark` class，格子变量全部跟随
- **Prisma/API/上传**：不受影响
