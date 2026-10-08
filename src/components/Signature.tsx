import { useMemo, useState } from 'react'
import type { KitConfig } from '../lib/config'
import { copyRichHtml, copyText } from '../lib/export'
import { buildSignature } from '../lib/signature'
import { Card, CopyButton, Label, inputCls } from './ui'

export function Signature({ cfg, url }: { cfg: KitConfig; url: string | null }) {
  const [label, setLabel] = useState('Déjanos tu reseña en Google')
  const sig = useMemo(
    () => buildSignature({ businessName: cfg.businessName, url: url ?? '#', primary: cfg.primary, ink: cfg.ink, label }),
    [cfg.businessName, cfg.primary, cfg.ink, url, label],
  )

  return (
    <Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="sig-label">Texto del botón</Label>
            <input id="sig-label" className={inputCls} value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-mute">
            <li>Pulsa «Copiar firma».</li>
            <li>
              En <b className="text-soft">Gmail</b>: Configuración → Ver todos los ajustes → Firma → pega. En <b className="text-soft">Outlook</b>: Configuración → Correo → Firmas → pega.
            </li>
            <li>Guarda y envía un correo de prueba a ti mismo.</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <CopyButton variant="primary" label="Copiar firma" disabled={!url} onCopy={() => copyRichHtml(sig.html, sig.plain)} />
            <CopyButton label="Copiar código HTML" disabled={!url} onCopy={() => copyText(sig.html)} />
          </div>
        </div>
        <div>
          <Label>Vista previa</Label>
          <div className="rounded-lg border border-line bg-white p-6">
            <div className="mb-4 space-y-1 text-sm text-neutral-500">
              <div>Un saludo,</div>
            </div>
            {/* HTML generado a partir de texto escapado. */}
            <div dangerouslySetInnerHTML={{ __html: sig.html }} />
          </div>
        </div>
      </div>
    </Card>
  )
}
