#!/usr/bin/env node
/**
 * Pad to Vibe MCP Server
 *
 * Serves tablet sketches to Claude Code.
 * No API key required — Claude Code sees the image directly via MCP.
 *
 * Add to your Claude Code project (.claude/settings.json):
 * {
 *   "mcpServers": {
 *     "pad-to-vibe": {
 *       "command": "node",
 *       "args": ["--import", "tsx/esm", "/absolute/path/to/packages/mcp/src/index.ts"],
 *       "env": { "SERVER_URL": "http://localhost:3001" }
 *     }
 *   }
 * }
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:3001'

interface SketchMeta {
  id: string
  name: string
  note: string
  createdAt: string
}

interface SketchDetail extends SketchMeta {
  imageBase64: string | null
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`)
  if (!res.ok) throw new Error(`Server error ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

// Returns image content block + metadata text for a sketch
function buildSketchContent(detail: SketchDetail) {
  const content: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; data: string; mimeType: string }
  > = []

  if (detail.imageBase64) {
    content.push({
      type: 'image',
      data: detail.imageBase64,
      mimeType: 'image/png',
    })
  }

  const synced = new Date(detail.createdAt).toLocaleString('zh-CN')
  const lines = [
    `**${detail.name}**`,
    `Synced: ${synced}`,
    detail.note ? `Note: ${detail.note}` : '',
    `ID: \`${detail.id}\``,
  ].filter(Boolean)

  content.push({ type: 'text', text: lines.join('  \n') })

  return content
}

const server = new McpServer({
  name: 'pad-to-vibe',
  version: '0.2.0',
})

// Tool 1: list_sketches
server.tool(
  'list_sketches',
  'List all sketches synced from the tablet. Returns names, IDs, and timestamps.',
  {
    limit: z.number().int().min(1).max(100).optional().describe('Max results (default 20)'),
    offset: z.number().int().min(0).optional().describe('Pagination offset'),
  },
  async ({ limit = 20, offset = 0 }) => {
    const data = await fetchJSON<{ total: number; items: SketchMeta[] }>(
      `/sketches?limit=${limit}&offset=${offset}`
    )

    if (data.items.length === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: 'No sketches yet. Open the Pad to Vibe web app on your tablet and sync a sketch first.',
        }],
      }
    }

    const lines = data.items.map((s, i) => {
      const date = new Date(s.createdAt).toLocaleString('zh-CN')
      return `${i + 1}. **${s.name}**  —  ID: \`${s.id}\`  |  ${date}${s.note ? `\n   > ${s.note}` : ''}`
    })

    return {
      content: [{
        type: 'text' as const,
        text: `## Tablet Sketches (${data.total} total)\n\n${lines.join('\n\n')}`,
      }],
    }
  }
)

// Tool 2: get_sketch — returns the image so Claude Code can see and understand it directly
server.tool(
  'get_sketch',
  'Get a specific sketch image from the tablet. Returns the image so you can see it and understand the design intent.',
  {
    sketch_id: z.string().describe('Sketch ID from list_sketches'),
  },
  async ({ sketch_id }) => {
    const detail = await fetchJSON<SketchDetail>(`/sketches/${sketch_id}`)

    if (!detail.imageBase64) {
      return {
        content: [{
          type: 'text' as const,
          text: `Sketch "${detail.name}" found but image not available. Try again in a moment.`,
        }],
      }
    }

    return { content: buildSketchContent(detail) }
  }
)

// Tool 3: get_latest_sketch — most common usage: "look at my latest sketch"
server.tool(
  'get_latest_sketch',
  'Get the most recently synced sketch from the tablet. Use this when the user says "look at my sketch" or "implement what I just drew".',
  {},
  async () => {
    const data = await fetchJSON<{ total: number; items: SketchMeta[] }>(
      '/sketches?limit=1&offset=0'
    )

    if (data.items.length === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: 'No sketches yet. Open the Pad to Vibe web app on your tablet and sync a sketch first.',
        }],
      }
    }

    const detail = await fetchJSON<SketchDetail>(`/sketches/${data.items[0].id}`)
    return { content: buildSketchContent(detail) }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
console.error(`Pad to Vibe MCP Server v0.2.0 ready (${SERVER_URL})`)
