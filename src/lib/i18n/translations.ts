export type Lang = 'en' | 'cs';

export interface TranslationStrings {
  // UI chrome
  allergens: string;
  allergensSubtitle: string;
  info: string;
  loading: string;
  soldOut: string;
  featured: string;
  sweet: string;
  glutenFree: string;
  week: string;
  pricesNote: string;
  // Language toggle
  langLabel: string;
  // Schedule
  schedulePrefix: string;
}

export const translations: Record<Lang, TranslationStrings> = {
  en: {
    allergens: 'Allergens',
    allergensSubtitle: 'EU Regulation No. 1169/2011',
    info: 'Info',
    loading: 'Loading menu...',
    soldOut: 'Sold Out',
    featured: 'Featured',
    sweet: 'Sweet',
    glutenFree: 'GF',
    week: 'Week',
    pricesNote: 'Prices in CZK. All prices include VAT.',
    langLabel: 'CZ',
    schedulePrefix: 'Week',
  },
  cs: {
    allergens: 'Alergeny',
    allergensSubtitle: 'Nařízení EU č. 1169/2011',
    info: 'Informace',
    loading: 'Načítání menu...',
    soldOut: 'Vyprodáno',
    featured: 'Doporučujeme',
    sweet: 'Sladké',
    glutenFree: 'BL',
    week: 'Týden',
    pricesNote: 'Ceny v Kč. Všechny ceny jsou včetně DPH.',
    langLabel: 'EN',
    schedulePrefix: 'Týden',
  },
};
