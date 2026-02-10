// EU 14 Allergen System
// Based on EU Regulation No. 1169/2011

export interface Allergen {
  number: number;
  name: string;
  nameCZ: string;
  icon: string;
  subTypes?: { code: string; name: string; nameCZ: string }[];
}

export const EU_ALLERGENS: Allergen[] = [
  {
    number: 1,
    name: "Cereals containing gluten",
    nameCZ: "Obiloviny obsahující lepek",
    icon: "🌾",
    subTypes: [
      { code: "1a", name: "Wheat", nameCZ: "Pšenice" },
      { code: "1b", name: "Rye", nameCZ: "Žito" },
      { code: "1c", name: "Barley", nameCZ: "Ječmen" },
      { code: "1d", name: "Oats", nameCZ: "Oves" },
    ],
  },
  {
    number: 2,
    name: "Crustaceans",
    nameCZ: "Korýši",
    icon: "🦐",
  },
  {
    number: 3,
    name: "Eggs",
    nameCZ: "Vejce",
    icon: "🥚",
  },
  {
    number: 4,
    name: "Fish",
    nameCZ: "Ryby",
    icon: "🐟",
  },
  {
    number: 5,
    name: "Peanuts",
    nameCZ: "Arašídy",
    icon: "🥜",
  },
  {
    number: 6,
    name: "Soybeans",
    nameCZ: "Sója",
    icon: "🫘",
  },
  {
    number: 7,
    name: "Milk",
    nameCZ: "Mléko",
    icon: "🥛",
  },
  {
    number: 8,
    name: "Nuts",
    nameCZ: "Skořápkové plody",
    icon: "🌰",
  },
  {
    number: 9,
    name: "Celery",
    nameCZ: "Celer",
    icon: "🥬",
  },
  {
    number: 10,
    name: "Mustard",
    nameCZ: "Hořčice",
    icon: "🟡",
  },
  {
    number: 11,
    name: "Sesame seeds",
    nameCZ: "Sezamová semena",
    icon: "⚪",
  },
  {
    number: 12,
    name: "Sulphur dioxide / sulphites",
    nameCZ: "Oxid siřičitý a siřičitany",
    icon: "🧪",
  },
  {
    number: 13,
    name: "Lupin",
    nameCZ: "Vlčí bob",
    icon: "🌸",
  },
  {
    number: 14,
    name: "Molluscs",
    nameCZ: "Měkkýši",
    icon: "🦑",
  },
];

// Look up allergen by number
export function getAllergenByNumber(num: number): Allergen | undefined {
  return EU_ALLERGENS.find((a) => a.number === num);
}

// Look up allergen by code (e.g., "1a" -> Wheat sub-type of Cereals)
export function getAllergenByCode(code: string): { allergen: Allergen; subType?: string; subTypeCZ?: string } | undefined {
  const num = parseInt(code, 10);
  const allergen = EU_ALLERGENS.find((a) => a.number === num);
  if (!allergen) return undefined;

  // Check for sub-type (e.g., "1a")
  if (code.length > String(num).length && allergen.subTypes) {
    const sub = allergen.subTypes.find((s) => s.code === code);
    return { allergen, subType: sub?.name, subTypeCZ: sub?.nameCZ };
  }

  return { allergen };
}

// Get display name for an allergen code in the specified language
export function getAllergenDisplayName(code: string, lang: string): string {
  const info = getAllergenByCode(code);
  if (!info) return code;
  if (info.subType) {
    return lang === 'cs' ? (info.subTypeCZ || info.subType) : info.subType;
  }
  return lang === 'cs' ? info.allergen.nameCZ : info.allergen.name;
}
