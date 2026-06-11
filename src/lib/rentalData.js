// Cenník požičovne náradia pre Stavebniny Ľubeľa
// Vychádza z dodaného súboru požičovňa.xlsx

export const RENTAL_CATEGORIES = [
  'Všetko',
  'Vibračná a hutniaca technika',
  'Sekanie a vŕtanie',
  'Pílenie a rezanie',
  'Odvlhčovanie a iné'
];

export const RENTAL_ITEMS = [
  // 1. Vibračná a hutniaca technika
  {
    id: 'vib-doska-160',
    name: 'Vibračná doska 160 kg',
    category: 'Vibračná a hutniaca technika',
    price4h: 24.60,
    price24h: 43.00,
    deposit: 200,
    imageUrl: 'https://images.unsplash.com/photo-1581442116035-7a4f91cd048b?auto=format&fit=crop&w=800&q=80',
    description: 'Profesionálna vibračná doska strednej váhovej kategórie s reverzným posunom, ideálna na hutnenie piesku, štrku a zámkovej dlažby.',
    note: 'Zľava 10% nad 3 dni',
    accessories: [
      { id: 'podlozka', name: 'Gumená podložka k vibračnej doske', price: 2.50, flat: true }
    ]
  },
  {
    id: 'vib-doska-100',
    name: 'Vibračná doska 100 kg',
    category: 'Vibračná a hutniaca technika',
    price4h: 18.50,
    price24h: 36.90,
    deposit: 150,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    description: 'Jednosmerná vibračná doska vhodná na asfaltové práce, úpravy chodníkov a záhradné terénne úpravy.',
    note: 'Zľava 10% nad 3 dni',
    accessories: [
      { id: 'podlozka', name: 'Gumená podložka k vibračnej doske', price: 2.50, flat: true }
    ]
  },
  {
    id: 'podlozka-samostatna',
    name: 'Podložka k vibračnej doske (Samostatná)',
    category: 'Vibračná a hutniaca technika',
    price4h: 2.50,
    price24h: 2.50,
    deposit: 20,
    imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&w=800&q=80',
    description: 'Gumená (polyuretánová) tlmiaca podložka zabraňujúca poškodeniu vibrovaného materiálu (napr. zámkovej dlažby).',
    accessories: []
  },

  // 2. Sekanie a vŕtanie
  {
    id: 'buracie-kladivo',
    name: 'Búracie kladivo (Ťažké)',
    category: 'Sekanie a vŕtanie',
    price4h: 18.50,
    price24h: 24.60,
    deposit: 150,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    description: 'Vysoko výkonné zbíjacie kladivo na búranie betónu, muriva a podláh.',
    accessories: [
      { id: 'sekac', name: 'Opotrebenie sekáča (plochý/špicatý)', price: 5.00, flat: true, unit: 'ks' }
    ]
  },
  {
    id: 'aku-skrutkovac',
    name: 'AKU skrutkovač / Vŕtačka',
    category: 'Sekanie a vŕtanie',
    price4h: 12.30,
    price24h: 18.50,
    deposit: 100,
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    description: 'Akumulátorová príklepová vŕtačka a uťahovačka s 2 batériami pre plynulú prácu.',
    accessories: []
  },
  {
    id: 'vrtacie-kladivo',
    name: 'Vŕtacie kladivo SDS-Plus',
    category: 'Sekanie a vŕtanie',
    price4h: 12.30,
    price24h: 18.50,
    deposit: 100,
    imageUrl: 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&w=800&q=80',
    description: 'Kombinované vŕtacie a sekacie kladivo pre vŕtanie do betónu a ľahšie sekacie práce.',
    accessories: [
      { id: 'sekac-vrtak', name: 'Opotrebenie SDS vrtákov/sekáčov', price: 10.00, flat: true }
    ]
  },
  {
    id: 'podny-vrtak',
    name: 'Motorový pôdny vrták',
    category: 'Sekanie a vŕtanie',
    price4h: 30.00,
    price24h: 49.00,
    deposit: 200,
    imageUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&w=800&q=80',
    description: 'Benzínový jednochlapový pôdny vrták pre hĺbenie dier na stĺpiky plotov, výsadbu stromčekov a základy.',
    accessories: []
  },

  // 3. Pílenie a rezanie
  {
    id: 'rezacka-polystyren',
    name: 'Rezačka na polystyrén (odporová)',
    category: 'Pílenie a rezanie',
    price4h: 12.30,
    price24h: 24.60,
    deposit: 100,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    description: 'Tavná rezačka na presné a čisté bezodpadové rezanie fasádneho a podlahového polystyrénu.',
    accessories: []
  },
  {
    id: 'pila-beton-350',
    name: 'Píla na betónovú dlažbu (stolová) 350',
    category: 'Pílenie a rezanie',
    price4h: 18.50,
    price24h: 24.60,
    deposit: 200,
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    description: 'Stolová píla s vodným chladením pre rezanie dlažby, kameňa, tehál a obkladov s priemerom kotúča 350 mm.',
    accessories: [
      { id: 'dia-350', name: 'Opotrebenie DIA kotúča 350 (cena za 1 mm)', price: 19.00 }
    ]
  },
  {
    id: 'bruska-125',
    name: 'Uhlová brúska 125 mm',
    category: 'Pílenie a rezanie',
    price4h: 6.50,
    price24h: 12.30,
    deposit: 50,
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
    description: 'Kompaktná a výkonná uhlová brúska s reguláciou otáčok pre bežné rezanie a brúsenie.',
    accessories: [
      { id: 'brúsny-odsavaci', name: 'Brúsny adaptér na odsávanie 125 mm', price: 6.50, flat: true }
    ]
  },
  {
    id: 'adapter-odsavaci-125',
    name: 'Adaptér brúsny na odsávanie 125',
    category: 'Pílenie a rezanie',
    price4h: 6.50,
    price24h: 12.30,
    deposit: 50,
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
    description: 'Protiprachový kryt pre uhlové brúsky 125mm s vývodom pre pripojenie priemyselného vysávača.',
    accessories: [
      { id: 'dia-brusny-opotrebenie', name: 'Opotrebenie brúsneho DIA kotúča (za 1 mm)', price: 14.50 }
    ]
  },
  {
    id: 'bruska-230',
    name: 'Uhlová brúska 230 mm (veľká)',
    category: 'Pílenie a rezanie',
    price4h: 12.30,
    price24h: 18.50,
    deposit: 80,
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
    description: 'Veľká flexa pre náročné rezanie betónu, armovaného železa a tehál.',
    accessories: [
      { id: 'dia-230', name: 'Opotrebenie DIA kotúča 230 (cena za 1 mm)', price: 12.00 }
    ]
  },
  {
    id: 'pila-chvostovka',
    name: 'Elektrická píla chvostovka',
    category: 'Pílenie a rezanie',
    price4h: 12.30,
    price24h: 20.90,
    deposit: 100,
    imageUrl: 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?auto=format&fit=crop&w=800&q=80',
    description: 'Vratná píla na rezy do dreva, plastu, kovových trubiek alebo pórobetónových tvárnic Ytong.',
    accessories: []
  },

  // 4. Odvlhčovanie a iné
  {
    id: 'odvlhcovac',
    name: 'Profesionálny odvlhčovač vzduchu',
    category: 'Odvlhčovanie a iné',
    price4h: 8.60,
    price24h: 17.20,
    deposit: 150,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    description: 'Priemyselný sušič a odvlhčovač pre stavby, vysušovanie omietok, poterov a zatopených pivníc.',
    accessories: []
  },
  {
    id: 'cistic-vzduchu',
    name: 'Priemyselný čistič vzduchu',
    category: 'Odvlhčovanie a iné',
    price4h: 10.00,
    price24h: 10.00, // Flat rate
    deposit: 100,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    description: 'HEPA čistička vzduchu na elimináciu prachu a zápachov pri rekonštrukčných prácach v interiéri.',
    accessories: []
  },
  {
    id: 'vysokotlakovy-cistic',
    name: 'Vysokotlakový čistič (Wapka)',
    category: 'Odvlhčovanie a iné',
    price4h: 12.30,
    price24h: 22.00,
    deposit: 150,
    imageUrl: 'https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?auto=format&fit=crop&w=800&q=80',
    description: 'Tlakový čistič pre umývanie stavebných strojov, striech, terás, fasád a vozidiel.',
    accessories: []
  },
  {
    id: 'miesacka-180',
    name: 'Miešačka na betón 180 litrov',
    category: 'Odvlhčovanie a iné',
    price4h: 18.50,
    price24h: 24.60,
    deposit: 150,
    imageUrl: 'https://images.unsplash.com/photo-1590069230002-70cc83bc50aa?auto=format&fit=crop&w=800&q=80',
    description: 'Klasická stavebná miešačka so silným motorom pre prípravu betónových a maltových zmesí.',
    accessories: []
  },
  {
    id: 'bruska-sadrokarton',
    name: 'Brúska na sádrokartón (Žirafa)',
    category: 'Odvlhčovanie a iné',
    price4h: 14.80,
    price24h: 24.60,
    deposit: 150,
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
    description: 'Teleskopická brúska na sadrokartónové stropy a steny pre dokonalú finálnu rovnosť stierok.',
    accessories: [
      { id: 'brusny-papier', name: 'Náhradný brúsny papier / výsek', price: 3.00, flat: true, unit: 'ks' }
    ]
  },
  {
    id: 'vysavac-priemyselny',
    name: 'Priemyselný vysávač na mokré/suché sanie',
    category: 'Odvlhčovanie and iné',
    price4h: 12.30,
    price24h: 18.50,
    deposit: 100,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    description: 'Profesionálny stavebný vysávač pre prácu s elektronáradím, vysávanie prachu a sutiny.',
    accessories: []
  },
  {
    id: 'vysavac-oklep',
    name: 'Priemyselný vysávač s auto-oklepom filtrov',
    category: 'Odvlhčovanie a iné',
    price4h: 12.30,
    price24h: 24.60,
    deposit: 150,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    description: 'Špeciálny bezsáčkový vysávač so stálym automatickým čistením filtrov pre extrémny jemný sadrový a betónový prach.',
    accessories: []
  },
  {
    id: 'kompresor',
    name: 'Kompresor jednovalcový',
    category: 'Odvlhčovanie a iné',
    price4h: 8.60,
    price24h: 12.30,
    deposit: 100,
    imageUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6b66b706?auto=format&fit=crop&w=800&q=80',
    description: 'Prenosný vzduchový kompresor pre pneumatické klincovačky, striekacie pištole a hustenie pneu.',
    accessories: []
  },
  {
    id: 'elektrocentrala',
    name: 'Benzínová elektrocentrála 3 kW',
    category: 'Odvlhčovanie a iné',
    price4h: 12.30,
    price24h: 18.50,
    deposit: 150,
    imageUrl: 'https://images.unsplash.com/photo-1590069230002-70cc83bc50aa?auto=format&fit=crop&w=800&q=80',
    description: 'Prenosný generátor elektrického prúdu pre prácu na stavbách a chatách bez elektrickej prípojky.',
    accessories: []
  },
  {
    id: 'vertikulator',
    name: 'Motorový vertikutátor (Prevzdušňovač trávnika)',
    category: 'Odvlhčovanie a iné',
    price4h: 27.00,
    price24h: 35.60,
    deposit: 150,
    imageUrl: 'https://images.unsplash.com/photo-1558905619-17254203dc1d?auto=format&fit=crop&w=800&q=80',
    description: 'Benzínový prevzdušňovač na odstránenie machu a trávnej plsti, posilnenie koreňovej štruktúry vášho trávnika.',
    accessories: []
  }
];

export const GENERAL_RENTAL_TERMS = {
  minDeposit: 100,
  cleaningFee: 10.00 // poplatok za znečistenie
};
