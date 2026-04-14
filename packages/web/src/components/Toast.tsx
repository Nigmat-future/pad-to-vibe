import { useEffect, useState } from 'react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: number) => void
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={`toast toast--${toast.type} ${visible ? 'toast--visible' : ''}`}
      role="status"
      onClick={() => onDismiss(toast.id)}
    >
      <span className="toast-icon">
        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}
      </span>
      <span className="toast-message">{toast.message}</span>
    </div>
  )
}

// Hook for managing toasts
let _nextId = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function showToast(message: string, type: ToastType = 'info') {
    const id = ++_nextId
    setToasts((prev) => [...prev, { id, message, type }])
  }

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, showToast, dismissToast }
}
