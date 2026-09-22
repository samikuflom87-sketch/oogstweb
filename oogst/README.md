# Oogst 🌱

Persoonlijke PWA voor Samuel. In maximaal één minuut per dag je fysieke,
financiële en mentale voortgang bijhouden — met op zondag een weekreview.

Alles draait lokaal op je telefoon: je gegevens staan in IndexedDB op je eigen
toestel en gaan nooit naar een server. Backup maak je zelf met een JSON-bestand.

## Wat zit erin

**Vandaag** — check-in in 30 seconden (slaap, energie, stress, stemming, één
winst), calorieën en eiwit met doelbalken die goud kleuren als je je doel haalt,
je eigen lijst calorie-boosts die je met één tik toevoegt, en een streak-teller.
Op zondag verschijnt hier de knop "Doe je weekreview".

**Gym** — je eigen oefeningenbibliotheek per trainingsdag (Upper, Lower, Push,
Pull, Legs of wat je zelf verzint). Tijdens het loggen zie je bij elke oefening
wat je vorige keer deed plus een suggestie: haalde je alle sets op de bovenkant
van je rep-range, dan gaat het gewicht omhoog (+2,5 kg compound, +1 kg isolatie,
aanpasbaar); anders blijf je op hetzelfde gewicht en pak je een rep meer. Per
oefening zie je een grafiek van je geschatte 1RM. Je lichaamsgewicht log je met
een trendlijn (gemiddelde van 7 wegingen).

**Geld** — inkomsten met bron (Agrio, OogstWeb, zelf aan te passen). Bij bronnen
met "belasting apart zetten" gaat automatisch btw + inkomstenbelasting naar de
belastingpot, met de melding: *dit geld is niet van jou*. Verder spaarpotten met
doel en voortgangsbalk, simpele uitgaven, en per maand een overzicht van binnen /
apart gezet / gespaard / uitgegeven / vrij te besteden.

**Week** — automatische samenvatting van de afgelopen 7 dagen, signalen in gewone
taal ("Je stress was 3 dagen op rij 4 of hoger"), al je winsten onder elkaar, de
drie review-vragen en je deadlines met het aantal dagen ernaartoe.

**Instellingen** (tandwiel rechtsboven) — doelen, belastingpercentages, KOR,
rep-ranges, deadlines, backup exporteren/importeren en de voorbeelddata wissen.

## Lokaal starten

Je hebt Node 20.19+ of 22.12+ nodig.

```bash
cd oogst
npm install
npm run dev
```

Vite drukt een adres af (meestal `http://localhost:5173`). Wil je de app op je
telefoon testen terwijl je ontwikkelt, start dan met `npm run dev -- --host` en
open het netwerkadres op je telefoon (zelfde wifi).

Productiebuild maken en bekijken:

```bash
npm run build     # resultaat komt in oogst/dist
npm run preview   # serveert dist op http://localhost:4173
```

De service worker (offline gebruik) werkt alleen in de build, niet in `npm run dev`.

## Deployen

### Vercel (makkelijkst)

1. Push deze repo naar GitHub (dat is hij al) en klik in Vercel op **Add New →
   Project**, kies de repo `oogstweb`.
2. Zet bij **Root Directory**: `oogst`.
3. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
4. Deploy. Je krijgt een adres als `oogst.vercel.app`; via **Settings → Domains**
   hang je er bijvoorbeeld `oogst.oogstweb.nl` aan.

### Hostinger (subdomein)

1. Maak in hPanel een subdomein aan, bijvoorbeeld `oogst.oogstweb.nl`. Onthoud de
   map die erbij hoort (vaak `public_html/oogst`).
2. Draai lokaal `npm run build`.
3. Upload via Bestandsbeheer of FTP **de inhoud** van `oogst/dist` naar die map —
   dus `index.html`, `assets/`, `sw.js`, `manifest.webmanifest` en de iconen.
4. Zorg dat het subdomein via https bereikbaar is (gratis SSL in hPanel). Een
   service worker werkt alleen op https.

Belangrijk: de app verwacht dat hij in de **hoofdmap** van een (sub)domein staat.
Wil je hem toch in een submap zetten (`example.nl/oogst/`), zet dan in
`vite.config.ts` `base: '/oogst/'` en pas `start_url` en `scope` in het manifest
daarop aan.

## Op je telefoon installeren

**iPhone (Safari):** open het adres in Safari → deelknop (vierkantje met pijltje)
→ **Zet op beginscherm** → Voeg toe. Oogst staat nu als app tussen je andere
apps, zonder browserbalk en met offline-ondersteuning.

**Android (Chrome):** open het adres → menu (drie puntjes) → **App installeren**
of **Toevoegen aan startscherm**.

Na een nieuwe deploy haalt de app zichzelf op de achtergrond bij; sluit hem een
keer helemaal af en open hem opnieuw om de nieuwe versie te zien.

## Backup

Instellingen → **Backup exporteren** zet alles (dagen, trainingen, geld, potten,
deadlines, instellingen) in één JSON-bestand. Bewaar dat in je cloudopslag.
**Backup importeren** zet alles weer terug en overschrijft wat er nu in staat.
Doe dit ook als je van telefoon wisselt: de gegevens staan per toestel, per
browser.

## Voorbeelddata

Bij de eerste start staat de app vol met voorbeelddata zodat je meteen ziet hoe
alles werkt. Instellingen → **Voorbeelddata wissen** gooit alle dagen,
trainingen, geldregels en deadlines weg. Je oefeningenbibliotheek, calorie-boosts
en inkomstenbronnen blijven staan, zodat je meteen verder kunt. Met
**Voorbeelddata terugzetten** haal je het voorbeeld weer terug.

## Hoe de code in elkaar zit

```
src/
  db.ts              Dexie-database: alle tabellen en types, plus instellingen
  lib/
    datum.ts         datums, weeknummers, "over 3 dagen"
    geld.ts          btw/inkomstenbelasting-verdeling en euro-opmaak
    gym.ts           1RM-schatting, progressive overload, vorige sessies
    week.ts          weeksamenvatting, signalen en de streak
    backup.ts        export/import van je gegevens
    seed.ts          basisdata en voorbeelddata
  components/        Kaart, Knop, Balk, Schaal, Dialoog, Grafiek
  screens/           Vandaag, Gym, Geld, Week, Instellingen
  App.tsx            tabbalk en schermen
```

Stack: Vite + React + TypeScript + Tailwind, Dexie voor IndexedDB,
vite-plugin-pwa voor manifest en service worker. De grafieken zijn met de hand
getekende SVG's — geen extra bibliotheken.

Kleuren: bosgroen `#1B2C20`, cream `#F6F1E7`, goud `#D9A441`.
