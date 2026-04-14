import { useEffect, useRef, useState } from 'react'
import type { SketchMeta } from '../types'
import './SyncPanel.css'

interface SyncPanelProps {
  isOpen: boolean
  sketchName: string
  onSketchNameChange: (name: string) => void
  onSync: (name: string, note: string) => Promise<void>
  recentSketches: SketchMeta[]
  isSyncing: boolean
  onClose: () => void
}

export function SyncPanel({
  isOpen,
  sketchName,
  onSketchNameChange,
  onSync,
  recentSketches,
  isSyncing,
  onClose,
}: SyncPanelProps) {
  const [note, setNote] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSync = async () => {
    await onSync(sketchName, note)
    setNote('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  function formatRelativeTime(isoStr: string): string {
    const diff = Date.now() - new Date(isoStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}天前`
    return new Date(isoStr).toLocaleDateString('zh-CN')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`sync-panel-overlay ${isOpen ? 'sync-panel-overlay--visible' : ''}`}
        onClick={handleBackdropClick}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <div
        className={`sync-panel ${isOpen ? 'sync-panel--open' : ''}`}
        role="dialog"
        aria-label="同步草图"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        {/* Drag handle */}
        <div className="sync-panel__handle" aria-hidden="true" />

        <div className="sync-panel__content">
          <h2 className="sync-panel__title">同步到 Claude Code</h2>

          {/* Name input */}
          <label className="sync-panel__label" htmlFor="sketch-name">草图名称</label>
          <input
            id="sketch-name"
            ref={nameRef}
            className="sync-panel__input"
            value={sketchName}
            onChange={(e) => onSketchNameChange(e.target.value)}
            placeholder={`草图 ${new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
            maxLength={48}
          />

          {/* Note input */}
          <label className="sync-panel__label" htmlFor="sketch-note">备注（可选）</label>
          <textarea
            id="sketch-note"
            className="sync-panel__input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="这是 v2 登录页的导航栏改版方案…"
            maxLength={200}
            rows={2}
          />

          {/* Sync CTA */}
          <button
            className="btn-primary sync-panel__sync-btn"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Spinner /> 同步中…
              </>
            ) : (
              '⬆  同步到 Claude Code'
            )}
          </button>

          {/* Recent syncs */}
          {recentSketches.length > 0 && (
            <div className="sync-panel__recent">
              <div className="sync-panel__recent-header">最近同步</div>
              <ul className="sync-panel__recent-list" role="list">
                {recentSketches.slice(0, 5).map((s) => (
                  <li key={s.id} className="sync-panel__recent-item">
                    <span className="sync-panel__recent-icon" aria-hidden="true">📄</span>
                    <span className="sync-panel__recent-name">{s.name}</span>
                    <span className="sync-panel__recent-time mono">
                      {formatRelativeTime(s.createdAt)}
                    </span>
                    <span className="sync-panel__recent-status" aria-label="已同步">✓</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Spinner() {
  return (
    <svg
      className="spinner"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
    </svg>
  )
}
