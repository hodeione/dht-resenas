import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const create = vi.fn()
vi.mock('@anthropic-ai/sdk', async (orig) => {
  const real = (await orig()) as { default: unknown }
  const Real = real.default as { new (...a: unknown[]): unknown } & Record<string, unknown>
  class Fake {
    beta = { messages: { create } }
  }
  Object.assign(Fake, Real)
  return { ...real, default: Fake }
})

const ORIGIN = 'https://dht-resenas.vercel.app'
function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}/api/responder`, {
    method: 'POST',
    headers: { origin: ORIGIN, host: 'dht-resenas.vercel.app', 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('POST /api/responder', () => {
  beforeEach(() => {
    vi.resetModules()
    create.mockReset()
  })
  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY
  })

  it('rechaza orígenes ajenos', async () => {
    process.env.ANTHROPIC_API_KEY = 'k'
    const { POST } = await import('./responder')
    const r = await POST(req({ review: 'hola' }, { origin: 'https://evil.com' }))
    expect(r.status).toBe(403)
  })

  it('avisa si falta la clave', async () => {
    const { POST } = await import('./responder')
    const r = await POST(req({ review: 'hola' }))
    expect(r.status).toBe(503)
    expect((await r.json()).code).toBe('not_configured')
  })

  it('valida la entrada', async () => {
    process.env.ANTHROPIC_API_KEY = 'k'
    const { POST } = await import('./responder')
    expect((await POST(req('{malformado'))).status).toBe(400)
    expect((await POST(req({ review: '' }))).status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it('devuelve las respuestas y limita a 8 por IP', async () => {
    process.env.ANTHROPIC_API_KEY = 'k'
    create.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            sentimiento: 'positiva', idioma: 'castellano', resumen: 'ok', alertas: [], consejo: 'c',
            respuestas: [{ estilo: 'cercana', texto: 'gracias' }],
          }),
        },
      ],
    })
    const { POST } = await import('./responder')
    const first = await POST(req({ review: 'Muy bien todo' }))
    expect(first.status).toBe(200)
    expect((await first.json()).respuestas[0].texto).toBe('gracias')
    for (let i = 0; i < 7; i++) await POST(req({ review: 'Muy bien todo' }))
    const blocked = await POST(req({ review: 'Muy bien todo' }))
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('retry-after')).toBeTruthy()
    expect((await POST(req({ review: 'Muy bien todo' }, { 'x-forwarded-for': '9.9.9.9' }))).status).toBe(200)
  })

  it('traduce el rechazo de seguridad a un 422', async () => {
    process.env.ANTHROPIC_API_KEY = 'k'
    create.mockResolvedValue({ stop_reason: 'refusal', content: [] })
    const { POST } = await import('./responder')
    expect((await POST(req({ review: 'texto' }))).status).toBe(422)
  })
})
