import { Leeg } from './ui'

export interface Punt {
  x: string // datum
  y: number
}

/**
 * Kleine lijngrafiek in SVG. Geen extra bibliotheek: schaalt mee met de breedte
 * van het scherm en houdt de lijnen even dik dankzij non-scaling-stroke.
 */
export function Grafiek({
  punten,
  trend,
  eenheid = '',
  doel,
  hoogte = 140,
}: {
  punten: Punt[]
  trend?: Punt[]
  eenheid?: string
  doel?: number
  hoogte?: number
}) {
  if (punten.length === 0) return <Leeg tekst="Nog geen gegevens om te tekenen." />

  const B = 300
  const H = 100
  const marge = 6

  const waarden = [...punten.map((p) => p.y), ...(trend ?? []).map((p) => p.y)]
  if (doel !== undefined) waarden.push(doel)
  let min = Math.min(...waarden)
  let max = Math.max(...waarden)
  if (max - min < 0.001) {
    min -= 1
    max += 1
  }
  const ruimte = (max - min) * 0.12
  min -= ruimte
  max += ruimte

  const xVan = (i: number, totaal: number) =>
    totaal <= 1 ? B / 2 : marge + (i / (totaal - 1)) * (B - marge * 2)
  const yVan = (waarde: number) =>
    marge + (1 - (waarde - min) / (max - min)) * (H - marge * 2)

  const pad = (lijst: Punt[]) =>
    lijst.map((p, i) => `${xVan(i, lijst.length)},${yVan(p.y)}`).join(' ')

  const laatste = punten[punten.length - 1]

  return (
    <div>
      <svg
        viewBox={`0 0 ${B} ${H}`}
        preserveAspectRatio="none"
        style={{ height: hoogte }}
        className="w-full"
        role="img"
        aria-label="Verloop over tijd"
      >
        {doel !== undefined && (
          <line
            x1={0}
            x2={B}
            y1={yVan(doel)}
            y2={yVan(doel)}
            stroke="#F6F1E7"
            strokeOpacity={0.25}
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
        <polyline
          points={pad(punten)}
          fill="none"
          stroke="#D9A441"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {trend && trend.length > 1 && (
          <polyline
            points={pad(trend)}
            fill="none"
            stroke="#F6F1E7"
            strokeOpacity={0.55}
            strokeWidth={2}
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {punten.map((p, i) => (
          <circle
            key={p.x + i}
            cx={xVan(i, punten.length)}
            cy={yVan(p.y)}
            r={2.5}
            fill="#D9A441"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-cream/50">
        <span>
          laag {Math.round(Math.min(...punten.map((p) => p.y)) * 10) / 10} {eenheid}
        </span>
        <span className="text-goud">
          nu {Math.round(laatste.y * 10) / 10} {eenheid}
        </span>
      </div>
    </div>
  )
}
