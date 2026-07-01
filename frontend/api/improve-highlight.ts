import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `Eres un experto en redacción de currículums profesionales optimizados para ATS.

Tu tarea es mejorar un bullet point de experiencia laboral:
- Mantén la intención original del usuario
- Añade un verbo de acción específico si falta o está débil
- Añade impacto medible cuando sea posible (%, cifras, escala)
- Máximo 130 caracteres
- Tono profesional y directo
- Devuelve SOLO el bullet mejorado, sin comillas, sin explicaciones`

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

  const { highlight, position } = req.body as {
    highlight?: string
    position?: string
  }

  if (!highlight?.trim() || highlight.trim().length < 5) {
    return res.status(400).json({ error: 'El bullet a mejorar es demasiado corto.' })
  }

  const context = position?.trim()
    ? `Cargo: ${position.trim()}\nBullet a mejorar: ${highlight.trim()}`
    : `Bullet a mejorar: ${highlight.trim()}`

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    })

    const result = await model.generateContent(context)
    const text = result.response.text().trim()

    return res.status(200).json({ result: text })
  } catch (err) {
    const { status, message } = classifyError(err)
    return res.status(status).json({ error: message })
  }
}
