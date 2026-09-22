import Dexie, { type Table } from 'dexie'

// ---- Types -----------------------------------------------------------------

export interface Dag {
  datum: string // 'YYYY-MM-DD', primaire sleutel
  slaap?: number
  energie?: number
  stress?: number
  stemming?: number
  winst?: string
  kcal: number
  eiwit: number
  checkin: boolean // is de check-in ingevuld? (telt mee voor de streak)
}

export interface Snack {
  id?: number
  naam: string
  kcal: number
  eiwit: number
}

export type Soort = 'compound' | 'isolatie'

export interface Oefening {
  id?: number
  naam: string
  dag: string // trainingsdag: Upper, Lower, Push, Pull, Legs, ...
  soort: Soort
  repMin: number
  repMax: number
}

export interface Training {
  id?: number
  datum: string
  dag: string
  klaar?: boolean // afgesloten; blijft in je geschiedenis staan
}

export interface SetLog {
  id?: number
  trainingId: number
  oefeningId: number
  gewicht: number
  reps: number
}

export interface Weging {
  datum: string // primaire sleutel
  kg: number
}

export interface Bron {
  id?: number
  naam: string
  apartZetten: boolean // btw + inkomstenbelasting reserveren
}

export interface Inkomst {
  id?: number
  datum: string
  bedrag: number
  bron: string
  btw: number // apart gezet voor btw
  ib: number // apart gezet voor inkomstenbelasting
}

export interface Uitgave {
  id?: number
  datum: string
  bedrag: number
  categorie: string
}

export interface Pot {
  id?: number
  naam: string
  doel: number
}

export interface Storting {
  id?: number
  potId: number
  datum: string
  bedrag: number
}

export interface Belastingbetaling {
  id?: number
  datum: string
  bedrag: number
  omschrijving: string
}

export interface Weekreview {
  week: string // 'YYYY-Www'
  goed: string
  zwaar: string
  focus: string
}

export interface Deadline {
  id?: number
  titel: string
  datum: string
}

export interface Instellingen {
  id: number // altijd 1
  kcalDoel: number
  eiwitDoel: number
  streefgewicht: number
  korActief: boolean // KOR = geen btw afdragen
  btwPercentage: number
  bedragInclusiefBtw: boolean
  ibPercentage: number
  repMinStandaard: number
  repMaxStandaard: number
  stapCompound: number
  stapIsolatie: number
  voorbeelddata: boolean
}

export const STANDAARD_INSTELLINGEN: Instellingen = {
  id: 1,
  kcalDoel: 3000,
  eiwitDoel: 153,
  streefgewicht: 80,
  korActief: false,
  btwPercentage: 21,
  bedragInclusiefBtw: true,
  ibPercentage: 20,
  repMinStandaard: 6,
  repMaxStandaard: 10,
  stapCompound: 2.5,
  stapIsolatie: 1,
  voorbeelddata: false,
}

// ---- Database --------------------------------------------------------------

export class OogstDB extends Dexie {
  dagen!: Table<Dag, string>
  snacks!: Table<Snack, number>
  oefeningen!: Table<Oefening, number>
  trainingen!: Table<Training, number>
  sets!: Table<SetLog, number>
  wegingen!: Table<Weging, string>
  bronnen!: Table<Bron, number>
  inkomsten!: Table<Inkomst, number>
  uitgaven!: Table<Uitgave, number>
  potten!: Table<Pot, number>
  stortingen!: Table<Storting, number>
  belastingbetalingen!: Table<Belastingbetaling, number>
  weekreviews!: Table<Weekreview, string>
  deadlines!: Table<Deadline, number>
  instellingen!: Table<Instellingen, number>

  constructor() {
    super('oogst')
    this.version(1).stores({
      dagen: 'datum',
      snacks: '++id',
      oefeningen: '++id, dag',
      trainingen: '++id, datum',
      sets: '++id, trainingId, oefeningId',
      wegingen: 'datum',
      bronnen: '++id',
      inkomsten: '++id, datum',
      uitgaven: '++id, datum',
      potten: '++id',
      stortingen: '++id, potId, datum',
      belastingbetalingen: '++id, datum',
      weekreviews: 'week',
      deadlines: '++id',
      instellingen: 'id',
    })
  }
}

export const db = new OogstDB()

/** Namen van alle tabellen — gebruikt voor backup, import en wissen. */
export const TABELLEN = [
  'dagen',
  'snacks',
  'oefeningen',
  'trainingen',
  'sets',
  'wegingen',
  'bronnen',
  'inkomsten',
  'uitgaven',
  'potten',
  'stortingen',
  'belastingbetalingen',
  'weekreviews',
  'deadlines',
  'instellingen',
] as const

/** Haalt de instellingen op en vult ontbrekende velden aan met de standaard. */
export async function leesInstellingen(): Promise<Instellingen> {
  const opgeslagen = await db.instellingen.get(1)
  return { ...STANDAARD_INSTELLINGEN, ...opgeslagen, id: 1 }
}

export async function bewaarInstellingen(wijziging: Partial<Instellingen>) {
  const huidig = await leesInstellingen()
  await db.instellingen.put({ ...huidig, ...wijziging, id: 1 })
}

/** Zorgt dat de dag bestaat en past hem aan. */
export async function updateDag(datum: string, wijziging: Partial<Dag>) {
  const bestaand = await db.dagen.get(datum)
  const basis: Dag = bestaand ?? { datum, kcal: 0, eiwit: 0, checkin: false }
  await db.dagen.put({ ...basis, ...wijziging, datum })
}
