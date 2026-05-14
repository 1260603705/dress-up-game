# 方格纸背景 + 居中容器布局 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为所有游戏页面添加经典方格纸背景 + 居中 max-w-[1200px] 纯色容器布局，支持白天/夜间模式切换。

**Architecture:** 纯 CSS 实现 — 格子图案用 `body` 的 `background-image`（两层 `linear-gradient` 叠加）。`body.game-layout` class 控制格子仅在游戏路由生效。容器是 AppShell 最外层新增的 `<div>`，`useEffect` 管理 body class 挂载/卸载。

**Tech Stack:** CSS custom properties + Tailwind CSS + React useEffect

---

### Task 1: 新增格子 CSS 变量和 body 格子背景规则

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 在 `:root` 中新增白天格子变量**

在当前 `:root` 块末尾（`}` 前）添加：

```css
  --game-grid-bg: #f5f0e8;
  --game-grid-line: rgba(0,0,0,0.07);
  --game-grid-size: 22px;
  --game-container-bg: var(--game-bg);
```

- [ ] **Step 2: 在 `.dark` 中新增夜间格子变量**

在当前 `.dark` 块末尾（`}` 前）添加：

```css
  --game-grid-bg: #151224;
  --game-grid-line: rgba(255,255,255,0.05);
  --game-grid-size: 22px;
  --game-container-bg: var(--game-bg);
```

- [ ] **Step 3: 在文件末尾添加 `body.game-layout` 格子背景规则**

在文件最末尾添加：

```css
body.game-layout {
  background-color: var(--game-grid-bg);
  background-image:
    linear-gradient(var(--game-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--game-grid-line) 1px, transparent 1px);
  background-size: var(--game-grid-size) var(--game-grid-size);
  padding-top: 7px;
}
```

- [ ] **Step 4: 验证文件语法**

Run: `npx tailwindcss --help > /dev/null 2>&1 && echo "OK"`
Expected: `OK`（确认 Tailwind 可正常解析）

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: 新增格子背景CSS变量 + body.game-layout规则"
```

---

### Task 2: AppShell 包裹居中容器 + body class 管理

**Files:**
- Modify: `src/components/layout/AppShell.tsx`

- [ ] **Step 1: 添加 `useEffect` 管理 `body.game-layout` class**

在现有 `useEffect`（AuthGuard 中那个）同层级，在 `AuthGuard` 的 return 之前（即 `{children}` 外层），在 `AppShell` 函数体内或容器 div 所在的组件中添加 class 管理逻辑。

在 `AuthGuard` 组件内，在 `return` 语句前添加：

```typescript
useEffect(() => {
  document.body.classList.add('game-layout');
  return () => {
    document.body.classList.remove('game-layout');
  };
}, []);
```

- [ ] **Step 2: 用居中容器 div 包裹 Navbar + 内容区**

将 `AuthGuard` 的 return 内容（从 `<Navbar />` 开始）包裹在一个容器 div 中，并移除 `<main>` 上的 `style={{ background: 'var(--game-bg)' }}`：

```typescript
return (
  <div className="w-full max-w-[1200px] mx-auto min-h-screen" style={{ background: 'var(--game-container-bg)' }}>
    <Navbar />
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 min-h-[calc(100vh-56px)]">{children}</main>
    </div>
  </div>
);
```

关键变更：
- 新增最外层 `<div className="w-full max-w-[1200px] mx-auto min-h-screen" style={{ background: 'var(--game-container-bg)' }}>`
- **移除** `<main>` 上的 `style={{ background: 'var(--game-bg)' }}`（容器已提供背景）

- [ ] **Step 3: 构建验证**

Run: `npx next build 2>&1 | tail -20`
Expected: 编译成功，无错误

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/AppShell.tsx
git commit -m "feat: AppShell包裹max-w-[1200px]居中容器 + body class管理"
```

---

## 验证清单

实现完成后，手动验证以下场景：

1. `npx next build` 编译成功
2. 访问 `/home` — 看到方格纸背景 + 居中容器，容器顶部有约 7px 格子间隙
3. 宽度 < 1200px — 容器撑满 100%
4. 宽度 >= 1200px — 容器最大 1200px 并居中，两侧露出格子
5. 切换到夜间模式 — 格子底色和线色都变为深色
6. 访问 `/login` — 无格子背景（body 无 `game-layout` class）
7. 访问 `/` — 无格子背景
8. PixiJS Canvas（/home 角色预览）正常渲染，无视觉异常
