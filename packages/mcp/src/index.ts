#!/usr/bin/env node
/**
 * Pad to Vibe MCP Server
 *
 * Connects Claude Code to your tablet sketches.
 *
 * Claude Desktop config (~/.claude/claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "pad-to-vibe": {
 *       "command": "node",
 *       "args": ["--import", "tsx/esm", "/path/to/packages/mcp/src/index.ts"],
 *       "env": {
 *         "SERVER_URL": "http://localhost:3001"
 *       }
 *     }
 *   }
 * }
 *
 * Claude Code config (.claude/settings.json in your project):
 * {
 *   "mcpServers": {
 *     "pad-to-vibe": {
 *       "command": "node",
 *       "args": ["--import", "tsx/esm", "/path/to/packages/mcp/src/index.ts"],
 *       "env": { "SERVER_URL": "http://localhost:3001" }
 *     }
 *   }
 * }
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:3001'

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Server error ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

async function fetchText(path: string): Promise<string> {
  const res = await fetch(`${SERVER_URL}${path}`)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Server error ${res.status}: ${body}`)
  }
  return res.text()
}

// Types mirroring server types
interface SketchMeta {
  id: string
  name: string
  note: string
  createdAt: string
  analyzed: boolean
  type: string
}

interface SketchDetail extends SketchMeta {
  analysis: {
    type: string
    description: string
    components: string[]
    relationships: string[]
    techSuggestions: string[]
    markdownSpec: string
  } | null
  imageBase64: string | null
}

const server = new McpServer({
  name: 'pad-to-vibe',
  version: '0.1.0',
})

// Tool 1: list_sketches
server.tool(
  'list_sketches',
  'List all sketches synced from the tablet. Returns sketch IDs, names, timestamps, and analysis status.',
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
        content: [
          {
            type: 'text' as const,
            text: 'No sketches found. Open the Pad to Vibe web app on your tablet and sync a sketch first.',
          },
        ],
      }
    }

    const lines = data.items.map((s, i) => {
      const date = new Date(s.createdAt).toLocaleString('zh-CN')
      const status = s.analyzed ? `[${s.type}]` : '[analyzing...]'
      return `${i + 1}. **${s.name}** ${status}\n   ID: \`${s.id}\`  |  ${date}${s.note ? `\n   Note: ${s.note}` : ''}`
    })

    return {
      content: [
        {
          type: 'text' as const,
          text: `## Tablet Sketches (${data.total} total)\n\n${lines.join('\n\n')}`,
        },
      ],
    }
  }
)

// Tool 2: get_sketch
server.tool(
  'get_sketch',
  'Get a specific sketch with its image and AI analysis. Use this to understand what a sketch shows before generating code.',
  {
    sketch_id: z.string().describe('The sketch ID from list_sketches'),
  },
  async ({ sketch_id }) => {
    const detail = await fetchJSON<SketchDetail>(`/sketches/${sketch_id}`)

    const content: Array<{ type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string }> = []

    // Include the image if available
    if (detail.imageBase64) {
      content.push({
        type: 'image' as const,
        data: detail.imageBase64,
        mimeType: 'image/png',
      })
    }

    // Include analysis text
    if (detail.analysis) {
      const a = detail.analysis
      content.push({
        type: 'text' as const,
        text: [
          `## Sketch: ${detail.name}`,
          `**Type:** ${a.type}  |  **Synced:** ${new Date(detail.createdAt).toLocaleString('zh-CN')}`,
          detail.note ? `**Note:** ${detail.note}` : '',
          '',
          '### Description',
          a.description,
          '',
          '### Components',
          a.components.map((c) => `- ${c}`).join('\n'),
          '',
          '### Relationships',
          a.relationships.map((r) => `- ${r}`).join('\n'),
          '',
          '### Tech Suggestions',
          a.techSuggestions.map((t) => `- ${t}`).join('\n'),
        ]
          .filter((l) => l !== undefined)
          .join('\n'),
      })
    } else {
      content.push({
        type: 'text' as const,
        text: detail.imageBase64
          ? `## Sketch: ${detail.name}\n\nAnalysis is still processing. The image is shown above. You can describe what you see and proceed.`
          : `## Sketch: ${detail.name}\n\nSketch found but image not available yet. Try again in a moment.`,
      })
    }

    return { content }
  }
)

// Tool 3: get_sketch_as_spec
server.tool(
  'get_sketch_as_spec',
  'Convert a sketch into a structured Markdown specification/PRD. Use this to get a detailed spec before implementing.',
  {
    sketch_id: z.string().describe('The sketch ID from list_sketches'),
  },
  async ({ sketch_id }) => {
    const spec = await fetchText(`/sketches/${sketch_id}/spec`)

    return {
      content: [
        {
          type: 'text' as const,
          text: spec,
        },
      ],
    }
  }
)

// Tool 4: get_latest_sketch
server.tool(
  'get_latest_sketch',
  'Get the most recently synced sketch from the tablet. Use this when the user says "look at my latest sketch" or "implement what I just drew".',
  {},
  async () => {
    const data = await fetchJSON<{ total: number; items: SketchMeta[] }>(
      '/sketches?limit=1&offset=0'
    )

    if (data.items.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'No sketches found. Open the Pad to Vibe web app on your tablet and sync a sketch first.',
          },
        ],
      }
    }

    const latest = data.items[0]
    const detail = await fetchJSON<SketchDetail>(`/sketches/${latest.id}`)

    const content: Array<{ type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string }> = []

    if (detail.imageBase64) {
      content.push({
        type: 'image' as const,
        data: detail.imageBase64,
        mimeType: 'image/png',
      })
    }

    if (detail.analysis) {
      const a = detail.analysis
      content.push({
        type: 'text' as const,
        text: [
          `## Latest Sketch: ${detail.name}`,
          `**Type:** ${a.type}  |  **Synced:** ${new Date(detail.createdAt).toLocaleString('zh-CN')}`,
          detail.note ? `**Note:** ${detail.note}` : '',
          '',
          '### AI Analysis',
          a.description,
          '',
          '### Components Detected',
          a.components.map((c) => `- ${c}`).join('\n'),
          '',
          '### Tech Suggestions',
          a.techSuggestions.map((t) => `- ${t}`).join('\n'),
          '',
          '---',
          `*Use \`get_sketch_as_spec\` with ID \`${detail.id}\` for the full implementation spec.*`,
        ]
          .filter(Boolean)
          .join('\n'),
      })
    } else {
      content.push({
        type: 'text' as const,
        text: `## Latest Sketch: ${detail.name}\n\nSynced ${new Date(detail.createdAt).toLocaleString('zh-CN')}. Analysis in progress — the image is shown above.`,
      })
    }

    return { content }
  }
)

// Start server
const transport = new StdioServerTransport()
await server.connect(transport)
console.error('Pad to Vibe MCP Server running (stdio)')
console.error(`Connected to sketch server at: ${SERVER_URL}`)
