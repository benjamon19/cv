import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `Misión y Rol del Sistema:
Actúas como un generador experto de logros curriculares y analista de reclutamiento optimizado para ATS. Tu tarea es generar exactamente 4 sugerencias de viñetas (highlights/logros) realistas, profesionales y de alto impacto para el cargo y empresa provistos por el usuario, evitando duplicar cualquier logro existente que se te indique.

--- DIRECTIVAS DE GENERACIÓN (FÓRMULA STAR/CAR) ---
Cada una de las 4 sugerencias debe ser redactada siguiendo la fórmula STAR:
1. Inicio con Verbo de Acción Fuerte: Cada viñeta debe comenzar obligatoriamente con un verbo de acción en tiempo pasado y en primera persona del singular (ej. "Implementé", "Desarrollé", "Automaticé", "Optimicé", "Reduje", "Diseñé", "Coordiné").
2. Estructura de Resultados: Combinar la acción concreta con una métrica de impacto estimada o un contexto operacional de alta calidad (ej: "reduciendo incidentes en un 15%", "ahorrando 5 horas semanales", "para 500+ usuarios finales", "garantizando la continuidad operacional").
3. Longitud Máxima: Cada viñeta debe tener un máximo estricto de 120 caracteres para asegurar legibilidad instantánea.
4. Adaptabilidad al Perfil: Las sugerencias deben ser realistas e incorporar palabras clave críticas del sector que se puedan indexar fácilmente por un sistema ATS.
5. Variedad: Las 4 viñetas deben cubrir diferentes áreas del puesto:
   - Viñeta 1: Logro técnico principal, desarrollo del producto o resolución de problemas complejos.
   - Viñeta 2: Optimización de procesos, automatización o ahorro de tiempo/costes.
   - Viñeta 3: Soporte, mantenimiento, control de calidad o mitigación de riesgos.
   - Viñeta 4: Colaboración, liderazgo, capacitación o relación con usuarios/clientes.

--- RESTRICCIONES DE FORMATO DE SALIDA (MANDATORIAS) ---
- Debes responder ÚNICAMENTE con un objeto JSON válido que contenga la propiedad "highlights" con un array de exactamente 4 strings:
  {"highlights": ["logro1", "logro2", "logro3", "logro4"]}
- NO uses formato markdown en el JSON ni en el texto de las viñetas (NO uses asteriscos ** para negritas).
- NO agregues bloques de código markdown como \`\`\`json ... \`\`\`. Devuelve el JSON crudo en texto plano.
- NO incluyas introducciones, ni explicaciones adicionales, ni notas de pie. Cualquier carácter fuera del JSON romperá el analizador.`

function classifyError(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
    return { status: 429, message: 'Se superó el límite de uso de IA. Intenta en unos minutos.' }
  }
  if (msg.includes('403') || msg.toLowerCase().includes('api key')) {
    return { status: 403, message: 'Error de autenticación con el servicio de IA.' }
  }
  return { status: 500, message: 'Error interno al procesar la solicitud de IA.' }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en el servidor.' })
  }

  const { position, company, existingHighlights } = req.body as {
    position?: string
    company?: string
    existingHighlights?: string[]
  }

  if (!position?.trim()) {
    return res.status(400).json({ error: 'El cargo es obligatorio para sugerir logros.' })
  }

  const contextParts: string[] = [
    `Cargo: ${position.trim()}`,
    company?.trim() ? `Empresa: ${company.trim()}` : '',
    existingHighlights?.length
      ? `Logros ya existentes (no repitas): ${existingHighlights.filter(Boolean).join(' | ')}`
      : '',
  ].filter(Boolean)

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    })

    const result = await model.generateContent(
      `Genera bullets de logros para:\n${contextParts.join('\n')}`
    )

    let raw = result.response.text().trim()
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    }
    const parsed = JSON.parse(raw) as { highlights: string[] }

    if (!Array.isArray(parsed.highlights)) {
      throw new Error('Formato de respuesta inválido desde Gemini')
    }

    return res.status(200).json({ highlights: parsed.highlights.slice(0, 5) })
  } catch (err) {
    const { status, message } = classifyError(err)
    return res.status(status).json({ error: message })
  }
}
