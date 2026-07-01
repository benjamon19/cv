import type { CVData } from '../types/cv'
import { ACTION_VERBS_ES, ATS_CLICHES } from '../data/suggestions'

export interface ATSCheck {
  label: string
  tip: string
  passed: boolean
  weight: number
}

export interface ATSResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D'
  color: string
  checks: ATSCheck[]
}

export function calculateATS(data: CVData): ATSResult {
  const checks: ATSCheck[] = [
    {
      label: 'Email y teléfono',
      tip: 'Los ATS necesitan datos de contacto en texto plano, no como imagen.',
      passed: !!data.personal.email.trim() && !!data.personal.phone.trim(),
      weight: 8,
    },
    {
      label: 'Ubicación incluida',
      tip: 'Muchos ATS filtran por ciudad o región. Inclúyela aunque sea solo el país.',
      passed: !!data.personal.location.trim(),
      weight: 5,
    },
    {
      label: 'Perfil de LinkedIn',
      tip: 'LinkedIn es el segundo campo más validado por reclutadores tras el email.',
      passed: !!data.personal.linkedin.trim(),
      weight: 5,
    },
    {
      label: 'Resumen profesional presente',
      tip: 'Un resumen de 2-4 frases permite al ATS clasificar tu perfil rápidamente.',
      passed: data.summary.trim().length >= 60,
      weight: 12,
    },
    {
      label: 'Resumen sin clichés',
      tip: 'Palabras como "apasionado" o "proactivo" penalizan en sistemas modernos. Usa logros concretos.',
      passed: !ATS_CLICHES.some(c => data.summary.toLowerCase().includes(c)),
      weight: 8,
    },
    {
      label: 'Al menos 1 experiencia laboral',
      tip: 'La sección de experiencia es la más peso para los ATS.',
      passed: data.experience.length >= 1,
      weight: 15,
    },
    {
      label: 'Logros con verbos de acción',
      tip: 'Los ATS y reclutadores valoran más "Desarrollé X" que "Responsable de X".',
      passed: data.experience.some(e =>
        e.highlights.some(h =>
          ACTION_VERBS_ES.some(v => h.toLowerCase().startsWith(v.toLowerCase()))
        )
      ),
      weight: 10,
    },
    {
      label: 'Fechas en formato AAAA-MM',
      tip: 'Un formato de fecha inconsistente confunde al parser del ATS.',
      passed: data.experience.length === 0 || data.experience.every(e =>
        /^\d{4}-\d{2}$/.test(e.startDate) && (/^\d{4}-\d{2}$/.test(e.endDate) || e.current)
      ),
      weight: 7,
    },
    {
      label: 'Educación incluida',
      tip: 'El título académico es filtro obligatorio en muchas ofertas.',
      passed: data.education.length >= 1,
      weight: 10,
    },
    {
      label: 'Mínimo 2 grupos de habilidades',
      tip: 'Los ATS buscan palabras clave específicas de tu área. Cuantas más, mejor clasificación.',
      passed: data.skills.length >= 2,
      weight: 12,
    },
    {
      label: 'Habilidades con detalle suficiente',
      tip: 'Cada grupo debería tener al menos 3 skills para aumentar la densidad de keywords.',
      passed: data.skills.filter(s => s.details.split(',').filter(d => d.trim()).length >= 3).length >= 1,
      weight: 8,
    },
  ]

  const score = checks.reduce((acc, c) => c.passed ? acc + c.weight : acc, 0)

  const grade = score >= 85 ? 'A' : score >= 65 ? 'B' : score >= 45 ? 'C' : 'D'
  const color = score >= 85 ? '#16a34a' : score >= 65 ? '#2563eb' : score >= 45 ? '#d97706' : '#dc2626'

  return { score, grade, color, checks }
}

export function detectClichés(text: string): string[] {
  return ATS_CLICHES.filter(c => text.toLowerCase().includes(c))
}

export function startsWithActionVerb(text: string): boolean {
  return ACTION_VERBS_ES.some(v => text.toLowerCase().startsWith(v.toLowerCase()))
}
