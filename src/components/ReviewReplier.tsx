import { useEffect, useState } from 'react'
import { copyText } from '../lib/export'
import { Button, Card, CopyButton, Label, inputCls } from './ui'

interface Reply {
  estilo: 'cercana' | 'profesional' | 'breve'
  texto: string
}
interface ReplyResult {
  sentimiento: 'positiva' | 'neutra' | 'mixta' | 'negativa'
  idioma: string
  resumen: string
  alertas: { tipo: string; detalle: string }[]
  respuestas: Reply[]
  consejo: string
}

const MAX = 2000
const STYLE_LABEL: Record<Reply['estilo'], string> = { cercana: 'Cercana', profesional: 'Profesional', breve: 'Breve' }
const SENTIMENT: Record<ReplyResult['sentimiento'], { label: string; cls: string }> = {
  positiva: { label: 'Positiva', cls: 'bg-acid text-ink' },
  neutra: { label: 'Neutra', cls: 'bg-neutral-300 text-ink' },
  mixta: { label: 'Mixta', cls: 'bg-amber-300 text-ink' },
  negativa: { label: 'Negativa', cls: 'bg-red-400 text-ink' },
}
const ALERT_LABEL: Record<string, string> = {
  datos_personales: 'Datos personales',
  salud: 'Datos de salud',
  legal: 'Riesgo legal',
  amenaza: 'Amenaza',
  posible_falsa: 'Posible reseña falsa',
  contenido_inapropiado: 'Contenido inapropiado',
  otro: 'Atención',
}
const LANG_OPTIONS = [
  ['auto', 'El de la reseña'],
  ['es', 'Castellano'],
  ['en', 'English'],
  ['ca', 'Català'],
  ['eu', 'Euskara'],
  ['gl', 'Galego'],
  ['fr', 'Français'],
  ['de', 'Deutsch'],
  ['it', 'Italiano'],
  ['pt', 'Português'],
] as const

const EXAMPLES = [
  {
    label: '★★★★★ Positiva',
    stars: 5,
    text: 'Fuimos a cenar el sábado y todo genial. La tortilla, increíble, y el camarero muy atento con los niños. ¡Repetiremos seguro!',
  },
  {
    label: '★★ Negativa',
    stars: 2,
    text: 'Esperamos casi 40 minutos a que nos trajeran la comida y nadie se disculpó. La comida estaba bien, pero así no volvemos.',
  },
  {
    label: '★★★★ En inglés',
    stars: 4,
    text: 'Lovely little place near the beach. Great coffee and friendly staff, although it was a bit noisy at lunchtime.',
  },
]

type AiStatus = 'checking' | 'on' | 'off'

export function ReviewReplier({ businessName }: { businessName: string }) {
  const [aiStatus, setAiStatus] = useState<AiStatus>('checking')
  const [review, setReview] = useState('')
  const [stars, setStars] = useState<number | null>(null)
  const [businessType, setBusinessType] = useState('')
  const [signature, setSignature] = useState('')
  const [lang, setLang] = useState('auto')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<ReplyResult | null>(null)
  const [edited, setEdited] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    fetch('/api/responder', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((d) => alive && setAiStatus(d.configured ? 'on' : 'off'))
      .catch(() => alive && setAiStatus('off'))
    return () => {
      alive = false
    }
  }, [])

  async function generate() {
    if (aiStatus === 'off') return
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/responder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ review, stars, business: businessName, businessType, signature, lang }),
      })
      const data = await res.json().catch(() => ({ error: 'Respuesta no válida del servidor.' }))
      if (!res.ok) throw new Error(data.error || 'Algo ha fallado. Inténtalo de nuevo.')
      setResult(data)
      setEdited(data.respuestas.map((r: Reply) => r.texto))
      setState('done')
    } catch (e) {
      setError(e instanceof TypeError ? 'Sin conexión. Revisa tu internet e inténtalo de nuevo.' : (e as Error).message)
      setState('error')
    }
  }

  const tooLong = review.length > MAX
  const canSend = review.trim().length >= 3 && !tooLong && state !== 'loading' && aiStatus === 'on'

  return (
    <Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="review" hint={<span className={tooLong ? 'text-red-300' : ''}>{review.length}/{MAX}</span>}>
              Reseña del cliente
            </Label>
            <textarea
              id="review"
              className={inputCls + ' min-h-36 resize-y leading-relaxed'}
              placeholder="Pega aquí la reseña tal como aparece en Google…"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canSend) {
                  e.preventDefault()
                  generate()
                }
              }}
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-mute">Probar con:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => {
                    setReview(ex.text)
                    setStars(ex.stars)
                  }}
                  className="rounded-full border border-line px-2.5 py-1 text-xs text-soft transition-colors hover:border-acid hover:text-acid"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label hint="opcional">Estrellas</Label>
            <div className="flex gap-1" role="radiogroup" aria-label="Estrellas de la reseña">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={stars === n}
                  aria-label={`${n} estrellas`}
                  onClick={() => setStars(stars === n ? null : n)}
                  className={`text-2xl leading-none transition-transform hover:scale-110 ${stars !== null && n <= stars ? 'text-[#FBBC04]' : 'text-line'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="btype" hint="opcional">
                Tipo de negocio
              </Label>
              <input id="btype" className={inputCls} maxLength={80} placeholder="Ej.: clínica dental" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="sign" hint="opcional">
                Firma
              </Label>
              <input id="sign" className={inputCls} maxLength={80} placeholder="Ej.: Laura, gerente" value={signature} onChange={(e) => setSignature(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="rlang">Idioma de la respuesta</Label>
            <select id="rlang" className={inputCls} value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANG_OPTIONS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {aiStatus === 'off' && (
            <div className="rounded-lg border border-amber-300/40 bg-amber-300/10 p-3 text-sm text-amber-100">
              <b className="font-mono text-[11px] uppercase tracking-wider text-amber-300">Próximamente</b>
              <p className="mt-1">El respondedor con IA se está activando. Mientras tanto, el resto del kit funciona con normalidad.</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" disabled={!canSend} onClick={generate}>
              {state === 'loading' ? 'Pensando respuestas…' : state === 'done' ? '↻ Generar otras 3' : '✦ Generar 3 respuestas'}
            </Button>
            {aiStatus === 'on' && <span className="hidden font-mono text-[10px] uppercase tracking-wider text-mute sm:inline">Ctrl + Intro</span>}
          </div>
          <p className="text-xs text-mute">
            La reseña se envía a la IA de Anthropic solo para generar las respuestas y no se guarda en esta web. No pegues datos que no aparezcan ya en la reseña pública.
          </p>
        </div>

        <div aria-live="polite" className="min-w-0">
          {state === 'idle' && <Placeholder />}
          {state === 'loading' && <Loading />}
          {state === 'error' && (
            <div className="rounded-lg border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-200">
              <p>{error}</p>
            </div>
          )}
          {state === 'done' && result && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${SENTIMENT[result.sentimiento]?.cls ?? 'bg-line'}`}>
                  {SENTIMENT[result.sentimiento]?.label ?? result.sentimiento}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-mute">{result.idioma}</span>
              </div>
              <p className="text-sm text-soft">{result.resumen}</p>

              {result.alertas.length > 0 && (
                <div className="space-y-2 rounded-lg border border-amber-300/50 bg-amber-300/10 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-amber-300">⚠ Antes de responder</p>
                  {result.alertas.map((a, i) => (
                    <p key={i} className="text-sm text-amber-100">
                      <b>{ALERT_LABEL[a.tipo] ?? a.tipo}:</b> {a.detalle}
                    </p>
                  ))}
                </div>
              )}

              {result.respuestas.map((r, i) => (
                <div key={i} className="rounded-lg border border-line bg-ink p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-acid">{STYLE_LABEL[r.estilo] ?? r.estilo}</span>
                    <span className="font-mono text-[10px] text-mute">{(edited[i] ?? '').length} caracteres</span>
                  </div>
                  <textarea
                    aria-label={`Respuesta ${STYLE_LABEL[r.estilo] ?? i + 1}`}
                    className="min-h-28 w-full resize-y bg-transparent text-[15px] leading-relaxed text-white focus:outline-none"
                    value={edited[i] ?? ''}
                    onChange={(e) => setEdited((prev) => prev.map((t, j) => (j === i ? e.target.value : t)))}
                  />
                  <div className="mt-2">
                    <CopyButton label="Copiar" onCopy={() => copyText(edited[i] ?? '')} />
                  </div>
                </div>
              ))}

              {result.consejo && (
                <div className="rounded-lg border border-line p-4">
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-mute">Consejo para tu negocio</p>
                  <p className="text-sm text-soft">{result.consejo}</p>
                </div>
              )}
              <p className="text-xs text-mute">Revisa siempre la respuesta antes de publicarla. Puedes editarla aquí mismo.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function Placeholder() {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-line p-6 text-center">
      <p className="font-display text-3xl tracking-wide text-soft">3 respuestas en segundos</p>
      <p className="mt-2 max-w-sm text-sm text-mute">
        Cercana, profesional y breve. Con aviso si la reseña tiene riesgos, como datos de salud o amenazas legales.
      </p>
    </div>
  )
}

function Loading() {
  return (
    <div className="space-y-3" aria-busy="true">
      <p className="text-sm text-mute">Leyendo la reseña y escribiendo las respuestas. Suele tardar entre 10 y 30 segundos.</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-lg border border-line bg-card" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  )
}
