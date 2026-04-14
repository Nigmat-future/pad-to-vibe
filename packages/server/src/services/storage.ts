import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { SketchMeta } from '../types.js'

const DATA_DIR = resolve(process.env.DATA_DIR ?? './data/sketches')

function generateId(): string {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 6)
  return `${ts}_${rand}`
}

async function ensureSketchDir(id: string): Promise<string> {
  const dir = join(DATA_DIR, id)
  await mkdir(dir, { recursive: true })
  return dir
}

export async function saveSketch(
  imageBuffer: Buffer,
  name: string,
  note: string
): Promise<SketchMeta> {
  const id = generateId()
  const dir = await ensureSketchDir(id)

  const meta: SketchMeta = {
    id,
    name: name || `Sketch ${new Date().toLocaleString('zh-CN')}`,
    note,
    createdAt: new Date().toISOString(),
  }

  await writeFile(join(dir, 'image.png'), imageBuffer)
  await writeFile(join(dir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8')

  return meta
}

export async function listSketches(): Promise<SketchMeta[]> {
  if (!existsSync(DATA_DIR)) return []

  const entries = await readdir(DATA_DIR)
  const metas: SketchMeta[] = []

  for (const entry of entries) {
    const metaPath = join(DATA_DIR, entry, 'meta.json')
    if (!existsSync(metaPath)) continue
    try {
      const raw = await readFile(metaPath, 'utf-8')
      metas.push(JSON.parse(raw) as SketchMeta)
    } catch {
      // skip corrupted entries
    }
  }

  return metas.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getSketchMeta(id: string): Promise<SketchMeta | null> {
  const metaPath = join(DATA_DIR, id, 'meta.json')
  if (!existsSync(metaPath)) return null
  const raw = await readFile(metaPath, 'utf-8')
  return JSON.parse(raw) as SketchMeta
}

export async function getSketchImage(id: string): Promise<Buffer | null> {
  const imgPath = join(DATA_DIR, id, 'image.png')
  if (!existsSync(imgPath)) return null
  return readFile(imgPath)
}

export async function sketchExists(id: string): Promise<boolean> {
  return existsSync(join(DATA_DIR, id, 'meta.json'))
}
