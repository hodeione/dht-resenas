import { useEffect, useMemo, useState } from 'react'
import { Messages } from './components/Messages'
import { PosterStudio } from './components/PosterStudio'
import { SetupForm } from './components/SetupForm'
import { Signature } from './components/Signature'
import { Button, SectionTitle } from './components/ui'
import { DEFAULT_CONFIG, type KitConfig } from './lib/config'
import { checkReviewLink } from './lib/reviewLink'
import { clearConfig, loadConfig, saveConfig } from './lib/storage'

const DHT_URL = 'https://h-com-bay.vercel.app'
const DHT_CONTACT = `${DHT_URL}/#contacto`

export default function App() {
  const [cfg, setCfg] = useState<KitConfig>(loadConfig)
  const update = (patch: Partial<KitConfig>) => setCfg((c) => ({ ...c, ...patch }))
  const link = useMemo(() => checkReviewLink(cfg.reviewInput), [cfg.reviewInput])
  const url = link.ok ? link.url : null

  useEffect(() => {
    const t = setTimeout(() => saveConfig(cfg), 300)
    return () => clearTimeout(t)
  }, [cfg])

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <a href={DHT_URL} target="_blank" rel="noopener noreferrer" className="font-display text-3xl tracking-[0.12em] text-acid">
            D.H.T
          </a>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-mute">/Kit de reseñas</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Hero */}
        <section className="py-12 sm:py-16">
          <p className="mb-4 inline-block border border-acid/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.25em] text-acid">
            Gratis · sin registro · en 2 minutos
          </p>
          <h1 className="font-display text-6xl leading-[0.9] tracking-wide sm:text-8xl">
            Consigue más
            <br />
            <span className="text-acid">reseñas en Google.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-mute">
            Crea carteles con QR, tarjetas de mesa, mensajes de WhatsApp y una firma de email que llevan a tus clientes directamente a escribir su reseña.
            Más reseñas significa aparecer antes en Google Maps.
          </p>
        </section>

        {/* Paso 1 + Paso 2 */}
        <section aria-labelledby="paso-materiales" className="pb-16">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <div>
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
            <div id="paso-materiales">
              <SectionTitle n="02" title="Material para imprimir">
                Elige formato, revisa la vista previa y descárgalo.
              </SectionTitle>
              <PosterStudio cfg={cfg} url={url} />
            </div>
          </div>
        </section>

        <section className="pb-16">
          <SectionTitle n="03" title="Mensajes listos para enviar">
            El mejor momento para pedir una reseña es justo después de un buen servicio. Envía este mensaje ese mismo día.
          </SectionTitle>
          <Messages businessName={cfg.businessName} url={url} />
        </section>

        <section className="pb-16">
          <SectionTitle n="04" title="Firma de email">
            Cada correo que envías puede traerte una reseña sin que tengas que pedirla.
          </SectionTitle>
          <Signature cfg={cfg} url={url} />
        </section>

        <section className="pb-16">
          <SectionTitle n="05" title="Cómo conseguir más reseñas" />
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
          <span>Sin cookies · sin registro · tus datos no salen de tu navegador</span>
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
