import { useState, useEffect, useCallback, useRef } from 'react'
import { AppBar } from './components/AppBar'
import { SketchCanvas } from './components/SketchCanvas'
import { SyncPanel } from './components/SyncPanel'
import { SketchesPage } from './components/SketchesPage'
import { Toast, useToast } from './components/Toast'
import { checkHealth, uploadSketch, listSketches } from './api'
import type { ConnectionStatus, SketchMeta, SyncStatus } from './types'

export default function App() {
  const [page, setPage] = useState<'canvas' | 'sketches'>('canvas')
  const [sketchName, setSketchName] = useState('')
  const [syncPanelOpen, setSyncPanelOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking')
  const [recentSketches, setRecentSketches] = useState<SketchMeta[]>([])

  const exportFnRef = useRef<(() => Promise<Blob>) | null>(null)
  const { toasts, showToast, dismissToast } = useToast()

  // Health check polling
  useEffect(() => {
    async function checkConnection() {
      const ok = await checkHealth()
      setConnectionStatus(ok ? 'connected' : 'disconnected')
    }

    checkConnection()
    const interval = setInterval(checkConnection, 10000)
    return () => clearInterval(interval)
  }, [])

  // Load recent sketches
  useEffect(() => {
    if (connectionStatus === 'connected') {
      listSketches(10, 0)
        .then(({ items }) => setRecentSketches(items))
        .catch(() => {}) // silent
    }
  }, [connectionStatus, syncStatus])

  // Called when SketchCanvas mounts and exposes its export function
  const handleExportReady = useCallback((fn: () => Promise<Blob>) => {
    exportFnRef.current = fn
  }, [])

  // Sync handler
  const handleSync = async (name: string, note: string) => {
    if (!exportFnRef.current) {
      showToast('画布尚未就绪，请稍候', 'error')
      return
    }

    if (connectionStatus === 'disconnected') {
      showToast('服务器未连接，请先运行 npm run start:server', 'error')
      return
    }

    setSyncStatus('syncing')
    setSyncPanelOpen(false) // Close panel while syncing

    try {
      const blob = await exportFnRef.current()
      const finalName = name || `草图 ${new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
      const meta = await uploadSketch(blob, finalName, note)

      setRecentSketches((prev) => [meta, ...prev.slice(0, 9)])
      setSyncStatus('success')
      showToast(`✓ 已同步「${meta.name}」，Claude Code 可以读取了`, 'success')

      // Reset to idle after 2s
      setTimeout(() => setSyncStatus('idle'), 2000)
    } catch (e) {
      setSyncStatus('error')
      showToast(`同步失败: ${e instanceof Error ? e.message : String(e)}`, 'error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  // AppBar sync button click — open panel
  const handleSyncClick = () => {
    setSyncPanelOpen(true)
  }

  return (
    <>
      <AppBar
        sketchName={sketchName}
        onSketchNameChange={setSketchName}
        syncStatus={syncStatus}
        connectionStatus={connectionStatus}
        onSyncClick={handleSyncClick}
        onListClick={() => setPage(page === 'canvas' ? 'sketches' : 'canvas')}
        isListPage={page === 'sketches'}
      />

      {page === 'canvas' && (
        <>
          <SketchCanvas onExportReady={handleExportReady} />
          <SyncPanel
            isOpen={syncPanelOpen}
            sketchName={sketchName}
            onSketchNameChange={setSketchName}
            onSync={handleSync}
            recentSketches={recentSketches}
            isSyncing={syncStatus === 'syncing'}
            onClose={() => setSyncPanelOpen(false)}
          />
        </>
      )}

      {page === 'sketches' && <SketchesPage onBack={() => setPage('canvas')} />}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}
