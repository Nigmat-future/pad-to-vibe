import { Hono } from 'hono'
import {
  saveSketch,
  listSketches,
  getSketchMeta,
  getSketchImage,
  sketchExists,
} from '../services/storage.js'

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
  return c.json(meta, 201)
})

// GET /sketches — list all sketches
sketchesRouter.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') ?? '50', 10)
  const offset = parseInt(c.req.query('offset') ?? '0', 10)

  const all = await listSketches()
  const page = all.slice(offset, offset + limit)

  return c.json({ total: all.length, items: page })
})

// GET /sketches/:id — get sketch detail (meta + imageBase64)
sketchesRouter.get('/:id', async (c) => {
  const id = c.req.param('id')

  const meta = await getSketchMeta(id)
  if (!meta) return c.json({ error: 'Sketch not found' }, 404)

  const image = await getSketchImage(id)
  const imageBase64 = image ? image.toString('base64') : null

  return c.json({ ...meta, imageBase64 })
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
