export type Lang = 'es' | 'en' | 'ca' | 'eu' | 'gl'

export interface KitConfig {
  businessName: string
  reviewInput: string
  lang: Lang
  headline: string
  subtitle: string
  instruction: string
  thanks: string
  primary: string
  ink: string
  logo: string | null // data URL
}

export interface PosterTexts {
  headline: string
  subtitle: string
  instruction: string
  thanks: string
}

export const LANG_LABELS: Record<Lang, string> = {
  es: 'Castellano',
  en: 'English',
  ca: 'Català',
  eu: 'Euskara',
  gl: 'Galego',
}

export const PRESETS: Record<Lang, PosterTexts> = {
  es: {
    headline: '¿Te ha gustado?',
    subtitle: 'Déjanos tu opinión en Google',
    instruction: 'Escanea el código con la cámara de tu móvil',
    thanks: '¡Gracias por ayudarnos a crecer!',
  },
  en: {
    headline: 'Enjoyed your visit?',
    subtitle: 'Leave us a review on Google',
    instruction: 'Scan the code with your phone camera',
    thanks: 'Thank you for helping us grow!',
  },
  ca: {
    headline: "T'ha agradat?",
    subtitle: "Deixa'ns la teva opinió a Google",
    instruction: 'Escaneja el codi amb la càmera del mòbil',
    thanks: 'Gràcies per ajudar-nos a créixer!',
  },
  eu: {
    headline: 'Gustatu zaizu?',
    subtitle: 'Utzi zure iritzia Google-n',
    instruction: 'Eskaneatu kodea mugikorraren kamerarekin',
    thanks: 'Eskerrik asko hazten laguntzeagatik!',
  },
  gl: {
    headline: 'Gustouche?',
    subtitle: 'Déixanos a túa opinión en Google',
    instruction: 'Escanea o código coa cámara do móbil',
    thanks: 'Grazas por axudarnos a medrar!',
  },
}

export const COLOR_PRESETS = [
  { name: 'Ácido', primary: '#C8FF00', ink: '#0B0B0D' },
  { name: 'Google', primary: '#1A73E8', ink: '#FFFFFF' },
  { name: 'Terracota', primary: '#C8553D', ink: '#FFFFFF' },
  { name: 'Bosque', primary: '#2D6A4F', ink: '#FFFFFF' },
  { name: 'Noche', primary: '#111827', ink: '#FFFFFF' },
  { name: 'Rosa', primary: '#E85D9C', ink: '#FFFFFF' },
  { name: 'Mostaza', primary: '#E9B949', ink: '#1F1F1F' },
]

export const DEFAULT_CONFIG: KitConfig = {
  businessName: '',
  reviewInput: '',
  lang: 'es',
  ...PRESETS.es,
  primary: '#1A73E8',
  ink: '#FFFFFF',
  logo: null,
}

/** Devuelve blanco o negro según cuál contraste mejor con el color dado. */
export function bestInk(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#FFFFFF'
  const n = parseInt(m[1], 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
  return (1.05) / (L + 0.05) > (L + 0.05) / 0.05 ? '#FFFFFF' : '#0B0B0D'
}
