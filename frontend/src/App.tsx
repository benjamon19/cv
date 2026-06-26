import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type CVData, initialCVData } from './types/cv'
import Landing from './components/Landing'
import WizardLayout from './components/wizard/WizardLayout'
import Step1Personal from './components/wizard/steps/Step1Personal'
import Step2Summary from './components/wizard/steps/Step2Summary'
import Step3Experience from './components/wizard/steps/Step3Experience'
import Step4Skills from './components/wizard/steps/Step4Skills'
import Step5Template from './components/wizard/steps/Step5Template'

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
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [data, setData] = useState<CVData>(initialCVData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const prevUrlRef = useRef<string | null>(null)

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
    setError(null)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    clearDownload()

    try {
      const response = await fetch('http://localhost:8000/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const detail = await response.json().catch(() => ({ detail: 'Error desconocido' }))
        throw new Error(detail.detail ?? `HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      prevUrlRef.current = url
      setDownloadUrl(url)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al conectar con el servidor'
      setError(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!started ? (
        <motion.div
          key="landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <Landing onStart={() => setStarted(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="wizard"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <WizardLayout step={step} steps={STEPS} onBack={() => setStarted(false)}>
            {/* Error banner */}
            {error && (
              <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-700">Error al generar el CV</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  <p className="text-xs text-red-500 mt-1">
                    Asegúrate de que el servidor backend está corriendo en{' '}
                    <code className="font-mono">localhost:8000</code>
                  </p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
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
                  {step === 0 && <Step1Personal data={data} setData={setData} onNext={goNext} />}
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
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </WizardLayout>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
