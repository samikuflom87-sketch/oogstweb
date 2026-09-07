# Van demo naar echte webshop — CurlsbyRuth

Projectplan OogstWeb × CurlsbyRuth, september 2026.
Uitgebreide, opgemaakte versie: zie het gedeelde projectplan-artifact.

## Uitgangspunt

De demo in `curlsbyruth/` is een statische site op GitHub Pages. De winkelmand draait op
`localStorage`, de voorraad staat hardcoded in `products.js` en de betaalmethodes staan op DEMO.
Ruth wil de shop echt gaan gebruiken en gaat hem **zelf beheren**.

## Advies: WooCommerce op eigen hosting, met Mollie

Gekozen omdat er twee harde eisen zijn: geen duur abonnement, en Ruth moet zelfstandig producten
en bestellingen kunnen beheren.

| Route | Vast per maand | Ruth beheert zelf | Ontwerp behouden | Onderhoud |
|---|---|---|---|---|
| **WooCommerce (advies)** | € 5–12 hosting | Volledig | Overgezet naar thema | OogstWeb |
| Shopify Basic | ± € 32 + fees | Volledig | Nagebouwd in Liquid | Shopify |
| Eigen backend | hosting + uren | Alleen als we het bouwen | Blijft één op één | OogstWeb, alles |
| Snipcart | ± $ 29 | Nee, producten in code | Blijft één op één | Gedeeld |

Redenen:

- Geen platformabonnement en geen percentage over de omzet. Mollie rekent per transactie;
  bij iDEAL is dat een vast bedrag.
- Ruth krijgt een volwaardig beheerpaneel. Dat sluit Snipcart uit, want daar blijven de
  producten in de code staan.
- De huisstijl staat al als CSS-variabelen in `curlsbyruth/style.css` en gaat één op één mee.
- Domein, hosting, klantgegevens en bestellingen blijven van Ruth, niet van een platform.

Prijs die je hiervoor betaalt: onderhoud. Een WooCommerce-shop zonder updates is na een jaar
een beveiligingsrisico. Neem het onderhoudspakket mee in de offerte.

## Blokkerend punt: inkoop en cosmeticaregels

SheaMoisture, TGIN, Camille Rose, Mielle en As I Am zijn Amerikaanse merken.

- **Inkoop via een EU-groothandel/distributeur** → die partij is de verantwoordelijke persoon.
  Ruth verkoopt gewoon door. Vraag om facturen waaruit dat blijkt.
- **Zelf importeren van buiten de EU** → Ruth wordt zelf verantwoordelijke persoon: melding per
  product in het Europese portaal, productinformatiedossier, EU-conforme etikettering. Serieuze
  last, kost geld per product.

Uitzoeken vóór de bouw start. Het bepaalt of het assortiment kan blijven zoals het is.

Daarnaast: bij verkoop op afstand moet de INCI-ingrediëntenlijst vóór de aankoop op de
productpagina staan. Die lijsten ontbreken nu in `products.js` en mogen alleen letterlijk van
de verpakking worden overgenomen — nooit verzinnen, het gaat om allergenen.

## Stappenplan

### 0. Afspraken vastleggen — samen
- Bevestig: Ruth beheert zelf, dus volwaardig beheerpaneel plus instructiesessie.
- Leg eenmalige bouwprijs en maandbedrag onderhoud vast, inclusief wat erin zit.
- Spreek af wat Ruth aanlevert en vóór welke datum.
- Domein kiezen en controleren; registreren op naam van Ruth.
- Domein, hosting en Mollie op háár naam, met beheerderstoegang voor OogstWeb.

### 1. Inkoop en cosmeticaregels uitzoeken — BLOKKEREND
- Bij welke partij koopt Ruth in, zit die binnen de EU?
- Factuur of leveranciersverklaring opvragen.
- INCI-lijsten per product verzamelen.
- Bij eigen import: kosten van meldingen en dossiers doorrekenen vóór de bouw.

### 2. Zakelijke basis — Ruth (parallel met 4 en 5)
- KvK-inschrijving.
- Btw-identificatienummer.
- Zakelijke bankrekening op dezelfde naam.
- Mollie-account aanmaken en laten verifiëren (KvK, ID, IBAN). Enkele werkdagen tot twee weken.
- Account bij een verzendpartij voor PostNL-tarieven.
- E-mailadres op het eigen domein.

Dit is de kritieke lijn: zonder goedgekeurd Mollie-account kan de shop niet open.

### 3. Content verzamelen — Ruth
Per product:
- 2–4 foto's, minimaal 1200 px, vierkant, neutrale ondergrond
- Omschrijving van 60–120 woorden
- INCI-ingrediëntenlijst
- Gebruiksaanwijzing
- Inhoud in ml én verzendgewicht in gram
- Actuele voorraad (de aantallen in de demo zijn verouderd)

Plus een foto en verhaal voor de pagina Over ons.
Lever een ingevulde spreadsheet aan, dan hoeft Ruth alleen aan te vullen.

### 4. Technisch fundament — OogstWeb (parallel met 2 en 3)
- Domein registreren, DNS instellen.
- Hosting bij een NL-partij die WordPress goed draait: gratis SSL, dagelijkse back-ups, staging.
- WordPress + WooCommerce op een staging-adres, nog niet op het domein.
- Plugins: Mollie voor WooCommerce, SMTP, SEO, cookiebanner, back-up.
- Winkelinstellingen: Nederlands, euro, Nederland, gram, prijzen incl. btw.
- **Indexering op staging uit** — en noteren dat hij bij livegang weer aan moet.

### 5. Huisstijl overzetten — OogstWeb
- Geen thema vanaf nul: licht gratis basisthema met goede WooCommerce-ondersteuning plus een
  child-thema, zodat updaten mogelijk blijft.
- Huisstijl uit `style.css` meenemen: bruin `#9C6644`, klei, zand, salie, steen; Fraunces + DM Sans.
- Volgorde: kleuren en fonts → header/footer → productkaart → productpagina → winkelmand/afrekenen.
- Vaste categorie- en merkkleuren uit `products.js` behouden.
- Merkenslideshow van de homepage terugbrengen als sectie.
- Controleren op een echte iPhone (daar zat de bug met de dichtklappende fotobox).

### 6. Producten invoeren — OogstWeb
- `products.js` omzetten naar CSV en importeren: naam, merk, categorie, prijs, voorraad, EAN, inhoud.
- Bestaande categorieën aanmaken; merk als productattribuut zodat er op merk gefilterd kan worden.
- Prijzen inclusief 21% btw.
- Voorraadbeheer aan, met lage-voorraadmelding en automatisch uitverkocht bij nul.
- Foto's plaatsen; omschrijving, ingrediënten en gebruiksaanwijzing in vaste tabbladen.

### 7. Betalen en verzenden — samen
- Mollie koppelen met de live-sleutel; alleen goedgekeurde methodes aanzetten
  (iDEAL, Bancontact, creditcard, Apple Pay, Google Pay).
- Verzendzones Nederland en België.
- Flessen van 12–13 oz passen niet door de brievenbus: rekenen met pakketpost.
- Narekenen of "gratis verzending vanaf € 50" uit de demo uitkan bij haar marge.
- Verzendpartij koppelen voor tarieven, labels en track-and-trace.
- Retouradres en retourtermijn instellen.

### 8. Juridische pagina's en e-mails — samen
- Publiceren: algemene voorwaarden, privacyverklaring, cookieverklaring, retour- en
  herroepingsbeleid met modelformulier, verzendinformatie.
- KvK-nummer en btw-id in de footer en op de contactpagina.
- Bestelknop: **"Bestelling met betaalplicht"** in plaats van het neutrale "Bestelling plaatsen".
- Cookiebanner die analytics pas laadt na toestemming.
- Bestelbevestiging, verzendbevestiging en factuur in de huisstijl, via SMTP vanaf het eigen domein.
- SPF, DKIM en DMARC instellen, anders belandt de bevestiging bij een deel van de klanten in spam.
- Facturen met btw-specificatie voor Ruth haar aangifte.

### 9. Testen — samen
- Testbestelling in Mollie-testmodus, daarna één echte bestelling van € 0,01 met iDEAL, terugboeken.
- Controleren: voorraad omlaag, alle drie de mails aangekomen, factuur klopt, track-and-trace werkt.
- Retourprocedure één keer volledig doorlopen, inclusief terugbetaling.
- Testen op iPhone, Android en desktop (het meeste verkeer komt via Instagram en TikTok binnen).
- Snelheid en toegankelijkheid: contrast, toetsenbordbediening, alt-teksten.
- Ruth zelf een product laten toevoegen terwijl je meekijkt.

### 10. Live zetten — OogstWeb
- Domein naar de hosting, SSL controleren.
- Indexering weer aanzetten (het punt uit fase 4).
- Google Search Console koppelen, sitemap indienen.
- Demo op GitHub Pages laten staan als portfoliostuk, met `noindex` erop.
- Back-ups controleren én één keer terugzetten; een ongeteste back-up is geen back-up.

### 11. Overdragen — samen
- Instructiesessie van een uur: product toevoegen, voorraad bijwerken, bestelling verwerken,
  label printen, retour afhandelen.
- Korte handleiding of schermopnames.
- Inloggegevens overdragen via een wachtwoordmanager, alles op haar naam.
- Onderhoudsafspraak vastleggen.

### 12. Na de livegang — Ruth, OogstWeb adviseert
- Google Bedrijfsprofiel.
- Instagram- en TikTok-shopping koppelen aan de catalogus.
- Automatisch om een review vragen na levering.
- Nieuwsbrief opzetten.
- Na een maand de cijfers bekijken: wat verkoopt, waar haken mensen af in het afrekenen.

## Kosten (richtprijzen september 2026, controleer actuele tarieven)

| Post | Eenmalig | Per maand |
|---|---|---|
| Bouw van de webshop | webshoptarief OogstWeb | — |
| Domeinnaam | ± € 10 per jaar | — |
| Hosting | — | € 5–12 |
| WordPress + WooCommerce | € 0 | € 0 |
| Mollie | € 0 | € 0 (per transactie) |
| Verzendplatform | € 0 | € 0 (per label) |
| Onderhoud OogstWeb | — | onderhoudstarief |
| Productfoto's | € 0–400 | — |

## Aanleverlijst voor Ruth

- [ ] KvK-nummer en btw-identificatienummer
- [ ] Zakelijke bankrekening op dezelfde naam
- [ ] Goedgekeurd Mollie-account
- [ ] Waar ze inkoopt, en van wie
- [ ] Foto's van alle elf producten
- [ ] Omschrijving per product
- [ ] INCI-ingrediëntenlijsten
- [ ] Gebruiksaanwijzing per product
- [ ] Verzendgewicht per product in gram
- [ ] Actuele voorraad
- [ ] Retouradres
- [ ] Foto en verhaal voor Over ons

## Nog te beslissen

1. Blijft "gratis verzending vanaf € 50" staan? Narekenen met de echte marge.
2. Verkoopt ze ook naar België? Onder € 10.000 omzet naar andere EU-landen mag ze Nederlandse
   btw blijven rekenen; daarboven aanmelden voor de One Stop Shop-regeling.
3. Wie betaalt de hosting — Ruth rechtstreeks, of OogstWeb en doorbelasten?
4. Komt er een onderhoudsafspraak? Zo niet: schriftelijk vastleggen dat het onderhoud niet bij
   OogstWeb ligt.
5. Wat gebeurt er met de bestaande demo? Advies: laten staan als portfoliostuk, met `noindex`.

## Doorlooptijd

Het bouwwerk (fase 4 t/m 10) is ongeveer twee tot drie weken werk. De doorlooptijd wordt bepaald
door de Mollie-verificatie en door het moment waarop Ruth de content aanlevert. Reken op vier tot
zes weken van akkoord tot live, en start fase 2 en 3 op dag één.
