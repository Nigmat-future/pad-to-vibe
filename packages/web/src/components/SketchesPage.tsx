import { useEffect, useState } from 'react'
import { listSketches, getSketchImageUrl } from '../api'
import type { SketchMeta } from '../types'
import './SketchesPage.css'

interface SketchesPageProps {
  onBack: () => void
}

export function SketchesPage({ onBack }: SketchesPageProps) {
  const [sketches, setSketches] = useState<SketchMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listSketches(50, 0)
      .then(({ items }) => setSketches(items))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

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
    <main className="sketches-page">
      {loading && (
        <div className="sketches-page__loading" role="status">
          <span>加载中…</span>
        </div>
      )}

      {error && (
        <div className="sketches-page__error" role="alert">
          <p>⚠ 无法连接到服务器</p>
          <p className="mono" style={{ fontSize: 12, color: 'var(--color-muted)' }}>{error}</p>
          <p>请确认 <span className="mono">npm run start:server</span> 已运行</p>
        </div>
      )}

      {!loading && !error && sketches.length === 0 && (
        <div className="sketches-page__empty">
          <div className="sketches-page__empty-icon" aria-hidden="true">✏️</div>
          <h2>还没有草图</h2>
          <p>在画布上画个草图，然后点击「同步」按钮上传</p>
          <button className="btn-primary" onClick={onBack} style={{ marginTop: 'var(--space-lg)' }}>
            去画第一张草图
          </button>
        </div>
      )}

      {!loading && !error && sketches.length > 0 && (
        <>
          <div className="sketches-page__header">
            <span className="sketches-page__count mono">{sketches.length} 张草图</span>
          </div>
          <ul className="sketches-grid" role="list">
            {sketches.map((sketch) => (
              <li key={sketch.id} className="sketch-card" role="listitem">
                <div className="sketch-card__thumb">
                  <img
                    src={getSketchImageUrl(sketch.id)}
                    alt={sketch.name}
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget
                      img.style.display = 'none'
                      img.parentElement!.classList.add('sketch-card__thumb--fallback')
                    }}
                  />
                </div>
                <div className="sketch-card__info">
                  <span className="sketch-card__name">{sketch.name}</span>
                  <div className="sketch-card__meta">
                    <span className="sketch-card__time mono">{formatRelativeTime(sketch.createdAt)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
