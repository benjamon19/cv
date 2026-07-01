import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { COUNTRIES, CITIES_BY_COUNTRY, CHILE_REGIONS, type Country, type ChileRegion } from '../../data/countries'
import FlagIcon from './FlagIcon'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  hint?: string
  required?: boolean
  className?: string
  error?: string | null
}

const DEFAULT_COUNTRY = COUNTRIES[0] // Chile
const CHILE_ALL_COMMUNES = CHILE_REGIONS.flatMap(r => r.communes)

function detectChileRegion(city: string): ChileRegion | null {
  if (!city.trim()) return null
  return CHILE_REGIONS.find(r => r.communes.some(c => c.toLowerCase() === city.trim().toLowerCase())) ?? null
}

function parseLocation(value: string): { country: Country | null; city: string; remote: boolean } {
  const trimmed = value.trim()
  if (!trimmed) return { country: DEFAULT_COUNTRY, city: '', remote: false }
  if (/^remoto/i.test(trimmed)) {
    const rest = trimmed.replace(/^remoto\s*\/?\s*/i, '')
    return { country: null, city: rest, remote: true }
  }
  const parts = trimmed.split(',').map(s => s.trim())
  if (parts.length >= 2) {
    const countryName = parts[parts.length - 1]
    const match = COUNTRIES.find(c => c.name.toLowerCase() === countryName.toLowerCase())
    if (match) return { country: match, city: parts.slice(0, -1).join(', '), remote: false }
  }
  return { country: null, city: trimmed, remote: false }
}

export default function LocationInput({ label, value, onChange, onBlur, hint, required, className = '', error }: Props) {
  const initial = useMemo(() => parseLocation(value), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [country, setCountry] = useState<Country | null>(initial.country)
  const [region, setRegion] = useState<ChileRegion | null>(
    () => initial.country?.iso2 === 'CL' ? detectChileRegion(initial.city) : null
  )
  const [city, setCity] = useState(initial.city)
  const [remote, setRemote] = useState(initial.remote)
  const [countryOpen, setCountryOpen] = useState(false)
  const [regionOpen, setRegionOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [search, setSearch] = useState('')
  const countryRef = useRef<HTMLDivElement>(null)
  const regionRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  const isChile = country?.iso2 === 'CL'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false)
        setSearch('')
      }
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionOpen(false)
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const emit = (c: Country | null, ci: string, rem: boolean) => {
    const trimmedCity = ci.trim()
    if (rem) {
      onChange(trimmedCity ? `Remoto / ${trimmedCity}` : 'Remoto')
      return
    }
    if (!c) {
      onChange(trimmedCity)
      return
    }
    onChange(trimmedCity ? `${trimmedCity}, ${c.name}` : c.name)
  }

  const selectCountry = (c: Country) => {
    setCountry(c)
    setRegion(null)
    setRemote(false)
    setCountryOpen(false)
    setSearch('')
    emit(c, city, false)
  }

  const selectRegion = (r: ChileRegion) => {
    setRegion(r)
    setRegionOpen(false)
    setCity('')
    emit(country, '', remote)
  }

  const handleCityChange = (v: string) => {
    setCity(v)
    setCityOpen(true)
    emit(country, v, remote)
  }

  const selectCity = (v: string) => {
    setCity(v)
    setCityOpen(false)
    emit(country, v, remote)
  }

  const toggleRemote = () => {
    const next = !remote
    setRemote(next)
    emit(country, city, next)
  }

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q))
  }, [search])

  const citySuggestions = isChile
    ? (region ? region.communes : CHILE_ALL_COMMUNES)
    : (country ? (CITIES_BY_COUNTRY[country.iso2] ?? []) : [])
  const filteredCities = useMemo(() => {
    // Con región chilena elegida, mostramos todas sus comunas (son pocas, caben).
    const limit = isChile && region ? citySuggestions.length : 8
    const q = city.trim().toLowerCase()
    if (!q) return citySuggestions.slice(0, limit)
    return citySuggestions.filter(c => c.toLowerCase().includes(q)).slice(0, limit)
  }, [city, citySuggestions, isChile, region])

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
        {required && <span className="font-bold text-zinc-900 ml-0.5">*</span>}
      </label>

      <div className="flex gap-2">
        {/* Country dropdown */}
        <div className="relative flex-shrink-0" ref={countryRef}>
          <button
            type="button"
            onClick={() => setCountryOpen(o => !o)}
            disabled={remote}
            className="
              flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200
              bg-zinc-50 hover:bg-zinc-100 text-sm text-zinc-700
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-150
            "
          >
            {country ? (
              <>
                <FlagIcon iso2={country.iso2} />
                <span className="font-medium max-w-[7rem] truncate">{country.name}</span>
              </>
            ) : (
              <span className="text-zinc-400">País</span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${countryOpen ? 'rotate-180' : ''}`} />
          </button>

          {countryOpen && (
            <div className="absolute z-50 top-full left-0 mt-1.5 w-64 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-100/80 overflow-hidden">
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
                {filteredCountries.map(c => (
                  <button
                    key={c.iso2}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); selectCountry(c) }}
                    className={`
                      w-full flex items-center gap-2.5 text-left px-3 py-2 text-sm
                      hover:bg-zinc-50 transition-colors duration-100
                      ${country?.iso2 === c.iso2 ? 'bg-zinc-50' : ''}
                    `}
                  >
                    <FlagIcon iso2={c.iso2} />
                    <span className="text-zinc-700">{c.name}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <p className="px-3 py-3 text-xs text-zinc-400 text-center">Sin resultados</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Region dropdown (solo Chile) */}
        {isChile && (
          <div className="relative flex-shrink-0" ref={regionRef}>
            <button
              type="button"
              onClick={() => setRegionOpen(o => !o)}
              disabled={remote}
              className="
                flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200
                bg-zinc-50 hover:bg-zinc-100 text-sm text-zinc-700
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors duration-150
              "
            >
              <span className="font-medium max-w-[8rem] truncate">{region ? region.name : 'Región'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${regionOpen ? 'rotate-180' : ''}`} />
            </button>

            {regionOpen && (
              <div className="absolute z-50 top-full left-0 mt-1.5 w-64 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-100/80 overflow-hidden max-h-64 overflow-y-auto">
                {CHILE_REGIONS.map(r => (
                  <button
                    key={r.name}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); selectRegion(r) }}
                    className={`
                      w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 transition-colors duration-100
                      ${region?.name === r.name ? 'bg-zinc-50 text-zinc-900 font-medium' : 'text-zinc-700'}
                    `}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* City input */}
        <div className="relative flex-1" ref={cityRef}>
          <input
            value={city}
            onChange={e => handleCityChange(e.target.value)}
            onFocus={() => setCityOpen(true)}
            onBlur={onBlur}
            disabled={remote}
            placeholder={isChile && !region ? 'Elige una región primero' : 'Ciudad'}
            aria-invalid={!!error}
            className={`
              w-full px-4 py-2.5 rounded-xl border bg-white text-zinc-900
              placeholder-zinc-400 text-sm disabled:opacity-40 disabled:bg-zinc-50
              focus:outline-none focus:ring-2
              transition-all duration-200
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                : 'border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10'
              }
            `}
          />
          {cityOpen && !remote && filteredCities.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-100/80 overflow-hidden max-h-48 overflow-y-auto">
              {filteredCities.map(c => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); selectCity(c) }}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors duration-100"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleRemote}
          className={`
            px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150
            ${remote
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900'
            }
          `}
        >
          {remote ? '✓ ' : ''}🌐 Remoto
        </button>
        {hint && !error && <p className="text-xs text-zinc-400">{hint}</p>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
