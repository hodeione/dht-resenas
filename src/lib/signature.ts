import { escapeXml } from './posters'

/**
 * Firma de email con botón de reseña. Se construye con tablas y estilos en
 * línea porque es lo único que Gmail, Outlook y Apple Mail respetan igual.
 */
export function buildSignature(opts: {
  businessName: string
  url: string
  primary: string
  ink: string
  label: string
}): { html: string; plain: string } {
  const name = escapeXml(opts.businessName.trim() || 'Nuestro negocio')
  const href = escapeXml(opts.url).replace(/"/g, '&quot;')
  const label = escapeXml(opts.label)
  const html =
    `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#1f1f1f;">` +
    `<tr><td style="padding:0 0 6px 0;font-size:14px;font-weight:bold;">${name}</td></tr>` +
    `<tr><td style="padding:0 0 8px 0;font-size:16px;color:#FBBC04;letter-spacing:2px;">★★★★★</td></tr>` +
    `<tr><td><a href="${href}" target="_blank" rel="noopener" style="display:inline-block;background:${opts.primary};color:${opts.ink};` +
    `font-size:13px;font-weight:bold;text-decoration:none;padding:9px 16px;border-radius:6px;">${label} →</a></td></tr>` +
    `</table>`
  const plain = `${opts.businessName.trim()}\n${opts.label}: ${opts.url}`
  return { html, plain }
}
