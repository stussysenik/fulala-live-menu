import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { translations, type Lang, type TranslationStrings } from './translations';

const STORAGE_KEY = 'fulala-lang';

function getInitialLang(): Lang {
  if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'cs') return stored;
  }
  return 'cs'; // Default to Czech for Prague audience
}

export const lang = writable<Lang>(getInitialLang());

// Persist to localStorage
if (browser) {
  lang.subscribe((value) => {
    localStorage.setItem(STORAGE_KEY, value);
  });
}

// Derived store for current translation strings
export const t = derived(lang, ($lang) => translations[$lang]);

// Helper to get locale string for date formatting
export const locale = derived(lang, ($lang) => ($lang === 'cs' ? 'cs-CZ' : 'en-US'));

// Toggle function
export function toggleLang(): void {
  lang.update((current) => (current === 'cs' ? 'en' : 'cs'));
}
