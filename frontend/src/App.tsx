import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type CVData, type Sector, initialCVData } from './types/cv'
import SectorIntro from './components/SectorIntro'
import WizardLayout from './components/wizard/WizardLayout'
import Step1Personal from './components/wizard/steps/Step1Personal'
import Step2Summary from './components/wizard/steps/Step2Summary'
import Step3Experience from './components/wizard/steps/Step3Experience'
import Step4Skills from './components/wizard/steps/Step4Skills'
import Step5Template from './components/wizard/steps/Step5Template'
import CVPreviewModal from './components/CVPreviewModal'

// Render (plan free) "duerme" el backend tras inactividad: la primera
// request tras el cold-start puede tardar ~50s o más. Damos margen extra
// antes de abortar y mostrar el error de timeout.
const GENERATE_TIMEOUT_MS = 90000

const STEPS = [
  'Datos Personales',
  'Resumen',
  'Experiencia',
  'Habilidades',
  'Plantilla',
]

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '60%' : '-60%',
    opacity: 0,
    scale: 0.97,
  }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? '-60%' : '60%',
    opacity: 0,
    scale: 0.97,
  }),
}

const transition = {
  duration: 0.38,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
}

export default function App() {
  const [sector, setSector] = useState<Sector | null>(null)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState<CVData>(initialCVData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prevUrlRef = useRef<string | null>(null)

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved === 'light' || saved === 'dark') return saved
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step, sector])

  const goNext = () => {
    setDirection(1)
    setStep(s => Math.min(s + 1, STEPS.length - 1))
    clearDownload()
  }

  const goPrev = () => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 0))
    clearDownload()
  }

  const clearDownload = () => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = null
    }
    setDownloadUrl(null)
    setShowPreview(false)
    setError(null)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    clearDownload()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GENERATE_TIMEOUT_MS)

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      })

      if (!response.ok) {
        const detail = await response.json().catch(() => ({ detail: 'Error desconocido' }))
        throw new Error(detail.detail ?? `HTTP ${response.status}`)
      }

      // Reutilizamos este mismo blob para la vista previa: no hace falta un
      // segundo fetch a /generate-cv para mostrarlo antes de la descarga.
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      prevUrlRef.current = url
      setDownloadUrl(url)
      setShowPreview(true)
    } catch (e) {
      // `fetch` lanza un AbortError cuando superamos GENERATE_TIMEOUT_MS (p.ej.
      // el servidor tardó demasiado en despertar) y un TypeError cuando la
      // petición no llega al servidor (caído, en cold-start, sin red,
      // bloqueada por CORS). Cualquier otro error ya viene de una respuesta
      // HTTP real del backend. En todos los casos mostramos un mensaje
      // genérico: nunca exponemos la URL interna ni el texto técnico crudo
      // (p.ej. "Failed to fetch") al usuario final.
      let msg: string
      if (e instanceof DOMException && e.name === 'AbortError') {
        msg = 'El servidor está tardando más de lo esperado en responder (posiblemente saliendo de reposo). Por favor, inténtalo de nuevo en unos instantes.'
      } else if (e instanceof TypeError) {
        msg = 'El servicio de generación se encuentra temporalmente en mantenimiento. Por favor, reinténtalo en unos minutos.'
      } else {
        msg = 'Estamos experimentando una alta demanda en nuestros servidores de diseño. Por favor, espera un momento y vuelve a intentarlo.'
      }
      setError(msg)
    } finally {
      clearTimeout(timeoutId)
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!downloadUrl) return
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `cv.${data.template.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!sector) {
    return <SectorIntro onSelect={setSector} theme={theme} onToggleTheme={toggleTheme} />
  }

  return (
    <WizardLayout step={step} steps={STEPS} theme={theme} onToggleTheme={toggleTheme}>
      {/* Error banner */}
      {error && (
        <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Error al generar el CV</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
            <button
              onClick={handleGenerate}
              className="mt-2 text-xs font-semibold text-red-700 hover:text-red-900 underline underline-offset-2"
            >
              Reintentar
            </button>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Animated step container */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            {step === 0 && <Step1Personal data={data} setData={setData} onNext={goNext} sector={sector} />}
            {step === 1 && <Step2Summary data={data} setData={setData} onNext={goNext} onPrev={goPrev} />}
            {step === 2 && <Step3Experience data={data} setData={setData} onNext={goNext} onPrev={goPrev} />}
            {step === 3 && <Step4Skills data={data} setData={setData} onNext={goNext} onPrev={goPrev} />}
            {step === 4 && (
              <Step5Template
                data={data}
                setData={setData}
                onPrev={goPrev}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                downloadUrl={downloadUrl}
                onShowPreview={() => setShowPreview(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {showPreview && downloadUrl && (
        <CVPreviewModal
          url={downloadUrl}
          format={data.template.format}
          onDownload={handleDownload}
          onClose={() => setShowPreview(false)}
        />
      )}
    </WizardLayout>
  )
}
