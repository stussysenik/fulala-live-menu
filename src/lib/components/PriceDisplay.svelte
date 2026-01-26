<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { ThemeConfig } from "$lib/theme/defaults";
  import { defaultTheme } from "$lib/theme/defaults";
  import { formatCurrency, type CurrencyCode } from "$lib/currency/formats";
  import { convertPrice } from "$lib/currency/converter";
  import { selectedCurrency as currencyLens } from "$lib/stores/currency";

  export let price: number; // Price in cents (in base currency)
  export let alignment: "left" | "right" | "dots" | undefined = undefined;

  // Get theme from context
  const themeStore = getContext<Writable<ThemeConfig>>("theme");
  $: theme = $themeStore ?? defaultTheme;

  // Currency configuration from theme (with fallback to defaults)
  $: currencyConfig = theme.currency ?? defaultTheme.currency;
  $: baseCurrency = currencyConfig.baseCurrency;
  $: displayCurrencies = currencyConfig.displayCurrencies;
  $: displayMode = currencyConfig.displayMode;
  $: rates = currencyConfig.rates;
  $: showSymbols = currencyConfig.showSymbols;
  $: compactMode = currencyConfig.compactMode;

  // Use prop or fall back to theme setting
  $: effectiveAlignment = alignment ?? theme.display.priceAlignment;

  // Selected currency for toggle mode (internal state)
  let localToggleIndex = 0;
  $: localToggleCurrency = displayCurrencies[localToggleIndex] ?? baseCurrency;

  // Effective currency: use lens store if set, otherwise fall back to mode-specific logic
  $: effectiveCurrency = $currencyLens ?? displayCurrencies[0] ?? baseCurrency;

  // Convert and format a price for a specific currency
  function getFormattedPrice(
    cents: number,
    targetCurrency: CurrencyCode
  ): string {
    const converted = convertPrice(cents, baseCurrency, targetCurrency, rates);
    return formatCurrency(converted, targetCurrency, showSymbols, compactMode);
  }

  // Get all formatted prices for multi-currency display
  $: formattedPrices = displayCurrencies.map((currency) => ({
    currency,
    formatted: getFormattedPrice(price, currency),
  }));

  // Single formatted price (used for lens, single, and toggle modes)
  $: singlePrice = getFormattedPrice(
    price,
    displayMode === "toggle" && !$currencyLens ? localToggleCurrency : effectiveCurrency
  );

  // Toggle to next currency (only for toggle mode when no lens is active)
  function toggleCurrency() {
    localToggleIndex = (localToggleIndex + 1) % displayCurrencies.length;
  }

  // Check if lens mode is active (currency selected via CurrencyLens component)
  $: isLensActive = $currencyLens !== null;
</script>

<span
  class="price"
  class:dots={effectiveAlignment === "dots"}
  class:toggle-mode={displayMode === "toggle" && !isLensActive}
  data-alignment={effectiveAlignment}
  data-testid="price"
>
  {#if effectiveAlignment === "dots"}
    <span class="dots-fill"></span>
  {/if}

  {#if displayMode === "multi" && !isLensActive}
    <!-- Multi-currency display when no lens is active -->
    <span class="price-multi">
      {#each formattedPrices as { currency, formatted }, i}
        {#key formatted}
          <span class="price-value" data-currency={currency}>{formatted}</span>
        {/key}
        {#if i < formattedPrices.length - 1}
          <span class="price-separator" aria-hidden="true">·</span>
        {/if}
      {/each}
    </span>
  {:else if displayMode === "toggle" && !isLensActive}
    <!-- Toggle mode when no lens is active -->
    <button
      class="price-toggle"
      on:click={toggleCurrency}
      title="Click to show price in different currency"
      aria-label="Price: {singlePrice}. Click to toggle currency."
    >
      {#key singlePrice}
        <span class="price-value">{singlePrice}</span>
      {/key}
      {#if displayCurrencies.length > 1}
        <span class="toggle-indicator" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </span>
      {/if}
    </button>
  {:else}
    <!-- Single price display (lens active, single mode, or default) -->
    {#key singlePrice}
      <span class="price-value">{singlePrice}</span>
    {/key}
  {/if}
</span>

<style>
  .price {
    font-family: var(--font-price, var(--font));
    font-size: var(--text-price, var(--text-base));
    font-weight: 600;
    color: var(--color-price, var(--price, #2d5016));
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  .price[data-alignment="right"] {
    margin-left: auto;
  }

  .price[data-alignment="left"] {
    margin-right: auto;
  }

  .price.dots {
    display: flex;
    align-items: baseline;
    flex: 1;
    min-width: 0;
  }

  .dots-fill {
    flex: 1;
    border-bottom: 1px dotted var(--color-text-muted, var(--text-muted));
    margin: 0 0.5rem;
    min-width: 1rem;
  }

  .price-value {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    min-width: fit-content;
    display: inline-block;
    animation: price-pulse var(--anim-duration-normal, 400ms) var(--anim-ease-spring, ease);
  }

  @keyframes price-pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Multi-currency display */
  .price-multi {
    display: inline-flex;
    align-items: baseline;
    gap: 0.25rem;
    flex-wrap: wrap;
  }

  /* Mobile optimization for multi-currency mode */
  @media (max-width: 480px) {
    .price-multi {
      flex-wrap: nowrap;
      overflow: hidden;
      gap: 0.125rem;
      max-width: 100%;
    }

    .price-separator {
      margin: 0 0.0625rem;
    }
  }

  .price-separator {
    color: var(--color-text-muted, var(--text-muted));
    opacity: 0.6;
    margin: 0 0.125rem;
  }

  /* Toggle mode */
  .price-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    font: inherit;
    color: inherit;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    transition:
      background-color var(--anim-duration-quick, 200ms) var(--anim-ease-enter, ease),
      transform var(--anim-duration-quick, 200ms) var(--anim-ease-enter, ease);
  }

  .price-toggle:hover {
    background-color: color-mix(in srgb, var(--color-accent, var(--accent)) 10%, transparent);
    transform: scale(1.02);
  }

  .price-toggle:active {
    transform: scale(0.98);
  }

  .price-toggle:focus-visible {
    outline: 2px solid var(--color-accent, var(--accent));
    outline-offset: 2px;
  }

  .toggle-indicator {
    display: inline-flex;
    opacity: 0.5;
    transition:
      opacity var(--anim-duration-quick, 200ms) ease,
      transform var(--anim-duration-quick, 200ms) var(--anim-ease-spring, ease);
  }

  .toggle-indicator svg {
    width: 0.875em;
    height: 0.875em;
  }

  .price-toggle:hover .toggle-indicator {
    opacity: 0.8;
    transform: rotate(15deg);
  }
</style>
