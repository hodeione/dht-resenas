import { DEFAULT_CONFIG, type KitConfig } from './config'

const KEY = 'dht-resenas:v1'

/** Todo se guarda solo en este navegador: nada sale del dispositivo del usuario. */
export function loadConfig(): KitConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(cfg: KitConfig) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cfg))
  } catch {
    // Sin almacenamiento (modo privado o cuota llena): la app funciona igual.
  }
}

export function clearConfig() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nada que hacer */
  }
}

/** Reduce el logo a un PNG de 600 px como máximo para que pese poco y quepa en el almacenamiento. */
export function readLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('El logo debe ser una imagen (PNG, JPG, SVG o WebP).'))
    if (file.size > 8 * 1024 * 1024) return reject(new Error('La imagen pesa más de 8 MB.'))
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const max = 600
      const w0 = img.naturalWidth || 600
      const h0 = img.naturalHeight || 600
      const scale = Math.min(1, max / Math.max(w0, h0))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(w0 * scale))
      canvas.height = Math.max(1, Math.round(h0 * scale))
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen.'))
    }
    img.src = url
  })
}
