import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export const useToast = () => useContext(ToastContext)

let toastId = 0

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const toast = useCallback({
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  }, [addToast])

  // Wrap the convenience methods
  const value = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ICONS = {
  success: <CheckCircle size={18} className="text-green-400 flex-shrink-0" />,
  error: <XCircle size={18} className="text-red-400 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-400 flex-shrink-0" />,
}

const BG = {
  success: 'border-green-500/30 bg-green-950/80',
  error: 'border-red-500/30 bg-red-950/80',
  info: 'border-blue-500/30 bg-blue-950/80',
}

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration)
    return () => clearTimeout(timerRef.current)
  }, [toast, onRemove])

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md
                  shadow-lg min-w-[260px] max-w-[380px] text-sm text-white transition-all duration-300
                  ${BG[toast.type]}
                  ${exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-slide-in'}`}
    >
      {ICONS[toast.type]}
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onRemove(toast.id), 300) }}
        className="text-gray-400 hover:text-white transition p-0.5"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default ToastProvider
