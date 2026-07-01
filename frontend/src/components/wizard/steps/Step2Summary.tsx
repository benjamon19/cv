import { useMemo, useState } from 'react'
import { AlertTriangle, Lightbulb, Zap } from 'lucide-react'
import type { CVData } from '../../../types/cv'
import NavigationButtons from '../NavigationButtons'
import { detectClichés } from '../../../utils/ats'
import { ACTION_VERBS_ES, ATS_POWER_KEYWORDS, SUMMARY_PLACEHOLDER_EXAMPLES, pickRandom } from '../../../data/suggestions'
import { validateSummary } from '../../../utils/validation'

interface Props {
  data: CVData
  setData: (d: CVData) => void
  onNext: () => void
  onPrev: () => void
}

const MAX_CHARS = 600
const VERB_SAMPLES = ACTION_VERBS_ES.slice(0, 12)

export default function Step2Summary({ data, setData, onNext, onPrev }: Props) {
  const [touched, setTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [placeholder] = useState(() => pickRandom(SUMMARY_PLACEHOLDER_EXAMPLES))

  const len = data.summary.length
  const pct = Math.min((len / MAX_CHARS) * 100, 100)
  const barColor = len > MAX_CHARS ? 'bg-red-400' : len > MAX_CHARS * 0.85 ? 'bg-amber-400' : 'bg-zinc-900'
  const countColor = len > MAX_CHARS ? 'text-red-500' : len > MAX_CHARS * 0.85 ? 'text-amber-500' : 'text-zinc-400'

  const clichés = useMemo(() => detectClichés(data.summary), [data.summary])

  const foundKeywords = useMemo(
    () => ATS_POWER_KEYWORDS.filter(k => data.summary.toLowerCase().includes(k.toLowerCase())),
    [data.summary]
  )

  const error = useMemo(() => validateSummary(data.summary), [data.summary])
  const shownError = (touched || submitAttempted) ? error : null

  const appendVerb = (verb: string) => {
    const trimmed = data.summary.trimEnd()
    const sep = trimmed.length > 0 && !trimmed.endsWith('.') ? '. ' : trimmed.length > 0 ? ' ' : ''
    setData({ ...data, summary: trimmed + sep + verb + ' ' })
  }

  const handleNext = () => {
    if (error) {
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Resumen Profesional</h2>
        </div>
        <p className="text-zinc-500 text-sm mb-6 ml-11">
          2–4 frases que resuman tu perfil. Es lo primero que lee el ATS y el reclutador.
        </p>
      </div>

      <div className="px-8 pb-2 space-y-4">
        {/* Textarea */}
        <div>
          <textarea
            rows={6}
            value={data.summary}
            onChange={e => setData({ ...data, summary: e.target.value })}
            onBlur={() => setTouched(true)}
            placeholder={placeholder}
            aria-invalid={!!shownError}
            className={`
              w-full px-4 py-3 rounded-xl border bg-white text-zinc-900
              placeholder-zinc-400 text-sm resize-none
              focus:outline-none focus:ring-2
              transition-all duration-200
              ${shownError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                : 'border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10'
              }
            `}
          />
          <div className="mt-2 flex items-center justify-between gap-4">
            <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-xs font-medium tabular-nums flex-shrink-0 ${countColor}`}>
              {len} / {MAX_CHARS}
            </span>
          </div>
          {shownError && <p className="mt-1.5 text-xs text-red-500">{shownError}</p>}
        </div>

        {/* Cliché warnings */}
        {clichés.length > 0 && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 mb-1">Clichés detectados — los ATS los penalizan</p>
              <div className="flex flex-wrap gap-1.5">
                {clichés.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-800 text-xs font-medium line-through">
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-1.5">
                Sustitúyelos por logros concretos con cifras ("reduje el tiempo X un 30%").
              </p>
            </div>
          </div>
        )}

        {/* ATS keywords found */}
        {foundKeywords.length > 0 && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-700 mb-1.5">
                Keywords ATS detectadas ({foundKeywords.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {foundKeywords.map(k => (
                  <span key={k} className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-medium">
                    ✓ {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verb suggestions */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-zinc-500" />
            <p className="text-xs font-semibold text-zinc-700">
              Verbos de impacto — haz clic para insertarlos
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {VERB_SAMPLES.map(v => (
              <button
                key={v}
                onClick={() => appendVerb(v)}
                className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-600 text-xs font-medium hover:border-zinc-900 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-150"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            ['Menciona años de experiencia y especialidad', 'Evita frases sin métricas concretas'],
            ['Incluye 1–2 habilidades o herramientas clave del rol', 'No uses "yo" ni primera persona'],
          ].map(([do_, dont]) => (
            <div key={do_} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
              <p className="flex items-start gap-1.5 text-xs text-zinc-600 mb-1">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>{do_}
              </p>
              <p className="flex items-start gap-1.5 text-xs text-zinc-400">
                <span className="text-red-400 font-bold mt-0.5">✗</span>{dont}
              </p>
            </div>
          ))}
        </div>
      </div>

      <NavigationButtons
        onPrev={onPrev}
        onNext={handleNext}
      />
    </div>
  )
}
