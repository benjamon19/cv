import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import type { CVData, SkillGroup } from '../../../types/cv'
import NavigationButtons from '../NavigationButtons'
import Combobox from '../../ui/Combobox'
import {
  SKILLS_BY_CATEGORY, SUGGESTED_SKILL_CATEGORIES,
  SKILL_CATEGORY_PLACEHOLDER_EXAMPLES, SKILL_DETAILS_PLACEHOLDER_EXAMPLES, pickRandom,
} from '../../../data/suggestions'
import { validateRequired } from '../../../utils/validation'

interface Props {
  data: CVData
  setData: (d: CVData) => void
  onNext: () => void
  onPrev: () => void
}

const CATEGORY_NAMES = Object.keys(SKILLS_BY_CATEGORY)

interface SkillGroupErrors {
  label: string | null
  details: string | null
}

type SkillField = 'label' | 'details'

function validateSkillGroup(skill: SkillGroup): SkillGroupErrors {
  return {
    label: validateRequired(skill.label, 'La categoría'),
    details: validateRequired(skill.details, 'Al menos una habilidad'),
  }
}

function SkillCard({
  skill, index, onUpdate, onRemove, errors, forceShowErrors,
}: {
  skill: SkillGroup
  index: number
  onUpdate: (i: number, field: keyof SkillGroup, value: string) => void
  onRemove: (i: number) => void
  errors: SkillGroupErrors
  forceShowErrors: boolean
}) {
  const [touched, setTouched] = useState<Partial<Record<SkillField, boolean>>>({})
  const markTouched = (field: SkillField) => setTouched(t => ({ ...t, [field]: true }))
  const shownError = (field: SkillField) => (touched[field] || forceShowErrors) ? errors[field] : null
  const [categoryPlaceholder] = useState(() => pickRandom(SKILL_CATEGORY_PLACEHOLDER_EXAMPLES))
  const [detailsPlaceholder] = useState(() => pickRandom(SKILL_DETAILS_PLACEHOLDER_EXAMPLES))

  const suggestedSkills: string[] = useMemo(
    () => SKILLS_BY_CATEGORY[skill.label] ?? [],
    [skill.label]
  )

  const activeSet = useMemo(
    () => new Set(skill.details.split(',').map(s => s.trim()).filter(Boolean)),
    [skill.details]
  )

  const toggleSkill = (s: string) => {
    const current = skill.details.split(',').map(x => x.trim()).filter(Boolean)
    const next = current.includes(s)
      ? current.filter(x => x !== s)
      : [...current, s]
    onUpdate(index, 'details', next.join(', '))
  }

  return (
    <div className="px-4 py-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors duration-150 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Combobox
            label="Categoría"
            value={skill.label}
            onChange={v => onUpdate(index, 'label', v)}
            onBlur={() => markTouched('label')}
            error={shownError('label')}
            suggestions={CATEGORY_NAMES}
            placeholder={categoryPlaceholder}
            className="sm:col-span-1"
          />
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">
              Habilidades{' '}
              <span className="text-zinc-400 font-normal">(separadas por coma)</span>
            </label>
            <input
              value={skill.details}
              onChange={e => onUpdate(index, 'details', e.target.value)}
              onBlur={() => markTouched('details')}
              placeholder={detailsPlaceholder}
              aria-invalid={!!shownError('details')}
              className={`
                w-full px-3.5 py-2 rounded-lg border bg-white text-zinc-900
                placeholder-zinc-300 text-sm
                focus:outline-none focus:ring-2
                transition-all duration-150
                ${shownError('details')
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10'
                }
              `}
            />
            {shownError('details') && <p className="mt-1 text-xs text-red-500">{shownError('details')}</p>}
          </div>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="mt-5 p-1.5 rounded-lg text-zinc-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Skill chips */}
      {suggestedSkills.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400 mb-2">
            Chips sugeridos para <span className="font-semibold text-zinc-500">{skill.label}</span> — haz clic para añadir/quitar:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedSkills.map(s => {
              const active = activeSet.has(s)
              return (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className={`
                    px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150
                    ${active
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900'
                    }
                  `}
                >
                  {active ? '✓ ' : ''}{s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Count feedback */}
      {activeSet.size > 0 && (
        <p className="text-xs text-zinc-400">
          <span className="font-semibold text-zinc-900">{activeSet.size}</span> habilidad{activeSet.size !== 1 ? 'es' : ''} en esta categoría
          {activeSet.size >= 3
            ? <span className="text-emerald-600 ml-1">· Buena densidad de keywords ✓</span>
            : <span className="text-amber-500 ml-1">· Añade al menos 3 para mejor ATS</span>
          }
        </p>
      )}
    </div>
  )
}

export default function Step4Skills({ data, setData, onNext, onPrev }: Props) {
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const SUGGESTED_CATEGORIES = SUGGESTED_SKILL_CATEGORIES

  const addGroup = (label = '') =>
    setData({ ...data, skills: [...data.skills, { label, details: '' }] })

  const update = (i: number, field: keyof SkillGroup, value: string) => {
    const skills = data.skills.map((s, idx) => idx === i ? { ...s, [field]: value } : s)
    setData({ ...data, skills })
  }

  const remove = (i: number) =>
    setData({ ...data, skills: data.skills.filter((_, idx) => idx !== i) })

  const existingLabels = new Set(data.skills.map(s => s.label))

  const skillErrors = useMemo(() => data.skills.map(validateSkillGroup), [data.skills])
  const groupsHaveErrors = skillErrors.some(e => Object.values(e).some(Boolean))
  const noGroups = data.skills.length === 0
  const showNoGroupsError = submitAttempted && noGroups

  const handleNext = () => {
    if (noGroups || groupsHaveErrors) {
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Habilidades</h2>
        </div>
        <p className="text-zinc-500 text-sm mb-6 ml-11">
          Elige una categoría y selecciona chips — o escribe directamente. Mínimo 3 skills por grupo para optimizar ATS.
        </p>
      </div>

      <div className="px-8 pb-2 space-y-2.5">
        {data.skills.length === 0 && (
          <div className="py-8 text-center text-zinc-400 text-sm">
            <svg className="w-8 h-8 mx-auto mb-3 text-zinc-200" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Usa las sugerencias o añade un grupo personalizado
          </div>
        )}

        {data.skills.map((skill, i) => (
          <SkillCard
            key={i}
            skill={skill}
            index={i}
            onUpdate={update}
            onRemove={remove}
            errors={skillErrors[i]}
            forceShowErrors={submitAttempted}
          />
        ))}

        {showNoGroupsError && (
          <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Agrega al menos un grupo de habilidades antes de continuar.
          </div>
        )}

        <button
          onClick={() => addGroup()}
          className="w-full py-3 rounded-xl border border-dashed border-zinc-200 text-zinc-500 text-sm font-medium hover:border-zinc-900 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
        >
          + Añadir grupo personalizado
        </button>

        {SUGGESTED_CATEGORIES.filter(s => !existingLabels.has(s)).length > 0 && (
          <div className="pt-3 border-t border-zinc-100">
            <p className="text-xs text-zinc-400 mb-2.5">Añadir categoría sugerida:</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_CATEGORIES.filter(s => !existingLabels.has(s)).map(s => (
                <button
                  key={s}
                  onClick={() => addGroup(s)}
                  className="px-2.5 py-1 rounded-md bg-white text-zinc-500 text-xs font-medium border border-zinc-200 hover:border-zinc-900 hover:text-zinc-900 transition-all duration-150"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <NavigationButtons onPrev={onPrev} onNext={handleNext} />
    </div>
  )
}
