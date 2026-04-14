import { useRef, useCallback } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import './SketchCanvas.css'

interface SketchCanvasProps {
  onExportReady: (exportFn: () => Promise<Blob>) => void
}

export function SketchCanvas({ onExportReady }: SketchCanvasProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)

  const exportToPng = useCallback(async (): Promise<Blob> => {
    const api = apiRef.current
    if (!api) throw new Error('Canvas not ready')

    const { exportToBlob } = await import('@excalidraw/excalidraw')
    const elements = api.getSceneElements()
    const appState = api.getAppState()

    const blob = await exportToBlob({
      elements,
      appState: { ...appState, exportBackground: true },
      files: api.getFiles(),
      mimeType: 'image/png',
      quality: 0.95,
    })

    return blob
  }, [])

  const handleExcalidrawMount = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      apiRef.current = api
      onExportReady(exportToPng)
    },
    [exportToPng, onExportReady]
  )

  return (
    <div className="sketch-canvas" aria-label="绘图画布">
      <Excalidraw
        excalidrawAPI={handleExcalidrawMount}
        theme="dark"
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            export: false,
            loadScene: true,
            saveToActiveFile: false,
            toggleTheme: false,
          },
        }}
        initialData={{
          appState: {
            theme: 'dark',
            viewBackgroundColor: '#111110',
          },
        }}
      />
    </div>
  )
}
