import { useState } from 'react'
import type { ConnectionStatus, SyncStatus } from '../types'
import './AppBar.css'

interface AppBarProps {
  sketchName: string
  onSketchNameChange: (name: string) => void
  syncStatus: SyncStatus
  connectionStatus: ConnectionStatus
  onSyncClick: () => void
  onListClick: () => void
  isListPage: boolean
}

export function AppBar({
  sketchName,
  onSketchNameChange,
  syncStatus,
  connectionStatus,
  onSyncClick,
  onListClick,
  isListPage,
}: AppBarProps) {
  const [editingName, setEditingName] = useState(false)

  const syncLabel =
    syncStatus === 'syncing'
      ? '同步中…'
      : syncStatus === 'success'
      ? '✓ 已同步'
      : syncStatus === 'error'
      ? '✗ 重试'
      : '⬆ 同步'

  const syncClass =
    syncStatus === 'success'
      ? 'btn-primary btn-primary--success'
      : syncStatus === 'error'
      ? 'btn-primary btn-primary--error'
      : 'btn-primary'

  return (
    <header className="app-bar" role="banner">
      {/* Left: list toggle */}
      <button
        className="btn-ghost app-bar__list-btn"
        onClick={onListClick}
        aria-label={isListPage ? '返回画布' : '草图库'}
        title={isListPage ? '返回画布' : '草图库'}
      >
        {isListPage ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 15l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="5" height="5" rx="1"/>
            <rect x="12" y="3" width="5" height="5" rx="1"/>
            <rect x="3" y="12" width="5" height="5" rx="1"/>
            <rect x="12" y="12" width="5" height="5" rx="1"/>
          </svg>
        )}
      </button>

      {/* Center: sketch name */}
      <div className="app-bar__center">
        {editingName ? (
          <input
            className="app-bar__name-input"
            value={sketchName}
            onChange={(e) => onSketchNameChange(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            autoFocus
            maxLength={48}
            aria-label="草图名称"
          />
        ) : (
          <button
            className="btn-ghost app-bar__name-btn"
            onClick={() => !isListPage && setEditingName(true)}
            title={isListPage ? undefined : '点击编辑名称'}
            disabled={isListPage}
          >
            <span className="app-bar__name-text">
              {isListPage ? '草图库' : sketchName || '未命名草图'}
            </span>
          </button>
        )}
      </div>

      {/* Right: sync button + status dot */}
      <div className="app-bar__right">
        {!isListPage && (
          <button
            className={`${syncClass} app-bar__sync-btn`}
            onClick={onSyncClick}
            disabled={syncStatus === 'syncing'}
            aria-label={syncLabel}
          >
            {syncLabel}
          </button>
        )}
        <div
          className={`app-bar__status-dot app-bar__status-dot--${connectionStatus}`}
          title={
            connectionStatus === 'connected'
              ? '已连接到服务器'
              : connectionStatus === 'disconnected'
              ? '服务器未连接'
              : '正在检测连接…'
          }
          aria-label={`服务器状态: ${connectionStatus}`}
        />
      </div>
    </header>
  )
}
