import { useState, type ReactNode } from 'react'

export function SectionTitle({ n, title, children }: { n: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-xs tracking-[0.25em] text-acid">/{n}</div>
      <h2 className="font-display text-4xl leading-none tracking-wide sm:text-5xl">{title}</h2>
      {children && <p className="mt-2 max-w-2xl text-sm text-mute">{children}</p>}
    </div>
  )
}

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-soft/80">{children}</span>
      {hint && <span className="ml-2 text-xs text-mute">{hint}</span>}
    </label>
  )
}

export const inputCls =
  'w-full rounded-md border border-line bg-ink px-3 py-2.5 text-[15px] text-white placeholder:text-mute/60 ' +
  'transition-colors focus:border-acid focus:outline-none'

type BtnVariant = 'primary' | 'ghost'

export function Button({
  children,
  onClick,
  variant = 'ghost',
  disabled,
  href,
  title,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: BtnVariant
  disabled?: boolean
  href?: string
  title?: string
  type?: 'button' | 'submit'
}) {
  const cls =
    'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 font-mono text-xs uppercase tracking-[0.14em] ' +
    'transition-all disabled:cursor-not-allowed disabled:opacity-40 ' +
    (variant === 'primary'
      ? 'bg-acid text-ink hover:shadow-[0_0_24px_rgba(200,255,0,0.35)] enabled:active:translate-y-px'
      : 'border border-line text-soft hover:border-acid hover:text-acid')
  if (href && !disabled) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer" title={title}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  )
}

/** Botón que muestra "Copiado" un momento tras ejecutar la acción. */
export function CopyButton({ label, onCopy, variant = 'ghost', disabled }: { label: string; onCopy: () => Promise<boolean>; variant?: BtnVariant; disabled?: boolean }) {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle')
  return (
    <Button
      variant={variant}
      disabled={disabled}
      onClick={async () => {
        const ok = await onCopy()
        setState(ok ? 'ok' : 'err')
        setTimeout(() => setState('idle'), 1800)
      }}
    >
      {state === 'ok' ? '✓ Copiado' : state === 'err' ? 'No se pudo copiar' : label}
    </Button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-card p-5 sm:p-6 ${className}`}>{children}</div>
}
