/* CurlsbyRuth — productcatalogus
   Bron: aangeleverde productlijst van de klant (naam, merk, prijs, voorraad, barcode).
   LET OP: omschrijving/ingrediënten/gebruiksaanwijzing zijn nog NIET ingevuld.
   Die moeten door Ruth aangeleverd worden — ingrediëntenlijsten van cosmetica
   mogen niet verzonnen worden (allergenen-informatie is wettelijk verplicht en moet kloppen).
*/

const PRODUCTS = [
  {
    id: 'sheamoisture-manuka-conditioner',
    merk: 'SheaMoisture',
    naam: 'Manuka Honey & Mafura Intensive Hydration Conditioner',
    inhoud: '384 ml',
    categorie: 'Conditioner',
    prijs: 14.95,
    voorraad: 6,
    barcode: '0764302231059',
    tint: '#B98A5E'
  },
  {
    id: 'tgin-moisture-rich-shampoo',
    merk: 'TGIN',
    naam: 'Moisture Rich Sulfate Free Shampoo met Amla Oil & Coconut Oil',
    inhoud: '13 fl oz',
    categorie: 'Shampoo',
    prijs: 14.95,
    voorraad: 12,
    barcode: '0850316004380',
    tint: '#C9A15A'
  },
  {
    id: 'tgin-honey-miracle-mask',
    merk: 'TGIN',
    naam: 'Honey Miracle Hair Mask Deep Conditioner',
    inhoud: '12 oz',
    categorie: 'Deep conditioner / masker',
    prijs: 17.95,
    voorraad: 12,
    barcode: '0850316004410',
    tint: '#D6B36B'
  },
  {
    id: 'camille-rose-natural-jansyns',
    merk: 'Camille Rose',
    naam: "Natural Jansyn's",
    inhoud: '',
    categorie: 'Haarverzorging',
    prijs: 15.95,
    voorraad: 6,
    barcode: '0851557003057',
    tint: '#A9776B'
  },
  {
    id: 'mielle-pomegranate-honey-curl-smoothie',
    merk: 'Mielle',
    naam: 'Pomegranate & Honey Curl Smoothie',
    inhoud: '12 oz',
    categorie: 'Curl cream / styler',
    prijs: 14.95,
    voorraad: 6,
    barcode: '0854102006374',
    tint: '#9C5A3C'
  },
  {
    id: 'asiam-curl-clarity-shampoo',
    merk: 'As I Am',
    naam: 'Curl Clarity Shampoo',
    inhoud: '237 ml / 8 oz',
    categorie: 'Shampoo',
    prijs: 11.95,
    voorraad: 6,
    barcode: '0858380002004',
    tint: '#8C9A8E'
  },
  {
    id: 'asiam-curl-color-minty-mermaid',
    merk: 'As I Am',
    naam: 'Curl Color Minty Mermaid — Temporary Color & Curling Gel',
    inhoud: '6 oz',
    categorie: 'Tijdelijke haarkleur',
    prijs: 9.95,
    voorraad: 6,
    barcode: '0858380035101',
    tint: '#7FA894'
  },
  {
    id: 'asiam-curl-color-bold-gold',
    merk: 'As I Am',
    naam: 'Curl Color Bold Gold — Color & Curling Gel',
    inhoud: '6 oz',
    categorie: 'Tijdelijke haarkleur',
    prijs: 9.95,
    voorraad: 6,
    barcode: '0858380035606',
    tint: '#C9A15A'
  },
  {
    id: 'asiam-curl-color-cool-blue',
    merk: 'As I Am',
    naam: 'Curl Color Cool Blue',
    inhoud: '6 oz',
    categorie: 'Tijdelijke haarkleur',
    prijs: 9.95,
    voorraad: 6,
    barcode: '0858380035743',
    tint: '#7C90AC'
  },
  {
    id: 'asiam-curl-color-dark-teal-green',
    merk: 'As I Am',
    naam: 'Curl Color Dark Teal Green',
    inhoud: '6 oz',
    categorie: 'Tijdelijke haarkleur',
    prijs: 9.95,
    voorraad: 6,
    barcode: '0858380045650',
    tint: '#5F8A85'
  },
  {
    id: 'camille-rose-spiked-honey-mousse',
    merk: 'Camille Rose',
    naam: 'Spiked Honey Mousse 4-in-1 Hair Styler',
    inhoud: '',
    categorie: 'Mousse / styler',
    prijs: 15.95,
    voorraad: 6,
    barcode: '0860003058473',
    tint: '#B08968'
  }
];

const SHIPPING_COST = 4.95;
const FREE_SHIPPING_FROM = 50;
