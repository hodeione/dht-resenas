import { describe, expect, it } from 'vitest'
import { checkReviewLink } from './reviewLink'
import { fillTemplate, channelLink } from './messages'
import { buildPoster, FORMATS } from './posters'
import { DEFAULT_CONFIG, bestInk } from './config'
import { makeQr } from './qr'
import { buildSignature } from './signature'

describe('checkReviewLink', () => {
  it('acepta el enlace oficial g.page/r/.../review', () => {
    const r = checkReviewLink('https://g.page/r/CbDxF3abc123XYZEAI/review')
    expect(r).toMatchObject({ ok: true, kind: 'review-direct' })
  })
  it('añade /review a g.page/r/<id>', () => {
    const r = checkReviewLink('g.page/r/CbDxF3abc123XYZEAI')
    expect(r.ok && r.url).toBe('https://g.page/r/CbDxF3abc123XYZEAI/review')
  })
  it('construye el enlace desde un Place ID', () => {
    const r = checkReviewLink('ChIJN1t_tDeuEmsRUsoyG83frY4')
    expect(r.ok && r.url).toBe('https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4')
  })
  it('acepta writereview y exige placeid', () => {
    expect(checkReviewLink('https://search.google.com/local/writereview?placeid=ChIJabcdefghijk').ok).toBe(true)
    expect(checkReviewLink('https://search.google.com/local/writereview').ok).toBe(false)
  })
  it('convierte la lista de reseñas en el formulario', () => {
    const r = checkReviewLink('https://search.google.com/local/reviews?placeid=ChIJabcdefghijk')
    expect(r.ok && r.url).toContain('/local/writereview?placeid=ChIJabcdefghijk')
  })
  it('acepta Maps con aviso', () => {
    const r = checkReviewLink('https://maps.app.goo.gl/AbCdEf123')
    expect(r).toMatchObject({ ok: true, kind: 'maps-profile' })
    expect(checkReviewLink('https://www.google.es/maps/place/Bar+Pepe').ok).toBe(true)
  })
  it('rechaza enlaces ajenos a Google o vacíos', () => {
    expect(checkReviewLink('https://evil.com/g.page/r/x/review').ok).toBe(false)
    expect(checkReviewLink('https://g.page.evil.com/r/x/review').ok).toBe(false)
    expect(checkReviewLink('javascript:alert(1)').ok).toBe(false)
    expect(checkReviewLink('   ').ok).toBe(false)
  })
})

describe('fillTemplate', () => {
  const base = { negocio: 'Bar Pepe', enlace: 'https://g.page/r/x/review' }
  it('incluye el nombre del cliente con su prefijo', () => {
    expect(fillTemplate('¡Hola{ cliente}!', { ...base, cliente: 'Ana' })).toBe('¡Hola Ana!')
    expect(fillTemplate('Gracias{, cliente}.', { ...base, cliente: 'Ana' })).toBe('Gracias, Ana.')
  })
  it('elimina limpiamente el cliente vacío', () => {
    expect(fillTemplate('¡Hola{ cliente}! {negocio} {enlace}', { ...base, cliente: '' })).toBe('¡Hola! Bar Pepe https://g.page/r/x/review')
  })
  it('codifica el texto en el enlace de WhatsApp', () => {
    expect(channelLink('whatsapp', 'a b&c', '', '+34 600 11 22 33')).toBe('https://wa.me/34600112233?text=a%20b%26c')
  })
})

describe('posters', () => {
  const cfg = { ...DEFAULT_CONFIG, businessName: 'Café <Luna> & Co', logo: null }
  for (const f of FORMATS) {
    it(`genera SVG válido para ${f.id}`, () => {
      const svg = buildPoster(f.id, cfg, 'https://g.page/r/abc/review')
      expect(svg.startsWith('<svg')).toBe(true)
      expect(svg).toContain(`viewBox="0 0 ${f.w} ${f.h}"`)
      expect(svg).not.toContain('<Luna>')
      const doc = new DOMParserShim(svg)
      expect(doc.ok).toBe(true)
    })
  }
  it('el QR codifica el enlace (tamaño coherente)', () => {
    expect(makeQr('https://g.page/r/abc/review').size).toBeGreaterThanOrEqual(21)
  })
})

describe('utilidades', () => {
  it('elige tinta legible', () => {
    expect(bestInk('#C8FF00')).toBe('#0B0B0D')
    expect(bestInk('#111827')).toBe('#FFFFFF')
  })
  it('escapa la firma', () => {
    const s = buildSignature({ businessName: '<b>x</b>', url: 'https://g.page/r/a"b/review', primary: '#000', ink: '#fff', label: 'Déjanos tu reseña' })
    expect(s.html).not.toContain('<b>x</b>')
    expect(s.html).toContain('a&quot;b')
  })
})

/** Comprobación mínima de XML bien formado sin depender de un DOM. */
class DOMParserShim {
  ok: boolean
  constructor(xml: string) {
    const stack: string[] = []
    const re = /<\/?([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g
    let m: RegExpExecArray | null
    let ok = true
    while ((m = re.exec(xml))) {
      const [full, name, , self] = m
      if (full.startsWith('</')) {
        if (stack.pop() !== name) ok = false
      } else if (!self) stack.push(name)
    }
    this.ok = ok && stack.length === 0
  }
}
