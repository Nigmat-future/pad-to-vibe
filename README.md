# Pad to Vibe

> Sketch on your tablet. Code with Claude.

在平板上画草图，让 Claude Code 直接理解你的设计意图并生成代码。

```
平板 Excalidraw 画布
       ↓ 点击同步
  本地服务器 (3001)
  + Claude Vision 分析
       ↓ MCP 工具
    Claude Code
  "帮我实现这个草图"
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

```bash
cp packages/server/.env.example packages/server/.env
# 编辑 .env，填入你的 ANTHROPIC_API_KEY
```

### 3. 启动服务器 + Web App

```bash
# 在你的电脑上运行：
npm run start:server   # 后端 API (localhost:3001)
npm run start:web      # 平板 Web App (localhost:3000)
```

### 4. 平板访问

在平板浏览器中访问：`http://你电脑的局域网IP:3000`

> 查看你的局域网 IP：Mac `ifconfig | grep inet`，Windows `ipconfig`

### 5. 配置 Claude Code 的 MCP

在你的项目目录下创建 `.claude/settings.json`（或全局 `~/.claude/settings.json`）：

```json
{
  "mcpServers": {
    "pad-to-vibe": {
      "command": "node",
      "args": [
        "--import", "tsx/esm",
        "/path/to/pad-to-vibe/packages/mcp/src/index.ts"
      ],
      "env": {
        "SERVER_URL": "http://localhost:3001"
      }
    }
  }
}
```

将 `/path/to/pad-to-vibe` 替换为本项目的实际路径。

---

## 使用方法

1. 在平板上打开 `http://电脑IP:3000`
2. 用触控笔画 UI 线框图、流程图或架构图
3. 点击右上角「⬆ 同步」按钮
4. 在 Claude Code 中说：

```
看看我最新的草图，帮我实现它
```

Claude Code 会调用 `get_latest_sketch` 工具，看到你的草图并生成代码。

---

## MCP 工具

| 工具 | 说明 |
|------|------|
| `list_sketches` | 列出所有草图（名称、时间、类型）|
| `get_sketch` | 获取草图图片 + AI 分析描述 |
| `get_sketch_as_spec` | 将草图转成结构化 Markdown PRD |
| `get_latest_sketch` | 获取最新草图（最常用）|

---

## 项目结构

```
pad-to-vibe/
├── packages/
│   ├── server/   # Hono API 服务器（端口 3001）
│   ├── mcp/      # MCP Server（与 Claude Code 通信）
│   └── web/      # React + Excalidraw PWA（端口 3000）
├── package.json  # npm workspaces monorepo
├── PRD.md        # 产品需求文档
└── DESIGN.md     # 设计文档（Atelier Dark）
```

---

## 环境变量

`packages/server/.env`：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `ANTHROPIC_API_KEY` | 必填 | Claude Vision API Key |
| `PORT` | `3001` | 服务器端口 |
| `DATA_DIR` | `./data/sketches` | 草图存储目录 |

`packages/mcp/`（通过 MCP 配置的 env 传入）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SERVER_URL` | `http://localhost:3001` | 后端服务器地址 |

---

## 技术栈

- **前端**：React 18 + Vite + Excalidraw + PWA
- **后端**：Node.js + Hono + @anthropic-ai/sdk
- **MCP**：@modelcontextprotocol/sdk (stdio)
- **存储**：本地文件系统（MVP，无数据库）
