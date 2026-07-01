import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { COUNTRIES, type Country } from '../../data/countries'
import FlagIcon from './FlagIcon'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  hint?: string
  required?: boolean
  error?: string | null
}

const DEFAULT_COUNTRY = COUNTRIES[0] // Chile

function detectCountry(value: string): Country {
  const digits = value.replace(/\D/g, '')
  if (!digits) return DEFAULT_COUNTRY
  const byLongestDialCode = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)
  return byLongestDialCode.find(c => digits.startsWith(c.dialCode)) ?? DEFAULT_COUNTRY
}

function splitLocalNumber(value: string, country: Country): string {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith(country.dialCode)) {
    return digits.slice(country.dialCode.length)
  }
  return digits
}

export default function PhoneInput({ label, value, onChange, onBlur, hint, required, error }: Props) {
  const [country, setCountry] = useState<Country>(() => detectCountry(value))
  const [localNumber, setLocalNumber] = useState(() => splitLocalNumber(value, detectCountry(value)))
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const emit = (c: Country, num: string) => {
    onChange(num.trim() ? `+${c.dialCode} ${num.trim()}` : '')
  }

  const selectCountry = (c: Country) => {
    setCountry(c)
    setOpen(false)
    setSearch('')
    emit(c, localNumber)
  }

  const handleNumberChange = (v: string) => {
    setLocalNumber(v)
    emit(country, v)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.dialCode.includes(q))
  }, [search])

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
        {required && <span className="font-bold text-zinc-900 ml-0.5">*</span>}
      </label>

      <div className="relative flex" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`
            flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0
            bg-zinc-50 hover:bg-zinc-100 text-sm text-zinc-700 flex-shrink-0
            transition-colors duration-150
            ${error ? 'border-red-300' : 'border-zinc-200'}
          `}
        >
          <FlagIcon iso2={country.iso2} />
          <span className="font-medium tabular-nums">+{country.dialCode}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        <input
          type="tel"
          inputMode="tel"
          value={localNumber}
          onChange={e => handleNumberChange(e.target.value)}
          onBlur={onBlur}
          placeholder="9 1234 5678"
          aria-invalid={!!error}
          className={`
            flex-1 min-w-0 px-4 py-2.5 rounded-r-xl border bg-white text-zinc-900
            placeholder-zinc-400 text-sm
            focus:outline-none focus:ring-2
            transition-all duration-200
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
              : 'border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10'
            }
          `}
        />

        {open && (
          <div className="absolute z-50 top-full left-0 mt-1.5 w-72 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-100/80 overflow-hidden">
            <div className="p-2 border-b border-zinc-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar país..."
                  className="
                    w-full pl-8 pr-2 py-1.5 rounded-lg border border-zinc-200 text-sm text-zinc-900
                    focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10
                  "
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c.iso2}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); selectCountry(c) }}
                  className={`
                    w-full flex items-center gap-2.5 text-left px-3 py-2 text-sm
                    hover:bg-zinc-50 transition-colors duration-100
                    ${c.iso2 === country.iso2 ? 'bg-zinc-50' : ''}
                  `}
                >
                  <FlagIcon iso2={c.iso2} />
                  <span className="flex-1 text-zinc-700">{c.name}</span>
                  <span className="text-zinc-400 tabular-nums text-xs">+{c.dialCode}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-3 text-xs text-zinc-400 text-center">Sin resultados</p>
              )}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      ) : null}
    </div>
  )
}
