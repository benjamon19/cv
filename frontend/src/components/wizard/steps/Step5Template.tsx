import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, XCircle, ShieldCheck, Eye } from 'lucide-react'
import type { CVData, CVTheme, OutputFormat } from '../../../types/cv'
import { calculateATS } from '../../../utils/ats'
import { getLoadingState } from '../../../utils/loadingMessages'

interface Props {
  data: CVData
  setData: (d: CVData) => void
  onPrev: () => void
  onGenerate: () => void
  isGenerating: boolean
  downloadUrl: string | null
  onShowPreview: () => void
}

const THEMES: {
  id: CVTheme
  name: string
  description: string
  accent: string
  preview: string
}[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Diseño tradicional y elegante. Funciona para cualquier industria.',
    accent: '#18181b',
    preview: 'bg-zinc-800',
  },
  {
    id: 'sb2nov',
    name: 'SB2Nov',
    description: 'Moderno, minimalista y directo. Un diseño limpio para cualquier rubro.',
    accent: '#1d4ed8',
    preview: 'bg-blue-700',
  },
  {
    id: 'engineeringresumes',
    name: 'Compacto',
    description: 'Diseño compacto y estructurado, ideal si tienes mucha experiencia y formación para detallar.',
    accent: '#047857',
    preview: 'bg-emerald-700',
  },
  {
    id: 'moderncv',
    name: 'ModernCV',
    description: 'Colorido y diferenciado. Ideal para creativos y diseñadores.',
    accent: '#6d28d9',
    preview: 'bg-violet-700',
  },
]

function ATSPanel({ data }: { data: CVData }) {
  const result = useMemo(() => calculateATS(data), [data])

  const circumference = 2 * Math.PI * 28
  const dashOffset = circumference - (result.score / 100) * circumference

  const gradeLabel = result.grade === 'A'
    ? 'Excelente' : result.grade === 'B'
    ? 'Bueno' : result.grade === 'C'
    ? 'Mejorable' : 'Incompleto'

  return (
    <div className="rounded-xl border border-zinc-200 overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-4 bg-zinc-50 border-b border-zinc-200">
        <ShieldCheck className="w-5 h-5 text-zinc-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-zinc-800">Puntuación ATS</p>
          <p className="text-xs text-zinc-500">Compatibilidad con sistemas de rastreo de candidatos</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
            <circle cx="36" cy="36" r="28" fill="none" stroke="#e4e4e7" strokeWidth="6" />
            <circle
              cx="36" cy="36" r="28" fill="none"
              stroke={result.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="text-center -ml-1">
            <p className="text-2xl font-extrabold" style={{ color: result.color }}>{result.score}</p>
            <p className="text-xs font-bold" style={{ color: result.color }}>{gradeLabel}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-2.5">
        {result.checks.map(check => (
          <div key={check.label} className="flex items-start gap-3">
            {check.passed
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-4 h-4 text-zinc-200 flex-shrink-0 mt-0.5" />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${check.passed ? 'text-zinc-700' : 'text-zinc-400'}`}>
                {check.label}
                <span className="ml-1.5 font-normal text-zinc-400">+{check.weight}pts</span>
              </p>
              {!check.passed && (
                <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{check.tip}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Step5Template({ data, setData, onPrev, onGenerate, isGenerating, downloadUrl, onShowPreview }: Props) {
  const { theme, format } = data.template
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    if (!isGenerating) {
      setElapsedMs(0)
      return
    }
    const start = Date.now()
    const id = setInterval(() => setElapsedMs(Date.now() - start), 250)
    return () => clearInterval(id)
  }, [isGenerating])

  const { message: loadingMessage, progress: loadingProgress } = getLoadingState(elapsedMs)

  const setTheme = (t: CVTheme) =>
    setData({ ...data, template: { ...data.template, theme: t } })

  const setFormat = (f: OutputFormat) =>
    setData({ ...data, template: { ...data.template, format: f } })

  return (
    <div>
      <div className="px-8 pt-8 pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Plantilla & Formato</h2>
        </div>
        <p className="text-zinc-500 text-sm mb-6 ml-11">
          Elige el diseño visual y el formato de descarga de tu CV.
        </p>
      </div>

      <div className="px-8 pb-6 space-y-8">
        {/* Theme grid */}
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
            Diseño de plantilla
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {THEMES.map(t => {
              const selected = theme === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`
                    group flex flex-col rounded-2xl overflow-hidden border-2 text-left
                    transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900
                    ${selected
                      ? 'border-zinc-900 shadow-md scale-[1.02]'
                      : 'border-zinc-200 hover:border-zinc-400 hover:shadow-sm'
                    }
                  `}
                >
                  {/* Preview area */}
                  <div className={`${t.preview} p-4 h-28 relative overflow-hidden flex-shrink-0`}>
                    <div className="space-y-2">
                      <div className="h-2 w-3/4 bg-white/50 rounded-full" />
                      <div className="h-1.5 w-1/2 bg-white/30 rounded-full" />
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="h-1 w-full bg-white/20 rounded-full" />
                      <div className="h-1 w-5/6 bg-white/15 rounded-full" />
                      <div className="h-1 w-4/6 bg-white/15 rounded-full" />
                    </div>
                    {selected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-3.5 h-3.5 text-zinc-900" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white flex-1">
                    <p className={`text-sm font-bold ${selected ? 'text-zinc-900' : 'text-zinc-700'}`}>
                      {t.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{t.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ATS / autocompletado note */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 leading-relaxed">
            <span className="font-semibold">Todas las plantillas son ATS-friendly:</span> se generan con texto
            real seleccionable en una sola columna (sin imágenes ni tablas), así los sistemas de selección y los
            formularios de las webs de empleo pueden leer y autocompletar tus datos sin saltarte.
          </p>
        </div>

        {/* Format picker */}
        <div>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
            Formato de entrega
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {([
              {
                id: 'pdf' as OutputFormat,
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                ),
                label: 'PDF',
                sub: 'Listo para imprimir y enviar',
              },
              {
                id: 'png' as OutputFormat,
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                ),
                label: 'PNG',
                sub: 'Imagen de alta resolución',
              },
            ] as const).map(f => {
              const sel = format === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`
                    flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left
                    transition-all duration-200
                    ${sel
                      ? 'border-zinc-900 bg-zinc-50 text-zinc-900'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50'
                    }
                  `}
                >
                  <span className={sel ? 'text-zinc-900' : 'text-zinc-400'}>{f.icon}</span>
                  <div>
                    <p className="font-bold text-sm">{f.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{f.sub}</p>
                  </div>
                  {sel && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ATS Score panel */}
        <ATSPanel data={data} />

        {/* Generation progress — el backend (Render free) puede tardar en despertar */}
        {isGenerating && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <p className="text-sm font-medium text-zinc-700">{loadingMessage}</p>
              <span className="text-xs text-zinc-400 tabular-nums flex-shrink-0">{Math.round(loadingProgress)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-zinc-100">
        <button
          onClick={onPrev}
          className="
            inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
            text-zinc-600 bg-zinc-100 hover:bg-zinc-200 active:scale-95 transition-all duration-200
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Atrás
        </button>

        <div className="flex items-center gap-3">
          {downloadUrl && !isGenerating && (
            <button
              onClick={onShowPreview}
              className="
                inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                text-zinc-600 bg-zinc-100 hover:bg-zinc-200
                active:scale-95 transition-all duration-200
              "
            >
              <Eye className="w-4 h-4" />
              Ver vista previa
            </button>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`cv.${format}`}
              className="
                inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100
                active:scale-95 transition-all duration-200
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Descargar {format.toUpperCase()}
            </a>
          )}

          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="
              inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-semibold
              text-white bg-zinc-900 hover:bg-zinc-700 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
              transition-all duration-200
            "
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generando...
              </>
            ) : (
              <>
                Generar CV
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
