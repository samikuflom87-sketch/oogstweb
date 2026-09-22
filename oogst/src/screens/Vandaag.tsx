import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, updateDag, type Instellingen, type Snack } from '../db'
import { isZondag, leesbaarLang, vandaagISO } from '../lib/datum'
import { berekenStreak } from '../lib/week'
import { Balk, Dialoog, Kaart, Knop, Label, Leeg, Schaal } from '../components/ui'

const ENERGIE = ['😵‍💫', '😴', '😐', '🙂', '⚡']
const STRESS = ['😌', '🙂', '😐', '😣', '🤯']
const STEMMING = ['😞', '😕', '😐', '🙂', '😄']

export default function Vandaag({
  inst,
  naarWeek,
}: {
  inst: Instellingen
  naarWeek: () => void
}) {
  const datum = vandaagISO()
  const dag = useLiveQuery(() => db.dagen.get(datum), [datum])
  const snacks = useLiveQuery(() => db.snacks.toArray(), [])
  const streak = useLiveQuery(() => berekenStreak(), [dag?.checkin])

  const [winst, setWinst] = useState<string | null>(null)
  const [etenOpen, setEtenOpen] = useState(false)
  const [boostsOpen, setBoostsOpen] = useState(false)

  const kcal = dag?.kcal ?? 0
  const eiwit = dag?.eiwit ?? 0
  const winstWaarde = winst ?? dag?.winst ?? ''

  async function zet(wijziging: Parameters<typeof updateDag>[1]) {
    await updateDag(datum, wijziging)
  }

  async function bewaarCheckin() {
    await zet({ winst: winstWaarde, checkin: true })
    setWinst(null)
  }

  async function voegToe(extraKcal: number, extraEiwit: number) {
    await zet({ kcal: Math.max(0, kcal + extraKcal), eiwit: Math.max(0, eiwit + extraEiwit) })
  }

  const compleet =
    dag?.energie !== undefined && dag?.stress !== undefined && dag?.stemming !== undefined

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-cream/60">{leesbaarLang(datum)}</p>
          <h1 className="text-2xl font-semibold leading-tight">{groet()}, Samuel</h1>
        </div>
        <div className="rounded-xl bg-bos-licht px-3 py-2 text-center">
          <div className="text-xl font-semibold text-goud">🔥 {streak ?? 0}</div>
          <div className="whitespace-nowrap text-[10px] text-cream/60">dagen op rij</div>
        </div>
      </div>

      {isZondag() && (
        <button
          onClick={naarWeek}
          className="w-full rounded-2xl bg-goud px-4 py-4 text-left font-semibold text-bos active:bg-goud/80"
        >
          Doe je weekreview →
          <span className="block text-sm font-normal text-bos/70">
            Het is zondag. Vijf minuten terugkijken.
          </span>
        </button>
      )}

      <Kaart titel="Check-in" extra={<span className="text-xs text-cream/50">30 seconden</span>}>
        <div className="space-y-4">
          <div>
            <Label>Slaap: {dag?.slaap !== undefined ? `${dag.slaap} uur` : 'nog niet ingevuld'}</Label>
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={dag?.slaap ?? 7.5}
              onChange={(e) => zet({ slaap: Number(e.target.value) })}
              className="schuif"
              aria-label="Uren slaap"
            />
            <div className="flex justify-between text-[10px] text-cream/40">
              <span>3 u</span>
              <span>12 u</span>
            </div>
          </div>

          <div>
            <Label>Energie</Label>
            <Schaal waarde={dag?.energie} opties={ENERGIE} onKies={(n) => zet({ energie: n })} />
          </div>
          <div>
            <Label>Stress</Label>
            <Schaal waarde={dag?.stress} opties={STRESS} onKies={(n) => zet({ stress: n })} />
          </div>
          <div>
            <Label>Stemming</Label>
            <Schaal waarde={dag?.stemming} opties={STEMMING} onKies={(n) => zet({ stemming: n })} />
          </div>

          <div>
            <Label>Eén winst van vandaag</Label>
            <input
              className="veld"
              placeholder="Waar ben je tevreden over?"
              value={winstWaarde}
              onChange={(e) => setWinst(e.target.value)}
              onBlur={() => winst !== null && zet({ winst })}
            />
          </div>

          <Knop className="w-full" onClick={bewaarCheckin} disabled={!compleet}>
            {dag?.checkin ? 'Check-in bijwerken ✓' : 'Check-in bewaren'}
          </Knop>
          {!compleet && (
            <p className="text-center text-xs text-cream/50">
              Tik energie, stress en stemming aan om te bewaren.
            </p>
          )}
        </div>
      </Kaart>

      <Kaart
        titel="Eten"
        extra={
          <Knop klein kleur="rand" onClick={() => setEtenOpen(true)}>
            Handmatig
          </Knop>
        }
      >
        <div className="space-y-3">
          <Balk waarde={kcal} doel={inst.kcalDoel} eenheid="kcal" />
          <Balk waarde={eiwit} doel={inst.eiwitDoel} eenheid="g eiwit" />
          {kcal >= inst.kcalDoel && eiwit >= inst.eiwitDoel && (
            <p className="text-sm font-semibold text-goud">Allebei je doelen gehaald. Mooi.</p>
          )}
        </div>
      </Kaart>

      <Kaart
        titel="Calorie-boost"
        extra={
          <Knop klein kleur="rand" onClick={() => setBoostsOpen(true)}>
            Beheren
          </Knop>
        }
      >
        <div className="grid grid-cols-1 gap-2">
          {(snacks ?? []).map((s) => (
            <button
              key={s.id}
              onClick={() => voegToe(s.kcal, s.eiwit)}
              className="flex items-center justify-between rounded-xl border border-bos-rand bg-bos px-3 py-3 text-left active:bg-bos-rand/40"
            >
              <span className="mr-2 flex-1 text-sm">{s.naam}</span>
              <span className="whitespace-nowrap text-sm text-cream/60">
                {s.kcal} kcal · {s.eiwit} g
              </span>
              <span className="ml-3 text-xl text-goud">+</span>
            </button>
          ))}
          {(snacks ?? []).length === 0 && <Leeg tekst="Nog geen boosts. Voeg er een toe." />}
        </div>
      </Kaart>

      <EtenDialoog
        open={etenOpen}
        onSluit={() => setEtenOpen(false)}
        kcal={kcal}
        eiwit={eiwit}
        onVoegToe={voegToe}
        onZetOpNul={() => zet({ kcal: 0, eiwit: 0 })}
      />
      <BoostsDialoog
        open={boostsOpen}
        onSluit={() => setBoostsOpen(false)}
        snacks={snacks ?? []}
      />
    </div>
  )
}

function groet(): string {
  const uur = new Date().getHours()
  if (uur < 6) return 'Nog wakker'
  if (uur < 12) return 'Goeiemorgen'
  if (uur < 18) return 'Goeiemiddag'
  return 'Goeienavond'
}

function EtenDialoog({
  open,
  onSluit,
  kcal,
  eiwit,
  onVoegToe,
  onZetOpNul,
}: {
  open: boolean
  onSluit: () => void
  kcal: number
  eiwit: number
  onVoegToe: (kcal: number, eiwit: number) => void
  onZetOpNul: () => void
}) {
  const [nieuweKcal, setNieuweKcal] = useState('')
  const [nieuwEiwit, setNieuwEiwit] = useState('')

  return (
    <Dialoog titel="Eten aanpassen" open={open} onSluit={onSluit}>
      <div className="space-y-4">
        <p className="text-sm text-cream/60">
          Nu geteld: {kcal} kcal en {eiwit} g eiwit.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Kcal erbij</Label>
            <input
              className="veld"
              type="number"
              inputMode="numeric"
              value={nieuweKcal}
              onChange={(e) => setNieuweKcal(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Eiwit erbij (g)</Label>
            <input
              className="veld"
              type="number"
              inputMode="numeric"
              value={nieuwEiwit}
              onChange={(e) => setNieuwEiwit(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <Knop
          className="w-full"
          onClick={() => {
            onVoegToe(Number(nieuweKcal) || 0, Number(nieuwEiwit) || 0)
            setNieuweKcal('')
            setNieuwEiwit('')
            onSluit()
          }}
        >
          Toevoegen
        </Knop>
        <div className="grid grid-cols-2 gap-2">
          <Knop kleur="rand" onClick={() => onVoegToe(-250, 0)}>
            −250 kcal
          </Knop>
          <Knop
            kleur="rood"
            onClick={() => {
              onZetOpNul()
              onSluit()
            }}
          >
            Dag op 0 zetten
          </Knop>
        </div>
      </div>
    </Dialoog>
  )
}

function BoostsDialoog({
  open,
  onSluit,
  snacks,
}: {
  open: boolean
  onSluit: () => void
  snacks: Snack[]
}) {
  const [naam, setNaam] = useState('')
  const [kcal, setKcal] = useState('')
  const [eiwit, setEiwit] = useState('')

  async function toevoegen() {
    if (!naam.trim()) return
    await db.snacks.add({
      naam: naam.trim(),
      kcal: Number(kcal) || 0,
      eiwit: Number(eiwit) || 0,
    })
    setNaam('')
    setKcal('')
    setEiwit('')
  }

  return (
    <Dialoog titel="Calorie-boosts" open={open} onSluit={onSluit}>
      <div className="space-y-4">
        <div className="space-y-2">
          {snacks.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl bg-bos px-3 py-2"
            >
              <div>
                <div className="text-sm">{s.naam}</div>
                <div className="text-xs text-cream/50">
                  {s.kcal} kcal · {s.eiwit} g eiwit
                </div>
              </div>
              <Knop klein kleur="rood" onClick={() => db.snacks.delete(s.id!)}>
                Weg
              </Knop>
            </div>
          ))}
          {snacks.length === 0 && <Leeg tekst="Nog niks in je lijstje." />}
        </div>

        <div className="space-y-2 border-t border-bos-rand pt-4">
          <Label>Nieuwe boost</Label>
          <input
            className="veld"
            placeholder="Bijv. shake met havermout + pindakaas"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="veld"
              type="number"
              inputMode="numeric"
              placeholder="kcal"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
            />
            <input
              className="veld"
              type="number"
              inputMode="numeric"
              placeholder="eiwit (g)"
              value={eiwit}
              onChange={(e) => setEiwit(e.target.value)}
            />
          </div>
          <Knop className="w-full" onClick={toevoegen}>
            Toevoegen aan lijst
          </Knop>
        </div>
      </div>
    </Dialoog>
  )
}
