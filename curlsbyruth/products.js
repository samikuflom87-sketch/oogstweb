/* CurlsbyRuth — productcatalogus (demo)
   Bron: aangeleverde productlijst van de klant (naam, merk, prijs, voorraad, EAN).

   LET OP: omschrijving/ingrediënten/gebruiksaanwijzing zijn nog NIET ingevuld.
   Die moeten door Ruth aangeleverd worden — ingrediëntenlijsten van cosmetica
   mogen niet verzonnen worden (allergeneninformatie is wettelijk verplicht).

   Afbeeldingen: zodra de echte foto's er zijn, vul je `images` per product met
   bijvoorbeeld ['producten/tgin-honey-mask-1.jpg', ...]. Zolang die leeg is
   toont de shop een gekleurde tegel in de huisstijl.
*/

/* Vaste merkkleuren — dit palet staat vast, verzin geen nieuwe kleuren. */
const MERKKLEUREN = {
  coral:  '#E85D75',
  peach:  '#F6A65B',
  yellow: '#F8D85A',
  green:  '#78BFA3',
  sky:    '#8CCFE8'
};

/* Elke categorie heeft één vaste kleur, consequent door de hele shop. */
const CATEGORIEEN = [
  { naam: 'Shampoo',                  kleur: MERKKLEUREN.coral,  zacht: '#FBDDE2' },
  { naam: 'Conditioner',              kleur: MERKKLEUREN.green,   zacht: '#DDEFE7' },
  { naam: 'Deep conditioner / masker', kleur: MERKKLEUREN.yellow, zacht: '#FDF3CE' },
  { naam: 'Curl cream / styler',      kleur: MERKKLEUREN.peach,   zacht: '#FDE6CE' },
  { naam: 'Mousse / styler',          kleur: MERKKLEUREN.peach,   zacht: '#FDE6CE' },
  { naam: 'Tijdelijke haarkleur',     kleur: MERKKLEUREN.sky,     zacht: '#DEF0F7' },
  { naam: 'Haarverzorging',           kleur: MERKKLEUREN.green,   zacht: '#DDEFE7' }
];

const categorieInfo = naam =>
  CATEGORIEEN.find(c => c.naam === naam) || { kleur: MERKKLEUREN.coral, zacht: '#FBDDE2' };

/* Merken in de volgorde waarin ze in de slideshow bovenaan de homepage staan.
   Elk merk krijgt één vaste tint uit hetzelfde palet. */
const MERKEN = [
  { naam: 'SheaMoisture', kleur: MERKKLEUREN.green,  zacht: '#DDEFE7' },
  { naam: 'TGIN',         kleur: MERKKLEUREN.coral,  zacht: '#FBDDE2' },
  { naam: 'Camille Rose', kleur: MERKKLEUREN.peach,  zacht: '#FDE6CE' },
  { naam: 'Mielle',       kleur: MERKKLEUREN.yellow, zacht: '#FDF3CE' },
  { naam: 'As I Am',      kleur: MERKKLEUREN.sky,    zacht: '#DEF0F7' }
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
