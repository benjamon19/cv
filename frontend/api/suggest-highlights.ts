import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `Eres un experto en redacción de currículums profesionales optimizados para sistemas ATS.

Tu tarea es generar bullets de logros y responsabilidades para una posición de trabajo, siguiendo estas reglas:
- Genera exactamente 4 bullets
- Cada bullet DEBE comenzar con un verbo de acción en tiempo pasado (ej: "Desarrollé", "Implementé", "Gestioné", "Lideré", "Optimicé", "Diseñé", "Coordiné")
- Formato: verbo de acción + qué hiciste + impacto medible o contexto relevante
- Si no tienes datos reales, usa estimaciones realistas y específicas (ej: "equipo de 5 personas", "reducción del 20%")
- Máximo 120 caracteres por bullet
- Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta:
  {"highlights": ["bullet1", "bullet2", "bullet3", "bullet4"]}
- No incluyas explicaciones, notas ni texto fuera del JSON`

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

    const raw = result.response.text().trim()
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
