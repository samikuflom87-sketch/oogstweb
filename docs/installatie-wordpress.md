# WordPress inrichten voor CurlsbyRuth

Volgorde aanhouden. Alles gebeurt in het WordPress-beheerpaneel op
`curlsbyruth.nl/wp-admin`.

## 1. Basisinstellingen

- **Instellingen → Algemeen**: sitetitel `CurlsbyRuth`, taal Nederlands,
  tijdzone Amsterdam.
- **Instellingen → Permalinks**: zet op **Berichtnaam**. Doe dit vóór er
  producten in staan, anders veranderen later alle links.
- **Instellingen → Lezen**: vink *Zoekmachines ontmoedigen* AAN zolang we
  bouwen. Bij livegang weer uit — zet dat in je agenda.

## 2. Het adres zonder www

De installatie staat nu op `www.curlsbyruth.nl`. Zet hem om naar
`https://curlsbyruth.nl` bij **Instellingen → Algemeen** (beide velden), en
laat www daarheen doorsturen. Doe dit nu het nog leeg is.

Vergeet niet het adres in het Mollie-dashboard mee te veranderen.

## 3. Plugins installeren

| Plugin | Waarvoor |
|---|---|
| WooCommerce | de webshop zelf |
| Mollie Payments for WooCommerce | iDEAL, Bancontact, creditcard, Apple Pay |
| FluentSMTP | zorgt dat de bestelmails aankomen en niet in de spam belanden |
| Een cookiebanner naar keuze | analytics pas na toestemming |
| UpdraftPlus | back-ups, naast die van de hosting |

Meer niet. Elke extra plugin is onderhoud en risico.

## 4. Thema installeren

1. **Weergave → Thema's → Nieuwe toevoegen → Thema uploaden**
2. Kies `curlsbyruth-thema.zip`
3. Installeren en activeren

Het thema zet bij activeren de juiste afbeeldingsformaten. Kleine
productfoto's worden op de kaart nooit breder dan 400 px getoond, zodat ze
scherp blijven op een telefoon.

## 5. WooCommerce instellen

- **WooCommerce → Instellingen → Algemeen**: land Nederland, valuta euro,
  verkooplocatie Nederland en België.
- **Producten**: gewichtseenheid **gram**, afmetingen cm.
- **Btw**: btw inschakelen, prijzen **inclusief btw** invoeren, standaardtarief
  21%. Consumentenprijzen moeten inclusief getoond worden.
- **Verzending**: zone Nederland met pakketpost, zone België apart.
  Gratis verzending vanaf € 50 pas instellen nadat het is doorgerekend.
- **Betalingen**: Mollie koppelen met de **live**-API-sleutel. Alleen de
  methodes aanzetten die Mollie voor haar heeft goedgekeurd.

## 6. Producten importeren

1. **Producten → Alle producten → Importeren**
2. Kies `docs/woocommerce-import.csv`
3. De kolommen worden automatisch herkend
4. Upload daarna de foto's uit `curlsbyruth/producten/` in de mediabibliotheek
   en koppel ze per product

Beschrijving, ingrediënten, gebruiksaanwijzing, inhoud en gewicht staan
bewust leeg in het bestand: die komen van Ruth.

Ingrediënten en gebruiksaanwijzing vul je in op de productpagina zelf, in de
twee velden die het thema toevoegt onder de productgegevens. Ze verschijnen
dan als vaste tabbladen.

## 7. Menu's en pagina's

Maak deze pagina's aan en hang ze in de menu's:

- **Hoofdmenu**: Home, Shop, Over ons, Contact
- **Footermenu**: Algemene voorwaarden, Privacybeleid, Retourneren,
  Verzending

Die vier footerpagina's zijn niet optioneel — Mollie controleert erop
voordat ze de website goedkeurt.

## 8. Teksten en foto's

**Weergave → Aanpassen → CurlsbyRuth**. Daar staan de balk bovenaan, de kop
en slogan op de homepage, de grote foto, het portret, het verhaal, en het
KvK- en btw-nummer voor onderaan de site.

## 9. Voordat het live gaat

- Zoekmachines weer toelaten (stap 1)
- Testbestelling doen in de testmodus van Mollie
- Eén echte bestelling van € 0,01 met iDEAL, en die terugboeken
- Controleren: voorraad gaat omlaag, alle mails komen aan, factuur klopt
- Pas dan in Mollie op **Website is klaar** klikken
