import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, children, title, subtitle }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-8 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            {title && <h2 className="text-xl font-bold text-primary mb-1">{title}</h2>}
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted hover:text-white text-xl leading-none bg-transparent border-0 cursor-pointer">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}