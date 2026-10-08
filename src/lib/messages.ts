export type Channel = 'whatsapp' | 'sms' | 'email'

export interface MessageTemplate {
  id: string
  channel: Channel
  name: string
  subject?: string
  body: string
}

/**
 * Plantillas con variables:
 *   {cliente}  nombre del cliente (opcional, se elimina limpiamente si se deja vacío)
 *   {negocio}  nombre del negocio
 *   {enlace}   enlace de reseñas
 *
 * Respetan las políticas de Google: piden la opinión sin ofrecer nada a cambio
 * y sin pedir solo valoraciones positivas.
 */
export const TEMPLATES: MessageTemplate[] = [
  {
    id: 'wa-cercano',
    channel: 'whatsapp',
    name: 'WhatsApp · Cercano',
    body:
      '¡Hola{ cliente}! 😊 Muchas gracias por confiar en {negocio}.\n\n' +
      'Si tienes un minuto, nos ayudaría muchísimo que contaras tu experiencia en Google:\n{enlace}\n\n' +
      '¡Gracias de corazón!',
  },
  {
    id: 'wa-profesional',
    channel: 'whatsapp',
    name: 'WhatsApp · Profesional',
    body:
      'Hola{ cliente}, le escribimos desde {negocio} para agradecerle su confianza.\n\n' +
      'Su opinión nos ayuda a mejorar y a que otras personas nos conozcan. Puede dejarla aquí en menos de un minuto:\n{enlace}\n\n' +
      'Un saludo cordial.',
  },
  {
    id: 'sms',
    channel: 'sms',
    name: 'SMS · Corto',
    body: 'Gracias por elegir {negocio}{, cliente}. ¿Nos cuentas qué tal en Google? {enlace}',
  },
  {
    id: 'email',
    channel: 'email',
    name: 'Email · Tras la visita',
    subject: '¿Qué tal tu experiencia en {negocio}?',
    body:
      'Hola{ cliente}:\n\n' +
      'Gracias por visitarnos. En {negocio} cuidamos cada detalle y nos encantaría saber cómo te ha ido.\n\n' +
      '¿Nos dejas tu opinión en Google? Solo te llevará un minuto:\n{enlace}\n\n' +
      'Leemos y respondemos todas las reseñas, también las que nos ayudan a mejorar.\n\n' +
      'Un abrazo,\nEl equipo de {negocio}',
  },
]

/**
 * Sustituye variables. Para {cliente} admite un prefijo pegado dentro de las
 * llaves ("{ cliente}" o "{, cliente}") que solo aparece si hay nombre, así
 * la frase queda natural en los dos casos.
 */
export function fillTemplate(tpl: string, vars: { cliente: string; negocio: string; enlace: string }): string {
  return tpl
    .replace(/\{([^{}a-z]*)cliente\}/g, (_, prefix: string) => (vars.cliente.trim() ? `${prefix}${vars.cliente.trim()}` : ''))
    .replace(/\{negocio\}/g, vars.negocio.trim() || 'nuestro negocio')
    .replace(/\{enlace\}/g, vars.enlace)
}

export function channelLink(channel: Channel, text: string, subject = '', phone = ''): string {
  const digits = phone.replace(/[^\d]/g, '')
  switch (channel) {
    case 'whatsapp':
      return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    case 'sms':
      return `sms:${digits}?&body=${encodeURIComponent(text)}`
    case 'email':
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
  }
}
