import { useEffect, useMemo, useState } from 'react'
import { HeroPreview } from './components/HeroPreview'
import { Messages } from './components/Messages'
import { PosterStudio } from './components/PosterStudio'
import { ReviewReplier } from './components/ReviewReplier'
import { SetupForm } from './components/SetupForm'
import { Signature } from './components/Signature'
import { Button, SectionTitle } from './components/ui'
import { DEFAULT_CONFIG, type KitConfig } from './lib/config'
import { checkReviewLink } from './lib/reviewLink'
import { clearConfig, loadConfig, saveConfig } from './lib/storage'

const DHT_URL = 'https://h-com-bay.vercel.app'
const DHT_CONTACT = `${DHT_URL}/#contacto`
const NAV = [
  ['negocio', 'Tu negocio'],
  ['material', 'Carteles'],
  ['mensajes', 'Mensajes'],
  ['firma', 'Firma'],
  ['ia', 'Respuestas IA'],
  ['consejos', 'Consejos'],
] as const

export default function App() {
  const [cfg, setCfg] = useState<KitConfig>(loadConfig)
  const update = (patch: Partial<KitConfig>) => setCfg((c) => ({ ...c, ...patch }))
  const link = useMemo(() => checkReviewLink(cfg.reviewInput), [cfg.reviewInput])
  const url = link.ok ? link.url : null

  useEffect(() => {
    const t = setTimeout(() => saveConfig(cfg), 300)
    return () => clearTimeout(t)
  }, [cfg])

  // Resalta en el menú la sección visible.
  const [active, setActive] = useState<string>('')
  useEffect(() => {
    const els = NAV.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    // En la portada no se marca ninguna sección.
    const onScroll = () => {
      const first = els[0]
      if (first && first.getBoundingClientRect().top > window.innerHeight * 0.4) setActive('')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <a href="#negocio" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-acid focus:px-3 focus:py-2 focus:text-ink">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <a href={DHT_URL} target="_blank" rel="noopener noreferrer" className="shrink-0 font-display text-3xl leading-none tracking-[0.12em] text-acid">
            D.H.T
          </a>
          <nav aria-label="Secciones" className="no-scrollbar -mr-4 flex min-w-0 flex-1 gap-1 overflow-x-auto pr-4 sm:mr-0 sm:justify-end sm:pr-0">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? 'location' : undefined}
                className={`shrink-0 rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  active === id ? 'bg-acid/10 text-acid' : 'text-mute hover:text-soft'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
          <p className="mb-4 inline-block border border-acid/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.25em] text-acid">
            Gratis · sin registro · con IA
          </p>
          <h1 className="font-display text-6xl leading-[0.9] tracking-wide sm:text-8xl">
            Consigue más
            <br />
            <span className="text-acid">reseñas en Google.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-mute">
            Crea carteles con QR, tarjetas de mesa, mensajes de WhatsApp y una firma de email que llevan a tus clientes directamente a escribir su reseña.
            Y responde a cada reseña en segundos con IA. Más reseñas bien respondidas significa aparecer antes en Google Maps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#negocio" className="inline-flex items-center gap-2 rounded-md bg-acid px-5 py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-shadow hover:shadow-[0_0_28px_rgba(200,255,0,0.4)]">
              Crear mi kit gratis ↓
            </a>
            <a href="#ia" className="inline-flex items-center gap-2 rounded-md border border-line px-5 py-3 font-mono text-xs uppercase tracking-[0.14em] text-soft transition-colors hover:border-acid hover:text-acid">
              ✦ Responder reseñas
            </a>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['5', 'formatos'],
              ['300', 'ppp'],
              ['5', 'idiomas'],
              ['0 €', 'siempre'],
            ].map(([n, l]) => (
              <div key={l} className="border-l border-line pl-3">
                <dt className="font-display text-3xl leading-none text-soft">{n}</dt>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{l}</dd>
              </div>
            ))}
          </dl>
          </div>
          <HeroPreview cfg={cfg} url={url} />
        </section>

        {/* Paso 1 + Paso 2 */}
        <section className="pb-16">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <div id="negocio" className="scroll-mt-20">
              <SectionTitle n="01" title="Tu negocio">
                Los datos se guardan solo en este navegador.
              </SectionTitle>
              <SetupForm cfg={cfg} update={update} link={link} />
              <button
                className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-mute hover:text-red-300"
                onClick={() => {
                  if (confirm('¿Borrar todos los datos y empezar de cero?')) {
                    clearConfig()
                    setCfg(DEFAULT_CONFIG)
                  }
                }}
              >
                Empezar de cero
              </button>
            </div>
            <div id="material" className="scroll-mt-20">
              <SectionTitle n="02" title="Material para imprimir">
                Elige formato, revisa la vista previa y descárgalo.
              </SectionTitle>
              <PosterStudio cfg={cfg} url={url} />
            </div>
          </div>
        </section>

        <section id="mensajes" className="scroll-mt-20 pb-16">
          <SectionTitle n="03" title="Mensajes listos para enviar">
            El mejor momento para pedir una reseña es justo después de un buen servicio. Envía este mensaje ese mismo día.
          </SectionTitle>
          <Messages businessName={cfg.businessName} url={url} />
        </section>

        <section id="firma" className="scroll-mt-20 pb-16">
          <SectionTitle n="04" title="Firma de email">
            Cada correo que envías puede traerte una reseña sin que tengas que pedirla.
          </SectionTitle>
          <Signature cfg={cfg} url={url} />
        </section>

        <section id="ia" className="scroll-mt-20 pb-16">
          <SectionTitle n="05" title="Responde a tus reseñas con IA">
            Responder a todas las reseñas mejora tu posición en Google y da confianza. Pega una y elige entre tres respuestas listas para publicar.
          </SectionTitle>
          <ReviewReplier businessName={cfg.businessName} />
        </section>

        <section id="consejos" className="scroll-mt-20 pb-16">
          <SectionTitle n="06" title="Cómo conseguir más reseñas" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TIPS.map((t) => (
              <div key={t.title} className="rounded-xl border border-line p-5">
                <div className="mb-2 font-display text-2xl tracking-wide text-soft">{t.title}</div>
                <p className="text-sm leading-relaxed text-mute">{t.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-mute">
            Google prohíbe ofrecer descuentos o regalos a cambio de reseñas y pedirlas solo a clientes satisfechos. Si lo haces, puede eliminar reseñas o
            penalizar tu ficha. Este kit está pensado para pedirlas a todos y sin incentivos.
          </p>
        </section>

        {/* CTA */}
        <section className="mb-16 overflow-hidden rounded-2xl border border-acid/40 bg-[radial-gradient(circle_at_80%_0%,rgba(200,255,0,0.14),transparent_55%)] p-8 sm:p-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-acid">/DH Technology</p>
          <h2 className="mt-2 max-w-3xl font-display text-5xl leading-none tracking-wide sm:text-6xl">¿Quieres que lo hagamos por ti?</h2>
          <p className="mt-4 max-w-2xl text-mute">
            Placas NFC para acercar el móvil y reseñar, envío automático de mensajes tras cada venta, respuesta a reseñas y SEO local para salir el primero en
            Google Maps.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" href={DHT_CONTACT}>
              Hablar con DH Technology →
            </Button>
            <Button href={DHT_URL}>Ver servicios</Button>
            <Button href="https://dht-fotos.vercel.app">Optimizar fotos gratis ↗</Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 font-mono text-[11px] uppercase tracking-[0.18em] text-mute sm:px-6">
          <span>
            Hecho por{' '}
            <a className="text-acid hover:underline" href={DHT_URL} target="_blank" rel="noopener noreferrer">
              DH Technology
            </a>
          </span>
          <span>Sin cookies · sin registro · no guardamos tus datos</span>
        </div>
      </footer>
    </div>
  )
}

const TIPS = [
  { title: 'Pide en el momento', body: 'Justo al cobrar, entregar el pedido o terminar el servicio. Es cuando el cliente está más contento y tiene el móvil en la mano.' },
  { title: 'Ponlo donde esperan', body: 'Junto a la caja, en las mesas, en la puerta del baño o en la bolsa del pedido. Los sitios donde la gente espera unos segundos funcionan mejor.' },
  { title: 'Pídelo en persona', body: '«Si te ha gustado, nos ayudas mucho con una reseña» y señala el cartel. Una frase en voz alta multiplica los escaneos.' },
  { title: 'Responde a todas', body: 'Agradece las buenas y contesta con calma a las malas. Google lo valora y los futuros clientes leen tus respuestas.' },
  { title: 'Hazlo constante', body: 'Diez reseñas al mes durante un año valen más que cien en una semana. La regularidad es una señal de confianza.' },
  { title: 'Mide el resultado', body: 'Apunta cuántas reseñas tienes hoy y vuelve a mirarlo dentro de 30 días. Si el cartel no se ve, cámbialo de sitio.' },
]
