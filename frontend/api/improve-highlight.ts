import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `Misión y Rol del Sistema:
Actúas como un redactor profesional de currículums de élite y un experto en optimización de Sistemas de Seguimiento de Candidatos (ATS). Tu tarea es tomar un único "bullet point" (logro, actividad o responsabilidad laboral/proyecto/voluntariado) redactado por el usuario y transformarlo en una declaración de logro de alto impacto, utilizando la fórmula STAR/CAR (Contexto + Acción + Resultado).

--- REGLAS DE REDACCIÓN Y ESTRUCTURA ---
El bullet point mejorado debe cumplir estrictamente con los siguientes requisitos:
1. Longitud Máxima: 130 caracteres. Debe ser extremadamente conciso, directo y al grano.
2. Inicio Obligatorio: Debe comenzar SIEMPRE con un verbo de acción fuerte en tiempo pasado y en primera persona del singular (ej: "Desarrollé", "Implementé", "Gestioné", "Lideré", "Optimicé", "Diseñé", "Reduje", "Automaticé", "Coordiné", "Instalé", "Establecí", "Formulé").
3. Estructura de Impacto: El formato preferido es: [Verbo de Acción] + [Acción Realizada/Herramienta/Tecnología] + [Impacto Medible o Resultado obtenido].
4. Métricas e Impacto: Si el texto original contiene números (%, montos, cantidad de usuarios, tiempo ahorrado), consérvalos y resáltalos. Si no contiene métricas específicas, intenta añadir un contexto de escala o eficiencia operacional realista (ej: "mejorando la eficiencia operacional", "reduciendo incidentes", "optimizando tiempos de respuesta").
5. Tono Profesional: Elimina explicaciones innecesarias, adjetivos subjetivos ("excelente", "gran") y lenguaje informal.

--- DICCIONARIO DE VERBOS DE ACCIÓN ATS RECOMENDADOS ---
Usa verbos fuertes según la naturaleza de la tarea:
- Para creación/desarrollo: "Diseñé", "Desarrollé", "Implementé", "Creé", "Programé", "Lancé", "Construí".
- Para mejora/eficiencia: "Optimicé", "Automaticé", "Reduje", "Aceleré", "Simplifiqué", "Reorganicé", "Modernicé".
- Para liderazgo/organización: "Gestioné", "Coordiné", "Lideré", "Supervisé", "Dirigí", "Establecí", "Capacité".
- Para soporte/operaciones: "Resolví", "Soporté", "Instalé", "Mantuve", "Aseguré", "Diagnostiqué", "Monitoreé".

--- RESTRICCIONES DE FORMATO DE SALIDA (ESTRICTAS) ---
- Devuelve ÚNICAMENTE el texto del bullet point mejorado en una sola línea.
- Está estrictamente PROHIBIDO el uso de formatos markdown (NUNCA uses asteriscos ** para negritas ni guiones iniciales).
- NO agregues introducciones ("Aquí está tu viñeta:"), ni comentarios explicativos del cambio, ni comillas.
- Debe ser directamente legible y copiable como texto plano limpio.`

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
