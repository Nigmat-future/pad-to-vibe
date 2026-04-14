import Anthropic from '@anthropic-ai/sdk'
import type { SketchAnalysis, SketchType } from '../types.js'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const ANALYSIS_PROMPT = `You are analyzing a hand-drawn sketch from a developer's tablet.
Analyze this sketch and respond ONLY with a valid JSON object (no markdown, no explanation).

The JSON must have exactly this structure:
{
  "type": "ui-wireframe" | "flowchart" | "architecture" | "mixed" | "unknown",
  "description": "A clear, concise paragraph describing what this sketch shows",
  "components": ["list", "of", "key", "visual", "elements", "or", "components"],
  "relationships": ["how", "elements", "relate", "to", "each", "other"],
  "techSuggestions": ["suggested", "tech", "stack", "or", "implementation", "approach"],
  "markdownSpec": "A complete Markdown specification document for implementing what is shown in the sketch"
}

For markdownSpec, write a proper spec with:
- ## Overview (what this is)
- ## Components (list each component with description)
- ## User Flow (how user interacts)
- ## Technical Implementation (concrete implementation suggestions)
- ## Acceptance Criteria (how to verify it's built correctly)`

export async function analyzeSketch(imageBuffer: Buffer): Promise<SketchAnalysis> {
  const base64 = imageBuffer.toString('base64')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: base64,
            },
          },
          {
            type: 'text',
            text: ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude Vision')
  }

  let parsed: SketchAnalysis
  try {
    // Strip any accidental markdown code fences
    const cleaned = textBlock.text
      .replace(/^```json\s*/i, '')
      .replace(/```\s*$/, '')
      .trim()
    parsed = JSON.parse(cleaned)
  } catch {
    // Fallback if JSON parse fails
    parsed = {
      type: 'unknown' as SketchType,
      description: textBlock.text,
      components: [],
      relationships: [],
      techSuggestions: [],
      markdownSpec: `# Sketch Analysis\n\n${textBlock.text}`,
    }
  }

  return parsed
}
