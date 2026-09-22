import { db, STANDAARD_INSTELLINGEN, bewaarInstellingen, type Oefening } from '../db'
import { plusDagen, vandaagISO } from './datum'

/** Oefeningenbibliotheek waarmee de app start. Je past hem zelf aan in het Gym-tabblad. */
const BASIS_OEFENINGEN: Omit<Oefening, 'id'>[] = [
  { naam: 'Bankdrukken', dag: 'Push', soort: 'compound', repMin: 5, repMax: 8 },
  { naam: 'Schouderpers (dumbbell)', dag: 'Push', soort: 'compound', repMin: 8, repMax: 12 },
  { naam: 'Triceps pushdown', dag: 'Push', soort: 'isolatie', repMin: 10, repMax: 15 },
  { naam: 'Pull-up', dag: 'Pull', soort: 'compound', repMin: 5, repMax: 10 },
  { naam: 'Barbell row', dag: 'Pull', soort: 'compound', repMin: 6, repMax: 10 },
  { naam: 'Biceps curl', dag: 'Pull', soort: 'isolatie', repMin: 10, repMax: 15 },
  { naam: 'Squat', dag: 'Legs', soort: 'compound', repMin: 5, repMax: 8 },
  { naam: 'Romanian deadlift', dag: 'Legs', soort: 'compound', repMin: 6, repMax: 10 },
  { naam: 'Leg curl', dag: 'Legs', soort: 'isolatie', repMin: 10, repMax: 15 },
  { naam: 'Kuiten', dag: 'Legs', soort: 'isolatie', repMin: 12, repMax: 20 },
]

const BASIS_SNACKS = [
  { naam: 'Shake: havermout + pindakaas', kcal: 650, eiwit: 35 },
  { naam: 'Volle kwark + honing + noten', kcal: 480, eiwit: 40 },
  { naam: 'Twee boterhammen pindakaas', kcal: 420, eiwit: 14 },
  { naam: 'Handje amandelen', kcal: 300, eiwit: 10 },
  { naam: 'Glas volle melk', kcal: 160, eiwit: 8 },
]

const BASIS_BRONNEN = [
  { naam: 'Agrio', apartZetten: false },
  { naam: 'OogstWeb', apartZetten: true },
]

/** Vult een lege database met de basis: instellingen, oefeningen, snacks, bronnen. */
export async function zorgVoorBasis() {
  const inst = await db.instellingen.get(1)
  if (!inst) await db.instellingen.put(STANDAARD_INSTELLINGEN)
  if ((await db.oefeningen.count()) === 0) await db.oefeningen.bulkAdd(BASIS_OEFENINGEN)
  if ((await db.snacks.count()) === 0) await db.snacks.bulkAdd(BASIS_SNACKS)
  if ((await db.bronnen.count()) === 0) await db.bronnen.bulkAdd(BASIS_BRONNEN)
}

/** Voorbeelddata zodat je bij de eerste start meteen ziet hoe alles werkt. */
export async function vulVoorbeelddata() {
  await zorgVoorBasis()
  const vandaag = vandaagISO()

  // Twee weken check-ins
  const winsten = [
    'Eerste klant gebeld zonder uit te stellen',
    'Toch getraind terwijl ik geen zin had',
    'Offerte verstuurd',
    'Op tijd naar bed',
    'Niks gesnoept, wel 3000 kcal gehaald',
    'Twee uur aan OogstWeb gewerkt',
    'Met vrienden afgesproken',
  ]
  for (let i = 13; i >= 1; i--) {
    const datum = plusDagen(vandaag, -i)
    const wissel = i % 7
    await db.dagen.put({
      datum,
      slaap: 6 + ((i * 3) % 5) * 0.5,
      energie: 2 + (i % 4),
      stress: 2 + ((i + 1) % 4),
      stemming: 2 + ((i + 2) % 4),
      winst: winsten[wissel],
      kcal: 2400 + ((i * 137) % 900),
      eiwit: 110 + ((i * 17) % 70),
      checkin: true,
    })
  }

  // Wegingen: elke zondag + een paar losse
  for (let i = 14; i >= 0; i -= 2) {
    await db.wegingen.put({
      datum: plusDagen(vandaag, -i),
      kg: Math.round((72 + (14 - i) * 0.12) * 10) / 10,
    })
  }

  // Drie trainingen met sets
  const oefeningen = await db.oefeningen.toArray()
  const perDag: Record<string, typeof oefeningen> = {}
  for (const o of oefeningen) (perDag[o.dag] ??= []).push(o)

  const schema: { datum: string; dag: string; gewichten: number[] }[] = [
    { datum: plusDagen(vandaag, -8), dag: 'Push', gewichten: [60, 20, 25] },
    { datum: plusDagen(vandaag, -5), dag: 'Pull', gewichten: [0, 50, 12] },
    { datum: plusDagen(vandaag, -3), dag: 'Legs', gewichten: [80, 70, 35, 60] },
    { datum: plusDagen(vandaag, -1), dag: 'Push', gewichten: [62.5, 22, 25] },
  ]
  for (const blok of schema) {
    const id = await db.trainingen.add({ datum: blok.datum, dag: blok.dag })
    const lijst = perDag[blok.dag] ?? []
    for (let i = 0; i < lijst.length; i++) {
      const oefening = lijst[i]
      const gewicht = blok.gewichten[i] ?? 20
      for (let set = 0; set < 3; set++) {
        await db.sets.add({
          trainingId: id as number,
          oefeningId: oefening.id!,
          gewicht,
          reps: oefening.repMax - (set === 2 ? 1 : 0),
        })
      }
    }
  }

  // Geld
  await db.inkomsten.bulkAdd([
    { datum: plusDagen(vandaag, -18), bedrag: 1450, bron: 'Agrio', btw: 0, ib: 0 },
    { datum: plusDagen(vandaag, -11), bedrag: 750, bron: 'OogstWeb', btw: 130.17, ib: 123.97 },
    { datum: plusDagen(vandaag, -4), bedrag: 400, bron: 'OogstWeb', btw: 69.42, ib: 66.12 },
  ])
  await db.uitgaven.bulkAdd([
    { datum: plusDagen(vandaag, -9), bedrag: 62.5, categorie: 'Boodschappen' },
    { datum: plusDagen(vandaag, -6), bedrag: 29.95, categorie: 'Sportschool' },
    { datum: plusDagen(vandaag, -2), bedrag: 18, categorie: 'Hosting' },
  ])
  const potId = (await db.potten.add({ naam: 'Samenwonen', doel: 5000 })) as number
  const buffer = (await db.potten.add({ naam: 'Buffer', doel: 1500 })) as number
  await db.stortingen.bulkAdd([
    { potId, datum: plusDagen(vandaag, -18), bedrag: 300 },
    { potId, datum: plusDagen(vandaag, -11), bedrag: 250 },
    { potId, datum: plusDagen(vandaag, -4), bedrag: 150 },
    { potId: buffer, datum: plusDagen(vandaag, -11), bedrag: 100 },
  ])

  await db.deadlines.bulkAdd([
    { titel: 'BPV-verslag inleveren', datum: plusDagen(vandaag, 21) },
    { titel: 'Btw-aangifte kwartaal', datum: plusDagen(vandaag, 45) },
  ])

  await bewaarInstellingen({ voorbeelddata: true })
}

/**
 * Wist alle voorbeelddata en logs. Je instellingen, oefeningenbibliotheek,
 * calorie-boosts en inkomstenbronnen blijven staan, zodat je meteen verder kunt.
 */
export async function wisVoorbeelddata() {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all([
      db.dagen.clear(),
      db.trainingen.clear(),
      db.sets.clear(),
      db.wegingen.clear(),
      db.inkomsten.clear(),
      db.uitgaven.clear(),
      db.potten.clear(),
      db.stortingen.clear(),
      db.belastingbetalingen.clear(),
      db.weekreviews.clear(),
      db.deadlines.clear(),
    ])
  })
  await bewaarInstellingen({ voorbeelddata: false })
}

/** Eerste start: basis neerzetten en de app vullen met voorbeelddata. */
export async function startOp() {
  const bestaand = await db.instellingen.get(1)
  if (bestaand) {
    await zorgVoorBasis()
    return
  }
  await vulVoorbeelddata()
}
