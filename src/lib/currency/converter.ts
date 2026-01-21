// Currency conversion utilities
// Simple approach: rates express "1 base currency = X target currency"

import type { CurrencyCode } from "./formats";

export interface ExchangeRates {
  CZK: number;
  EUR: number;
  USD: number;
  CNY: number;
}

// Default exchange rates (from USD base, approximate January 2025)
// These will be overridden by the theme config
export const defaultRates: ExchangeRates = {
  CZK: 23.5,   // 1 USD = 23.5 CZK
  EUR: 0.92,   // 1 USD = 0.92 EUR
  USD: 1,      // 1 USD = 1 USD (base)
  CNY: 7.25,   // 1 USD = 7.25 CNY
};

// Convert an amount from base currency to target currency
// Simple: multiply by the target rate, divide by the source rate
export function convert(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // rates[X] means "1 base = X units of currency"
  // To convert from A to B: amount * (rate_B / rate_A)
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  return amount * (toRate / fromRate);
}

// Convert a price in cents from base currency to target currency
export function convertPrice(
  priceInCents: number,
  baseCurrency: CurrencyCode,
  targetCurrency: CurrencyCode,
  rates: ExchangeRates
): number {
  const priceInBase = priceInCents / 100;
  return convert(priceInBase, baseCurrency, targetCurrency, rates);
}

// Validate exchange rates (all must be positive)
export function validateRates(rates: ExchangeRates): boolean {
  return Object.values(rates).every((rate) => rate > 0);
}

// Reasonable price ranges for menu items (in each currency)
// Used to validate that conversions make sense
const PRICE_RANGES: Record<CurrencyCode, { min: number; max: number }> = {
  USD: { min: 1, max: 500 },      // $1 - $500
  EUR: { min: 1, max: 450 },      // €1 - €450
  CZK: { min: 20, max: 10000 },   // 20 Kč - 10,000 Kč
  CNY: { min: 5, max: 3000 },     // ¥5 - ¥3,000
};

export interface PriceValidationResult {
  isValid: boolean;
  warnings: string[];
}

// Validate that a converted price is within reasonable range
export function validatePrice(
  price: number,
  currency: CurrencyCode
): PriceValidationResult {
  const range = PRICE_RANGES[currency];
  const warnings: string[] = [];

  if (price < range.min) {
    warnings.push(
      `Price ${price.toFixed(2)} ${currency} is unusually low (min expected: ${range.min})`
    );
  }

  if (price > range.max) {
    warnings.push(
      `Price ${price.toFixed(2)} ${currency} is unusually high (max expected: ${range.max})`
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

// Validate exchange rates are realistic (within expected ranges)
const RATE_SANITY_CHECKS: Record<CurrencyCode, { min: number; max: number }> = {
  USD: { min: 0.5, max: 2 },       // Base reference
  EUR: { min: 0.4, max: 1.5 },     // Relative to USD
  CZK: { min: 15, max: 35 },       // 1 USD = 15-35 CZK
  CNY: { min: 5, max: 10 },        // 1 USD = 5-10 CNY
};

export function validateRatesSanity(
  rates: ExchangeRates,
  baseCurrency: CurrencyCode
): PriceValidationResult {
  const warnings: string[] = [];

  // Check if rates are relative to USD (most common reference)
  const usdRate = rates.USD;

  for (const [currency, rate] of Object.entries(rates) as [CurrencyCode, number][]) {
    // Normalize rate relative to USD
    const normalizedRate = rate / usdRate;
    const expected = RATE_SANITY_CHECKS[currency];

    if (normalizedRate < expected.min || normalizedRate > expected.max) {
      warnings.push(
        `${currency} rate (${rate}) seems unusual. Expected ${expected.min}-${expected.max} relative to USD.`
      );
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
