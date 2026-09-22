import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Instellingen, type Oefening, type SetLog, type Soort } from '../db'
import { leesbaar, vandaagISO } from '../lib/datum'
import {
  beste1RM,
  sessiesVanOefening,
  setsAlsTekst,
  volgendeStap,
  voortschrijdendGemiddelde,
  vorigeSessie,
} from '../lib/gym'
import { Grafiek } from '../components/Grafiek'
import { Dialoog, Kaart, Knop, Label, Leeg } from '../components/ui'

export default function Gym({ inst }: { inst: Instellingen }) {
  const datum = vandaagISO()
  const oefeningen = useLiveQuery(() => db.oefeningen.toArray(), []) ?? []
  const trainingVandaag = useLiveQuery(
    async () =>
      (await db.trainingen.where('datum').equals(datum).toArray()).find((t) => !t.klaar) ?? null,
    [datum],
  )
  const [beheerOpen, setBeheerOpen] = useState(false)

  const dagen = [...new Set(oefeningen.map((o) => o.dag))]

  async function startTraining(dag: string) {
    await db.trainingen.add({ datum, dag })
  }

  /** Lege training gooien we weg, een gevulde sluiten we af (blijft in je geschiedenis). */
  async function stopTraining(id: number) {
    const sets = await db.sets.where('trainingId').equals(id).count()
    if (sets === 0) await db.trainingen.delete(id)
    else await db.trainingen.update(id, { klaar: true })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold">Gym</h1>
        <Knop klein kleur="rand" onClick={() => setBeheerOpen(true)}>
          Oefeningen
        </Knop>
      </div>

      {trainingVandaag ? (
        <ActieveTraining
          trainingId={trainingVandaag.id!}
          dag={trainingVandaag.dag}
          oefeningen={oefeningen.filter((o) => o.dag === trainingVandaag.dag)}
          inst={inst}
          onSluit={() => stopTraining(trainingVandaag.id!)}
        />
      ) : (
        <Kaart titel="Start je training">
          {dagen.length === 0 ? (
            <Leeg tekst="Voeg eerst oefeningen toe via de knop 'Oefeningen'." />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {dagen.map((dag) => (
                <Knop key={dag} onClick={() => startTraining(dag)}>
                  {dag}
                </Knop>
              ))}
            </div>
          )}
        </Kaart>
      )}

      <Lichaamsgewicht inst={inst} />
      <Geschiedenis />

      <BeheerDialoog
        open={beheerOpen}
        onSluit={() => setBeheerOpen(false)}
        oefeningen={oefeningen}
        inst={inst}
      />
    </div>
  )
}

function ActieveTraining({
  trainingId,
  dag,
  oefeningen,
  inst,
  onSluit,
}: {
  trainingId: number
  dag: string
  oefeningen: Oefening[]
  inst: Instellingen
  onSluit: () => void
}) {
  const sets = useLiveQuery(
    () => db.sets.where('trainingId').equals(trainingId).toArray(),
    [trainingId],
  ) ?? []

  return (
    <Kaart
      titel={`Training vandaag · ${dag}`}
      extra={
        <Knop klein kleur="rand" onClick={onSluit}>
          Afsluiten
        </Knop>
      }
    >
      <div className="space-y-4">
        {oefeningen.map((oefening) => (
          <OefeningBlok
            key={oefening.id}
            oefening={oefening}
            trainingId={trainingId}
            sets={sets.filter((s) => s.oefeningId === oefening.id)}
            inst={inst}
          />
        ))}
        {oefeningen.length === 0 && <Leeg tekst="Geen oefeningen voor deze dag." />}
      </div>
    </Kaart>
  )
}

function OefeningBlok({
  oefening,
  trainingId,
  sets,
  inst,
}: {
  oefening: Oefening
  trainingId: number
  sets: SetLog[]
  inst: Instellingen
}) {
  const vorige = useLiveQuery(
    () => vorigeSessie(oefening.id!, trainingId),
    [oefening.id, trainingId],
  )
  const [gewicht, setGewicht] = useState('')
  const [reps, setReps] = useState('')
  const [grafiekOpen, setGrafiekOpen] = useState(false)

  const suggestie = vorige ? volgendeStap(oefening, vorige.sets, inst) : null

  async function setErbij() {
    const g = Number(gewicht !== '' ? gewicht : (suggestie?.gewicht ?? 0))
    const r = Number(reps !== '' ? reps : (suggestie?.reps ?? 0))
    if (!r) return
    await db.sets.add({ trainingId, oefeningId: oefening.id!, gewicht: g, reps: r })
    setGewicht(String(g))
    setReps(String(r))
  }

  return (
    <div className="rounded-xl border border-bos-rand p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{oefening.naam}</h3>
          <p className="text-xs text-cream/50">
            {oefening.soort === 'compound' ? 'compound' : 'isolatie'} · {oefening.repMin}–
            {oefening.repMax} reps
          </p>
        </div>
        <Knop klein kleur="vlak" onClick={() => setGrafiekOpen(true)}>
          📈
        </Knop>
      </div>

      <p className="mt-2 text-sm text-cream/70">
        <span className="text-cream/50">Vorige keer: </span>
        {vorige ? `${setsAlsTekst(vorige.sets)} (${leesbaar(vorige.datum)})` : 'nog niks gelogd'}
      </p>
      {suggestie && (
        <p className="mt-2 rounded-lg bg-goud/15 px-3 py-2 text-sm text-goud">
          {suggestie.tekst}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <input
          className="veld"
          type="number"
          inputMode="decimal"
          placeholder={suggestie ? `${suggestie.gewicht} kg` : 'kg'}
          value={gewicht}
          onChange={(e) => setGewicht(e.target.value)}
          aria-label="Gewicht in kilo"
        />
        <input
          className="veld"
          type="number"
          inputMode="numeric"
          placeholder={suggestie ? `${suggestie.reps} reps` : 'reps'}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          aria-label="Aantal reps"
        />
        <Knop onClick={setErbij} className="shrink-0 px-5">
          +
        </Knop>
      </div>

      {sets.length > 0 && (
        <ul className="mt-3 space-y-1">
          {sets.map((s, i) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg bg-bos px-3 py-2 text-sm"
            >
              <span>
                Set {i + 1}: {s.gewicht} kg × {s.reps}
              </span>
              <button
                onClick={() => db.sets.delete(s.id!)}
                className="px-2 text-cream/50"
                aria-label="Set verwijderen"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <GrafiekDialoog
        open={grafiekOpen}
        onSluit={() => setGrafiekOpen(false)}
        oefening={oefening}
      />
    </div>
  )
}

function GrafiekDialoog({
  open,
  onSluit,
  oefening,
}: {
  open: boolean
  onSluit: () => void
  oefening: Oefening
}) {
  const sessies = useLiveQuery(
    () => (open ? sessiesVanOefening(oefening.id!) : Promise.resolve([])),
    [open, oefening.id],
  ) ?? []

  const punten = sessies.map((s) => ({ x: s.datum, y: beste1RM(s.sets) }))

  return (
    <Dialoog titel={oefening.naam} open={open} onSluit={onSluit}>
      <p className="mb-2 text-sm text-cream/60">Geschat 1RM per training (formule van Epley).</p>
      <Grafiek punten={punten} eenheid="kg" />
      <ul className="mt-4 space-y-1 text-sm">
        {[...sessies].reverse().map((s) => (
          <li key={s.trainingId} className="flex justify-between rounded-lg bg-bos px-3 py-2">
            <span className="text-cream/60">{leesbaar(s.datum)}</span>
            <span>{setsAlsTekst(s.sets)}</span>
          </li>
        ))}
      </ul>
    </Dialoog>
  )
}

function Lichaamsgewicht({ inst }: { inst: Instellingen }) {
  const wegingen =
    useLiveQuery(async () => (await db.wegingen.toArray()).sort((a, b) => a.datum.localeCompare(b.datum)), []) ?? []
  const [kg, setKg] = useState('')

  const punten = wegingen.map((w) => ({ x: w.datum, y: w.kg }))
  const trend = voortschrijdendGemiddelde(punten)
  const laatsteTrend = trend.length ? trend[trend.length - 1].y : null

  async function bewaar() {
    const waarde = Number(kg)
    if (!waarde) return
    await db.wegingen.put({ datum: vandaagISO(), kg: waarde })
    setKg('')
  }

  return (
    <Kaart titel="Lichaamsgewicht">
      <div className="mb-3 flex gap-2">
        <input
          className="veld"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="kg vandaag"
          value={kg}
          onChange={(e) => setKg(e.target.value)}
        />
        <Knop onClick={bewaar} className="shrink-0">
          Bewaren
        </Knop>
      </div>
      <Grafiek punten={punten} trend={trend} eenheid="kg" />
      <p className="mt-2 text-sm text-cream/60">
        Stippellijn = gemiddelde van 7 wegingen
        {laatsteTrend !== null && ` · trend nu ${laatsteTrend} kg`} · streef{' '}
        {inst.streefgewicht} kg
      </p>
    </Kaart>
  )
}

function Geschiedenis() {
  const rijen =
    useLiveQuery(async () => {
      const trainingen = (await db.trainingen.toArray())
        .sort((a, b) => b.datum.localeCompare(a.datum))
        .slice(0, 8)
      return Promise.all(
        trainingen.map(async (t) => ({
          ...t,
          aantal: await db.sets.where('trainingId').equals(t.id!).count(),
        })),
      )
    }, []) ?? []

  return (
    <Kaart titel="Laatste trainingen">
      {rijen.length === 0 ? (
        <Leeg tekst="Nog geen trainingen gelogd." />
      ) : (
        <ul className="space-y-1 text-sm">
          {rijen.map((t) => (
            <li key={t.id} className="flex justify-between rounded-lg bg-bos px-3 py-2">
              <span>{t.dag}</span>
              <span className="text-cream/60">
                {leesbaar(t.datum)} · {t.aantal} sets
              </span>
            </li>
          ))}
        </ul>
      )}
    </Kaart>
  )
}

function BeheerDialoog({
  open,
  onSluit,
  oefeningen,
  inst,
}: {
  open: boolean
  onSluit: () => void
  oefeningen: Oefening[]
  inst: Instellingen
}) {
  const [naam, setNaam] = useState('')
  const [dag, setDag] = useState('')
  const [soort, setSoort] = useState<Soort>('compound')
  const [repMin, setRepMin] = useState(String(inst.repMinStandaard))
  const [repMax, setRepMax] = useState(String(inst.repMaxStandaard))

  const dagen = [...new Set(oefeningen.map((o) => o.dag))]

  async function toevoegen() {
    const trainingsdag = dag.trim() || dagen[0] || 'Full body'
    if (!naam.trim()) return
    await db.oefeningen.add({
      naam: naam.trim(),
      dag: trainingsdag,
      soort,
      repMin: Number(repMin) || inst.repMinStandaard,
      repMax: Number(repMax) || inst.repMaxStandaard,
    })
    setNaam('')
  }

  async function verwijder(oefening: Oefening) {
    if (!confirm(`${oefening.naam} verwijderen? Gelogde sets blijven staan.`)) return
    await db.oefeningen.delete(oefening.id!)
  }

  return (
    <Dialoog titel="Oefeningen" open={open} onSluit={onSluit}>
      <div className="space-y-5">
        {dagen.map((d) => (
          <div key={d}>
            <h4 className="mb-2 text-sm font-semibold text-goud">{d}</h4>
            <ul className="space-y-1">
              {oefeningen
                .filter((o) => o.dag === d)
                .map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between rounded-lg bg-bos px-3 py-2"
                  >
                    <div>
                      <div className="text-sm">{o.naam}</div>
                      <div className="text-xs text-cream/50">
                        {o.soort} · {o.repMin}–{o.repMax} reps
                      </div>
                    </div>
                    <Knop klein kleur="rood" onClick={() => verwijder(o)}>
                      Weg
                    </Knop>
                  </li>
                ))}
            </ul>
          </div>
        ))}

        <div className="space-y-2 border-t border-bos-rand pt-4">
          <Label>Nieuwe oefening</Label>
          <input
            className="veld"
            placeholder="Naam, bijv. Incline dumbbell press"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
          />
          <input
            className="veld"
            list="trainingsdagen"
            placeholder={`Trainingsdag${dagen.length ? ` (bijv. ${dagen[0]})` : ''}`}
            value={dag}
            onChange={(e) => setDag(e.target.value)}
          />
          <datalist id="trainingsdagen">
            {dagen.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="veld"
              value={soort}
              onChange={(e) => setSoort(e.target.value as Soort)}
            >
              <option value="compound">Compound</option>
              <option value="isolatie">Isolatie</option>
            </select>
            <div className="flex gap-2">
              <input
                className="veld"
                type="number"
                inputMode="numeric"
                value={repMin}
                onChange={(e) => setRepMin(e.target.value)}
                aria-label="Minimum reps"
              />
              <input
                className="veld"
                type="number"
                inputMode="numeric"
                value={repMax}
                onChange={(e) => setRepMax(e.target.value)}
                aria-label="Maximum reps"
              />
            </div>
          </div>
          <Knop className="w-full" onClick={toevoegen}>
            Oefening toevoegen
          </Knop>
          <p className="text-xs text-cream/50">
            Typ een nieuwe trainingsdag om er een groep bij te maken.
          </p>
        </div>
      </div>
    </Dialoog>
  )
}
