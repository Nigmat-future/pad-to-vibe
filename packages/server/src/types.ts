export type SketchType = 'ui-wireframe' | 'flowchart' | 'architecture' | 'mixed' | 'unknown'

export interface SketchMeta {
  id: string
  name: string
  note: string
  createdAt: string // ISO 8601
  analyzed: boolean
  type: SketchType
}

export interface SketchAnalysis {
  type: SketchType
  description: string
  components: string[]
  relationships: string[]
  techSuggestions: string[]
  markdownSpec: string
}

export interface SketchDetail extends SketchMeta {
  analysis: SketchAnalysis | null
  imageBase64: string | null
}

export interface UploadSketchBody {
  name?: string
  note?: string
}
