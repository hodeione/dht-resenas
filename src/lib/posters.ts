import type { KitConfig } from './config'
import { fmt, makeQr, qrPath, type QrMatrix } from './qr'

/** Todas las medidas están en milímetros: 1 unidad del viewBox = 1 mm. */
export type PosterFormat = 'a4' | 'tent' | 'sticker' | 'card' | 'cards-sheet'

export interface PosterSpec {
  id: PosterFormat
  name: string
  size: string
  description: string
  w: number
  h: number
}

export const FORMATS: PosterSpec[] = [
  { id: 'a4', name: 'Cartel A4', size: '210 × 297 mm', description: 'Para la pared, el escaparate o junto a la caja.', w: 210, h: 297 },
  { id: 'tent', name: 'Tarjeta de mesa', size: 'A4 doblado', description: 'Imprime en A4 y dobla por la mitad: se sostiene sola en la mesa o el mostrador.', w: 210, h: 297 },
  { id: 'sticker', name: 'Pegatina', size: '100 × 100 mm', description: 'Para la puerta, el TPV o el mostrador.', w: 100, h: 100 },
  { id: 'card', name: 'Tarjeta', size: '85 × 55 mm', description: 'Tamaño tarjeta de visita, para entregar con el ticket o el pedido.', w: 85, h: 55 },
  { id: 'cards-sheet', name: 'Hoja de 10 tarjetas', size: 'A4 · 10 × (85 × 55)', description: 'Lista para imprimir y recortar siguiendo las marcas.', w: 210, h: 297 },
]

const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif"
const STAR = '#FBBC04'
const MUTED = '#5F6368'
const DARK = '#1F1F1F'

export function buildPoster(format: PosterFormat, cfg: KitConfig, url: string): string {
  const qr = makeQr(url)
  const spec = FORMATS.find((f) => f.id === format)!
  let body: string
  switch (format) {
    case 'a4':
      body = a4(cfg, qr)
      break
    case 'tent':
      body = tent(cfg, qr)
      break
    case 'sticker':
      body = sticker(cfg, qr)
      break
    case 'card':
      body = card(cfg, qr, 0, 0)
      break
    case 'cards-sheet':
      body = cardsSheet(cfg, qr)
      break
  }
  return svgDoc(spec.w, spec.h, body)
}

function svgDoc(w: number, h: number, body: string) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" font-family="${FONT}">` +
    `<rect width="${w}" height="${h}" fill="#FFFFFF"/>${body}</svg>`
  )
}

/* ------------------------------------------------------------------ formatos */

function a4(cfg: KitConfig, qr: QrMatrix): string {
  const W = 210
  const bandH = 112
  let s = `<rect width="${W}" height="${bandH}" fill="${cfg.primary}"/>`
  // Onda suave en la base de la banda.
  s += `<path d="M0 ${bandH - 1} V ${bandH} Q ${W / 2} ${bandH + 16} ${W} ${bandH} V ${bandH - 1} Z" fill="${cfg.primary}"/>`

  let y = 16
  if (cfg.logo) {
    s += `<rect x="${W / 2 - 46}" y="${y - 7}" width="92" height="38" rx="7" fill="#FFFFFF"/>`
    s += logoBox(cfg.logo, W / 2 - 40, y - 4, 80, 32)
    y += 38
  } else if (cfg.businessName) {
    s += textBlock(cfg.businessName.toUpperCase(), W / 2, y + 6, 150, { size: 7, maxLines: 1, weight: 700, color: cfg.ink, spacing: 1.2 }).svg
    y += 16
  }
  const head = textBlock(cfg.headline, W / 2, y + 16, 180, { size: 22, minSize: 13, maxLines: 2, weight: 800, color: cfg.ink })
  s += head.svg
  y = head.bottom + 9
  s += textBlock(cfg.subtitle, W / 2, y, 176, { size: 10, minSize: 7, maxLines: 2, weight: 400, color: cfg.ink }).svg

  s += stars(W / 2, 132, 9, 5)

  const qrSide = 104
  const qx = (W - qrSide) / 2
  const qy = 146
  s += `<rect x="${qx - 4}" y="${qy - 4}" width="${qrSide + 8}" height="${qrSide + 8}" rx="8" fill="none" stroke="${cfg.primary}" stroke-width="2.2"/>`
  s += qrPath(qr, qx, qy, qrSide, DARK)

  s += textBlock(cfg.instruction, W / 2, 268, 170, { size: 6.2, minSize: 4.5, maxLines: 2, weight: 400, color: MUTED }).svg
  const footer = [cfg.businessName, cfg.thanks].filter(Boolean).join('  ·  ')
  s += textBlock(footer, W / 2, 285, 180, { size: 5.2, minSize: 3.8, maxLines: 1, weight: 700, color: DARK }).svg
  return s
}

/** Panel apaisado reutilizado por la tarjeta de mesa. */
function landscapePanel(cfg: KitConfig, qr: QrMatrix, w: number, h: number): string {
  let s = `<rect width="${w}" height="${h}" fill="#FFFFFF"/>`
  s += `<rect width="${w * 0.48}" height="${h}" fill="${cfg.primary}"/>`
  const qrSide = Math.min(w * 0.4, h - 34)
  const qx = (w * 0.48 - qrSide) / 2
  const qy = (h - qrSide) / 2 - 6
  s += `<rect x="${qx - 3}" y="${qy - 3}" width="${qrSide + 6}" height="${qrSide + 6}" rx="5" fill="#FFFFFF"/>`
  s += qrPath(qr, qx, qy, qrSide, DARK)
  s += textBlock(cfg.instruction, w * 0.24, qy + qrSide + 12, w * 0.42, { size: 4.6, minSize: 3.4, maxLines: 2, weight: 700, color: cfg.ink }).svg

  const cx = w * 0.74
  const colW = w * 0.46
  let y = 22
  if (cfg.logo) {
    s += logoBox(cfg.logo, cx - 24, y - 8, 48, 20)
    y += 24
  }
  const head = textBlock(cfg.headline, cx, y + 10, colW, { size: 14, minSize: 8, maxLines: 2, weight: 800, color: DARK })
  s += head.svg
  y = head.bottom + 8
  const sub = textBlock(cfg.subtitle, cx, y, colW, { size: 7, minSize: 5, maxLines: 3, weight: 400, color: MUTED })
  s += sub.svg
  s += stars(cx, sub.bottom + 10, 6.2, 3.6)
  if (cfg.businessName) {
    s += textBlock(cfg.businessName, cx, h - 14, colW, { size: 5.4, minSize: 3.8, maxLines: 1, weight: 700, color: DARK }).svg
  }
  return s
}

function tent(cfg: KitConfig, qr: QrMatrix): string {
  const W = 210
  const H = 297
  const half = H / 2
  const panel = landscapePanel(cfg, qr, W, half)
  let s = `<g transform="translate(0 ${half})">${panel}</g>`
  // La mitad superior va girada 180° para que, al doblar, ambas caras queden derechas.
  s += `<g transform="rotate(180 ${W / 2} ${half / 2})">${panel}</g>`
  s += `<line x1="0" y1="${half}" x2="${W}" y2="${half}" stroke="#B0B0B0" stroke-width="0.3" stroke-dasharray="3 2"/>`
  return s
}

function sticker(cfg: KitConfig, qr: QrMatrix): string {
  const S = 100
  let s = `<rect width="${S}" height="${S}" rx="8" fill="${cfg.primary}"/>`
  const head = textBlock(cfg.headline, S / 2, 14, 88, { size: 8.5, minSize: 5, maxLines: 1, weight: 800, color: cfg.ink })
  s += head.svg
  const qrSide = 58
  const qx = (S - qrSide) / 2
  const qy = 22
  s += `<rect x="${qx - 3}" y="${qy - 3}" width="${qrSide + 6}" height="${qrSide + 6}" rx="5" fill="#FFFFFF"/>`
  s += qrPath(qr, qx, qy, qrSide, DARK)
  s += stars(S / 2, 87.2, 4.4, 2.2, true)
  s += textBlock(cfg.subtitle, S / 2, 95, 90, { size: 3.6, minSize: 2.6, maxLines: 1, weight: 700, color: cfg.ink }).svg
  return s
}

function card(cfg: KitConfig, qr: QrMatrix, ox: number, oy: number): string {
  const W = 85
  const H = 55
  let s = `<g transform="translate(${fmt(ox)} ${fmt(oy)})">`
  s += `<rect width="${W}" height="${H}" fill="#FFFFFF"/>`
  s += `<rect width="4" height="${H}" fill="${cfg.primary}"/>`
  const qrSide = 40
  const qx = W - qrSide - 4
  const qy = (H - qrSide) / 2
  s += qrPath(qr, qx, qy, qrSide, DARK)
  const cx = 6 + (qx - 6) / 2
  const colW = qx - 10
  let y = 9
  if (cfg.logo) {
    s += logoBox(cfg.logo, cx - 15, y - 4, 30, 11)
    y += 12
  }
  const head = textBlock(cfg.headline, cx, y + 5, colW, { size: 4.6, minSize: 3, maxLines: 2, weight: 800, color: DARK })
  s += head.svg
  const sub = textBlock(cfg.subtitle, cx, head.bottom + 4.5, colW, { size: 2.9, minSize: 2.2, maxLines: 3, weight: 400, color: MUTED })
  s += sub.svg
  s += stars(cx, sub.bottom + 4.5, 2.6, 0.9)
  if (cfg.businessName) {
    s += textBlock(cfg.businessName, cx, H - 5, colW, { size: 2.6, minSize: 2, maxLines: 1, weight: 700, color: DARK }).svg
  }
  return s + '</g>'
}

function cardsSheet(cfg: KitConfig, qr: QrMatrix): string {
  const cols = 2
  const rows = 5
  const cw = 85
  const ch = 55
  const ox = (210 - cols * cw) / 2
  const oy = (297 - rows * ch) / 2
  let s = ''
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += card(cfg, qr, ox + c * cw, oy + r * ch)
  // Marcas de corte fuera del área de las tarjetas.
  const mark = 'stroke="#000000" stroke-width="0.15"'
  for (let c = 0; c <= cols; c++) {
    const x = ox + c * cw
    s += `<line x1="${fmt(x)}" y1="${fmt(oy - 7)}" x2="${fmt(x)}" y2="${fmt(oy - 2)}" ${mark}/>`
    s += `<line x1="${fmt(x)}" y1="${fmt(oy + rows * ch + 2)}" x2="${fmt(x)}" y2="${fmt(oy + rows * ch + 7)}" ${mark}/>`
  }
  for (let r = 0; r <= rows; r++) {
    const y = oy + r * ch
    s += `<line x1="${fmt(ox - 7)}" y1="${fmt(y)}" x2="${fmt(ox - 2)}" y2="${fmt(y)}" ${mark}/>`
    s += `<line x1="${fmt(ox + cols * cw + 2)}" y1="${fmt(y)}" x2="${fmt(ox + cols * cw + 7)}" y2="${fmt(y)}" ${mark}/>`
  }
  return s
}

/* ------------------------------------------------------------------ helpers */

function logoBox(dataUrl: string, x: number, y: number, w: number, h: number): string {
  return `<image href="${escapeAttr(dataUrl)}" xlink:href="${escapeAttr(dataUrl)}" x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}" preserveAspectRatio="xMidYMid meet"/>`
}

function starPath(cx: number, cy: number, r: number): string {
  const inner = r * 0.45
  let d = ''
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    d += `${i === 0 ? 'M' : 'L'}${fmt(cx + rad * Math.cos(a))} ${fmt(cy + rad * Math.sin(a))}`
  }
  return d + 'Z'
}

function stars(cx: number, cy: number, r: number, gap: number, outlined = false): string {
  const total = 5 * r * 2 + 4 * gap
  let d = ''
  for (let i = 0; i < 5; i++) d += starPath(cx - total / 2 + r + i * (2 * r + gap), cy, r)
  const stroke = outlined ? ` stroke="#FFFFFF" stroke-width="${fmt(r * 0.12)}" stroke-linejoin="round"` : ''
  return `<path d="${d}" fill="${STAR}"${stroke}/>`
}

interface TextOpts {
  size: number
  minSize?: number
  maxLines: number
  weight: number
  color: string
  spacing?: number
}

/**
 * Texto centrado con ajuste de línea y reducción automática de tamaño.
 * SVG no sabe partir líneas, así que estimamos el ancho de cada carácter
 * (Arial en negrita ronda 0,58 em de media) y repartimos las palabras.
 * `y` es la línea base de la primera línea.
 */
export function textBlock(text: string, cx: number, y: number, maxW: number, o: TextOpts) {
  const clean = text.trim()
  if (!clean) return { svg: '', bottom: y }
  const ratio = o.weight >= 700 ? 0.6 : 0.53
  let size = o.size
  const min = o.minSize ?? o.size
  let lines = wrap(clean, maxW, size, ratio, o.spacing)
  while ((lines.length > o.maxLines || lines.some((l) => width(l, size, ratio, o.spacing) > maxW)) && size > min) {
    size = Math.max(min, size * 0.92)
    lines = wrap(clean, maxW, size, ratio, o.spacing)
  }
  if (lines.length > o.maxLines) {
    lines = lines.slice(0, o.maxLines)
    lines[o.maxLines - 1] = lines[o.maxLines - 1].replace(/\s*\S*$/, '') + '…'
  }
  const lh = size * 1.15
  const tspans = lines
    .map((l, i) => `<tspan x="${fmt(cx)}" dy="${i === 0 ? 0 : fmt(lh)}">${escapeXml(l)}</tspan>`)
    .join('')
  const ls = o.spacing ? ` letter-spacing="${fmt(o.spacing)}"` : ''
  const svg = `<text x="${fmt(cx)}" y="${fmt(y)}" text-anchor="middle" font-size="${fmt(size)}" font-weight="${o.weight}" fill="${o.color}"${ls}>${tspans}</text>`
  return { svg, bottom: y + (lines.length - 1) * lh + size * 0.3 }
}

function width(s: string, size: number, ratio: number, spacing = 0) {
  return s.length * (size * ratio + spacing)
}

function wrap(text: string, maxW: number, size: number, ratio: number, spacing?: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w
    if (width(next, size, ratio, spacing) <= maxW || !cur) cur = next
    else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(s: string): string {
  return escapeXml(s).replace(/"/g, '&quot;')
}
