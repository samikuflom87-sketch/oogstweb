# Oogstweb OS

Intern bedrijfssysteem en AI-commandocentrum voor Oogstweb (webdesign & e-commerce,
Achterhoek). Dit is **geen publiek product** — het is een werktuig voor één bedrijf,
gebouwd om leads te vinden, klanten te beheren, financiën te volgen en met
gespecialiseerde AI-agents te werken binnen duidelijke permissiegrenzen.

## Snel starten

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Zonder verdere configuratie start de app automatisch in
**demo-modus**: alle gegevens (duidelijk gelabeld als demo) leven in je browser
(`localStorage`) en de AI-adviseur toont expliciet dat hij nog niet verbonden is. Je
kunt alle schermen, knoppen en workflows gewoon gebruiken — niets is nagemaakt of
nep, maar er is nog geen echte database of AI-koppeling actief.

## Echte data en AI koppelen

Kopieer `.env.example` naar `.env.local` en vul in:

1. **Supabase** (database + login)
   - Maak een gratis project op <https://supabase.com>.
   - Voer de migratie uit `supabase/migrations/0001_init.sql` uit via de SQL-editor
     van je project (of met de Supabase CLI: `supabase db push`).
   - Vul `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` in.
   - Maak jezelf als gebruiker aan via Supabase Auth (Authentication → Users → Add
     user) — dit vervangt de demo-login door echte, beveiligde authenticatie.
2. **Anthropic (Claude)** — de AI-adviseur en agents
   - Maak een API-key op <https://console.anthropic.com>.
   - Vul `ANTHROPIC_API_KEY` in (blijft server-side, komt nooit in de browser).
   - Controleer of `ANTHROPIC_MODEL` nog een geldige, actuele model-ID is (zie
     <https://docs.claude.com/en/docs/about-claude/models>) voordat je live gaat.

Zodra deze variabelen gezet zijn, schakelt de hele app automatisch over: dezelfde
schermen werken nu tegen je eigen Supabase-database en de AI-adviseur geeft echte
antwoorden. Er is geen aparte "demo-knop" — het is één codebase met twee standen.

## Wat er nog **niet** aan vastzit (bewust)

- **Geen e-mail/telefonie-integratie.** Een agent kan een conceptbericht opstellen
  en ter goedkeuring indienen, maar er wordt nog niets daadwerkelijk verstuurd —
  dat vereist een bewust gekozen vervolgstap (bijv. Gmail/SMTP-koppeling) die eerst
  getest moet worden voordat hij hier als "werkend" gemeld wordt.
- **Geen geautomatiseerde internet-/KvK-opzoeking.** De Lead Research Agent
  analyseert en onderbouwt alleen de gegevens die je zelf vastlegt; hij verzint
  nooit nieuwe bedrijven of contactgegevens. Een echte KvK-API-koppeling (betaald,
  met eigen gebruiksvoorwaarden) is een bewuste latere stap, geen onderdeel van
  deze MVP.
- **Geen volledige offline PWA.** De app heeft een manifest en is installeerbaar,
  maar heeft nog geen service worker voor offline gebruik — voor een intern
  bedrijfssysteem dat je zelf altijd online gebruikt, is dat vooralsnog niet
  prioritair.

## Architectuur in het kort

- **Next.js 14 (App Router) + TypeScript + Tailwind**, Nederlandstalige UI,
  responsive voor desktop/tablet/mobiel.
- **Eén databaselaag-interface** (`src/lib/data/provider.ts`) met twee
  implementaties: Supabase (`supabaseProvider.ts`) en een demo-store in
  `localStorage` (`demoProvider.ts`). UI-code praat nooit direct met Supabase of
  `localStorage` — alleen via deze interface — zodat beide standen altijd
  uitwisselbaar blijven.
- **Eén AI-orchestrator, acht rollen** (`src/lib/ai/agents.ts`): CEO, Lead
  Research, Sales, Marketing, Finance, Project Manager, Web Expert, Quality
  Controller. Geen acht losse achtergrondprocessen — één `/api/advisor`-route die
  per aanvraag de juiste systeemprompt en toegestane acties van de gekozen rol
  gebruikt. Dat is bewust lichter en goedkoper dan een volwaardige multi-agent
  architectuur, passend bij één gebruiker.
- **Permissietiers afgedwongen in code, niet (alleen) in de prompt**:
  - Tier 1 — onderzoek, analyse, rapportage: direct gelogd als
    `automatisch_uitgevoerd`.
  - Tier 2 — communicatie versturen, afspraken boeken, offertes uitbrengen, een
    live site wijzigen: landt altijd eerst in de **Approval Center** (`/agents`)
    en wordt pas als "goedgekeurd" gemarkeerd na een bewuste klik van de
    eigenaar.
  - Tier 3 — betalingen, contracten, destructieve acties: zelfde goedkeuringsplicht,
    zwaarder gewicht; er is in deze MVP geen enkel pad waarmee een agent hier
    zelfstandig overheen kan.
- **Volledig auditlog** (`agent_runs` + `approvals` tabellen) van elke agentactie,
  automatisch of met goedkeuring.

## Databaseschema

Zie `supabase/migrations/0001_init.sql`: `companies` (leads én klanten),
`contacts`, `interactions` (volledige geschiedenis), `projects`, `tasks`,
`appointments`, `quotes`, `invoices`, `financial_entries`, `business_goals`,
`agent_runs`, `approvals`, `profiles`. Row-Level Security staat aan op elke
tabel, gescoped op geauthenticeerde gebruikers.

## Kosten (indicatief, bij licht/matig gebruik door één persoon)

| Onderdeel | Kosten |
|---|---|
| Supabase | Gratis tier om te starten; Pro €25/maand zodra je meer dataopslag/gebruikers nodig hebt |
| Hosting (bijv. Vercel) | Gratis hobby-tier voldoende voor intern gebruik |
| Anthropic API (adviseur + agents) | Richtprijs €15–50/maand bij dagelijks, gematigd gebruik — reken dit zelf door op basis van je werkelijke gebruik via het Anthropic-dashboard |

Houd dit in de gaten via de Finance-pagina: er staat een demo-boeking
"AI/API-kosten" als voorbeeld van hoe je dit zelf als uitgave kunt bijhouden.

## Juridisch — waarom bepaalde dingen bewust niet automatisch gaan

- **Telecommunicatiewet / ongevraagde communicatie**: ongevraagde e-mail of
  telemarketing zonder toestemming is in Nederland aan strikte regels
  gebonden. Daarom versturen agents nooit zelf iets — elk uitgaand bericht is
  tier 2 en vereist jouw expliciete goedkeuring per geval.
- **AVG/privacy**: leg alleen gegevens vast die je rechtmatig hebt verkregen;
  het systeem onderscheidt bewust "bevonden feit met bron" van "onbekend" en
  verzint nooit ontbrekende gegevens.
- **KvK-gegevens**: het schema heeft een `kvk_verified`-vlag precies om nooit
  ongeverifieerde KvK-nummers als waarheid te presenteren.

## Roadmap na deze MVP

1. Echte verzend-integratie (e-mail) met verplichte goedkeuring per bericht.
2. KvK-API-koppeling voor geverifieerde bedrijfsgegevens (betaalde dienst, eigen
   gebruiksvoorwaarden — vooraf te toetsen).
3. Google Agenda-koppeling voor afspraken.
4. Uitbreiding van losse agentrollen naar specifiekere subrollen zodra het
   gebruik dat rechtvaardigt — niet eerder, om kosten en complexiteit in
   verhouding te houden met het omzetdoel van €500–€1.000/maand.
5. PDF-export voor offertes/facturen.
