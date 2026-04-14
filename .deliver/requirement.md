# Phase 0 — 需求理解摘要

## 项目类型
fullstack（前端 PWA + 后端 API + MCP Server）

## 核心目标
用 Excalidraw 作为平板画布，通过本地后端 + Claude Vision API + MCP Server，让 Claude Code 能直接调用工具获取草图及其 AI 分析，实现「平板草图 → Claude Code 生成代码」的工作流。

## 主要功能点
1. F1：平板 Web 画布（Excalidraw 嵌入，PWA）
2. F2：草图同步（PNG 上传到本地服务器）
3. F3：草图存储（本地文件系统 + JSON 元数据）
4. F4：Claude Vision 自动分析草图
5. F5：MCP Server（4 个工具：list/get/spec/latest）

## 约束条件
- MVP 本地部署，不上云
- 单用户，无需认证
- 跨平台浏览器兼容（iOS/Android/Windows 平板）
- 后端一条命令启动

## PRD 文件
→ PRD.md（完整版）
