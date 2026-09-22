import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Bron, type Instellingen, type Pot } from '../db'
import { leesbaar, maandLabel, maandSleutel, vandaagISO } from '../lib/datum'
import { euro, som, verdeelInkomst } from '../lib/geld'
import { Cijfer, Dialoog, Kaart, Knop, Label, Leeg } from '../components/ui'

const CATEGORIEEN = ['Boodschappen', 'Uit eten', 'Vervoer', 'Sportschool', 'Abonnement', 'Anders']

export default function Geld({ inst }: { inst: Instellingen }) {
  const [maand, setMaand] = useState(maandSleutel(vandaagISO()))
  const [bronnenOpen, setBronnenOpen] = useState(false)

  const bronnen = useLiveQuery(() => db.bronnen.toArray(), []) ?? []
  const potten = useLiveQuery(() => db.potten.toArray(), []) ?? []
  const inkomsten = useLiveQuery(() => db.inkomsten.toArray(), []) ?? []
  const uitgaven = useLiveQuery(() => db.uitgaven.toArray(), []) ?? []
  const stortingen = useLiveQuery(() => db.stortingen.toArray(), []) ?? []
  const betalingen = useLiveQuery(() => db.belastingbetalingen.toArray(), []) ?? []

  const inMaand = <T extends { datum: string }>(rijen: T[]) =>
    rijen.filter((r) => maandSleutel(r.datum) === maand)

  const binnen = som(inMaand(inkomsten).map((i) => i.bedrag))
  const apart = som(inMaand(inkomsten).map((i) => i.btw + i.ib))
  const gespaard = som(inMaand(stortingen).map((s) => s.bedrag))
  const uitgegeven = som(inMaand(uitgaven).map((u) => u.bedrag))
  const vrij = som([binnen, -apart, -gespaard, -uitgegeven])

  const belastingpot = som([
    ...inkomsten.map((i) => i.btw + i.ib),
    ...betalingen.map((b) => -b.bedrag),
  ])

  function verschuifMaand(stap: number) {
    const [jaar, m] = maand.split('-').map(Number)
    const d = new Date(jaar, m - 1 + stap, 1)
    setMaand(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Geld</h1>

      <Kaart className="border border-goud/40">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-cream/60">Belastingpot</p>
            <p className="text-3xl font-semibold text-goud">{euro(belastingpot)}</p>
            <p className="mt-1 text-sm font-semibold text-cream">Dit geld is niet van jou.</p>
            <p className="text-xs text-cream/50">
              {inst.korActief ? 'KOR aan: geen btw' : `btw ${inst.btwPercentage}%`} ·
              inkomstenbelasting {inst.ibPercentage}%
            </p>
          </div>
          <BelastingAfboeken />
        </div>
      </Kaart>

      <NieuweInkomst bronnen={bronnen} inst={inst} onBeheer={() => setBronnenOpen(true)} />

      <Kaart
        titel={maandLabel(maand)}
        extra={
          <div className="flex gap-1">
            <Knop klein kleur="vlak" onClick={() => verschuifMaand(-1)} aria-label="Vorige maand">
              ←
            </Knop>
            <Knop klein kleur="vlak" onClick={() => verschuifMaand(1)} aria-label="Volgende maand">
              →
            </Knop>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <Cijfer label="Binnen" waarde={euro(binnen)} />
          <Cijfer label="Apart gezet" waarde={euro(apart)} sub="belasting" />
          <Cijfer label="Gespaard" waarde={euro(gespaard)} sub="in je potten" />
          <Cijfer label="Uitgegeven" waarde={euro(uitgegeven)} />
        </div>
        <div className="mt-2 rounded-xl bg-goud/15 p-3">
          <div className="text-xs text-cream/60">Vrij te besteden</div>
          <div className="text-2xl font-semibold text-goud">{euro(vrij)}</div>
        </div>
        <ul className="mt-3 space-y-1 text-sm">
          {inMaand(inkomsten)
            .sort((a, b) => b.datum.localeCompare(a.datum))
            .slice(0, 6)
            .map((i) => (
              <li key={i.id} className="flex justify-between rounded-lg bg-bos px-3 py-2">
                <span>
                  {i.bron} <span className="text-cream/50">· {leesbaar(i.datum)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span>{euro(i.bedrag)}</span>
                  <button
                    onClick={() => db.inkomsten.delete(i.id!)}
                    className="text-cream/40"
                    aria-label="Inkomst verwijderen"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
        </ul>
      </Kaart>

      <Spaarpotten potten={potten} stortingen={stortingen} />
      <Uitgaven />

      <BronnenDialoog open={bronnenOpen} onSluit={() => setBronnenOpen(false)} bronnen={bronnen} />
    </div>
  )
}

function NieuweInkomst({
  bronnen,
  inst,
  onBeheer,
}: {
  bronnen: Bron[]
  inst: Instellingen
  onBeheer: () => void
}) {
  const [bedrag, setBedrag] = useState('')
  const [bronId, setBronId] = useState<number | null>(null)

  const gekozen = bronnen.find((b) => b.id === bronId) ?? bronnen[0]
  const bedragGetal = Number(bedrag.replace(',', '.')) || 0
  const verdeling = verdeelInkomst(bedragGetal, gekozen?.apartZetten ?? false, inst)

  async function boeken() {
    if (!bedragGetal || !gekozen) return
    await db.inkomsten.add({
      datum: vandaagISO(),
      bedrag: bedragGetal,
      bron: gekozen.naam,
      btw: verdeling.btw,
      ib: verdeling.ib,
    })
    setBedrag('')
  }

  return (
    <Kaart
      titel="Inkomst boeken"
      extra={
        <Knop klein kleur="rand" onClick={onBeheer}>
          Bronnen
        </Knop>
      }
    >
      <div className="space-y-3">
        <input
          className="veld text-lg"
          type="number"
          inputMode="decimal"
          placeholder="Bedrag in euro"
          value={bedrag}
          onChange={(e) => setBedrag(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {bronnen.map((b) => {
            const actief = (gekozen?.id ?? null) === b.id
            return (
              <button
                key={b.id}
                onClick={() => setBronId(b.id!)}
                className={`min-h-[44px] rounded-xl border px-4 text-sm ${
                  actief ? 'border-goud bg-goud/20 text-goud' : 'border-bos-rand text-cream'
                }`}
              >
                {b.naam}
              </button>
            )
          })}
          {bronnen.length === 0 && <Leeg tekst="Voeg eerst een bron toe." />}
        </div>

        {gekozen?.apartZetten && bedragGetal > 0 && (
          <div className="rounded-xl bg-bos p-3 text-sm">
            <p className="text-cream/60">
              Van {euro(bedragGetal)} gaat{' '}
              <span className="font-semibold text-goud">{euro(verdeling.apart)}</span> naar de
              belastingpot
              {!inst.korActief && ` (btw ${euro(verdeling.btw)} + ib ${euro(verdeling.ib)})`}.
            </p>
            <p className="mt-1">
              Vrij te besteden: <span className="font-semibold">{euro(verdeling.vrij)}</span>
            </p>
          </div>
        )}

        <Knop className="w-full" onClick={boeken} disabled={!bedragGetal || !gekozen}>
          Boeken
        </Knop>
      </div>
    </Kaart>
  )
}

function BelastingAfboeken() {
  const [open, setOpen] = useState(false)
  const [bedrag, setBedrag] = useState('')
  const [omschrijving, setOmschrijving] = useState('')

  async function afboeken() {
    const waarde = Number(bedrag.replace(',', '.'))
    if (!waarde) return
    await db.belastingbetalingen.add({
      datum: vandaagISO(),
      bedrag: waarde,
      omschrijving: omschrijving.trim() || 'Belasting betaald',
    })
    setBedrag('')
    setOmschrijving('')
    setOpen(false)
  }

  return (
    <>
      <Knop klein kleur="rand" onClick={() => setOpen(true)}>
        Afgedragen
      </Knop>
      <Dialoog titel="Belasting afgedragen" open={open} onSluit={() => setOpen(false)}>
        <div className="space-y-3">
          <p className="text-sm text-cream/60">
            Heb je btw of inkomstenbelasting betaald? Boek het hier af, dan klopt je pot weer.
          </p>
          <input
            className="veld"
            type="number"
            inputMode="decimal"
            placeholder="Bedrag"
            value={bedrag}
            onChange={(e) => setBedrag(e.target.value)}
          />
          <input
            className="veld"
            placeholder="Waarvoor? Bijv. btw Q3"
            value={omschrijving}
            onChange={(e) => setOmschrijving(e.target.value)}
          />
          <Knop className="w-full" onClick={afboeken}>
            Afboeken
          </Knop>
        </div>
      </Dialoog>
    </>
  )
}

function Spaarpotten({
  potten,
  stortingen,
}: {
  potten: Pot[]
  stortingen: { potId: number; bedrag: number }[]
}) {
  const [potOpen, setPotOpen] = useState(false)
  const [storten, setStorten] = useState<Pot | null>(null)
  const [naam, setNaam] = useState('')
  const [doel, setDoel] = useState('')
  const [bedrag, setBedrag] = useState('')

  const gespaardIn = (potId: number) =>
    som(stortingen.filter((s) => s.potId === potId).map((s) => s.bedrag))

  async function nieuwePot() {
    if (!naam.trim()) return
    await db.potten.add({ naam: naam.trim(), doel: Number(doel.replace(',', '.')) || 0 })
    setNaam('')
    setDoel('')
    setPotOpen(false)
  }

  async function stortIn() {
    const waarde = Number(bedrag.replace(',', '.'))
    if (!storten || !waarde) return
    await db.stortingen.add({ potId: storten.id!, datum: vandaagISO(), bedrag: waarde })
    setBedrag('')
    setStorten(null)
  }

  return (
    <Kaart
      titel="Spaarpotten"
      extra={
        <Knop klein kleur="rand" onClick={() => setPotOpen(true)}>
          Nieuwe pot
        </Knop>
      }
    >
      <div className="space-y-4">
        {potten.map((pot) => {
          const gespaard = gespaardIn(pot.id!)
          const percentage = pot.doel > 0 ? Math.min(100, (gespaard / pot.doel) * 100) : 0
          return (
            <div key={pot.id}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="font-semibold">{pot.naam}</span>
                <span className="text-sm text-cream/60">
                  {euro(gespaard)} / {euro(pot.doel)}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-bos">
                <div
                  className="h-full rounded-full bg-goud transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-2 flex gap-2">
                <Knop klein kleur="vlak" onClick={() => setStorten(pot)}>
                  Storten
                </Knop>
                <Knop
                  klein
                  kleur="rand"
                  onClick={async () => {
                    const nieuw = prompt(`Doelbedrag voor ${pot.naam}`, String(pot.doel))
                    if (nieuw === null) return
                    await db.potten.update(pot.id!, { doel: Number(nieuw.replace(',', '.')) || 0 })
                  }}
                >
                  Doel
                </Knop>
                <Knop
                  klein
                  kleur="rood"
                  onClick={async () => {
                    if (!confirm(`${pot.naam} verwijderen?`)) return
                    await db.stortingen.where('potId').equals(pot.id!).delete()
                    await db.potten.delete(pot.id!)
                  }}
                >
                  Weg
                </Knop>
              </div>
            </div>
          )
        })}
        {potten.length === 0 && <Leeg tekst="Nog geen potten. Begin met 'Samenwonen'." />}
      </div>

      <Dialoog titel="Nieuwe spaarpot" open={potOpen} onSluit={() => setPotOpen(false)}>
        <div className="space-y-3">
          <div>
            <Label>Naam</Label>
            <input
              className="veld"
              placeholder="Bijv. Samenwonen"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
            />
          </div>
          <div>
            <Label>Doelbedrag</Label>
            <input
              className="veld"
              type="number"
              inputMode="decimal"
              placeholder="5000"
              value={doel}
              onChange={(e) => setDoel(e.target.value)}
            />
          </div>
          <Knop className="w-full" onClick={nieuwePot}>
            Pot aanmaken
          </Knop>
        </div>
      </Dialoog>

      <Dialoog
        titel={storten ? `Storten in ${storten.naam}` : 'Storten'}
        open={storten !== null}
        onSluit={() => setStorten(null)}
      >
        <div className="space-y-3">
          <input
            className="veld text-lg"
            type="number"
            inputMode="decimal"
            placeholder="Bedrag"
            value={bedrag}
            onChange={(e) => setBedrag(e.target.value)}
          />
          <Knop className="w-full" onClick={stortIn}>
            Storten
          </Knop>
        </div>
      </Dialoog>
    </Kaart>
  )
}

function Uitgaven() {
  const uitgaven =
    useLiveQuery(async () =>
      (await db.uitgaven.toArray()).sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, 8),
    ) ?? []
  const [bedrag, setBedrag] = useState('')
  const [categorie, setCategorie] = useState(CATEGORIEEN[0])

  async function boeken() {
    const waarde = Number(bedrag.replace(',', '.'))
    if (!waarde) return
    await db.uitgaven.add({ datum: vandaagISO(), bedrag: waarde, categorie })
    setBedrag('')
  }

  return (
    <Kaart titel="Uitgaven" extra={<span className="text-xs text-cream/50">optioneel</span>}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            className="veld"
            type="number"
            inputMode="decimal"
            placeholder="Bedrag"
            value={bedrag}
            onChange={(e) => setBedrag(e.target.value)}
          />
          <select
            className="veld"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            aria-label="Categorie"
          >
            {CATEGORIEEN.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Knop onClick={boeken} className="shrink-0 px-5">
            +
          </Knop>
        </div>
        <ul className="space-y-1 text-sm">
          {uitgaven.map((u) => (
            <li key={u.id} className="flex justify-between rounded-lg bg-bos px-3 py-2">
              <span>
                {u.categorie} <span className="text-cream/50">· {leesbaar(u.datum)}</span>
              </span>
              <span className="flex items-center gap-2">
                <span>{euro(u.bedrag)}</span>
                <button
                  onClick={() => db.uitgaven.delete(u.id!)}
                  className="text-cream/40"
                  aria-label="Uitgave verwijderen"
                >
                  ×
                </button>
              </span>
            </li>
          ))}
          {uitgaven.length === 0 && <Leeg tekst="Nog geen uitgaven gelogd." />}
        </ul>
      </div>
    </Kaart>
  )
}

function BronnenDialoog({
  open,
  onSluit,
  bronnen,
}: {
  open: boolean
  onSluit: () => void
  bronnen: Bron[]
}) {
  const [naam, setNaam] = useState('')
  const [apart, setApart] = useState(true)

  async function toevoegen() {
    if (!naam.trim()) return
    await db.bronnen.add({ naam: naam.trim(), apartZetten: apart })
    setNaam('')
  }

  return (
    <Dialoog titel="Inkomstenbronnen" open={open} onSluit={onSluit}>
      <div className="space-y-4">
        <ul className="space-y-2">
          {bronnen.map((b) => (
            <li key={b.id} className="flex items-center justify-between rounded-lg bg-bos px-3 py-2">
              <div>
                <div className="text-sm">{b.naam}</div>
                <button
                  onClick={() => db.bronnen.update(b.id!, { apartZetten: !b.apartZetten })}
                  className="text-xs text-goud underline"
                >
                  {b.apartZetten ? 'belasting apart zetten: aan' : 'belasting apart zetten: uit'}
                </button>
              </div>
              <Knop klein kleur="rood" onClick={() => db.bronnen.delete(b.id!)}>
                Weg
              </Knop>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-bos-rand pt-4">
          <Label>Nieuwe bron</Label>
          <input
            className="veld"
            placeholder="Bijv. Agrio"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
          />
          <label className="flex items-center gap-3 rounded-xl bg-bos px-3 py-3 text-sm">
            <input
              type="checkbox"
              checked={apart}
              onChange={(e) => setApart(e.target.checked)}
              className="h-5 w-5 accent-[#D9A441]"
            />
            Belasting apart zetten (eigen werk, zoals OogstWeb)
          </label>
          <Knop className="w-full" onClick={toevoegen}>
            Bron toevoegen
          </Knop>
        </div>
      </div>
    </Dialoog>
  )
}
