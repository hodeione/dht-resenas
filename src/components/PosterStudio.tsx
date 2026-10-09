import { useMemo, useState } from 'react'
import type { KitConfig } from '../lib/config'
import { downloadPng, downloadSvg, printSvg, slugify } from '../lib/export'
import { buildKitZip } from '../lib/zip'
import { FORMATS, buildPoster, type PosterFormat } from '../lib/posters'
import { Button, Card } from './ui'

const EXAMPLE_URL = 'https://g.page/r/ejemplo/review'

export function PosterStudio({ cfg, url }: { cfg: KitConfig; url: string | null }) {
  const [format, setFormat] = useState<PosterFormat>('a4')
  const [busy, setBusy] = useState(false)
  const [zipProgress, setZipProgress] = useState<string | null>(null)
  const [error, setError] = useState('')
  const spec = FORMATS.find((f) => f.id === format)!
  const ready = url !== null

  const svg = useMemo(() => buildPoster(format, cfg, url ?? EXAMPLE_URL), [format, cfg, url])
  const base = `resenas-${slugify(cfg.businessName)}-${format}`

  return (
    <Card className="lg:sticky lg:top-20">
      <div
        role="tablist"
        aria-label="Formato"
        className="no-scrollbar -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap"
        onKeyDown={(e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
          const i = FORMATS.findIndex((f) => f.id === format)
          const next = FORMATS[(i + (e.key === 'ArrowRight' ? 1 : FORMATS.length - 1)) % FORMATS.length]
          setFormat(next.id)
          ;(e.currentTarget.querySelector(`[data-id="${next.id}"]`) as HTMLButtonElement | null)?.focus()
        }}
      >
        {FORMATS.map((f) => (
          <button
            key={f.id}
            data-id={f.id}
            role="tab"
            aria-selected={format === f.id}
            tabIndex={format === f.id ? 0 : -1}
            onClick={() => setFormat(f.id)}
            className={`shrink-0 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
              format === f.id ? 'bg-acid text-ink' : 'border border-line text-mute hover:text-soft'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-baseline justify-between gap-3 text-sm">
        <p className="text-mute">{spec.description}</p>
        <span className="shrink-0 font-mono text-[11px] text-soft/70">{spec.size}</span>
      </div>

      <div className="grain relative flex items-center justify-center rounded-lg border border-line bg-[#16171a] p-4 sm:p-8">
        <div
          className="poster-frame w-full shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          style={{ maxWidth: spec.w >= spec.h ? 520 : 380 }}
          // El SVG se genera en local a partir de texto escapado: no contiene HTML del usuario.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        {!ready && (
          <div className="absolute inset-x-4 top-4 rounded-md bg-amber-300 px-3 py-2 text-center font-mono text-[11px] uppercase tracking-wider text-ink">
            Vista de ejemplo · pega tu enlace para activar el QR real
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="primary"
          disabled={!ready || busy}
          onClick={async () => {
            setBusy(true)
            setError('')
            try {
              await downloadPng(svg, format, `${base}.png`)
            } catch (e) {
              setError((e as Error).message)
            } finally {
              setBusy(false)
            }
          }}
        >
          {busy ? 'Generando…' : '↓ PNG alta calidad'}
        </Button>
        <Button disabled={!ready} onClick={() => printSvg(svg, format)} title="En el diálogo de impresión puedes elegir «Guardar como PDF»">
          Imprimir / PDF
        </Button>
        <Button disabled={!ready} onClick={() => downloadSvg(svg, `${base}.svg`)} title="Vectorial, para imprentas o diseñadores">
          ↓ SVG
        </Button>
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-acid/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-soft">
            <b>Kit completo:</b> los 5 formatos en PNG y SVG, con instrucciones de impresión.
          </p>
          <Button
            variant="primary"
            disabled={!ready || zipProgress !== null}
            onClick={async () => {
              setError('')
              setZipProgress('0/5')
              try {
                const blob = await buildKitZip(cfg, url!, (d, t) => setZipProgress(`${d}/${t}`))
                const href = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = href
                a.download = `kit-resenas-${slugify(cfg.businessName)}.zip`
                document.body.appendChild(a)
                a.click()
                a.remove()
                setTimeout(() => URL.revokeObjectURL(href), 2000)
              } catch (e) {
                setError((e as Error).message)
              } finally {
                setZipProgress(null)
              }
            }}
          >
            {zipProgress ? `Preparando ${zipProgress}…` : '↓ Descargar todo (.zip)'}
          </Button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <p className="mt-3 text-xs text-mute">
        Imprime al 100 % o «tamaño real», sin ajustar a la página. Para PDF, elige «Guardar como PDF» en el diálogo de impresión.
      </p>
    </Card>
  )
}
