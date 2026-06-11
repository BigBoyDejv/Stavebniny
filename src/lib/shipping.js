// Cenník dopravy a kalkulačné funkcie pre e-shop Stavebniny Ľubeľa
// Vychádza z dodaného súboru doprava.ods

export const MUNICIPALITIES = [
  { name: 'Ľubeľa', car35: 8, hr8: 45 },
  { name: 'Dúbrava', car35: 16, hr8: 45 },
  { name: 'Lipt. Kľačany', car35: 16, hr8: 45 },
  { name: 'Vlachy, Vlašky', car35: 20, hr8: 50 },
  { name: 'Krmeš', car35: 16, hr8: 45 },
  { name: 'Malatíny', car35: 16, hr8: 45 },
  { name: 'Svätý Kríž', car35: 20, hr8: 50 },
  { name: 'Gálovany', car35: 20, hr8: 50 },
  { name: 'Part. Lupča', car35: 20, hr8: 45 },
  { name: 'Lipt. Mikuláš', car35: 30, hr8: 50 },
  { name: 'Ružomberok', car35: 30, hr8: 50 },
  { name: 'Lipt. Michal', car35: 25, hr8: 50 },
  { name: 'Andice', car35: 25, hr8: 50 },
  { name: 'Gôtovany', car35: 16, hr8: 45 }
];

export const KM_RATES = {
  car35: 1.50, // € za km (cesta tam aj späť)
  hr8: 3.00    // € za km (cesta tam aj späť)
};

export const ADDITIONAL_FEES = {
  craneUnloadPerPallet: 5.00,
  waitTimePerHalfHour: {
    car35: 5.00,
    hr8: 10.00
  }
};

// Preprava cudzieho tovaru (iba auto s HR 8t)
export const THIRD_PARTY_ZONES = [
  {
    name: 'Zóna 1 (Ľubeľa, Dúbrava, Lipt. Kľačany, Malatíny, Krmeš, Gôtovany)',
    municipalities: ['Ľubeľa', 'Dúbrava', 'Lipt. Kľačany', 'Malatíny', 'Krmeš', 'Gôtovany'],
    price: 30
  },
  {
    name: 'Zóna 2 (Vlachy, Vlašky, Part. Lupča, Lazisko, Sv. Kríž, Gálovany, Lipt. Michal)',
    municipalities: ['Vlachy, Vlašky', 'Part. Lupča', 'Lazisko', 'Svätý Kríž', 'Gálovany', 'Lipt. Michal'],
    price: 40
  },
  {
    name: 'Zóna 3 (Lipt. Mikuláš, Ružomberok)',
    municipalities: ['Lipt. Mikuláš', 'Ružomberok'],
    price: 50
  }
];

/**
 * Vypočíta cenu prepravy tovaru zo stavebnín
 * @param {string} municipalityName - názov obce
 * @param {string} vehicleType - 'car35' (do 3.5t) alebo 'hr8' (s HR 8t)
 * @param {number} customDistance - vzdialenosť v km (ak je obec mimo zoznamu)
 * @param {boolean} craneUnloading - vykládka hydraulickou rukou (iba pre hr8)
 * @param {number} palletsCount - počet paliet na vykládku
 * @param {boolean} waitTime - čakacia doba (prestoj)
 * @param {number} waitHalfHours - počet začatých polhodín
 * @returns {object} { basePrice, cranePrice, waitPrice, totalShipping }
 */
export function calculateShopShipping({
  municipalityName,
  vehicleType = 'car35',
  customDistance = 0,
  craneUnloading = false,
  palletsCount = 0,
  waitTime = false,
  waitHalfHours = 0,
  customMunicipalities,
  customKmRates,
  customFees
}) {
  const activeMunicipalities = customMunicipalities || MUNICIPALITIES;
  const activeKmRates = customKmRates || KM_RATES;
  const activeFees = customFees || ADDITIONAL_FEES;

  let basePrice = 0;
  
  if (municipalityName === 'other') {
    const rate = activeKmRates[vehicleType] || 0;
    basePrice = customDistance * rate;
  } else {
    const municipality = activeMunicipalities.find(m => m.name === municipalityName);
    if (municipality) {
      basePrice = vehicleType === 'hr8' ? municipality.hr8 : municipality.car35;
    }
  }

  // Príplatok za vykládku HR (iba pre auto s HR 8t)
  const cranePrice = (vehicleType === 'hr8' && craneUnloading) 
    ? (palletsCount * activeFees.craneUnloadPerPallet) 
    : 0;

  // Príplatok za prestoj
  const waitRate = activeFees.waitTimePerHalfHour[vehicleType] || 0;
  const waitPrice = waitTime ? (waitHalfHours * waitRate) : 0;

  return {
    basePrice,
    cranePrice,
    waitPrice,
    totalShipping: basePrice + cranePrice + waitPrice
  };
}

/**
 * Vypočíta cenu prepravy cudzieho tovaru (iba pre auto s HR 8t)
 * @param {string} zoneName - názov zóny alebo priradenie obce
 * @returns {number} cena za dopravu
 */
export function calculateThirdPartyShipping(zoneName) {
  const zone = THIRD_PARTY_ZONES.find(z => z.name === zoneName);
  return zone ? zone.price : 0;
}
