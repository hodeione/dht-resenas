/**
 * Validación de enlaces de reseñas de Google.
 *
 * Google ofrece varias formas de llegar al formulario de reseñas de un negocio:
 *  - El enlace "Pedir reseñas" del Perfil de Empresa: https://g.page/r/<id>/review
 *  - El formulario directo por Place ID: https://search.google.com/local/writereview?placeid=<id>
 *  - Enlaces cortos de Maps (maps.app.goo.gl/...), que abren la ficha del negocio.
 *
 * Los dos primeros abren directamente la ventana para escribir la reseña, que es
 * lo que más conversión da. Los enlaces de Maps funcionan, pero obligan al
 * cliente a buscar el botón "Escribir una reseña", así que se aceptan con aviso.
 */

export type LinkKind = 'review-direct' | 'maps-profile'

export type LinkCheck =
  | { ok: true; url: string; kind: LinkKind; note?: string }
  | { ok: false; error: string }

/** Los Place ID de Google empiezan casi siempre por "ChIJ" y solo usan caracteres base64url. */
const PLACE_ID_RE = /^(ChIJ|GhIJ|EiI|Ei)[A-Za-z0-9_-]{10,}$/

export function isPlaceId(value: string): boolean {
  return PLACE_ID_RE.test(value.trim())
}

export function buildReviewUrlFromPlaceId(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId.trim())}`
}

export function checkReviewLink(raw: string): LinkCheck {
  const value = raw.trim()
  if (!value) return { ok: false, error: 'Pega el enlace de reseñas de tu negocio.' }

  // Si pegan solo el Place ID, construimos el enlace por ellos.
  if (isPlaceId(value)) {
    return {
      ok: true,
      url: buildReviewUrlFromPlaceId(value),
      kind: 'review-direct',
      note: 'Hemos creado el enlace directo a partir de tu Place ID.',
    }
  }

  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
  } catch {
    return { ok: false, error: 'Eso no parece un enlace válido.' }
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false, error: 'El enlace debe empezar por https://' }
  }
  url.protocol = 'https:'
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const path = url.pathname

  // g.page/r/<id>/review  (enlace oficial de "Pedir reseñas")
  if (host === 'g.page') {
    if (/^\/r\/[^/]+\/review\/?$/.test(path)) return { ok: true, url: url.toString(), kind: 'review-direct' }
    if (/^\/r\/[^/]+\/?$/.test(path)) {
      url.pathname = path.replace(/\/?$/, '/review')
      return {
        ok: true,
        url: url.toString(),
        kind: 'review-direct',
        note: 'Hemos añadido "/review" al final para que se abra directamente el formulario.',
      }
    }
    return { ok: true, url: url.toString(), kind: 'maps-profile', note: maybeNote() }
  }

  // search.google.com/local/writereview?placeid=...
  if (host === 'search.google.com' && path.startsWith('/local/writereview')) {
    const pid = url.searchParams.get('placeid')
    if (!pid) return { ok: false, error: 'Al enlace le falta el parámetro "placeid".' }
    return { ok: true, url: buildReviewUrlFromPlaceId(pid), kind: 'review-direct' }
  }

  // search.google.com/local/reviews?placeid=... (lista de reseñas) -> lo convertimos al formulario
  if (host === 'search.google.com' && path.startsWith('/local/reviews')) {
    const pid = url.searchParams.get('placeid')
    if (pid) {
      return {
        ok: true,
        url: buildReviewUrlFromPlaceId(pid),
        kind: 'review-direct',
        note: 'Era el enlace a la lista de reseñas. Lo hemos cambiado por el del formulario para escribir una.',
      }
    }
  }

  // Enlaces de Google Maps: abren la ficha, no el formulario.
  const isMaps =
    host === 'maps.app.goo.gl' ||
    (host === 'goo.gl' && path.startsWith('/maps')) ||
    ((host === 'google.com' || /^google\.[a-z.]+$/.test(host) || host === 'maps.google.com') &&
      (path.startsWith('/maps') || host === 'maps.google.com'))
  if (isMaps) return { ok: true, url: url.toString(), kind: 'maps-profile', note: maybeNote() }

  return {
    ok: false,
    error: 'No es un enlace de Google. Usa el enlace de "Pedir reseñas" de tu Perfil de Empresa.',
  }
}

function maybeNote() {
  return 'Este enlace abre tu ficha en Google Maps, no el formulario de reseña. Funciona, pero convierte menos: mejor usa el enlace "Pedir reseñas".'
}
