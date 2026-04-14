import { Hono } from 'hono'
import {
  saveSketch,
  listSketches,
  getSketchMeta,
  getSketchImage,
  getSketchAnalysis,
  saveSketchAnalysis,
  sketchExists,
} from '../services/storage.js'
import { analyzeSketch } from '../services/analyzer.js'

export const sketchesRouter = new Hono()

// POST /sketches — upload a sketch (multipart/form-data: image, name?, note?)
sketchesRouter.post('/', async (c) => {
  const formData = await c.req.formData()

  const imageFile = formData.get('image')
  if (!imageFile || typeof imageFile === 'string') {
    return c.json({ error: 'Missing image file' }, 400)
  }

  const name = (formData.get('name') as string) ?? ''
  const note = (formData.get('note') as string) ?? ''

  const arrayBuffer = await imageFile.arrayBuffer()
  const imageBuffer = Buffer.from(arrayBuffer)

  const meta = await saveSketch(imageBuffer, name, note)

  // Trigger async analysis (don't await — return immediately)
  if (process.env.ANTHROPIC_API_KEY) {
    analyzeSketch(imageBuffer)
      .then((analysis) => saveSketchAnalysis(meta.id, analysis))
      .catch((err) => console.error(`[analyzer] Failed for ${meta.id}:`, err))
  }

  return c.json(meta, 201)
})

// GET /sketches — list all sketches
sketchesRouter.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') ?? '50', 10)
  const offset = parseInt(c.req.query('offset') ?? '0', 10)

  const all = await listSketches()
  const page = all.slice(offset, offset + limit)

  return c.json({
    total: all.length,
    items: page,
  })
})

// GET /sketches/:id — get sketch detail (meta + analysis if ready)
sketchesRouter.get('/:id', async (c) => {
  const id = c.req.param('id')

  const meta = await getSketchMeta(id)
  if (!meta) return c.json({ error: 'Sketch not found' }, 404)

  const analysis = await getSketchAnalysis(id)

  const image = await getSketchImage(id)
  const imageBase64 = image ? image.toString('base64') : null

  return c.json({ ...meta, analysis, imageBase64 })
})

// GET /sketches/:id/image — serve the raw PNG
sketchesRouter.get('/:id/image', async (c) => {
  const id = c.req.param('id')

  if (!(await sketchExists(id))) return c.json({ error: 'Sketch not found' }, 404)

  const image = await getSketchImage(id)
  if (!image) return c.json({ error: 'Image not found' }, 404)

  c.header('Content-Type', 'image/png')
  c.header('Cache-Control', 'public, max-age=3600')
  return c.body(image)
})

// GET /sketches/:id/spec — get sketch as Markdown spec (waits for analysis)
sketchesRouter.get('/:id/spec', async (c) => {
  const id = c.req.param('id')

  if (!(await sketchExists(id))) return c.json({ error: 'Sketch not found' }, 404)

  let analysis = await getSketchAnalysis(id)

  // If not yet analyzed, trigger synchronous analysis now
  if (!analysis) {
    const image = await getSketchImage(id)
    if (!image) return c.json({ error: 'Image not found' }, 404)

    if (!process.env.ANTHROPIC_API_KEY) {
      return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 503)
    }

    analysis = await analyzeSketch(image)
    await saveSketchAnalysis(id, analysis)
  }

  return c.text(analysis.markdownSpec, 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
  })
})
