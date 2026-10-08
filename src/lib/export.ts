import { FORMATS, type PosterFormat } from './posters'

export function slugify(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'negocio'
  )
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function downloadSvg(svg: string, filename: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/** Rasteriza el SVG a PNG a la resolución pedida (300 ppp = calidad de imprenta). */
export async function svgToPngBlob(svg: string, format: PosterFormat, dpi = 300): Promise<Blob> {
  const spec = FORMATS.find((f) => f.id === format)!
  const pxW = Math.round((spec.w / 25.4) * dpi)
  const pxH = Math.round((spec.h / 25.4) * dpi)
  // Forzamos tamaño en píxeles para que el navegador rasterice a la resolución final.
  const sized = svg.replace(/width="[^"]+mm" height="[^"]+mm"/, `width="${pxW}" height="${pxH}"`)
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    img.decoding = 'sync'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('No se pudo generar la imagen.'))
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = pxW
    canvas.height = pxH
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, pxW, pxH)
    ctx.drawImage(img, 0, 0, pxW, pxH)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo generar la imagen.'))), 'image/png'),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function downloadPng(svg: string, format: PosterFormat, filename: string) {
  const blob = await svgToPngBlob(svg, format)
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/**
 * Imprime (o guarda como PDF desde el diálogo del navegador) el diseño a su
 * tamaño real usando un iframe oculto, sin abrir ventanas emergentes.
 */
export function printSvg(svg: string, format: PosterFormat) {
  const spec = FORMATS.find((f) => f.id === format)!
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
  document.body.appendChild(iframe)
  const doc = iframe.contentDocument!
  doc.open()
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Imprimir</title>
<style>@page{size:${spec.w}mm ${spec.h}mm;margin:0}html,body{margin:0;padding:0}
svg{display:block;width:${spec.w}mm;height:${spec.h}mm}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${svg}</body></html>`)
  doc.close()
  const go = () => {
    iframe.contentWindow!.focus()
    iframe.contentWindow!.print()
    setTimeout(() => iframe.remove(), 60_000)
  }
  // Espera a que el logo incrustado termine de decodificarse.
  setTimeout(go, 350)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

/** Copia HTML con formato (para pegar la firma en Gmail/Outlook) con texto plano de respaldo. */
export async function copyRichHtml(html: string, plain: string): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ])
      return true
    }
  } catch {
    /* sigue con el método alternativo */
  }
  const div = document.createElement('div')
  div.innerHTML = html
  div.style.position = 'fixed'
  div.style.left = '-9999px'
  document.body.appendChild(div)
  const range = document.createRange()
  range.selectNodeContents(div)
  const sel = window.getSelection()!
  sel.removeAllRanges()
  sel.addRange(range)
  const ok = document.execCommand('copy')
  sel.removeAllRanges()
  div.remove()
  return ok
}
