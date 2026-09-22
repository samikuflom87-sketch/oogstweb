import { useRef, useState } from 'react'
import { bewaarInstellingen, type Instellingen as Inst } from '../db'
import { downloadBackup, importeerBackup } from '../lib/backup'
import { vulVoorbeelddata, wisVoorbeelddata } from '../lib/seed'
import { Kaart, Knop, Label } from '../components/ui'
import { Deadlines } from './Week'

export default function Instellingen({ inst, onSluit }: { inst: Inst; onSluit: () => void }) {
  const [melding, setMelding] = useState('')
  const bestandRef = useRef<HTMLInputElement>(null)

  function getal(veld: keyof Inst) {
    return (waarde: string) => bewaarInstellingen({ [veld]: Number(waarde) || 0 })
  }

  async function importeer(bestand?: File) {
    if (!bestand) return
    try {
      setMelding(await importeerBackup(bestand))
    } catch (fout) {
      setMelding(fout instanceof Error ? fout.message : 'Import mislukt.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Instellingen</h1>
        <Knop klein kleur="rand" onClick={onSluit}>
          Klaar
        </Knop>
      </div>

      <Kaart titel="Doelen">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Calorieën per dag</Label>
            <input
              className="veld"
              type="number"
              inputMode="numeric"
              defaultValue={inst.kcalDoel}
              onBlur={(e) => getal('kcalDoel')(e.target.value)}
            />
          </div>
          <div>
            <Label>Eiwit per dag (g)</Label>
            <input
              className="veld"
              type="number"
              inputMode="numeric"
              defaultValue={inst.eiwitDoel}
              onBlur={(e) => getal('eiwitDoel')(e.target.value)}
            />
          </div>
          <div>
            <Label>Streefgewicht (kg)</Label>
            <input
              className="veld"
              type="number"
              inputMode="decimal"
              defaultValue={inst.streefgewicht}
              onBlur={(e) => getal('streefgewicht')(e.target.value)}
            />
          </div>
        </div>
      </Kaart>

      <Kaart titel="Belastingpot">
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-xl bg-bos px-3 py-3 text-sm">
            <span>
              KOR aan (geen btw)
              <span className="block text-xs text-cream/50">
                Met de kleineondernemersregeling reken je geen btw.
              </span>
            </span>
            <input
              type="checkbox"
              checked={inst.korActief}
              onChange={(e) => bewaarInstellingen({ korActief: e.target.checked })}
              className="h-6 w-6 accent-[#D9A441]"
            />
          </label>
          <label className="flex items-center justify-between rounded-xl bg-bos px-3 py-3 text-sm">
            <span>
              Bedragen zijn inclusief btw
              <span className="block text-xs text-cream/50">
                Aan: uit €121 haalt de app €21 btw. Uit: €121 + €25,41 btw.
              </span>
            </span>
            <input
              type="checkbox"
              checked={inst.bedragInclusiefBtw}
              onChange={(e) => bewaarInstellingen({ bedragInclusiefBtw: e.target.checked })}
              className="h-6 w-6 accent-[#D9A441]"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Btw-percentage</Label>
              <input
                className="veld"
                type="number"
                inputMode="numeric"
                defaultValue={inst.btwPercentage}
                onBlur={(e) => getal('btwPercentage')(e.target.value)}
              />
            </div>
            <div>
              <Label>Inkomstenbelasting %</Label>
              <input
                className="veld"
                type="number"
                inputMode="numeric"
                defaultValue={inst.ibPercentage}
                onBlur={(e) => getal('ibPercentage')(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Kaart>

      <Kaart titel="Gym">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Rep-range van</Label>
            <input
              className="veld"
              type="number"
              inputMode="numeric"
              defaultValue={inst.repMinStandaard}
              onBlur={(e) => getal('repMinStandaard')(e.target.value)}
            />
          </div>
          <div>
            <Label>Rep-range tot</Label>
            <input
              className="veld"
              type="number"
              inputMode="numeric"
              defaultValue={inst.repMaxStandaard}
              onBlur={(e) => getal('repMaxStandaard')(e.target.value)}
            />
          </div>
          <div>
            <Label>Stap compound (kg)</Label>
            <input
              className="veld"
              type="number"
              inputMode="decimal"
              step="0.5"
              defaultValue={inst.stapCompound}
              onBlur={(e) => getal('stapCompound')(e.target.value)}
            />
          </div>
          <div>
            <Label>Stap isolatie (kg)</Label>
            <input
              className="veld"
              type="number"
              inputMode="decimal"
              step="0.5"
              defaultValue={inst.stapIsolatie}
              onBlur={(e) => getal('stapIsolatie')(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-cream/50">
          Nieuwe oefeningen krijgen deze rep-range. Per oefening pas je hem los aan.
        </p>
      </Kaart>

      <Deadlines />

      <Kaart titel="Backup">
        <div className="space-y-2">
          <Knop className="w-full" onClick={downloadBackup}>
            Backup exporteren (JSON)
          </Knop>
          <Knop className="w-full" kleur="rand" onClick={() => bestandRef.current?.click()}>
            Backup importeren
          </Knop>
          <input
            ref={bestandRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => importeer(e.target.files?.[0])}
          />
          <p className="text-xs text-cream/50">
            Je gegevens staan alleen op deze telefoon. Maak af en toe een backup en zet hem in je
            cloudopslag.
          </p>
        </div>
      </Kaart>

      <Kaart titel="Voorbeelddata">
        <div className="space-y-2">
          <Knop
            className="w-full"
            kleur="rood"
            onClick={async () => {
              if (!confirm('Alle dagen, trainingen, geld en deadlines wissen?')) return
              await wisVoorbeelddata()
              setMelding('Voorbeelddata gewist. Je oefeningen en boosts staan er nog.')
            }}
          >
            Voorbeelddata wissen
          </Knop>
          <Knop
            className="w-full"
            kleur="rand"
            onClick={async () => {
              await vulVoorbeelddata()
              setMelding('Voorbeelddata staat er weer in.')
            }}
          >
            Voorbeelddata terugzetten
          </Knop>
        </div>
      </Kaart>

      {melding && (
        <p className="rounded-xl bg-goud/15 px-3 py-2 text-sm text-goud" role="status">
          {melding}
        </p>
      )}

      <p className="pb-2 text-center text-xs text-cream/40">
        Oogst · alles blijft lokaal op je toestel
      </p>
    </div>
  )
}
