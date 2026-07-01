import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { gsap } from 'gsap'

type Theme = 'light' | 'dark' | 'system'

interface Props {
  theme: Theme
  onChangeTheme: (theme: Theme) => void
  align?: 'left' | 'right'
}

export default function ThemeSelector({ theme, onChangeTheme, align = 'right' }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // GSAP Animations for opening/closing the menu
  useEffect(() => {
    const menu = dropdownRef.current
    if (!menu) return

    if (isOpen) {
      // Clear any ongoing animations
      gsap.killTweensOf([menu, menu.querySelectorAll('button')])
      
      // Reset initial values for the entrance animation
      gsap.set(menu, { display: 'block', pointerEvents: 'auto' })
      
      // Dropdown menu fade-in & drop-down
      gsap.fromTo(menu,
        { opacity: 0, scale: 0.92, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power3.out' }
      )

      // Staggered items slide-in animation
      gsap.fromTo(menu.querySelectorAll('button'),
        { opacity: 0, x: -6 },
        { opacity: 1, x: 0, duration: 0.15, stagger: 0.03, ease: 'power2.out', delay: 0.05 }
      )
    } else {
      // Clear ongoing entrance animations
      gsap.killTweensOf([menu, menu.querySelectorAll('button')])

      // Fade-out & lift-up menu
      gsap.to(menu, {
        opacity: 0,
        scale: 0.95,
        y: -4,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(menu, { display: 'none', pointerEvents: 'none' })
        }
      })
    }
  }, [isOpen])

  // GSAP Micro-animations for button hover
  const handleMouseEnter = () => {
    gsap.to(buttonRef.current, { scale: 1.05, duration: 0.2, ease: 'power2.out' })
  }

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' })
  }

  const options = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Oscuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ] as const

  const ActiveIcon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun

  return (
    <div ref={containerRef} className="relative inline-block text-left z-50">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        type="button"
        className="
          flex items-center justify-center p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800
          bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400
          hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100
          transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800
        "
        aria-label="Seleccionar tema"
        aria-expanded={isOpen}
      >
        <ActiveIcon className="w-5 h-5" />
      </button>

      <div
        ref={dropdownRef}
        style={{ display: 'none', pointerEvents: 'none' }}
        className={`
          absolute mt-2 w-32 rounded-xl border border-zinc-200 dark:border-zinc-800
          bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-none
          ${align === 'right' ? 'right-0' : 'left-0'}
          overflow-hidden
        `}
      >
        <div className="py-1">
          {options.map((opt) => {
            const Icon = opt.icon
            const isSelected = theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => {
                  if (dropdownRef.current) {
                    gsap.killTweensOf([dropdownRef.current, dropdownRef.current.querySelectorAll('button')])
                    gsap.set(dropdownRef.current, { display: 'none', opacity: 0, pointerEvents: 'none' })
                  }
                  onChangeTheme(opt.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-left
                  transition-colors duration-100
                  ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
