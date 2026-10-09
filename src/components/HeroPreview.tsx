import { useMemo } from 'react'
import type { KitConfig } from '../lib/config'
import { buildPoster } from '../lib/posters'

const DEMO_URL = 'https://g.page/r/ejemplo/review'

/**
 * Vista previa en vivo para la portada: el cartel A4 y la pegatina con los
 * datos que el usuario va escribiendo (o un negocio de ejemplo si aún no hay).
 */
export function HeroPreview({ cfg, url }: { cfg: KitConfig; url: string | null }) {
  const demo = useMemo(() => ({ ...cfg, businessName: cfg.businessName || 'Tu negocio' }), [cfg])
  const a4 = useMemo(() => buildPoster('a4', demo, url ?? DEMO_URL), [demo, url])
  const sticker = useMemo(() => buildPoster('sticker', demo, url ?? DEMO_URL), [demo, url])

  return (
    <div aria-hidden="true" className="relative mx-auto hidden w-full max-w-md select-none lg:block">
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(200,255,0,0.16),transparent_65%)] blur-2xl" />
      <div
        className="poster-frame relative w-[78%] rotate-[-4deg] rounded-sm shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:rotate-[-2deg]"
        dangerouslySetInnerHTML={{ __html: a4 }}
      />
      <div
        className="poster-frame absolute -bottom-6 right-0 w-[42%] rotate-[7deg] shadow-[0_20px_50px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:rotate-[3deg]"
        dangerouslySetInnerHTML={{ __html: sticker }}
      />
      <span className="absolute -left-3 -top-3 z-10 rotate-[-4deg] rounded bg-acid px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink">
        {url ? 'Tu kit · en vivo' : 'Vista de ejemplo'}
      </span>
    </div>
  )
}
