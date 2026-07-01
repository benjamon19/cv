import { useRef } from 'react'
import {
  Code2, Stethoscope, HardHat, Pickaxe, ChefHat,
  ShoppingBag, Briefcase, GraduationCap, Sparkles
} from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import type { Sector } from '../types/cv'
import ThemeSelector from './ThemeSelector'

interface Props {
  onSelect: (sector: Sector) => void
  theme: 'light' | 'dark' | 'system'
  onChangeTheme: (theme: 'light' | 'dark' | 'system') => void
}

const SECTORS: { id: Sector; label: string; icon: typeof Code2 }[] = [
  { id: 'tecnologia', label: 'Tecnología', icon: Code2 },
  { id: 'salud', label: 'Salud', icon: Stethoscope },
  { id: 'construccion', label: 'Construcción', icon: HardHat },
  { id: 'mineria', label: 'Minería', icon: Pickaxe },
  { id: 'gastronomia', label: 'Gastronomía', icon: ChefHat },
  { id: 'retail', label: 'Retail y Ventas', icon: ShoppingBag },
  { id: 'administracion', label: 'Administración', icon: Briefcase },
  { id: 'educacion', label: 'Educación', icon: GraduationCap },
  { id: 'otro', label: 'Otro rubro', icon: Sparkles },
]

export default function SectorIntro({ onSelect, theme, onChangeTheme }: Props) {
  const scopeRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline()
    tl.from('.sector-intro-heading', { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out' })
    tl.from('.sector-card', { opacity: 0, y: 16, stagger: 0.045, duration: 0.4, ease: 'power2.out' }, '-=0.2')
  }, { scope: scopeRef })

  const liftIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { y: -3, scale: 1.02, duration: 0.2, ease: 'power2.out' })
  }
  const liftOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.2, ease: 'power2.out' })
  }

  return (
    <div ref={scopeRef} className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4 py-10 relative transition-colors duration-200">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <ThemeSelector theme={theme} onChangeTheme={onChangeTheme} />
      </div>

      <div className="w-full max-w-2xl text-center pt-12 sm:pt-0 px-12 sm:px-0">
        <h1 className="sector-intro-heading text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          ¿A qué rubro pertenece tu trabajo?
        </h1>
        <p className="sector-intro-heading text-zinc-500 dark:text-zinc-400 text-sm mb-8">
          Así adaptamos el formulario a tu caso — por ejemplo, no te pediremos datos que no apliquen a tu rubro.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SECTORS.map(s => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                onMouseEnter={liftIn}
                onMouseLeave={liftOut}
                className="
                  sector-card group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850
                  bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-zinc-100
                  hover:shadow-md dark:hover:shadow-zinc-950/20 transition-colors duration-200
                  flex flex-col items-center gap-3
                "
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors duration-200" />
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.label}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
