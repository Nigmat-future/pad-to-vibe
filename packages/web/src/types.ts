export interface SketchMeta {
  id: string
  name: string
  note: string
  createdAt: string
}

export interface SketchDetail extends SketchMeta {
  imageBase64: string | null
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'
export type ConnectionStatus = 'connected' | 'disconnected' | 'checking'
