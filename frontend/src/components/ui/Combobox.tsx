import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  suggestions: string[]
  placeholder?: string
  className?: string
  hint?: string
  required?: boolean
  error?: string | null
}

export default function Combobox({
  label, value, onChange, onBlur, suggestions, placeholder, className = '', hint, required, error,
}: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = value.trim().length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : suggestions.slice(0, 8)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const highlight = (text: string, query: string) => {
    if (!query.trim()) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-zinc-100 text-zinc-900 font-semibold rounded-sm">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    )
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
        {required && <span className="text-zinc-900 ml-0.5 font-bold">*</span>}
      </label>

      <div className="relative">
        <input
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={`
            w-full px-4 py-2.5 pr-9 rounded-xl border bg-white text-zinc-900
            placeholder-zinc-400 text-sm
            focus:outline-none focus:ring-2
            transition-all duration-200
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
              : 'border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10'
            }
          `}
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-100/80 overflow-hidden max-h-56 overflow-y-auto">
          {filtered.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={e => {
                e.preventDefault()
                onChange(s)
                setOpen(false)
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors duration-100 border-b border-zinc-50 last:border-0"
            >
              {highlight(s, value)}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      ) : null}
    </div>
  )
}
