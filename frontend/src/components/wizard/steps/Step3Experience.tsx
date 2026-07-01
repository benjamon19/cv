import { useMemo, useState } from 'react'
import { Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react'
import type { CVData, Experience, Education } from '../../../types/cv'
import NavigationButtons from '../NavigationButtons'
import Combobox from '../../ui/Combobox'
import {
  JOB_TITLES, DEGREES, ACTION_VERBS_ES,
  ROLE_PLACEHOLDER_EXAMPLES, HIGHLIGHT_PLACEHOLDER_EXAMPLES,
  DEGREE_PLACEHOLDER_EXAMPLES, AREA_PLACEHOLDER_EXAMPLES, pickRandom,
} from '../../../data/suggestions'
import { startsWithActionVerb } from '../../../utils/ats'
import { validateRequired, validateExperienceDates, validateEducationDates } from '../../../utils/validation'

const genId = () => Math.random().toString(36).slice(2, 10)

interface Props {
  data: CVData
  setData: (d: CVData) => void
  onNext: () => void
  onPrev: () => void
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: string | null
}

function Field({ label, value, onChange, onBlur, placeholder, className = '', disabled = false, error }: FieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className={`
          w-full px-3.5 py-2.5 rounded-xl border bg-white text-zinc-900
          placeholder-zinc-300 text-sm
          focus:outline-none focus:ring-2
          disabled:opacity-40 disabled:bg-zinc-50
          transition-all duration-200
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
            : 'border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10'
          }
        `}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function VerbPicker({ onSelect }: { onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-zinc-500 font-semibold hover:text-zinc-900 transition-colors"
      >
        <Lightbulb className="w-3.5 h-3.5" />
        Verbos ATS
      </button>
      {open && (
        <div className="absolute z-50 left-0 top-6 w-56 bg-white border border-zinc-200 rounded-xl shadow-xl p-2 grid grid-cols-2 gap-1">
          {ACTION_VERBS_ES.map(v => (
            <button
              key={v}
              type="button"
              onMouseDown={e => {
                e.preventDefault()
                onSelect(v + ' ')
                setOpen(false)
              }}
              className="text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ExperienceEntryErrors {
  position: string | null
  company: string | null
  startDate: string | null
  endDate: string | null
}

type ExperienceField = 'position' | 'company' | 'startDate' | 'endDate'

function ExperienceCard({
  exp, index, onUpdate, onRemove, jobTitles, errors, forceShowErrors,
}: {
  exp: Experience
  index: number
  onUpdate: (id: string, field: keyof Experience, value: Experience[keyof Experience]) => void
  onRemove: (id: string) => void
  jobTitles: string[]
  errors: ExperienceEntryErrors
  forceShowErrors: boolean
}) {
  const [touched, setTouched] = useState<Partial<Record<ExperienceField, boolean>>>({})
  const markTouched = (field: ExperienceField) => setTouched(t => ({ ...t, [field]: true }))
  const shownError = (field: ExperienceField) => (touched[field] || forceShowErrors) ? errors[field] : null
  const [positionPlaceholder] = useState(() => pickRandom(ROLE_PLACEHOLDER_EXAMPLES))
  const [highlightPlaceholder] = useState(() => pickRandom(HIGHLIGHT_PLACEHOLDER_EXAMPLES))

  const updateHighlight = (i: number, val: string) => {
    const h = [...exp.highlights]
    h[i] = val
    onUpdate(exp.id, 'highlights', h)
  }

  const prependVerb = (i: number, verb: string) => {
    const current = exp.highlights[i] ?? ''
    updateHighlight(i, verb + current)
  }

  return (
    <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-900 text-xs font-bold text-white flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[200px]">
            {exp.position || 'Nueva posición'}
            {exp.company ? ` · ${exp.company}` : ''}
          </span>
        </div>
        <button
          onClick={() => onRemove(exp.id)}
          className="text-xs font-semibold text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
        >
          Eliminar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Combobox
          label="Cargo / Posición"
          value={exp.position}
          onChange={v => onUpdate(exp.id, 'position', v)}
          onBlur={() => markTouched('position')}
          error={shownError('position')}
          suggestions={jobTitles}
          placeholder={positionPlaceholder}
        />
        <Field
          label="Empresa"
          value={exp.company}
          onChange={v => onUpdate(exp.id, 'company', v)}
          onBlur={() => markTouched('company')}
          error={shownError('company')}
          placeholder="Nombre de la empresa"
        />
        <Field
          label="Inicio (AAAA-MM)"
          value={exp.startDate}
          onChange={v => onUpdate(exp.id, 'startDate', v)}
          onBlur={() => markTouched('startDate')}
          error={shownError('startDate')}
          placeholder="2021-03"
        />
        <div>
          <Field
            label="Fin (AAAA-MM)"
            value={exp.endDate}
            onChange={v => onUpdate(exp.id, 'endDate', v)}
            onBlur={() => markTouched('endDate')}
            error={shownError('endDate')}
            placeholder="2024-01"
            disabled={exp.current}
          />
          <label className="mt-2 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={e => onUpdate(exp.id, 'current', e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20"
            />
            <span className="text-xs text-zinc-600 font-medium">Posición actual</span>
          </label>
        </div>
        <Field
          label="Ubicación"
          value={exp.location}
          onChange={v => onUpdate(exp.id, 'location', v)}
          placeholder="Madrid, España / Remoto"
          className="sm:col-span-2"
        />
      </div>

      {/* Highlights */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            Logros y responsabilidades
          </label>
          <span className="text-xs text-zinc-400">Comienza cada línea con un verbo de acción</span>
        </div>
        <div className="space-y-2">
          {exp.highlights.map((h, i) => {
            const ok = h.trim() === '' || startsWithActionVerb(h)
            return (
              <div key={i} className="flex items-center gap-2">
                {h.trim() !== '' ? (
                  ok
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <span className="w-4 h-4 flex-shrink-0" />
                )}
                <input
                  value={h}
                  onChange={e => updateHighlight(i, e.target.value)}
                  placeholder={highlightPlaceholder}
                  className="
                    flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900
                    placeholder-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 focus:outline-none
                    transition-all duration-200
                  "
                />
                <button
                  onClick={() => onUpdate(exp.id, 'highlights', exp.highlights.filter((_, idx) => idx !== i))}
                  className="text-zinc-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>

        {exp.highlights.some(h => h.trim() !== '' && !startsWithActionVerb(h)) && (
          <div className="mt-2 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Algunos logros no empiezan con verbo de acción. Usa el selector para añadir uno.
          </div>
        )}

        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={() => onUpdate(exp.id, 'highlights', [...exp.highlights, ''])}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 hover:underline transition-colors"
          >
            + Añadir logro
          </button>
          <VerbPicker
            onSelect={verb => {
              const emptyIdx = exp.highlights.findIndex(h => h.trim() === '')
              if (emptyIdx !== -1) {
                prependVerb(emptyIdx, verb)
              } else {
                onUpdate(exp.id, 'highlights', [...exp.highlights, verb])
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface EducationEntryErrors {
  institution: string | null
  degree: string | null
  startDate: string | null
  endDate: string | null
}

type EducationField = 'institution' | 'degree' | 'startDate' | 'endDate'

function EducationCard({
  edu, index, onUpdate, onRemove, errors, forceShowErrors,
}: {
  edu: Education
  index: number
  onUpdate: (id: string, field: keyof Education, value: string) => void
  onRemove: (id: string) => void
  errors: EducationEntryErrors
  forceShowErrors: boolean
}) {
  const [touched, setTouched] = useState<Partial<Record<EducationField, boolean>>>({})
  const markTouched = (field: EducationField) => setTouched(t => ({ ...t, [field]: true }))
  const shownError = (field: EducationField) => (touched[field] || forceShowErrors) ? errors[field] : null
  const [degreePlaceholder] = useState(() => pickRandom(DEGREE_PLACEHOLDER_EXAMPLES))
  const [areaPlaceholder] = useState(() => pickRandom(AREA_PLACEHOLDER_EXAMPLES))

  return (
    <div className="p-5 rounded-xl border border-zinc-200 bg-white space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-700 flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[220px]">
            {edu.institution || 'Nueva formación'}
          </span>
        </div>
        <button
          onClick={() => onRemove(edu.id)}
          className="text-xs font-semibold text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
        >
          Eliminar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Institución"
          value={edu.institution}
          onChange={v => onUpdate(edu.id, 'institution', v)}
          onBlur={() => markTouched('institution')}
          error={shownError('institution')}
          placeholder="Nombre de la institución"
          className="sm:col-span-2"
        />
        <Combobox
          label="Grado / Título / Certificación"
          value={edu.degree}
          onChange={v => onUpdate(edu.id, 'degree', v)}
          onBlur={() => markTouched('degree')}
          error={shownError('degree')}
          suggestions={DEGREES}
          placeholder={degreePlaceholder}
          className="sm:col-span-2"
        />
        <Field
          label="Área de estudio"
          value={edu.area}
          onChange={v => onUpdate(edu.id, 'area', v)}
          placeholder={areaPlaceholder}
          className="sm:col-span-2"
        />
        <Field
          label="Inicio (AAAA-MM)"
          value={edu.startDate}
          onChange={v => onUpdate(edu.id, 'startDate', v)}
          onBlur={() => markTouched('startDate')}
          error={shownError('startDate')}
          placeholder="2016-09"
        />
        <Field
          label="Fin (AAAA-MM)"
          value={edu.endDate}
          onChange={v => onUpdate(edu.id, 'endDate', v)}
          onBlur={() => markTouched('endDate')}
          error={shownError('endDate')}
          placeholder="2020-06"
        />
        <Field
          label="Nota media (opcional)"
          value={edu.gpa}
          onChange={v => onUpdate(edu.id, 'gpa', v)}
          placeholder="8.5 / 10"
          className="sm:col-span-2"
        />
      </div>
    </div>
  )
}

type Tab = 'experience' | 'education'

function validateExperienceEntry(exp: Experience): ExperienceEntryErrors {
  const dates = validateExperienceDates(exp.startDate, exp.endDate, exp.current)
  return {
    position: validateRequired(exp.position, 'El cargo'),
    company: validateRequired(exp.company, 'La empresa'),
    startDate: dates.startDate,
    endDate: dates.endDate,
  }
}

function validateEducationEntry(edu: Education): EducationEntryErrors {
  const dates = validateEducationDates(edu.startDate, edu.endDate)
  return {
    institution: validateRequired(edu.institution, 'La institución'),
    degree: validateRequired(edu.degree, 'El grado / título'),
    startDate: dates.startDate,
    endDate: dates.endDate,
  }
}

const hasAnyError = (errors: object) => Object.values(errors).some(Boolean)

export default function Step3Experience({ data, setData, onNext, onPrev }: Props) {
  const [tab, setTab] = useState<Tab>('experience')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const jobTitles = JOB_TITLES

  const addExp = () => {
    const e: Experience = {
      id: genId(), company: '', position: '', startDate: '', endDate: '',
      current: false, location: '', highlights: [''],
    }
    setData({ ...data, experience: [...data.experience, e] })
  }

  const updateExp = (id: string, field: keyof Experience, value: Experience[keyof Experience]) =>
    setData({ ...data, experience: data.experience.map(e => e.id === id ? { ...e, [field]: value } : e) })

  const removeExp = (id: string) =>
    setData({ ...data, experience: data.experience.filter(e => e.id !== id) })

  const addEdu = () => {
    const e: Education = { id: genId(), institution: '', degree: '', area: '', startDate: '', endDate: '', gpa: '' }
    setData({ ...data, education: [...data.education, e] })
  }

  const updateEdu = (id: string, field: keyof Education, value: string) =>
    setData({ ...data, education: data.education.map(e => e.id === id ? { ...e, [field]: value } : e) })

  const removeEdu = (id: string) =>
    setData({ ...data, education: data.education.filter(e => e.id !== id) })

  const experienceErrors = useMemo(
    () => data.experience.map(validateExperienceEntry),
    [data.experience]
  )
  const educationErrors = useMemo(
    () => data.education.map(validateEducationEntry),
    [data.education]
  )

  const experienceHasErrors = experienceErrors.some(hasAnyError)
  const educationHasErrors = educationErrors.some(hasAnyError)

  const handleNext = () => {
    if (experienceHasErrors || educationHasErrors) {
      setSubmitAttempted(true)
      setTab(experienceHasErrors ? 'experience' : 'education')
      return
    }
    onNext()
  }

  const tabs: { id: Tab; label: string; count: number; hasErrors: boolean }[] = [
    { id: 'experience', label: 'Experiencia Laboral', count: data.experience.length, hasErrors: submitAttempted && experienceHasErrors },
    { id: 'education', label: 'Educación', count: data.education.length, hasErrors: submitAttempted && educationHasErrors },
  ]

  return (
    <div>
      <div className="px-8 pt-8 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Experiencia & Educación</h2>
        </div>
        <p className="text-zinc-500 text-sm mb-5 ml-11">
          Del más reciente al más antiguo. Usa el selector de verbos ATS en cada logro.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="px-8 mb-5">
        <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                transition-all duration-200
                ${tab === t.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}
              `}
            >
              {t.label}
              {t.hasErrors ? (
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold bg-red-500 text-white">!</span>
              ) : t.count > 0 ? (
                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${tab === t.id ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 pb-2 space-y-4">
        {tab === 'experience' && (
          <>
            {data.experience.length === 0 && (
              <div className="py-10 text-center text-zinc-400 text-sm">
                <svg className="w-10 h-10 mx-auto mb-3 text-zinc-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38" />
                </svg>
                Añade tu primera experiencia laboral
              </div>
            )}
            {data.experience.map((exp, i) => (
              <ExperienceCard
                key={exp.id}
                exp={exp}
                index={i}
                onUpdate={updateExp}
                onRemove={removeExp}
                jobTitles={jobTitles}
                errors={experienceErrors[i]}
                forceShowErrors={submitAttempted}
              />
            ))}
            <button
              onClick={addExp}
              className="w-full py-3.5 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 text-sm font-semibold hover:border-zinc-900 hover:text-zinc-900 hover:bg-zinc-50 active:scale-[0.99] transition-all duration-200"
            >
              + Agregar experiencia laboral
            </button>
          </>
        )}

        {tab === 'education' && (
          <>
            {data.education.length === 0 && (
              <div className="py-10 text-center text-zinc-400 text-sm">
                <svg className="w-10 h-10 mx-auto mb-3 text-zinc-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
                Añade tu primera formación o certificación
              </div>
            )}
            {data.education.map((edu, i) => (
              <EducationCard
                key={edu.id}
                edu={edu}
                index={i}
                onUpdate={updateEdu}
                onRemove={removeEdu}
                errors={educationErrors[i]}
                forceShowErrors={submitAttempted}
              />
            ))}
            <button
              onClick={addEdu}
              className="w-full py-3.5 rounded-xl border-2 border-dashed border-zinc-200 text-zinc-500 text-sm font-semibold hover:border-zinc-900 hover:text-zinc-900 hover:bg-zinc-50 active:scale-[0.99] transition-all duration-200"
            >
              + Agregar formación o certificación
            </button>
          </>
        )}
      </div>

      <NavigationButtons onPrev={onPrev} onNext={handleNext} />
    </div>
  )
}
