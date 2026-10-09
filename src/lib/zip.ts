import type { KitConfig } from './config'
import { slugify, svgToPngBlob } from './export'
import { FORMATS, buildPoster } from './posters'

/**
 * Genera un ZIP con todos los formatos en PNG (300 ppp) y SVG, más un LEEME
 * con instrucciones de impresión. JSZip se carga solo al pulsar el botón.
 */
export async function buildKitZip(cfg: KitConfig, url: string, onProgress?: (done: number, total: number) => void): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const base = slugify(cfg.businessName)
  const total = FORMATS.length
  let done = 0
  for (const f of FORMATS) {
    const svg = buildPoster(f.id, cfg, url)
    zip.file(`svg/${base}-${f.id}.svg`, svg)
    zip.file(`png/${base}-${f.id}.png`, await svgToPngBlob(svg, f.id))
    onProgress?.(++done, total)
  }
  zip.file('LEEME.txt', readme(cfg, url))
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
}

function readme(cfg: KitConfig, url: string): string {
  const lines = [
    `KIT DE RESEÑAS · ${cfg.businessName || 'Tu negocio'}`,
    '',
    `Enlace de reseñas: ${url}`,
    '',
    'CONTENIDO',
    ...FORMATS.map((f) => `- ${f.name} (${f.size}): ${f.description}`),
    '',
    'CÓMO IMPRIMIR',
    '- Usa los PNG de la carpeta "png": están a 300 ppp, calidad de imprenta.',
    '- Imprime al 100 % o "tamaño real", sin "ajustar a la página".',
    '- Tarjeta de mesa: imprime en A4, dobla por la línea discontinua y se sostiene sola.',
    '- Hoja de tarjetas: recorta siguiendo las marcas de las esquinas.',
    '- Los SVG son vectoriales: pásaselos a tu imprenta o diseñador si quieres otro tamaño.',
    '',
    'ANTES DE COLOCARLOS',
    '- Escanea el QR con tu móvil y comprueba que se abre el formulario de reseña.',
    '- Ponlos donde el cliente espera unos segundos: caja, mesas, mostrador, puerta.',
    '',
    'Hecho gratis con https://dht-resenas.vercel.app · DH Technology',
  ]
  return lines.join('\r\n')
}
