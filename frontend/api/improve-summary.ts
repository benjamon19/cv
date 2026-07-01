import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `Eres un experto en redacción de currículums profesionales optimizados para sistemas ATS (Applicant Tracking Systems) y reclutadores de RRHH.

Tu tarea es mejorar el resumen profesional de un candidato siguiendo estas reglas estrictas:
- Longitud: entre 3 y 5 oraciones concisas (máximo 500 caracteres)
- Inicio: NUNCA uses "Yo", "Me", "Mi" ni primera persona
- Tono: profesional, directo, con foco en valor y resultados
- ATS: incluye palabras clave relevantes al perfil del candidato
- Elimina clichés como "apasionado", "dinámico", "orientado a resultados" sin datos
- Sustituye frases vacías por logros o habilidades concretas
- Devuelve SOLO el texto mejorado del resumen, sin comillas, sin explicaciones, sin etiquetas`

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

  const { draft } = req.body as { draft?: string }
  if (!draft || draft.trim().length < 10) {
    return res.status(400).json({ error: 'El borrador es demasiado corto para mejorar.' })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    })

    const result = await model.generateContent(
      `Mejora el siguiente resumen profesional:\n\n${draft.trim()}`
    )
    const text = result.response.text().trim()

    return res.status(200).json({ result: text })
  } catch (err) {
    const { status, message } = classifyError(err)
    return res.status(status).json({ error: message })
  }
}
