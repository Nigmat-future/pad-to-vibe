import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sketchesRouter } from './routes/sketches.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: '*', // MVP: allow all origins (local network usage)
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// Routes
app.route('/sketches', sketchesRouter)

// Health check
app.get('/health', (c) =>
  c.json({ status: 'ok', service: 'pad-to-vibe-server', version: '0.1.0' })
)

// 404
app.notFound((c) => c.json({ error: 'Not found' }, 404))

const port = parseInt(process.env.PORT ?? '3001', 10)

console.log(`🎨 Pad to Vibe Server starting on http://localhost:${port}`)
console.log(`   Sketches stored at: ${process.env.DATA_DIR ?? './data/sketches'}`)
console.log()

serve({ fetch: app.fetch, port })
