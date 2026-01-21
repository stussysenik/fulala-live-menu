// Currency lens store - persists selected viewing currency in localStorage
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { CurrencyCode } from '$lib/currency/formats';

// Get stored currency preference or default to null (use theme default)
const storedCurrency = browser ? localStorage.getItem('selectedCurrency') : null;

// Create the writable store
// null means "use the first display currency from theme config"
export const selectedCurrency = writable<CurrencyCode | null>(
  storedCurrency as CurrencyCode | null
);

// Subscribe to changes and persist to localStorage
if (browser) {
  selectedCurrency.subscribe((value) => {
    if (value) {
      localStorage.setItem('selectedCurrency', value);
    } else {
      localStorage.removeItem('selectedCurrency');
    }
  });
}

// Helper to reset to default (use theme's first currency)
export function resetCurrencyLens() {
  selectedCurrency.set(null);
}
