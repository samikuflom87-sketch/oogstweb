import { db, type Dag, type Instellingen } from '../db'
import { laatsteZevenDagen, leesbaar, plusDagen, vandaagISO } from './datum'
import { voortschrijdendGemiddelde } from './gym'
import { som } from './geld'

export interface Signaal {
  toon: 'goed' | 'letop' | 'neutraal'
  tekst: string
}

export interface WeekSamenvatting {
  datums: string[]
  dagen: Dag[]
  slaap: number | null
  energie: number | null
  stress: number | null
  stemming: number | null
  checkins: number
  trainingen: number
  dagenOpKcal: number
  dagenOpEiwit: number
  gewichtNu: number | null
  gewichtVerschil: number | null
  gespaard: number
  binnen: number
  winsten: { datum: string; tekst: string }[]
  signalen: Signaal[]
}

function gemiddelde(waarden: (number | undefined)[]): number | null {
  const echte = waarden.filter((w): w is number => typeof w === 'number')
  if (echte.length === 0) return null
  return Math.round((echte.reduce((a, b) => a + b, 0) / echte.length) * 10) / 10
}

export async function maakWeekSamenvatting(
  inst: Instellingen,
  eind = vandaagISO(),
): Promise<WeekSamenvatting> {
  const datums = laatsteZevenDagen(eind)
  const start = datums[0]

  const dagen = (await db.dagen.where('datum').between(start, eind, true, true).toArray())
    .sort((a, b) => a.datum.localeCompare(b.datum))
  const trainingen = await db.trainingen.where('datum').between(start, eind, true, true).count()
  const stortingen = await db.stortingen.where('datum').between(start, eind, true, true).toArray()
  const inkomsten = await db.inkomsten.where('datum').between(start, eind, true, true).toArray()

  const wegingenAlles = (await db.wegingen.toArray()).sort((a, b) =>
    a.datum.localeCompare(b.datum),
  )
  const trend = voortschrijdendGemiddelde(
    wegingenAlles.map((w) => ({ x: w.datum, y: w.kg })),
  )
  const trendTot = (grens: string) => {
    const eerder = trend.filter((p) => p.x <= grens)
    return eerder.length ? eerder[eerder.length - 1].y : null
  }
  const gewichtNu = trendTot(eind)
  const gewichtVorigeWeek = trendTot(plusDagen(start, -1))
  const gewichtVerschil =
    gewichtNu !== null && gewichtVorigeWeek !== null
      ? Math.round((gewichtNu - gewichtVorigeWeek) * 10) / 10
      : null

  const dagenOpKcal = dagen.filter((d) => d.kcal >= inst.kcalDoel).length
  const dagenOpEiwit = dagen.filter((d) => d.eiwit >= inst.eiwitDoel).length
  const checkins = dagen.filter((d) => d.checkin).length

  const samenvatting: WeekSamenvatting = {
    datums,
    dagen,
    slaap: gemiddelde(dagen.map((d) => d.slaap)),
    energie: gemiddelde(dagen.map((d) => d.energie)),
    stress: gemiddelde(dagen.map((d) => d.stress)),
    stemming: gemiddelde(dagen.map((d) => d.stemming)),
    checkins,
    trainingen,
    dagenOpKcal,
    dagenOpEiwit,
    gewichtNu,
    gewichtVerschil,
    gespaard: som(stortingen.map((s) => s.bedrag)),
    binnen: som(inkomsten.map((i) => i.bedrag)),
    winsten: dagen
      .filter((d) => d.winst && d.winst.trim() !== '')
      .map((d) => ({ datum: leesbaar(d.datum), tekst: d.winst!.trim() })),
    signalen: [],
  }

  samenvatting.signalen = maakSignalen(samenvatting, dagen, inst)
  return samenvatting
}

/** Langste reeks opeenvolgende dagen waarop `test` waar is. */
function langsteReeks(dagen: Dag[], test: (d: Dag) => boolean): number {
  let langste = 0
  let huidig = 0
  for (const dag of dagen) {
    huidig = test(dag) ? huidig + 1 : 0
    langste = Math.max(langste, huidig)
  }
  return langste
}

function maakSignalen(s: WeekSamenvatting, dagen: Dag[], inst: Instellingen): Signaal[] {
  const signalen: Signaal[] = []

  const stressReeks = langsteReeks(dagen, (d) => (d.stress ?? 0) >= 4)
  if (stressReeks >= 3) {
    signalen.push({
      toon: 'letop',
      tekst: `Je stress was ${stressReeks} dagen op rij 4 of hoger. Plan deze week iets in dat je hoofd leegmaakt.`,
    })
  }

  if (s.slaap !== null && s.slaap < 7) {
    signalen.push({
      toon: 'letop',
      tekst: `Je sliep gemiddeld ${s.slaap} uur. Onder de 7 uur merk je dat in de gym én in je hoofd.`,
    })
  } else if (s.slaap !== null && s.slaap >= 7.5) {
    signalen.push({ toon: 'goed', tekst: `Sterke slaapweek: gemiddeld ${s.slaap} uur.` })
  }

  if (s.dagenOpKcal <= 3) {
    signalen.push({
      toon: 'letop',
      tekst: `Je haalde je calorieën maar ${s.dagenOpKcal} van de 7 dagen (doel ${inst.kcalDoel} kcal). Zet je calorie-boosts vaker in.`,
    })
  } else if (s.dagenOpKcal >= 6) {
    signalen.push({
      toon: 'goed',
      tekst: `${s.dagenOpKcal} van de 7 dagen op je caloriedoel. Zo bouw je.`,
    })
  }

  if (s.dagenOpEiwit <= 3) {
    signalen.push({
      toon: 'letop',
      tekst: `Eiwit was ${s.dagenOpEiwit} van de 7 dagen op doel (${inst.eiwitDoel} g). Pak er een shake bij.`,
    })
  }

  if (s.trainingen === 0) {
    signalen.push({ toon: 'letop', tekst: 'Deze week nog geen training gelogd.' })
  } else if (s.trainingen >= 4) {
    signalen.push({ toon: 'goed', tekst: `${s.trainingen} trainingen deze week. Netjes.` })
  } else {
    signalen.push({ toon: 'neutraal', tekst: `${s.trainingen} trainingen deze week.` })
  }

  if (s.gewichtVerschil !== null) {
    const richting = s.gewichtVerschil > 0 ? 'omhoog' : s.gewichtVerschil < 0 ? 'omlaag' : 'gelijk'
    const bedrag = Math.abs(s.gewichtVerschil)
    signalen.push({
      toon: 'neutraal',
      tekst:
        richting === 'gelijk'
          ? `Je gewichtstrend staat stil op ${s.gewichtNu} kg.`
          : `Je gewichtstrend ging ${bedrag} kg ${richting} naar ${s.gewichtNu} kg (streef: ${inst.streefgewicht} kg).`,
    })
  }

  if (s.checkins <= 4) {
    signalen.push({
      toon: 'letop',
      tekst: `Je vulde ${s.checkins} van de 7 check-ins in. Eén minuut per dag, meer is het niet.`,
    })
  }

  if (s.energie !== null && s.energie <= 2.5) {
    signalen.push({
      toon: 'letop',
      tekst: `Je energie zat gemiddeld op ${s.energie} uit 5. Kijk naar slaap en eten voor je meer volume in de gym gooit.`,
    })
  }

  if (s.gespaard > 0) {
    signalen.push({ toon: 'goed', tekst: `Je zette deze week geld opzij in je spaarpotten.` })
  }

  return signalen
}

/** Streak: aantal dagen op rij tot en met vandaag met een check-in. */
export async function berekenStreak(eind = vandaagISO()): Promise<number> {
  let streak = 0
  let datum = eind
  // de dag van vandaag telt alleen mee als hij al ingevuld is
  for (let i = 0; i < 400; i++) {
    const dag = await db.dagen.get(datum)
    if (dag?.checkin) {
      streak++
      datum = plusDagen(datum, -1)
    } else if (i === 0) {
      datum = plusDagen(datum, -1)
    } else {
      break
    }
  }
  return streak
}
