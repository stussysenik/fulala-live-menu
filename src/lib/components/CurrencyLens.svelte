<script lang="ts">
  import { getContext, tick, onMount } from "svelte";
  import type { Writable } from "svelte/store";
  import type { ThemeConfig } from "$lib/theme/defaults";
  import { defaultTheme } from "$lib/theme/defaults";
  import { selectedCurrency } from "$lib/stores/currency";
  import { getCurrencyShortDisplay, type CurrencyCode } from "$lib/currency/formats";

  // Get theme from context
  const themeStore = getContext<Writable<ThemeConfig>>("theme");
  $: theme = $themeStore ?? defaultTheme;

  // Currency configuration from theme
  $: currencyConfig = theme.currency ?? defaultTheme.currency;
  $: displayCurrencies = currencyConfig.displayCurrencies ?? defaultTheme.currency.displayCurrencies;

  // Derive active currency directly from store with fallback
  $: activeCurrency = $selectedCurrency ?? displayCurrencies?.[0] ?? "CZK";

  // Auto-select first currency on mount if none is selected
  // This ensures single-price display on initial load
  onMount(() => {
    if ($selectedCurrency === null && displayCurrencies.length > 0) {
      selectedCurrency.set(displayCurrencies[0]);
    }
  });

  // Set the selected currency with immediate DOM update
  async function selectCurrency(currency: CurrencyCode) {
    selectedCurrency.set(currency);
    await tick(); // Force immediate DOM update
  }
</script>

{#if displayCurrencies.length > 1}
  <div class="currency-lens" role="group" aria-label="Select currency">
    {#each displayCurrencies as currency}
      <button
        class="lens-button"
        class:active={currency === activeCurrency}
        on:click={() => selectCurrency(currency)}
        aria-pressed={currency === activeCurrency}
        data-testid="currency-{currency}"
      >
        {getCurrencyShortDisplay(currency)}
      </button>
    {/each}
  </div>
{/if}

<style>
  .currency-lens {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: var(--color-surface, var(--surface, #f5f5f5));
    border: 1px solid var(--color-border, var(--border, #e5e5e5));
    border-radius: 8px;
    padding: 3px;
    font-family: var(--font-body, system-ui, sans-serif);
  }

  .lens-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 28px;
    padding: 0 8px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text-muted, var(--text-muted, #666));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .lens-button:hover:not(.active) {
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text, var(--text, #1a1a1a));
  }

  .lens-button.active {
    background: var(--color-bg, var(--bg, #fff));
    color: var(--color-price, var(--price, #2d5016));
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    font-weight: 600;
  }

  .lens-button:focus-visible {
    outline: 2px solid var(--color-accent, var(--accent));
    outline-offset: 1px;
  }

  /* Dark mode adjustments */
  @media (prefers-color-scheme: dark) {
    .lens-button:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
    }
  }
</style>
