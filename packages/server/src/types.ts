export interface SketchMeta {
  id: string
  name: string
  note: string
  createdAt: string // ISO 8601
}

export interface SketchDetail extends SketchMeta {
  imageBase64: string | null
}
