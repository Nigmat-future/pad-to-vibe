# Pad to Vibe

> **Sketch on your tablet. Code with Claude.**  
> **在平板上画草图，让 Claude 直接理解并生成代码。**

---

## ✨ Overview ｜ 项目简介

Pad to Vibe connects tablet sketching with Claude Code through MCP.  
Pad to Vibe 通过 MCP 把平板草图和 Claude Code 连接起来。

```text
Tablet Excalidraw Canvas
        ↓ Sync
Local Server (3001) + Claude Vision
        ↓ MCP Tools
Claude Code
“Implement this sketch for me”
```

---

## 🚀 Quick Start ｜ 快速开始

### 1) Install dependencies ｜ 安装依赖

```bash
npm install
```

### 2) Configure API key ｜ 配置 API Key

```bash
cp packages/server/.env.example packages/server/.env
# Edit .env and set ANTHROPIC_API_KEY
# 编辑 .env，填入 ANTHROPIC_API_KEY
```

### 3) Start server + web app ｜ 启动服务端和 Web 应用

```bash
npm run start:server   # Backend API (localhost:3001)
npm run start:web      # Tablet Web App (localhost:3000)
```

### 4) Open on your tablet ｜ 在平板访问

`http://<your-computer-lan-ip>:3000`

- Mac: `ifconfig | grep inet`
- Windows: `ipconfig`

### 5) Configure MCP for Claude Code ｜ 配置 Claude Code 的 MCP

Create `.claude/settings.json` in your project (or `~/.claude/settings.json` globally):  
在项目目录创建 `.claude/settings.json`（或全局 `~/.claude/settings.json`）：

```json
{
  "mcpServers": {
    "pad-to-vibe": {
      "command": "node",
      "args": ["--import", "tsx/esm", "/path/to/pad-to-vibe/packages/mcp/src/index.ts"],
      "env": {
        "SERVER_URL": "http://localhost:3001"
      }
    }
  }
}
```

Replace `/path/to/pad-to-vibe` with your actual local path.  
将 `/path/to/pad-to-vibe` 替换为你的本地实际路径。

---

## 🧭 How to Use ｜ 使用方法

1. Open `http://<your-computer-lan-ip>:3000` on your tablet  
   在平板打开 `http://<your-computer-lan-ip>:3000`（替换为你电脑的局域网 IP）
2. Draw UI wireframes, flows, or architecture sketches  
   画 UI 线框图、流程图或架构图
3. Tap the **⬆ Sync** button  
   点击右上角 **⬆ 同步**
4. Ask Claude Code:

```text
Check my latest sketch and implement it.
看看我最新的草图，帮我实现它。
```

Claude Code will call `get_latest_sketch` and generate code from your sketch.  
Claude Code 会调用 `get_latest_sketch`，读取草图并生成代码。

---

## 🛠 MCP Tools ｜ MCP 工具

| Tool | English | 中文 |
|------|---------|------|
| `list_sketches` | List all sketches (name, timestamp, type) | 列出所有草图（名称、时间、类型） |
| `get_sketch` | Get sketch image + AI analysis | 获取草图图片 + AI 分析 |
| `get_sketch_as_spec` | Convert sketch into structured Markdown PRD | 将草图转为结构化 Markdown PRD |
| `get_latest_sketch` | Get latest sketch (most used) | 获取最新草图（最常用） |

---

## 📁 Project Structure ｜ 项目结构

```text
pad-to-vibe/
├── packages/
│   ├── server/   # Hono API server (3001) / Hono API 服务器（3001）
│   ├── mcp/      # MCP server for Claude Code / 与 Claude Code 通信
│   └── web/      # React + Excalidraw PWA (3000) / 平板 Web 应用（3000）
├── package.json  # npm workspaces monorepo
├── PRD.md        # Product requirements / 产品需求文档
└── DESIGN.md     # Design document / 设计文档
```

---

## 🔐 Environment Variables ｜ 环境变量

`packages/server/.env`

| Variable | Default | English | 中文 |
|----------|---------|---------|------|
| `ANTHROPIC_API_KEY` | required | Claude Vision API key | Claude Vision API Key（必填） |
| `PORT` | `3001` | Server port | 服务端口 |
| `DATA_DIR` | `./data/sketches` | Sketch storage directory | 草图存储目录 |

`packages/mcp/` (via MCP env) / （通过 MCP env 传入）

| Variable | Default | English | 中文 |
|----------|---------|---------|------|
| `SERVER_URL` | `http://localhost:3001` | Backend server URL | 后端服务地址 |

---

## 🧩 Tech Stack ｜ 技术栈

- **Frontend / 前端**: React 18 + Vite + Excalidraw + PWA
- **Backend / 后端**: Node.js + Hono + @anthropic-ai/sdk
- **MCP**: @modelcontextprotocol/sdk (stdio)
- **Storage / 存储**: Local filesystem (MVP, no DB) / 本地文件系统（MVP，无数据库）
