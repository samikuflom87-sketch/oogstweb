import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { leesInstellingen } from './db'
import { startOp } from './lib/seed'
import Vandaag from './screens/Vandaag'
import Gym from './screens/Gym'
import Geld from './screens/Geld'
import Week from './screens/Week'
import Instellingen from './screens/Instellingen'

type Tab = 'vandaag' | 'gym' | 'geld' | 'week'

const TABS: { id: Tab; label: string; icoon: string }[] = [
  { id: 'vandaag', label: 'Vandaag', icoon: '🌱' },
  { id: 'gym', label: 'Gym', icoon: '🏋️' },
  { id: 'geld', label: 'Geld', icoon: '💶' },
  { id: 'week', label: 'Week', icoon: '📅' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('vandaag')
  const [instellingenOpen, setInstellingenOpen] = useState(false)
  const [klaar, setKlaar] = useState(false)

  useEffect(() => {
    startOp().then(() => setKlaar(true))
  }, [])

  const inst = useLiveQuery(() => leesInstellingen(), [])

  if (!klaar || !inst) {
    return (
      <div className="flex min-h-screen items-center justify-center text-cream/60">
        Oogst wordt geladen…
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-bos/95 px-4 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
        <span className="text-sm font-semibold tracking-wide text-goud">OOGST</span>
        <button
          onClick={() => setInstellingenOpen((open) => !open)}
          className="-mr-2 h-11 w-11 rounded-full text-xl active:bg-bos-licht"
          aria-label="Instellingen"
        >
          {instellingenOpen ? '×' : '⚙️'}
        </button>
      </header>

      <main className="px-4 pb-32 pt-2">
        {instellingenOpen ? (
          <Instellingen inst={inst} onSluit={() => setInstellingenOpen(false)} />
        ) : tab === 'vandaag' ? (
          <Vandaag inst={inst} naarWeek={() => setTab('week')} />
        ) : tab === 'gym' ? (
          <Gym inst={inst} />
        ) : tab === 'geld' ? (
          <Geld inst={inst} />
        ) : (
          <Week inst={inst} />
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-bos-rand bg-bos-licht/95 backdrop-blur">
        <div className="mx-auto flex max-w-md pb-[env(safe-area-inset-bottom)]">
          {TABS.map((t) => {
            const actief = !instellingenOpen && tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => {
                  setInstellingenOpen(false)
                  setTab(t.id)
                }}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
                  actief ? 'text-goud' : 'text-cream/60'
                }`}
              >
                <span className="text-xl leading-none">{t.icoon}</span>
                {t.label}
                <span
                  className={`mt-0.5 h-0.5 w-6 rounded-full ${actief ? 'bg-goud' : 'bg-transparent'}`}
                />
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
