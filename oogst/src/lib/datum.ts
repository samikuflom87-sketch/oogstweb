/** Datumhulpjes. Alle datums zijn strings in 'YYYY-MM-DD' (lokale tijd). */

export function naarISO(d: Date): string {
  const jaar = d.getFullYear()
  const maand = String(d.getMonth() + 1).padStart(2, '0')
  const dag = String(d.getDate()).padStart(2, '0')
  return `${jaar}-${maand}-${dag}`
}

export function vandaagISO(): string {
  return naarISO(new Date())
}

export function vanISO(iso: string): Date {
  const [j, m, d] = iso.split('-').map(Number)
  return new Date(j, m - 1, d)
}

export function plusDagen(iso: string, aantal: number): string {
  const d = vanISO(iso)
  d.setDate(d.getDate() + aantal)
  return naarISO(d)
}

/** Aantal hele dagen tussen twee datums (b - a). */
export function dagenTussen(a: string, b: string): number {
  const ms = vanISO(b).getTime() - vanISO(a).getTime()
  return Math.round(ms / 86400000)
}

/** De laatste 7 datums, oudste eerst, eindigend op `eind` (standaard vandaag). */
export function laatsteZevenDagen(eind = vandaagISO()): string[] {
  return [...Array(7)].map((_, i) => plusDagen(eind, i - 6))
}

export function isZondag(iso = vandaagISO()): boolean {
  return vanISO(iso).getDay() === 0
}

const DAGNAMEN = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
const MAANDEN = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

export function kortDagLabel(iso: string): string {
  return DAGNAMEN[vanISO(iso).getDay()]
}

export function leesbaar(iso: string): string {
  const d = vanISO(iso)
  return `${DAGNAMEN[d.getDay()]} ${d.getDate()} ${MAANDEN[d.getMonth()].slice(0, 3)}`
}

export function leesbaarLang(iso: string): string {
  const d = vanISO(iso)
  return `${d.getDate()} ${MAANDEN[d.getMonth()]} ${d.getFullYear()}`
}

export function maandNaam(maand: number): string {
  return MAANDEN[maand]
}

/** ISO-weeknummer, bijv. '2026-W38'. */
export function weekSleutel(iso: string): string {
  const d = vanISO(iso)
  // donderdag van deze week bepaalt het jaar en weeknummer (ISO 8601)
  const donderdag = new Date(d)
  donderdag.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3)
  const eersteDonderdag = new Date(donderdag.getFullYear(), 0, 4)
  eersteDonderdag.setDate(
    eersteDonderdag.getDate() - ((eersteDonderdag.getDay() + 6) % 7) + 3,
  )
  const week =
    1 + Math.round((donderdag.getTime() - eersteDonderdag.getTime()) / (7 * 86400000))
  return `${donderdag.getFullYear()}-W${String(week).padStart(2, '0')}`
}

/** 'YYYY-MM' van een datum. */
export function maandSleutel(iso: string): string {
  return iso.slice(0, 7)
}

export function maandLabel(sleutel: string): string {
  const [jaar, maand] = sleutel.split('-').map(Number)
  return `${MAANDEN[maand - 1]} ${jaar}`
}
