import Anthropic from '@anthropic-ai/sdk'
import { RateLimiter, generateReplies, isAllowedOrigin, validateInput } from './_lib/reply.js'

/**
 * POST /api/responder
 * Genera tres respuestas a una reseña de Google con la API de Claude.
 * La clave ANTHROPIC_API_KEY vive solo en las variables de entorno de Vercel.
 */

// 8 consultas cada 10 minutos por IP y 200 por hora en total por instancia.
const limiter = new RateLimiter(8, 10 * 60_000, 200, 60 * 60_000)
let client: Anthropic | null = null

function json(status: number, body: unknown, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  })
}

export async function POST(request: Request): Promise<Response> {
  if (!isAllowedOrigin(request.headers.get('origin'), request.headers.get('host'))) {
    return json(403, { error: 'Origen no permitido.' })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(503, { error: 'El respondedor con IA todavía no está activado en esta web.', code: 'not_configured' })
  }

  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > 16_000) return json(413, { error: 'Petición demasiado grande.' })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'Petición no válida.' })
  }
  const v = validateInput(body)
  if (!v.ok) return json(400, { error: v.error })

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'desconocida'
  const rl = limiter.check(ip)
  if (!rl.ok) {
    return json(
      429,
      { error: `Has hecho muchas consultas seguidas. Vuelve a intentarlo en ${Math.ceil(rl.retryAfterSec / 60)} min.` },
      { 'retry-after': String(rl.retryAfterSec) },
    )
  }

  client ??= new Anthropic()
  const out = await generateReplies(v.input, (params) => client!.beta.messages.create(params))
  switch (out.kind) {
    case 'ok':
      return json(200, out.result)
    case 'refusal':
      return json(422, { error: 'No podemos generar una respuesta para esta reseña. Te recomendamos responderla a mano o denunciarla a Google si es inapropiada.' })
    case 'error':
      return json(out.status, { error: out.error })
  }
}

export function GET(): Response {
  return json(405, { error: 'Usa POST.' }, { allow: 'POST' })
}
