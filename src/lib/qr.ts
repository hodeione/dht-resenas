import QRCode from 'qrcode'

export interface QrMatrix {
  size: number
  isDark: (row: number, col: number) => boolean
}

export function makeQr(text: string): QrMatrix {
  // Nivel "Q" (25 % de corrección): aguanta bien carteles algo gastados o
  // impresos en impresoras domésticas sin hacer el código demasiado denso.
  const qr = QRCode.create(text, { errorCorrectionLevel: 'Q' })
  const { size } = qr.modules
  return { size, isDark: (r, c) => !!qr.modules.get(r, c) }
}

/**
 * Devuelve un <path> SVG del QR dentro del cuadrado (x, y, side).
 * Une los módulos oscuros contiguos de cada fila en un solo rectángulo para
 * que el SVG sea ligero y se imprima nítido a cualquier tamaño.
 * Incluye la zona de silencio de 4 módulos que exige el estándar.
 */
export function qrPath(qr: QrMatrix, x: number, y: number, side: number, color: string): string {
  const quiet = 4
  const total = qr.size + quiet * 2
  const m = side / total
  let d = ''
  for (let r = 0; r < qr.size; r++) {
    let c = 0
    while (c < qr.size) {
      if (!qr.isDark(r, c)) {
        c++
        continue
      }
      const start = c
      while (c < qr.size && qr.isDark(r, c)) c++
      const px = x + (start + quiet) * m
      const py = y + (r + quiet) * m
      // +0.01 evita líneas finas blancas entre filas al rasterizar.
      d += `M${fmt(px)} ${fmt(py)}h${fmt((c - start) * m)}v${fmt(m + 0.01)}h${fmt(-(c - start) * m)}z`
    }
  }
  return `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(side)}" height="${fmt(side)}" fill="#FFFFFF"/><path d="${d}" fill="${color}"/>`
}

export function fmt(n: number): string {
  return Number(n.toFixed(3)).toString()
}
