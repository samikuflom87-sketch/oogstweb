import type { Instellingen } from '../db'

const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
})

export function euro(bedrag: number): string {
  return euroFormatter.format(bedrag)
}

export interface Verdeling {
  btw: number
  ib: number
  apart: number
  vrij: number
}

/**
 * Rekent uit hoeveel van een inkomst apart gezet moet worden.
 * Bij KOR reken je geen btw, dan is het btw-deel 0.
 * Inkomstenbelasting reserveer je over het bedrag exclusief btw.
 */
export function verdeelInkomst(
  bedrag: number,
  apartZetten: boolean,
  inst: Instellingen,
): Verdeling {
  if (!apartZetten) return { btw: 0, ib: 0, apart: 0, vrij: bedrag }

  const p = inst.btwPercentage
  const btw = inst.korActief
    ? 0
    : inst.bedragInclusiefBtw
      ? (bedrag * p) / (100 + p)
      : (bedrag * p) / 100

  const exclBtw = inst.bedragInclusiefBtw ? bedrag - btw : bedrag
  const ib = (exclBtw * inst.ibPercentage) / 100
  const apart = btw + ib
  return {
    btw: afronden(btw),
    ib: afronden(ib),
    apart: afronden(apart),
    vrij: afronden(bedrag - apart),
  }
}

export function afronden(n: number): number {
  return Math.round(n * 100) / 100
}

export function som(getallen: number[]): number {
  return afronden(getallen.reduce((a, b) => a + b, 0))
}
