import { db, type Instellingen, type Oefening, type SetLog } from '../db'

/** Geschat 1RM volgens Epley. */
export function geschat1RM(gewicht: number, reps: number): number {
  if (reps <= 1) return gewicht
  return Math.round(gewicht * (1 + reps / 30) * 10) / 10
}

/** Beste geschatte 1RM van een reeks sets. */
export function beste1RM(sets: SetLog[]): number {
  return sets.reduce((max, s) => Math.max(max, geschat1RM(s.gewicht, s.reps)), 0)
}

export interface Suggestie {
  gewicht: number
  reps: number
  tekst: string
}

/**
 * Progressive overload:
 * haalde je vorige keer op je werkgewicht álle sets aan de bovenkant van je
 * rep-range, dan gaat het gewicht omhoog. Anders: zelfde gewicht, één rep meer.
 */
export function volgendeStap(
  oefening: Oefening,
  vorigeSets: SetLog[],
  inst: Instellingen,
): Suggestie | null {
  if (vorigeSets.length === 0) return null

  const werkgewicht = Math.max(...vorigeSets.map((s) => s.gewicht))
  const opWerkgewicht = vorigeSets.filter((s) => s.gewicht === werkgewicht)
  const allesBovenin = opWerkgewicht.every((s) => s.reps >= oefening.repMax)
  const stap = oefening.soort === 'compound' ? inst.stapCompound : inst.stapIsolatie

  if (allesBovenin) {
    const nieuw = Math.round((werkgewicht + stap) * 100) / 100
    return {
      gewicht: nieuw,
      reps: oefening.repMin,
      tekst: `Je haalde alle sets op ${werkgewicht} kg tot ${oefening.repMax} reps. Ga naar ${nieuw} kg en mik op ${oefening.repMin} reps.`,
    }
  }

  const laagsteReps = Math.min(...opWerkgewicht.map((s) => s.reps))
  const doelReps = Math.min(laagsteReps + 1, oefening.repMax)
  return {
    gewicht: werkgewicht,
    reps: doelReps,
    tekst: `Blijf op ${werkgewicht} kg en pak ${doelReps} reps per set (rep-range ${oefening.repMin}–${oefening.repMax}).`,
  }
}

/** Gemiddelde van de laatste 7 wegingen rond een datum (trendlijn). */
export function voortschrijdendGemiddelde(
  punten: { x: string; y: number }[],
  venster = 7,
): { x: string; y: number }[] {
  return punten.map((punt, i) => {
    const deel = punten.slice(Math.max(0, i - venster + 1), i + 1)
    const gem = deel.reduce((a, p) => a + p.y, 0) / deel.length
    return { x: punt.x, y: Math.round(gem * 10) / 10 }
  })
}

// ---- Vragen aan de database ------------------------------------------------

export interface Sessie {
  trainingId: number
  datum: string
  sets: SetLog[]
}

/** Alle sessies van één oefening, oudste eerst. */
export async function sessiesVanOefening(oefeningId: number): Promise<Sessie[]> {
  const sets = await db.sets.where('oefeningId').equals(oefeningId).toArray()
  const perTraining = new Map<number, SetLog[]>()
  for (const set of sets) {
    const lijst = perTraining.get(set.trainingId) ?? []
    lijst.push(set)
    perTraining.set(set.trainingId, lijst)
  }
  const trainingen = await db.trainingen.bulkGet([...perTraining.keys()])
  return trainingen
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map((t) => ({ trainingId: t.id!, datum: t.datum, sets: perTraining.get(t.id!) ?? [] }))
    .sort((a, b) => a.datum.localeCompare(b.datum))
}

/** De laatste sessie van een oefening, de huidige training niet meegeteld. */
export async function vorigeSessie(
  oefeningId: number,
  huidigeTrainingId?: number,
): Promise<Sessie | null> {
  const sessies = (await sessiesVanOefening(oefeningId)).filter(
    (s) => s.trainingId !== huidigeTrainingId,
  )
  return sessies.length ? sessies[sessies.length - 1] : null
}

/** Sets kort opschrijven, bijv. '3×8 @ 60 kg' of '8, 8, 7 @ 60 kg'. */
export function setsAlsTekst(sets: SetLog[]): string {
  if (sets.length === 0) return '—'
  const perGewicht = new Map<number, number[]>()
  for (const s of sets) {
    const lijst = perGewicht.get(s.gewicht) ?? []
    lijst.push(s.reps)
    perGewicht.set(s.gewicht, lijst)
  }
  return [...perGewicht.entries()]
    .map(([gewicht, reps]) => {
      const gelijk = reps.every((r) => r === reps[0])
      const repsTekst = gelijk ? `${reps.length}×${reps[0]}` : reps.join(', ')
      return `${repsTekst} @ ${gewicht} kg`
    })
    .join(' · ')
}
