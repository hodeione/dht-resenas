import { useRef, useState } from 'react'
import { COLOR_PRESETS, LANG_LABELS, PRESETS, bestInk, type KitConfig, type Lang } from '../lib/config'
import type { LinkCheck } from '../lib/reviewLink'
import { readLogo } from '../lib/storage'
import { Button, Card, Label, inputCls } from './ui'

interface Props {
  cfg: KitConfig
  update: (patch: Partial<KitConfig>) => void
  link: LinkCheck
}

export function SetupForm({ cfg, update, link }: Props) {
  const [logoError, setLogoError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const showLinkState = cfg.reviewInput.trim().length > 0

  const steps = [
    { label: 'Nombre', done: cfg.businessName.trim().length > 1 },
    { label: 'Enlace', done: link.ok },
    { label: 'Logo', done: Boolean(cfg.logo), optional: true },
  ]
  const required = steps.filter((st) => !st.optional)
  const pct = Math.round((required.filter((st) => st.done).length / required.length) * 100)

  return (
    <Card className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em]">
          <span className={pct === 100 ? 'text-acid' : 'text-mute'}>{pct === 100 ? '✓ Kit listo para descargar' : 'Completa tu kit'}</span>
          <span className="text-mute">{pct}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del kit">
          <div className="h-full rounded-full bg-acid transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <ul className="mt-2 flex flex-wrap gap-3 text-xs">
          {steps.map((st) => (
            <li key={st.label} className={st.done ? 'text-acid' : 'text-mute'}>
              {st.done ? '✓' : '○'} {st.label}
              {st.optional && !st.done && <span className="text-mute/70"> (opcional)</span>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Label htmlFor="name">Nombre del negocio</Label>
        <input
          id="name"
          className={inputCls}
          placeholder="Ej.: Cafetería La Plaza"
          value={cfg.businessName}
          maxLength={60}
          onChange={(e) => update({ businessName: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="link" hint="o tu Place ID">
          Enlace de reseñas de Google
        </Label>
        <input
          id="link"
          className={inputCls + (showLinkState && !link.ok ? ' border-red-400/70' : '')}
          placeholder="https://g.page/r/XXXXXXXX/review"
          value={cfg.reviewInput}
          spellCheck={false}
          autoComplete="off"
          inputMode="url"
          aria-invalid={showLinkState && !link.ok}
          aria-describedby="link-state"
          onChange={(e) => update({ reviewInput: e.target.value })}
        />
        <div id="link-state" aria-live="polite" className="mt-2 text-sm">
          {showLinkState && !link.ok && <p className="text-red-300">✕ {link.error}</p>}
          {link.ok && (
            <div className="space-y-1">
              <p className={link.kind === 'review-direct' ? 'text-acid' : 'text-amber-300'}>
                {link.kind === 'review-direct' ? '✓ Enlace directo al formulario de reseña' : '⚠ Enlace válido, pero no directo'}
              </p>
              {link.note && <p className="text-mute">{link.note}</p>}
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-block font-mono text-xs text-soft underline decoration-line underline-offset-4 hover:text-acid">
                Probar el enlace ↗
              </a>
            </div>
          )}
        </div>
        <LinkHelp />
      </div>

      <div>
        <Label>Logo</Label>
        <div className="flex flex-wrap items-center gap-3">
          {cfg.logo ? (
            <div className="flex h-14 w-28 items-center justify-center rounded-md border border-line bg-white p-1.5">
              <img src={cfg.logo} alt="Logo del negocio" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="flex h-14 w-28 items-center justify-center rounded-md border border-dashed border-line font-mono text-[10px] uppercase text-mute">
              Sin logo
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (!f) return
              try {
                setLogoError('')
                update({ logo: await readLogo(f) })
              } catch (err) {
                setLogoError((err as Error).message)
              }
            }}
          />
          <Button onClick={() => fileRef.current?.click()}>{cfg.logo ? 'Cambiar' : 'Subir logo'}</Button>
          {cfg.logo && <Button onClick={() => update({ logo: null })}>Quitar</Button>}
        </div>
        {logoError && <p className="mt-2 text-sm text-red-300">{logoError}</p>}
        <p className="mt-2 text-xs text-mute">Mejor un PNG con fondo transparente. Se queda en tu navegador, no se sube a ningún sitio.</p>
      </div>

      <div>
        <Label>Colores</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((p) => {
            const active = p.primary.toLowerCase() === cfg.primary.toLowerCase()
            return (
              <button
                key={p.name}
                type="button"
                title={p.name}
                aria-label={`Color ${p.name}`}
                aria-pressed={active}
                onClick={() => update({ primary: p.primary, ink: p.ink })}
                className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${active ? 'border-acid' : 'border-line'}`}
                style={{ background: p.primary }}
              />
            )
          })}
          <label className="flex items-center gap-2 rounded-full border border-line px-3 font-mono text-[11px] uppercase text-mute" title="Color personalizado">
            <input
              type="color"
              value={cfg.primary}
              onChange={(e) => update({ primary: e.target.value.toUpperCase(), ink: bestInk(e.target.value) })}
              className="h-6 w-6"
              aria-label="Color personalizado"
            />
            Propio
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="lang">Idioma de los carteles</Label>
        <select
          id="lang"
          className={inputCls}
          value={cfg.lang}
          onChange={(e) => {
            const lang = e.target.value as Lang
            update({ lang, ...PRESETS[lang] })
          }}
        >
          {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
            <option key={l} value={l}>
              {LANG_LABELS[l]}
            </option>
          ))}
        </select>
      </div>

      <details className="group rounded-md border border-line">
        <summary className="cursor-pointer list-none px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-soft/80 hover:text-acid">
          <span className="inline-block transition-transform group-open:rotate-90">›</span> Personalizar textos
        </summary>
        <div className="space-y-4 border-t border-line p-3">
          {(
            [
              ['headline', 'Titular', 40],
              ['subtitle', 'Subtítulo', 60],
              ['instruction', 'Instrucción', 70],
              ['thanks', 'Agradecimiento', 50],
            ] as const
          ).map(([key, label, max]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <input id={key} className={inputCls} maxLength={max} value={cfg[key]} onChange={(e) => update({ [key]: e.target.value })} />
            </div>
          ))}
        </div>
      </details>
    </Card>
  )
}

function LinkHelp() {
  return (
    <details className="group mt-3 rounded-md border border-line bg-ink/60">
      <summary className="cursor-pointer list-none px-3 py-2.5 text-sm text-soft hover:text-acid">
        <span className="inline-block transition-transform group-open:rotate-90">›</span> ¿Dónde consigo mi enlace?
      </summary>
      <div className="space-y-4 border-t border-line p-3 text-sm text-mute">
        <div>
          <p className="mb-1 font-medium text-soft">Opción 1 · Desde Google (recomendada)</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Busca el nombre de tu negocio en Google con la sesión de la cuenta que lo gestiona.</li>
            <li>
              En tu panel de empresa, pulsa <b className="text-soft">«Pedir reseñas»</b> (a veces aparece como «Conseguir más reseñas»).
            </li>
            <li>Copia el enlace que te muestra, del tipo g.page/r/…/review, y pégalo arriba.</li>
          </ol>
        </div>
        <div>
          <p className="mb-1 font-medium text-soft">Opción 2 · Con tu Place ID</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Abre el{' '}
              <a
                className="text-soft underline underline-offset-4 hover:text-acid"
                href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                target="_blank"
                rel="noopener noreferrer"
              >
                buscador de Place ID de Google ↗
              </a>
              .
            </li>
            <li>Escribe el nombre de tu negocio en el mapa y selecciónalo.</li>
            <li>Copia el código que empieza por «ChIJ…» y pégalo arriba: crearemos el enlace por ti.</li>
          </ol>
        </div>
        <p>Usa siempre «Probar el enlace» antes de imprimir: debe abrirse la ventana para escribir la reseña.</p>
      </div>
    </details>
  )
}
