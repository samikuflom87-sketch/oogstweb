import { db, TABELLEN } from '../db'
import { vandaagISO } from './datum'

export interface Backup {
  app: 'oogst'
  versie: 1
  gemaaktOp: string
  data: Record<string, unknown[]>
}

export async function maakBackup(): Promise<Backup> {
  const data: Record<string, unknown[]> = {}
  for (const naam of TABELLEN) {
    data[naam] = await db.table(naam).toArray()
  }
  return { app: 'oogst', versie: 1, gemaaktOp: new Date().toISOString(), data }
}

export async function downloadBackup() {
  const backup = await maakBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `oogst-backup-${vandaagISO()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/** Leest een backupbestand en zet alle data terug (bestaande data wordt vervangen). */
export async function importeerBackup(bestand: File): Promise<string> {
  const tekst = await bestand.text()
  let backup: Backup
  try {
    backup = JSON.parse(tekst)
  } catch {
    throw new Error('Dit bestand is geen geldige JSON.')
  }
  if (backup?.app !== 'oogst' || typeof backup.data !== 'object') {
    throw new Error('Dit lijkt geen Oogst-backup te zijn.')
  }

  let aantal = 0
  await db.transaction('rw', db.tables, async () => {
    for (const naam of TABELLEN) {
      const rijen = backup.data[naam]
      if (!Array.isArray(rijen)) continue
      await db.table(naam).clear()
      await db.table(naam).bulkPut(rijen)
      aantal += rijen.length
    }
  })
  return `${aantal} regels teruggezet.`
}
