import { useMemo, useState } from 'react'
import type { CVData } from '../../../types/cv'
import PhoneInput from '../../ui/PhoneInput'
import LocationInput from '../../ui/LocationInput'
import NavigationButtons from '../NavigationButtons'
import { validateRequired, validateEmail, validatePhone, validateUrl } from '../../../utils/validation'

interface Props {
  data: CVData
  setData: (d: CVData) => void
  onNext: () => void
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  type?: string
  className?: string
  hint?: string
  required?: boolean
  error?: string | null
}

function Field({ label, value, onChange, onBlur, placeholder, type = 'text', className = '', hint, required, error }: FieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
        {required && <span className="font-bold text-zinc-900 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`
          w-full px-4 py-2.5 rounded-xl border bg-white text-zinc-900
          placeholder-zinc-400 text-sm
          focus:outline-none focus:ring-2
          transition-all duration-200
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
            : 'border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10'
          }
        `}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      ) : null}
    </div>
  )
}

type FieldName = 'name' | 'email' | 'phone' | 'location' | 'website' | 'linkedin' | 'github'

export default function Step1Personal({ data, setData, onNext }: Props) {
  const p = data.personal
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const update = (field: keyof typeof p, value: string) =>
    setData({ ...data, personal: { ...p, [field]: value } })

  const markTouched = (field: FieldName) => setTouched(t => ({ ...t, [field]: true }))

  const errors = useMemo(() => ({
    name: validateRequired(p.name, 'El nombre'),
    email: validateEmail(p.email),
    phone: validatePhone(p.phone),
    location: validateRequired(p.location, 'La ubicación'),
    website: validateUrl(p.website, 'El sitio web'),
    linkedin: validateUrl(p.linkedin, 'El enlace de LinkedIn'),
    github: validateUrl(p.github, 'El enlace de GitHub'),
  }), [p])

  const shownError = (field: FieldName) => (touched[field] || submitAttempted) ? errors[field] : null

  const handleNext = () => {
    if (Object.values(errors).some(Boolean)) {
      setSubmitAttempted(true)
      return
    }
    onNext()
  }

  return (
    <div>
      <div className="px-8 pt-8 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Datos Personales</h2>
        </div>
        <p className="text-zinc-500 text-sm mb-6 ml-11">
          Tu información de contacto y presencia online. Los campos marcados con{' '}
          <span className="font-bold text-zinc-900">*</span> son obligatorios.
        </p>
      </div>

      <div className="px-8 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Nombre completo"
          value={p.name}
          onChange={v => update('name', v)}
          onBlur={() => markTouched('name')}
          error={shownError('name')}
          placeholder="Ana García López"
          className="sm:col-span-2"
          required
        />
        <Field
          label="Email"
          type="email"
          value={p.email}
          onChange={v => update('email', v)}
          onBlur={() => markTouched('email')}
          error={shownError('email')}
          placeholder="ana@ejemplo.com"
          hint="Usa un email profesional, sin apodos."
          required
        />
        <PhoneInput
          label="Teléfono"
          value={p.phone}
          onChange={v => update('phone', v)}
          onBlur={() => markTouched('phone')}
          error={shownError('phone')}
          hint="Elige tu país para el prefijo."
          required
        />

        <LocationInput
          label="Ubicación"
          value={p.location}
          onChange={v => update('location', v)}
          onBlur={() => markTouched('location')}
          error={shownError('location')}
          className="sm:col-span-2"
          required
        />

        <Field
          label="Sitio web / Portfolio"
          value={p.website}
          onChange={v => update('website', v)}
          onBlur={() => markTouched('website')}
          error={shownError('website')}
          placeholder="https://tuweb.com"
          hint="Opcional — aumenta credibilidad."
        />
        <Field
          label="LinkedIn"
          value={p.linkedin}
          onChange={v => update('linkedin', v)}
          onBlur={() => markTouched('linkedin')}
          error={shownError('linkedin')}
          placeholder="linkedin.com/in/tunombre"
          hint="Muy valorado por reclutadores y ATS."
        />
        <Field
          label="GitHub"
          value={p.github}
          onChange={v => update('github', v)}
          onBlur={() => markTouched('github')}
          error={shownError('github')}
          placeholder="github.com/tunombre"
          hint="Opcional — si tienes un perfil o portafolio online."
        />
      </div>

      <NavigationButtons onNext={handleNext} />
    </div>
  )
}
