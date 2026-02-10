// Currency conversion utilities
// Simple approach: rates express "1 base currency = X target currency"

import type { CurrencyCode } from "./formats";

export interface ExchangeRates {
  CZK: number;
  EUR: number;
  USD: number;
  CNY: number;
}

// Default exchange rates (CZK-based for Fulala)
// These will be overridden by the theme config
export const defaultRates: ExchangeRates = {
  CZK: 1,       // Base currency
  EUR: 0.039,   // 1 CZK ≈ 0.039 EUR
  USD: 0.042,   // 1 CZK ≈ 0.042 USD
  CNY: 0.31,    // 1 CZK ≈ 0.31 CNY
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

// Convert a price from base currency to target currency (whole units)
export function convertPrice(
  price: number,
  baseCurrency: CurrencyCode,
  targetCurrency: CurrencyCode,
  rates: ExchangeRates
): number {
  return convert(price, baseCurrency, targetCurrency, rates);
}

// Validate exchange rates (all must be positive)
export function validateRates(rates: ExchangeRates): boolean {
  return Object.values(rates).every((rate) => rate > 0);
}

// Reasonable price ranges for menu items (in each currency)
// Used to validate that conversions make sense
const PRICE_RANGES: Record<CurrencyCode, { min: number; max: number }> = {
  CZK: { min: 20, max: 10000 },   // 20 Kč - 10,000 Kč
  EUR: { min: 1, max: 450 },      // €1 - €450
  USD: { min: 1, max: 500 },      // $1 - $500
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
// Rates are relative to CZK base
const RATE_SANITY_CHECKS: Record<CurrencyCode, { min: number; max: number }> = {
  CZK: { min: 0.5, max: 2 },       // Base reference
  EUR: { min: 0.03, max: 0.06 },    // 1 CZK = 0.03-0.06 EUR
  USD: { min: 0.03, max: 0.06 },    // 1 CZK = 0.03-0.06 USD
  CNY: { min: 0.2, max: 0.5 },      // 1 CZK = 0.2-0.5 CNY
};

export function validateRatesSanity(
  rates: ExchangeRates,
  baseCurrency: CurrencyCode
): PriceValidationResult {
  const warnings: string[] = [];

  const czkRate = rates.CZK;

  for (const [currency, rate] of Object.entries(rates) as [CurrencyCode, number][]) {
    const normalizedRate = rate / czkRate;
    const expected = RATE_SANITY_CHECKS[currency];

    if (normalizedRate < expected.min || normalizedRate > expected.max) {
      warnings.push(
        `${currency} rate (${rate}) seems unusual. Expected ${expected.min}-${expected.max} relative to CZK.`
      );
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}
