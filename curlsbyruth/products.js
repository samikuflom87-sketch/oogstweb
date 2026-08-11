/* CurlsbyRuth — productcatalogus (demo)
   Bron: aangeleverde productlijst van de klant (naam, merk, prijs, voorraad, EAN).

   LET OP: omschrijving/ingrediënten/gebruiksaanwijzing zijn nog NIET ingevuld.
   Die moeten door Ruth aangeleverd worden — ingrediëntenlijsten van cosmetica
   mogen niet verzonnen worden (allergeneninformatie is wettelijk verplicht).

   Afbeeldingen: zodra de echte foto's er zijn, vul je `images` per product met
   bijvoorbeeld ['producten/tgin-honey-mask-1.jpg', ...]. Zolang die leeg is
   toont de shop een gekleurde tegel in de huisstijl.
*/

/* Warm aardetintenpalet. Geen roze. Verzin geen nieuwe kleuren.
   Per kleur een donkere variant, voor letters en iconen op de zachte
   vlakken — de lichte tint alleen heeft daar te weinig contrast voor. */
const MERKKLEUREN = {
  bruin: '#9C6644',
  klei:  '#C0794E',
  zand:  '#D2A85F',
  salie: '#8FA383',
  steen: '#7F9E9B'
};

const DONKER = {
  '#9C6644': '#895A3C',
  '#C0794E': '#925C3B',
  '#D2A85F': '#82683B',
  '#8FA383': '#5E6C56',
  '#7F9E9B': '#566B69'
};

const donkerVan = kleur => DONKER[kleur] || kleur;

/* Elke categorie heeft één vaste kleur, consequent door de hele shop. */
const CATEGORIEEN = [
  { naam: 'Shampoo',                  kleur: MERKKLEUREN.bruin,  zacht: '#F1E3D6' },
  { naam: 'Conditioner',              kleur: MERKKLEUREN.salie,   zacht: '#E5EBE0' },
  { naam: 'Deep conditioner / masker', kleur: MERKKLEUREN.zand, zacht: '#F8EFDC' },
  { naam: 'Curl cream / styler',      kleur: MERKKLEUREN.klei,   zacht: '#F8E5D8' },
  { naam: 'Mousse / styler',          kleur: MERKKLEUREN.klei,   zacht: '#F8E5D8' },
  { naam: 'Tijdelijke haarkleur',     kleur: MERKKLEUREN.steen,     zacht: '#E0EAE8' },
  { naam: 'Haarverzorging',           kleur: MERKKLEUREN.salie,   zacht: '#E5EBE0' }
];

const categorieInfo = naam =>
  CATEGORIEEN.find(c => c.naam === naam) || { kleur: MERKKLEUREN.bruin, zacht: '#F1E3D6' };

/* Merken in de volgorde waarin ze in de slideshow bovenaan de homepage staan.
   Elk merk krijgt één vaste tint uit hetzelfde palet. */
const MERKEN = [
  { naam: 'SheaMoisture', kleur: MERKKLEUREN.salie,  zacht: '#E5EBE0' },
  { naam: 'TGIN',         kleur: MERKKLEUREN.bruin,  zacht: '#F1E3D6' },
  { naam: 'Camille Rose', kleur: MERKKLEUREN.klei,  zacht: '#F8E5D8' },
  { naam: 'Mielle',       kleur: MERKKLEUREN.zand, zacht: '#F8EFDC' },
  { naam: 'As I Am',      kleur: MERKKLEUREN.steen,    zacht: '#E0EAE8' }
];

const PRODUCTS = [
  {
    id: 'sheamoisture-manuka-conditioner',
    merk: 'SheaMoisture',
    naam: 'Manuka Honey & Mafura Intensive Hydration Conditioner',
    inhoud: '384 ml',
    categorie: 'Conditioner',
    prijs: 14.95,
    voorraad: 6,
    ean: '0764302231059',
    images: [],
    featured: true
  },
  {
    id: 'tgin-moisture-rich-shampoo',
    merk: 'TGIN',
    naam: 'Moisture Rich Sulfate Free Shampoo met Amla Oil & Coconut Oil',
    inhoud: '13 fl oz',
    categorie: 'Shampoo',
    prijs: 14.95,
    voorraad: 12,
    ean: '0850316004380',
    images: [],
    featured: true
  },
  {
    id: 'tgin-honey-miracle-mask',
    merk: 'TGIN',
    naam: 'Honey Miracle Hair Mask Deep Conditioner',
    inhoud: '12 oz',
    categorie: 'Deep conditioner / masker',
    prijs: 17.95,
    voorraad: 12,
    ean: '0850316004410',
    images: [],
    featured: true
  },
  {
    id: 'camille-rose-natural-jansyns',
    merk: 'Camille Rose',
    naam: "Natural Jansyn's",
    inhoud: '',
    categorie: 'Haarverzorging',
    prijs: 15.95,
    voorraad: 6,
    ean: '0851557003057',
    images: [],
    featured: false
  },
  {
    id: 'mielle-pomegranate-honey-curl-smoothie',
    merk: 'Mielle',
    naam: 'Pomegranate & Honey Curl Smoothie',
    inhoud: '12 oz',
    categorie: 'Curl cream / styler',
    prijs: 14.95,
    voorraad: 6,
    ean: '0854102006374',
    images: [],
    featured: true
  },
  {
    id: 'asiam-curl-clarity-shampoo',
    merk: 'As I Am',
    naam: 'Curl Clarity Shampoo',
    inhoud: '237 ml / 8 oz',
    categorie: 'Shampoo',
    prijs: 11.95,
    voorraad: 6,
    ean: '0858380002004',
    images: [],
    featured: false
  },
  {
    id: 'asiam-curl-color-minty-mermaid',
    merk: 'As I Am',
    naam: 'Curl Color Minty Mermaid — Temporary Color & Curling Gel',
    inhoud: '6 oz',
    categorie: 'Tijdelijke haarkleur',
    prijs: 9.95,
    voorraad: 6,
    ean: '0858380035101',
    images: [],
    featured: false
  },
  {
    id: 'asiam-curl-color-bold-gold',
    merk: 'As I Am',
    naam: 'Curl Color Bold Gold — Color & Curling Gel',
    inhoud: '6 oz',
    categorie: 'Tijdelijke haarkleur',
    prijs: 9.95,
    voorraad: 6,
    ean: '0858380035606',
    images: [],
    featured: false
  },
  {
    id: 'asiam-curl-color-cool-blue',
    merk: 'As I Am',
    naam: 'Curl Color Cool Blue',
    inhoud: '6 oz',
    categorie: 'Tijdelijke haarkleur',
    prijs: 9.95,
    voorraad: 6,
    ean: '0858380035743',
    images: [],
    featured: false
  },
  {
    id: 'asiam-curl-color-dark-teal-green',
    merk: 'As I Am',
    naam: 'Curl Color Dark Teal Green',
    inhoud: '6 oz',
    categorie: 'Tijdelijke haarkleur',
    prijs: 9.95,
    voorraad: 6,
    ean: '0858380045650',
    images: [],
    featured: false
  },
  {
    id: 'camille-rose-spiked-honey-mousse',
    merk: 'Camille Rose',
    naam: 'Spiked Honey Mousse 4-in-1 Hair Styler',
    inhoud: '',
    categorie: 'Mousse / styler',
    prijs: 15.95,
    voorraad: 6,
    ean: '0860003058473',
    images: [],
    featured: false
  }
];

const SHIPPING_COST = 4.95;
const FREE_SHIPPING_FROM = 50;
