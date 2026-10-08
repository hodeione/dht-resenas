import { useEffect, useMemo, useState } from 'react'
import { copyText } from '../lib/export'
import { TEMPLATES, channelLink, fillTemplate } from '../lib/messages'
import { Button, Card, CopyButton, Label, inputCls } from './ui'

const CHANNEL_LABEL = { whatsapp: 'Abrir en WhatsApp', sms: 'Abrir en SMS', email: 'Abrir en el correo' }

export function Messages({ businessName, url }: { businessName: string; url: string | null }) {
  const [tplId, setTplId] = useState(TEMPLATES[0].id)
  const [client, setClient] = useState('')
  const [phone, setPhone] = useState('')
  const tpl = TEMPLATES.find((t) => t.id === tplId)!
  const vars = useMemo(() => ({ cliente: client, negocio: businessName, enlace: url ?? '[tu enlace de reseñas]' }), [client, businessName, url])

  const generated = useMemo(() => fillTemplate(tpl.body, vars), [tpl, vars])
  const subject = useMemo(() => (tpl.subject ? fillTemplate(tpl.subject, vars) : ''), [tpl, vars])
  const [text, setText] = useState(generated)
  // Si cambian los datos, regeneramos el texto (las ediciones manuales se pierden a propósito al cambiar de plantilla).
  useEffect(() => setText(generated), [generated])

  return (
    <Card>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div>
            <Label>Plantilla</Label>
            <div className="flex flex-col gap-1.5">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTplId(t.id)}
                  aria-pressed={t.id === tplId}
                  className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    t.id === tplId ? 'bg-acid font-medium text-ink' : 'border border-line text-soft hover:border-acid'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="client" hint="opcional">
              Nombre del cliente
            </Label>
            <input id="client" className={inputCls} value={client} placeholder="Ej.: Laura" onChange={(e) => setClient(e.target.value)} />
          </div>
          {tpl.channel !== 'email' && (
            <div>
              <Label htmlFor="phone" hint="opcional, con prefijo">
                Teléfono
              </Label>
              <input id="phone" className={inputCls} value={phone} inputMode="tel" placeholder="+34 600 000 000" onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          {subject && (
            <div className="mb-3">
              <Label>Asunto</Label>
              <div className="rounded-md border border-line bg-ink px-3 py-2.5 text-[15px]">{subject}</div>
            </div>
          )}
          <Label htmlFor="msg">Mensaje</Label>
          <textarea id="msg" className={inputCls + ' min-h-56 flex-1 resize-y leading-relaxed'} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton variant="primary" label="Copiar mensaje" disabled={!url} onCopy={() => copyText(subject ? `${subject}\n\n${text}` : text)} />
            <Button disabled={!url} href={channelLink(tpl.channel, text, subject, phone)}>
              {CHANNEL_LABEL[tpl.channel]} ↗
            </Button>
          </div>
          {!url && <p className="mt-2 text-xs text-amber-300">Pega tu enlace de reseñas arriba para poder enviar el mensaje.</p>}
        </div>
      </div>
    </Card>
  )
}
