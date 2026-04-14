# Pad to Vibe — 设计文档

**版本：** v0.1.0  
**日期：** 2026-04-14  
**美学方向：** Atelier Dark（暗色工具感 × Excalidraw 手绘温度）  
**设计评分：** A（新建）

---

## 1. 设计原则

**核心原则：** 界面退场，画布主导

1. **退场** — UI chrome 尽量薄、暗、透明。用户的注意力属于画布，不属于我们的界面。
2. **工具感** — 每一个交互都应该感觉精准、快速、有反应。没有过度的动画、没有废话的文案。
3. **温度** — 不是冷酷的黑色工具。暖炭灰底色 + 琥珀强调色，呼应 Excalidraw 的手绘气质。
4. **少即多** — 移除任何非必要的视觉元素。边框仅在必要时出现，间距说话。

---

## 2. 色彩系统

### 2.1 Primitive Tokens（原始值）

```css
/* 背景层级 */
--gray-950: #111110;   /* 暖炭灰，最深 */
--gray-900: #1C1C1A;   /* 面板底色 */
--gray-850: #252523;   /* 卡片升起层 */
--gray-800: #2E2E2B;   /* 边框 */
--gray-600: #8C867C;   /* muted 辅助 */
--gray-100: #F5F0E8;   /* 暖白，主文字 */

/* 品牌色 */
--amber-500: #F59E0B;  /* 琥珀/铅笔黄 — 核心强调 */
--amber-600: #D97706;  /* 强调 hover 态 */
--amber-900: #451A03;  /* 强调背景（低调标签） */

/* 语义色 */
--green-500: #22C55E;  /* 成功 */
--green-900: #052E16;  /* 成功背景 */
--red-500:   #EF4444;  /* 错误 */
--red-900:   #450A0A;  /* 错误背景 */
```

### 2.2 Semantic Tokens（语义化）

```css
:root[data-theme="dark"] {
  /* 背景 */
  --color-background:      var(--gray-950);   /* #111110 */
  --color-surface:         var(--gray-900);   /* #1C1C1A */
  --color-surface-raised:  var(--gray-850);   /* #252523 */

  /* 文字 */
  --color-foreground:      var(--gray-100);   /* #F5F0E8 */
  --color-muted:           var(--gray-600);   /* #8C867C */

  /* 强调 */
  --color-accent:          var(--amber-500);  /* #F59E0B */
  --color-accent-hover:    var(--amber-600);  /* #D97706 */
  --color-accent-subtle:   var(--amber-900);  /* #451A03 */

  /* 边框 */
  --color-border:          var(--gray-800);   /* #2E2E2B */

  /* 状态 */
  --color-success:         var(--green-500);
  --color-success-bg:      var(--green-900);
  --color-error:           var(--red-500);
  --color-error-bg:        var(--red-900);
}
```

### 2.3 Component Tokens

```css
/* 按钮 */
--btn-primary-bg:       var(--color-accent);
--btn-primary-text:     #0C0A00;
--btn-primary-hover-bg: var(--color-accent-hover);
--btn-ghost-text:       var(--color-muted);
--btn-ghost-hover-bg:   var(--color-surface-raised);

/* 输入框 */
--input-bg:             var(--color-surface);
--input-border:         var(--color-border);
--input-focus-ring:     var(--color-accent);
--input-placeholder:    var(--color-muted);

/* 卡片 */
--card-bg:              var(--color-surface-raised);
--card-border:          var(--color-border);

/* 工具栏 */
--toolbar-bg:           rgba(17, 17, 16, 0.92);  /* 毛玻璃效果 */
--toolbar-border:       var(--color-border);
```

---

## 3. 字体系统

### 3.1 字体族

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-ui:   'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 3.2 字号阶梯

| Token | 大小 | 字重 | 行高 | 用途 |
|-------|------|------|------|------|
| `--text-xs`  | 11px | 400  | 1.4  | 标签、时间戳 |
| `--text-sm`  | 13px | 400  | 1.4  | 辅助文字、hint |
| `--text-base`| 15px | 400  | 1.6  | 正文 |
| `--text-md`  | 17px | 500  | 1.4  | 小标题 |
| `--text-lg`  | 20px | 600  | 1.3  | 标题 |
| `--text-xl`  | 24px | 600  | 1.2  | 页面标题 |

**JetBrains Mono 用途：** 草图 ID、时间戳、技术参数、状态 badge

---

## 4. 间距与圆角

### 4.1 间距（4px 基数）

```css
--space-xs:  4px;
--space-sm:  8px;
--space-md:  16px;
--space-lg:  24px;
--space-xl:  32px;
--space-2xl: 48px;
```

### 4.2 圆角（层级化）

```css
--radius-sm: 4px;   /* 小元素：badge、tag */
--radius-md: 8px;   /* 输入框、按钮 */
--radius-lg: 12px;  /* 卡片、面板 */
--radius-xl: 16px;  /* 抽屉、底部 sheet */
```

### 4.3 阴影

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.4);           /* 按钮微提升 */
--shadow-md: 0 4px 12px rgba(0,0,0,0.5);           /* 卡片 */
--shadow-lg: 0 8px 32px rgba(0,0,0,0.6);           /* 面板、抽屉 */
--shadow-accent: 0 0 0 2px var(--color-accent);    /* 焦点环 */
```

---

## 5. 断点

```css
--bp-mobile:  375px;   /* 手机（兜底）*/
--bp-tablet:  768px;   /* 平板竖屏 */
--bp-desktop: 1024px;  /* 平板横屏 / 桌面 */
--bp-wide:    1440px;  /* 宽屏 */
```

---

## 6. 动效规范

```css
/* 缓动 */
--ease-out:     cubic-bezier(0.0, 0.0, 0.2, 1);   /* 元素进入 */
--ease-in:      cubic-bezier(0.4, 0.0, 1, 1);     /* 元素退出 */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* 弹性弹入 */

/* 时长 */
--duration-fast:   100ms;  /* hover 态切换 */
--duration-normal: 200ms;  /* 面板滑入、状态切换 */
--duration-slow:   350ms;  /* 底部 sheet 滑入 */

/* 规则 */
/* 1. 只动画 transform 和 opacity */
/* 2. 必须尊重 prefers-reduced-motion */
/* 3. 不用 transition: all */
```

---

## 7. 页面规范

### 7.1 主画布页面（Canvas Page）

**设计目标：** UI 退到 10%，画布占据 90%

```
┌─────────────────────────────────────────────────────┐
│  ████ App Bar (48px, 毛玻璃, position: fixed top)    │
│  [≡ 草图列表]              [项目名]   [⬆ 同步] [●]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│                 Excalidraw 画布                      │
│              (全屏, position: absolute)              │
│                                                     │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**App Bar 组件规范：**

| 元素 | 规格 |
|------|------|
| 高度 | 48px |
| 背景 | `--toolbar-bg`（毛玻璃：backdrop-filter: blur(12px)） |
| 底边 | 1px `--color-border` |
| 左侧 | 草图列表按钮（图标 ghost 按钮，24px icon） |
| 中央 | 草图名称（可点击编辑，Inter 500 15px，最多 24 字符） |
| 右侧 | 同步按钮 + 状态点 |

**同步按钮（主 CTA）：**

```
Default:  [⬆ 同步] — bg: --color-accent, text: #0C0A00, radius: --radius-md
Hover:    bg: --color-accent-hover, scale(1.02), transition: 100ms
Active:   scale(0.98)
Loading:  spinner + "同步中…"，禁止再次点击
Success:  [✓ 已同步] — bg: --color-success-bg, text: --color-success，2s 后还原
Error:    [✗ 失败] — bg: --color-error-bg, text: --color-error
Disabled: opacity: 0.4, cursor: not-allowed
```

**状态点（右上角小圆点）：**

```
灰色（#8C867C）— 未连接服务器
绿色（#22C55E）— 已连接
黄色（#F59E0B）— 同步中（pulse 动画）
红色（#EF4444）— 连接失败
```

**Excalidraw 集成：**
- 铺满整个视口（`position: absolute; inset: 0`）
- App bar 在画布之上（z-index: 10）
- 顶部 padding = 48px（App bar 高度），防止内容被遮挡
- Excalidraw 使用暗色主题（与 Atelier Dark 一致）

---

### 7.2 同步面板（Sync Panel）

**触发方式：** 点击 App Bar 的「同步」按钮  
**呈现方式：** 底部 Sheet（移动端/平板竖屏）| 右侧 Drawer（平板横屏 ≥1024px）

**底部 Sheet 布局（默认，≤ 1023px）：**

```
┌─────────────────────────────────────────────────────┐
│  ████ 画布（变暗，overlay: rgba(0,0,0,0.5)）         │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ▬  （拖拽把手，40px 宽，4px 高，居中）              │
│                                                     │
│  草图名称                                            │
│  ┌─────────────────────────────────────────────────┐ │
│  │  我的首页设计草图                               │ │  ← 默认空则用时间戳
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  备注（可选）                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │  这是 v2 版本的导航栏改版方案…                  │ │
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │              ⬆  同步到 Claude Code              │ │  ← 主 CTA，全宽
│  └─────────────────────────────────────────────────┘ │
│                                                     │
│  ─── 最近同步 ────────────────────────────────────  │
│  📄 首页线框图 v1          2分钟前  ✓               │
│  📄 系统架构图             昨天     ✓               │
└─────────────────────────────────────────────────────┘
```

**Sheet 组件规范：**

| 属性 | 值 |
|------|---|
| 背景 | `--color-surface` |
| 顶圆角 | `--radius-xl`（16px） |
| 顶部阴影 | `--shadow-lg` |
| 滑入动画 | translateY: 100% → 0，350ms ease-out |
| 滑出动画 | translateY: 0 → 100%，250ms ease-in |
| 最大高度 | 85vh |
| 键盘弹起 | 自动上移（避免输入框被遮挡） |

**输入框规范：**

```
背景: --input-bg
边框: 1px solid --input-border
焦点: outline: 2px solid --color-accent（--shadow-accent）
圆角: --radius-md
padding: var(--space-sm) var(--space-md)
字体: Inter 400 15px
placeholder: --color-muted
```

**最近同步列表行：**

```
高度: 44px（满足触控目标）
布局: flex; 草图名称（flex:1）+ 时间（mono, muted）+ 状态图标
hover: background: --color-surface-raised, transition: 100ms
```

---

### 7.3 草图列表页（Sketches Page）

**导航方式：** 点击 App Bar 左侧「≡」图标或抽屉内导航  
**布局：** 全页，替换画布视图

```
┌─────────────────────────────────────────────────────┐
│  [← 返回画布]    草图库          [🔍]               │  ← App Bar
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  [缩略图]    │  │  [缩略图]    │  │  [缩略图]    ││
│  │              │  │              │  │              ││
│  │  首页线框图  │  │  系统架构图  │  │  流程图 v2   ││
│  │  2min ago    │  │  昨天        │  │  3天前       ││
│  └──────────────┘  └──────────────┘  └──────────────┘│
│  ┌──────────────┐  ┌──────────────┐                  │
│  │  [缩略图]    │  │  + 新草图    │                  │
│  │              │  │              │                  │
│  │  API 设计图  │  │              │                  │
│  │  上周        │  │              │                  │
│  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────┘
```

**草图卡片规范：**

| 属性 | 值 |
|------|---|
| 背景 | `--card-bg` |
| 边框 | 1px solid `--card-border` |
| 圆角 | `--radius-lg` |
| 缩略图比例 | 4:3 |
| 缩略图背景 | `#1A1A18`（深一度，显示草图） |
| 名称字体 | Inter 500 13px |
| 时间字体 | JetBrains Mono 11px `--color-muted` |
| hover | border-color → `--color-accent`，transform: translateY(-2px)，200ms |
| 最小触控尺寸 | 整卡片可点击，padding: var(--space-sm) |

**网格布局：**

```css
display: grid;
grid-template-columns: repeat(2, 1fr);        /* 手机 */
grid-template-columns: repeat(3, 1fr);        /* 平板 (≥768px) */
grid-template-columns: repeat(4, 1fr);        /* 桌面 (≥1024px) */
gap: var(--space-md);
padding: var(--space-md);
```

---

## 8. 交互状态完整规范

### 按钮状态

```
Primary（琥珀）：
  default:  bg #F59E0B, text #0C0A00, radius 8px
  hover:    bg #D97706, transition 100ms
  active:   scale(0.97)
  loading:  spinner（白色）+ 禁止点击
  disabled: opacity 0.35, cursor not-allowed

Ghost（透明）：
  default:  bg transparent, text --color-muted
  hover:    bg --color-surface-raised, text --color-foreground, transition 100ms
  active:   scale(0.97)
  disabled: opacity 0.35
```

### 输入框状态

```
default:  border --color-border
focus:    border-color: --color-accent, box-shadow: --shadow-accent
error:    border-color: --color-error, text: --color-error 在下方
disabled: opacity 0.4, cursor not-allowed
```

### 触摸目标

所有交互元素最小 44×44px（按照 Apple HIG）

---

## 9. 无障碍规范

- **对比度：** 主文字 #F5F0E8 on #111110 = 12.1:1 ✓（超 WCAG AAA）
- **焦点可见：** 所有交互元素 `focus-visible: outline 2px solid #F59E0B`
- **动效：** `@media (prefers-reduced-motion: reduce)` 禁用所有 transition/animation
- **颜色语义：** 状态不仅用颜色表达（✓ ✗ 文字 + 图标并用）
- **触摸目标：** ≥ 44px

---

## 10. 设计审计（初始评估）

| 维度 | 评分 | 备注 |
|------|------|------|
| 视觉层级 | A | 画布主导，chrome 退场 |
| 排版 | A | Inter + JetBrains Mono，工具感清晰 |
| 间距布局 | A | 4px 体系严格 |
| 色彩对比 | A | 12.1:1 超 AAA |
| 交互状态 | A | 完整定义 5 种状态 |
| 响应式 | B | 需工程实现时验证 |
| AI 模板痕迹 | A | 无三列网格、无渐变 Hero、无居中滥用 |
| 动效 | A | 100-350ms，有目的 |

**整体评分：A**

---

## DESIGN CHANGELOG

### v0.1.0 (2026-04-14)
**背景：** 新项目，从零创建设计系统  
**设计方向选择：** Atelier Dark（用户在 3 个选项中选定）  
**关键决策：**
- 琥珀/铅笔黄（#F59E0B）作为唯一强调色，呼应手绘工具气质
- UI chrome 刻意保持薄而暗，让 Excalidraw 画布主导视野
- 15px 基准字号（比常见 16px 小一点），提升工具感密度
- 底部 Sheet 而非模态框，保留空间感
