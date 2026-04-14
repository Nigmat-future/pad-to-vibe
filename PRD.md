# Pad to Vibe — 产品需求文档 (PRD)

**版本：** v0.1.0  
**日期：** 2026-04-14  
**状态：** MVP 规划中

---

## 1. 产品概述

### 1.1 一句话定义
Pad to Vibe 是一个桥接工具，让用户在平板上画的草图（线框图、流程图、系统架构图）能被 Claude Code 等 AI 编程工具直接理解并用于生成代码。

### 1.2 核心问题
Vibe coding（AI 辅助编程）缺乏视觉化输入通道：
- 用户脑中有设计图，但 Claude Code 只接受文字
- 用纸和笔构思后，必须重新用文字描述，信息损失大
- 没有自然的「草图 → 代码」工作流

### 1.3 解决方案
```
平板浏览器（任意设备）
      ↓ 用户用触控笔/手指画草图
 Excalidraw 画布
      ↓ 点击"同步"按钮
 本地后端服务器
      ↓ Claude Vision API 分析草图
 MCP Server
      ↓ Claude Code 通过工具调用获取草图 + 分析
 Claude Code 生成代码
```

---

## 2. 目标用户

**主要用户：** 使用 Claude Code / Cursor / AI 编程工具的开发者，且有用草图/白板辅助思考的习惯

**使用场景：**
- 设计新功能的 UI 界面前先在 iPad 上画线框图
- 规划系统架构时画模块关系图
- 解释复杂业务流程时画流程图
- 开会时随手记录的技术图示

---

## 3. 功能需求

### 3.1 核心功能（MVP 必做）

#### F1：平板 Web 画布
- 嵌入 Excalidraw 开源版作为画布
- 支持任意平板浏览器（iOS Safari、Android Chrome、Windows Edge）
- 支持触控笔和手指输入
- 支持手绘风格线框图、流程图、文字注释

#### F2：草图同步
- 画布上有"同步到 Claude Code"按钮
- 点击后将当前画布导出为 PNG 并上传到本地服务器
- 支持给草图命名和添加简短备注
- 显示同步状态（上传中 / 成功 / 失败）

#### F3：草图存储与管理
- 本地服务器存储草图（PNG 文件 + JSON 元数据）
- 每个草图记录：名称、时间戳、备注、AI 分析结果
- 支持查看草图列表

#### F4：Claude Vision 分析
- 草图上传后自动调用 Claude Vision API 分析
- 分析内容：
  - 草图类型（UI线框图 / 流程图 / 架构图 / 混合）
  - 结构化描述（组件、关系、布局）
  - 可能的实现技术建议
- 分析结果缓存，避免重复调用

#### F5：MCP Server
暴露以下工具供 Claude Code 调用：

| 工具名 | 描述 | 输入 | 输出 |
|--------|------|------|------|
| `list_sketches` | 列出所有草图 | 无（可选：limit, offset） | 草图列表（id、名称、时间、类型） |
| `get_sketch` | 获取草图详情 | sketch_id | PNG base64 + AI 分析文本 |
| `get_sketch_as_spec` | 草图转 Markdown PRD | sketch_id | 结构化 Markdown spec |
| `get_latest_sketch` | 获取最新草图 | 无 | 最新草图的完整信息 |

### 3.2 非功能需求（MVP）

- **本地优先：** 所有数据存储在本地，不上云（MVP 阶段保护隐私）
- **低延迟：** 草图上传 + 分析在 10 秒内完成
- **跨平台：** 平板 Web App 在主流平板浏览器上可用
- **简单部署：** 后端服务器用一条命令启动（`npm start`）

---

## 4. 技术架构

### 4.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      平板浏览器（PWA）                        │
│  React + Excalidraw + Service Worker                         │
│  端口：3000                                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP REST API
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend Server                              │
│  Node.js + Hono                                              │
│  - POST /sketches          上传草图                           │
│  - GET  /sketches          列出草图                           │
│  - GET  /sketches/:id      获取草图详情                       │
│  - GET  /sketches/:id/png  获取草图图片                       │
│  - GET  /sketches/:id/spec 草图转 spec                        │
│  本地文件存储：./data/sketches/                               │
│  端口：3001                                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (内部调用)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   Claude Vision API                           │
│  Anthropic SDK (claude-sonnet-4-6)                           │
│  分析草图内容，生成结构化描述                                   │
└──────────────────────────────────────────────────────────────┘
                       ↑
                       │ MCP Protocol (stdio)
┌─────────────────────────────────────────────────────────────┐
│                   MCP Server                                  │
│  TypeScript + @modelcontextprotocol/sdk                      │
│  - list_sketches                                             │
│  - get_sketch                                                 │
│  - get_sketch_as_spec                                         │
│  - get_latest_sketch                                          │
│  与 Claude Code 通过 stdio 通信                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 项目目录结构

```
pad-to-vibe/
├── packages/
│   ├── web/                    # 平板 Web App (React + Excalidraw)
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── SketchCanvas.tsx    # Excalidraw 画布封装
│   │   │   │   └── SyncButton.tsx      # 同步按钮
│   │   │   └── api.ts                  # 与后端通信
│   │   └── package.json
│   │
│   ├── server/                 # Backend Server (Node.js + Hono)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   └── sketches.ts
│   │   │   ├── services/
│   │   │   │   ├── storage.ts          # 本地文件存储
│   │   │   │   └── analyzer.ts         # Claude Vision 分析
│   │   │   └── types.ts
│   │   ├── data/
│   │   │   └── sketches/               # 草图存储目录
│   │   └── package.json
│   │
│   └── mcp/                    # MCP Server
│       ├── src/
│       │   ├── index.ts
│       │   └── tools/
│       │       ├── listSketches.ts
│       │       ├── getSketch.ts
│       │       ├── getSketchAsSpec.ts
│       │       └── getLatestSketch.ts
│       └── package.json
│
├── package.json                # Monorepo 根
└── PRD.md
```

### 4.3 技术栈

| 层 | 技术 | 选择理由 |
|----|------|----------|
| 平板前端 | React + Vite + TypeScript | 生态最好，Excalidraw 官方支持 |
| 画布 | Excalidraw (npm 包) | 开源、支持触控、导出 PNG/SVG、手绘风格 |
| 后端 | Node.js + Hono | 轻量、TypeScript 原生、适合本地服务 |
| 存储 | 本地文件系统 | MVP 简单，无需数据库 |
| AI 分析 | Claude Vision API (claude-sonnet-4-6) | 最强多模态理解能力 |
| MCP | @modelcontextprotocol/sdk | 官方 SDK，类型安全 |
| Monorepo | npm workspaces | 无需额外工具 |

---

## 5. 用户故事

### US-01：画草图并同步
> 作为开发者，我想在 iPad 上画 UI 草图，然后一键同步到我的 MacBook，让 Claude Code 能看到它。

**验收标准：**
- 平板浏览器打开 http://localhost:3000 可以看到 Excalidraw 画布
- 可以用触控笔画线框图
- 点击"同步"按钮后，草图出现在服务器端
- 同步成功后有视觉确认（toast / 图标变绿）

### US-02：Claude Code 获取草图
> 作为使用 Claude Code 的开发者，我想说"看看我刚画的草图，帮我实现它"，Claude Code 能自动理解设计意图。

**验收标准：**
- Claude Code 通过 MCP 工具 `get_latest_sketch` 获取草图
- 返回值包含：草图图片（base64）+ AI 分析的文字描述
- Claude Code 能根据分析生成对应代码

### US-03：草图转 PRD
> 作为开发者，我想把草图转成结构化的 Markdown 文档，方便存档和分享。

**验收标准：**
- 调用 `get_sketch_as_spec` 工具返回完整 Markdown PRD
- PRD 包含：功能描述、组件列表、交互说明、建议的技术实现

---

## 6. MVP 范围边界

### 在 MVP 内：
- 本地部署（服务端跑在开发者自己的电脑上）
- 平板通过局域网访问服务端
- 单用户（不做认证）
- 4 个 MCP 工具
- PNG 格式草图存储
- Claude Vision 分析（同步触发）

### MVP 之后再做：
- 云端部署 / 多设备同步
- 实时协作（WebSocket）
- Excalidraw 元数据（向量）存储，不只是 PNG
- 草图版本历史
- 多项目管理
- 草图搜索
- 自定义分析 prompt

---

## 7. 成功指标

- 从画完草图到 Claude Code 获取草图分析 < 15 秒
- Claude Code 基于草图生成的代码与预期结果匹配度（主观评估）> 80%
- 平板端操作直觉，无需说明书

---

## CHANGELOG

### v0.1.0 (2026-04-14)
- 初始 PRD 创建
- 定义 MVP 范围：4 个 MCP 工具、本地部署、Excalidraw 画布
