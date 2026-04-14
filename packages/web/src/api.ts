import type { SketchMeta, SketchDetail } from './types'

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001'

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${SERVER_URL}/health`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

export async function uploadSketch(
  pngBlob: Blob,
  name: string,
  note: string
): Promise<SketchMeta> {
  const form = new FormData()
  form.append('image', pngBlob, 'sketch.png')
  form.append('name', name)
  form.append('note', note)

  const res = await fetch(`${SERVER_URL}/sketches`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Upload failed (${res.status}): ${err}`)
  }

  return res.json() as Promise<SketchMeta>
}

export async function listSketches(
  limit = 50,
  offset = 0
): Promise<{ total: number; items: SketchMeta[] }> {
  const res = await fetch(`${SERVER_URL}/sketches?limit=${limit}&offset=${offset}`)
  if (!res.ok) throw new Error(`List failed (${res.status})`)
  return res.json()
}

export async function getSketch(id: string): Promise<SketchDetail> {
  const res = await fetch(`${SERVER_URL}/sketches/${id}`)
  if (!res.ok) throw new Error(`Get sketch failed (${res.status})`)
  return res.json()
}

export function getSketchImageUrl(id: string): string {
  return `${SERVER_URL}/sketches/${id}/image`
}
