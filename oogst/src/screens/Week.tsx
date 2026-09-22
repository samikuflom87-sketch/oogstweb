import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Instellingen } from '../db'
import { dagenTussen, leesbaarLang, vandaagISO, weekSleutel } from '../lib/datum'
import { euro } from '../lib/geld'
import { maakWeekSamenvatting, type Signaal } from '../lib/week'
import { Cijfer, Kaart, Knop, Label, Leeg } from '../components/ui'

export default function Week({ inst }: { inst: Instellingen }) {
  const vandaag = vandaagISO()
  const week = weekSleutel(vandaag)

  const samenvatting = useLiveQuery(() => maakWeekSamenvatting(inst), [inst])
  const review = useLiveQuery(() => db.weekreviews.get(week), [week])

  if (!samenvatting) return <p className="text-cream/60">Bezig met rekenen…</p>

  const s = samenvatting

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Weekreview</h1>
        <p className="text-sm text-cream/60">
          De afgelopen 7 dagen, tot en met {leesbaarLang(vandaag)}
        </p>
      </div>

      <Kaart titel="Zo ging je week">
        <div className="grid grid-cols-2 gap-2">
          <Cijfer label="Slaap" waarde={s.slaap !== null ? `${s.slaap} u` : '—'} sub="gemiddeld" />
          <Cijfer label="Energie" waarde={s.energie !== null ? `${s.energie}/5` : '—'} />
          <Cijfer label="Stress" waarde={s.stress !== null ? `${s.stress}/5` : '—'} />
          <Cijfer label="Stemming" waarde={s.stemming !== null ? `${s.stemming}/5` : '—'} />
          <Cijfer label="Trainingen" waarde={s.trainingen} sub="deze week" />
          <Cijfer label="Check-ins" waarde={`${s.checkins}/7`} />
          <Cijfer label="Calorieën" waarde={`${s.dagenOpKcal}/7`} sub={`doel ${inst.kcalDoel}`} />
          <Cijfer label="Eiwit" waarde={`${s.dagenOpEiwit}/7`} sub={`doel ${inst.eiwitDoel} g`} />
          <Cijfer
            label="Gewichtstrend"
            waarde={s.gewichtNu !== null ? `${s.gewichtNu} kg` : '—'}
            sub={
              s.gewichtVerschil !== null
                ? `${s.gewichtVerschil > 0 ? '+' : ''}${s.gewichtVerschil} kg`
                : 'nog geen trend'
            }
          />
          <Cijfer label="Gespaard" waarde={euro(s.gespaard)} sub={`binnen ${euro(s.binnen)}`} />
        </div>
      </Kaart>

      <Kaart titel="Wat opvalt">
        <ul className="space-y-2">
          {s.signalen.map((signaal, i) => (
            <SignaalRegel key={i} signaal={signaal} />
          ))}
          {s.signalen.length === 0 && <Leeg tekst="Nog te weinig ingevuld om iets te zeggen." />}
        </ul>
      </Kaart>

      <Kaart titel="Je winsten van deze week">
        {s.winsten.length === 0 ? (
          <Leeg tekst="Nog geen winsten genoteerd." />
        ) : (
          <ul className="space-y-2">
            {s.winsten.map((w, i) => (
              <li key={i} className="rounded-lg bg-bos px-3 py-2 text-sm">
                <span className="mr-2 text-goud">•</span>
                {w.tekst}
                <span className="block text-xs text-cream/50">{w.datum}</span>
              </li>
            ))}
          </ul>
        )}
      </Kaart>

      <ReviewVragen week={week} review={review ?? null} />
      <Deadlines />
    </div>
  )
}

function SignaalRegel({ signaal }: { signaal: Signaal }) {
  const kleur =
    signaal.toon === 'goed'
      ? 'border-goud/50 bg-goud/10'
      : signaal.toon === 'letop'
        ? 'border-red-400/40 bg-red-400/10'
        : 'border-bos-rand bg-bos'
  const teken = signaal.toon === 'goed' ? '✓' : signaal.toon === 'letop' ? '!' : '•'
  return (
    <li className={`rounded-xl border px-3 py-2 text-sm ${kleur}`}>
      <span className="mr-2 font-semibold text-goud">{teken}</span>
      {signaal.tekst}
    </li>
  )
}

function ReviewVragen({
  week,
  review,
}: {
  week: string
  review: { goed: string; zwaar: string; focus: string } | null
}) {
  const [concept, setConcept] = useState<Record<string, string> | null>(null)
  const waardes = concept ?? {
    goed: review?.goed ?? '',
    zwaar: review?.zwaar ?? '',
    focus: review?.focus ?? '',
  }

  function zet(veld: string, waarde: string) {
    setConcept({ ...waardes, [veld]: waarde })
  }

  async function bewaren() {
    await db.weekreviews.put({
      week,
      goed: waardes.goed,
      zwaar: waardes.zwaar,
      focus: waardes.focus,
    })
    setConcept(null)
  }

  return (
    <Kaart titel="Jouw drie vragen">
      <div className="space-y-3">
        <div>
          <Label>Wat ging goed?</Label>
          <textarea
            className="veld min-h-[80px]"
            value={waardes.goed}
            onChange={(e) => zet('goed', e.target.value)}
          />
        </div>
        <div>
          <Label>Wat was zwaar?</Label>
          <textarea
            className="veld min-h-[80px]"
            value={waardes.zwaar}
            onChange={(e) => zet('zwaar', e.target.value)}
          />
        </div>
        <div>
          <Label>Wat is mijn ene focus voor volgende week?</Label>
          <textarea
            className="veld min-h-[80px]"
            value={waardes.focus}
            onChange={(e) => zet('focus', e.target.value)}
          />
        </div>
        <Knop className="w-full" onClick={bewaren}>
          {concept || !review ? 'Review bewaren' : 'Bewaard ✓'}
        </Knop>
      </div>
    </Kaart>
  )
}

export function Deadlines() {
  const deadlines =
    useLiveQuery(async () =>
      (await db.deadlines.toArray()).sort((a, b) => a.datum.localeCompare(b.datum)),
    ) ?? []
  const [titel, setTitel] = useState('')
  const [datum, setDatum] = useState('')

  async function toevoegen() {
    if (!titel.trim() || !datum) return
    await db.deadlines.add({ titel: titel.trim(), datum })
    setTitel('')
    setDatum('')
  }

  return (
    <Kaart titel="Deadlines">
      <ul className="mb-4 space-y-2">
        {deadlines.map((d) => {
          const dagen = dagenTussen(vandaagISO(), d.datum)
          const tekst =
            dagen === 0
              ? 'vandaag'
              : dagen > 0
                ? `over ${dagen} ${dagen === 1 ? 'dag' : 'dagen'}`
                : `${Math.abs(dagen)} ${Math.abs(dagen) === 1 ? 'dag' : 'dagen'} geleden`
          return (
            <li
              key={d.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                dagen >= 0 && dagen <= 7 ? 'bg-goud/15' : 'bg-bos'
              }`}
            >
              <div>
                <div className="text-sm">{d.titel}</div>
                <div className="text-xs text-cream/50">{leesbaarLang(d.datum)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${dagen <= 7 ? 'text-goud' : 'text-cream/60'}`}>
                  {tekst}
                </span>
                <button
                  onClick={() => db.deadlines.delete(d.id!)}
                  className="text-cream/40"
                  aria-label="Deadline verwijderen"
                >
                  ×
                </button>
              </div>
            </li>
          )
        })}
        {deadlines.length === 0 && <Leeg tekst="Nog geen deadlines ingevoerd." />}
      </ul>
      <div className="space-y-2 border-t border-bos-rand pt-4">
        <input
          className="veld"
          placeholder="Bijv. BPV-verslag inleveren"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
        />
        <input
          className="veld"
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
          aria-label="Datum"
        />
        <Knop className="w-full" onClick={toevoegen}>
          Deadline toevoegen
        </Knop>
      </div>
    </Kaart>
  )
}
