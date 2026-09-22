import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function Kaart({
  titel,
  extra,
  children,
  className = '',
}: {
  titel?: string
  extra?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl bg-bos-licht p-4 ${className}`}>
      {(titel || extra) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {titel && <h2 className="text-base font-semibold text-cream">{titel}</h2>}
          {extra}
        </header>
      )}
      {children}
    </section>
  )
}

type KnopKleur = 'goud' | 'rand' | 'vlak' | 'rood'

const KNOP_STIJL: Record<KnopKleur, string> = {
  goud: 'bg-goud text-bos font-semibold active:bg-goud/80',
  rand: 'border border-bos-rand text-cream active:bg-bos-rand/40',
  vlak: 'bg-bos-rand/50 text-cream active:bg-bos-rand',
  rood: 'border border-red-400/60 text-red-300 active:bg-red-400/10',
}

export function Knop({
  kleur = 'goud',
  klein = false,
  className = '',
  ...rest
}: {
  kleur?: KnopKleur
  klein?: boolean
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`rounded-xl transition-colors disabled:opacity-40 ${
        klein ? 'px-3 py-2 text-sm' : 'min-h-[52px] px-4 py-3'
      } ${KNOP_STIJL[kleur]} ${className}`}
    />
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-sm text-cream/60">{children}</span>
}

export function Balk({
  waarde,
  doel,
  eenheid,
}: {
  waarde: number
  doel: number
  eenheid: string
}) {
  const gehaald = doel > 0 && waarde >= doel
  const percentage = doel > 0 ? Math.min(100, (waarde / doel) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className={gehaald ? 'font-semibold text-goud' : 'text-cream'}>
          {Math.round(waarde)} {eenheid}
        </span>
        <span className="text-cream/50">doel {doel}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-bos">
        <div
          className={`h-full rounded-full transition-all ${gehaald ? 'bg-goud' : 'bg-cream/40'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function Schaal({
  waarde,
  opties,
  onKies,
}: {
  waarde?: number
  opties: string[]
  onKies: (n: number) => void
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {opties.map((optie, i) => {
        const nummer = i + 1
        const actief = waarde === nummer
        return (
          <button
            key={nummer}
            type="button"
            onClick={() => onKies(nummer)}
            className={`flex h-14 flex-col items-center justify-center rounded-xl border text-xl transition-colors ${
              actief
                ? 'border-goud bg-goud/20'
                : 'border-bos-rand bg-bos active:bg-bos-rand/40'
            }`}
          >
            <span>{optie}</span>
            <span className="text-[10px] text-cream/50">{nummer}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Dialoog({
  titel,
  open,
  onSluit,
  children,
}: {
  titel: string
  open: boolean
  onSluit: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const vorige = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = vorige
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div
        className="absolute inset-0"
        onClick={onSluit}
        aria-hidden
      />
      <div className="relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-bos-licht p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{titel}</h3>
          <button
            type="button"
            onClick={onSluit}
            className="-mr-1 h-10 w-10 rounded-full text-2xl leading-none text-cream/60 active:bg-bos-rand/50"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Leeg({ tekst }: { tekst: string }) {
  return <p className="py-4 text-center text-sm text-cream/50">{tekst}</p>
}

export function Cijfer({
  label,
  waarde,
  sub,
}: {
  label: string
  waarde: ReactNode
  sub?: string
}) {
  return (
    <div className="rounded-xl bg-bos p-3">
      <div className="text-xs text-cream/60">{label}</div>
      <div className="text-xl font-semibold text-cream">{waarde}</div>
      {sub && <div className="text-xs text-cream/50">{sub}</div>}
    </div>
  )
}
