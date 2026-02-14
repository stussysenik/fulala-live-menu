<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ColorPicker from "./ColorPicker.svelte";
  import TypographyPanel from "./TypographyPanel.svelte";
  import type { ThemeConfig, CurrencyDisplayMode } from "$lib/theme/defaults";
  import { defaultTheme } from "$lib/theme/defaults";
  import type { CurrencyCode } from "$lib/currency/formats";
  import { getCurrencyName } from "$lib/currency/formats";
  import { browser } from "$app/environment";
  import { useAction } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";

  export let theme: ThemeConfig;

  const dispatch = createEventDispatcher<{ change: ThemeConfig }>();

  // Active tab
  let activeTab: "colors" | "typography" | "display" | "currency" = "colors";

  // Exchange rates action (only on browser)
  const refreshRates = browser ? useAction(api.exchangeRates.refreshExchangeRates) : null;
  let isLoadingRates = false;
  let ratesLastUpdated: string | null = null;

  async function fetchLatestRates() {
    isLoadingRates = true;
    try {
      const rates = await refreshRates?.();
      // Update the local theme with new rates
      updateTheme({
        currency: {
          ...theme.currency,
          rates,
        },
      });
      ratesLastUpdated = new Date().toLocaleTimeString();
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error);
      alert("Failed to fetch exchange rates. Please try again.");
    } finally {
      isLoadingRates = false;
    }
  }

  // All available currencies
  const allCurrencies: CurrencyCode[] = ["CZK", "EUR", "USD", "CNY"];

  // Ensure theme has currency config (for backward compatibility)
  $: if (theme && !theme.currency) {
    theme = { ...theme, currency: defaultTheme.currency };
  }

  function updateTheme(updates: Partial<ThemeConfig>) {
    theme = { ...theme, ...updates };
    dispatch("change", theme);
  }

  function updateColors(key: keyof ThemeConfig["colors"], value: string) {
    updateTheme({
      colors: { ...theme.colors, [key]: value },
    });
  }

  function updateTypography(
    key: keyof ThemeConfig["typography"],
    value: string | number
  ) {
    updateTheme({
      typography: { ...theme.typography, [key]: value },
    });
  }

  function updateFonts(key: keyof ThemeConfig["fonts"], value: string) {
    updateTheme({
      fonts: { ...theme.fonts, [key]: value },
    });
  }

  function updateDisplay(
    key: keyof ThemeConfig["display"],
    value: boolean | string
  ) {
    updateTheme({
      display: { ...theme.display, [key]: value },
    });
  }

  function updateSpacing(key: keyof ThemeConfig["spacing"], value: string | number) {
    updateTheme({
      spacing: { ...theme.spacing, [key]: value },
    });
  }

  function updateTv(key: keyof ThemeConfig["tv"], value: number) {
    updateTheme({
      tv: { ...theme.tv, [key]: value },
    });
  }

  function updateCurrency<K extends keyof ThemeConfig["currency"]>(
    key: K,
    value: ThemeConfig["currency"][K]
  ) {
    updateTheme({
      currency: { ...theme.currency, [key]: value },
    });
  }

  function updateRate(currency: CurrencyCode, value: number) {
    updateTheme({
      currency: {
        ...theme.currency,
        rates: { ...theme.currency.rates, [currency]: value },
      },
    });
  }

  function toggleDisplayCurrency(currency: CurrencyCode, enabled: boolean) {
    const current = theme.currency.displayCurrencies;
    let updated: CurrencyCode[];

    if (enabled) {
      updated = [...current, currency];
    } else {
      updated = current.filter((c) => c !== currency);
    }

    // Ensure at least one currency is always selected
    if (updated.length === 0) {
      updated = [theme.currency.baseCurrency];
    }

    updateCurrency("displayCurrencies", updated);
  }

  function isDisplayCurrencyEnabled(currency: CurrencyCode): boolean {
    return theme.currency.displayCurrencies.includes(currency);
  }

  function handleBaseCurrencyChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    updateCurrency("baseCurrency", target.value as CurrencyCode);
  }
</script>

<div class="theme-editor">
  <div class="tabs">
    <button
      class="tab"
      class:active={activeTab === "colors"}
      on:click={() => (activeTab = "colors")}
    >
      Colors
    </button>
    <button
      class="tab"
      class:active={activeTab === "typography"}
      on:click={() => (activeTab = "typography")}
    >
      Typography
    </button>
    <button
      class="tab"
      class:active={activeTab === "display"}
      on:click={() => (activeTab = "display")}
    >
      Display
    </button>
    <button
      class="tab"
      class:active={activeTab === "currency"}
      on:click={() => (activeTab = "currency")}
    >
      Currency
    </button>
  </div>

  <div class="tab-content">
    {#if activeTab === "colors"}
      <div class="colors-panel">
        <h3 class="panel-title">Colors</h3>

        <div class="color-section">
          <h4 class="section-title">Text Colors</h4>
          <div class="color-grid">
            <ColorPicker
              value={theme.colors.text}
              label="Primary Text"
              contrastWith={theme.colors.background}
              on:change={(e) => updateColors("text", e.detail)}
            />
            <ColorPicker
              value={theme.colors.textMuted}
              label="Muted Text"
              contrastWith={theme.colors.background}
              on:change={(e) => updateColors("textMuted", e.detail)}
            />
            <ColorPicker
              value={theme.colors.price}
              label="Price"
              contrastWith={theme.colors.background}
              on:change={(e) => updateColors("price", e.detail)}
            />
          </div>
        </div>

        <div class="color-section">
          <h4 class="section-title">Background Colors</h4>
          <div class="color-grid">
            <ColorPicker
              value={theme.colors.background}
              label="Background"
              on:change={(e) => updateColors("background", e.detail)}
            />
            <ColorPicker
              value={theme.colors.surface}
              label="Surface"
              on:change={(e) => updateColors("surface", e.detail)}
            />
            <ColorPicker
              value={theme.colors.border}
              label="Border"
              on:change={(e) => updateColors("border", e.detail)}
            />
          </div>
        </div>

        <div class="color-section">
          <h4 class="section-title">Accent & Status Colors</h4>
          <div class="color-grid">
            <ColorPicker
              value={theme.colors.accent}
              label="Accent"
              contrastWith={theme.colors.background}
              on:change={(e) => updateColors("accent", e.detail)}
            />
            <ColorPicker
              value={theme.colors.available}
              label="Available"
              on:change={(e) => updateColors("available", e.detail)}
            />
            <ColorPicker
              value={theme.colors.unavailable}
              label="Unavailable"
              on:change={(e) => updateColors("unavailable", e.detail)}
            />
          </div>
        </div>
      </div>
    {:else if activeTab === "typography"}
      <TypographyPanel
        typography={theme.typography}
        fonts={theme.fonts}
        on:changeTypography={(e) => updateTypography(e.detail.key, e.detail.value)}
        on:changeFonts={(e) => updateFonts(e.detail.key, e.detail.value)}
      />
    {:else if activeTab === "display"}
      <div class="display-panel">
        <h3 class="panel-title">Display Settings</h3>

        <div class="display-section">
          <h4 class="section-title">Price Display</h4>
          <div class="fields">
            <label class="checkbox-field">
              <input
                type="checkbox"
                checked={theme.display.showCurrencySymbol}
                on:change={(e) =>
                  updateDisplay("showCurrencySymbol", e.currentTarget.checked)}
              />
              <span>Show currency symbol ($)</span>
              <span class="hint">Research shows ~8% higher spending without $</span>
            </label>

            <label class="field">
              <span class="field-label">Price Alignment</span>
              <select
                value={theme.display.priceAlignment}
                on:change={(e) => updateDisplay("priceAlignment", e.currentTarget.value)}
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="dots">With Dots (...)</option>
              </select>
            </label>
          </div>
        </div>

        <div class="display-section">
          <h4 class="section-title">Images</h4>
          <div class="fields">
            <label class="checkbox-field">
              <input
                type="checkbox"
                checked={theme.display.showImages}
                on:change={(e) =>
                  updateDisplay("showImages", e.currentTarget.checked)}
              />
              <span>Show menu item images</span>
            </label>

            <label class="field">
              <span class="field-label">Image Size</span>
              <select
                value={theme.display.imageSize}
                on:change={(e) => updateDisplay("imageSize", e.currentTarget.value)}
                disabled={!theme.display.showImages}
              >
                <option value="small">Small (60px)</option>
                <option value="medium">Medium (100px)</option>
                <option value="large">Large (150px)</option>
              </select>
            </label>
          </div>
        </div>

        <div class="display-section">
          <h4 class="section-title">Spacing</h4>
          <div class="fields">
            <label class="field">
              <span class="field-label">Item Gap</span>
              <select
                value={theme.spacing.itemGap}
                on:change={(e) => updateSpacing("itemGap", e.currentTarget.value)}
              >
                <option value="0.5rem">Compact</option>
                <option value="1rem">Normal</option>
                <option value="1.5rem">Relaxed</option>
                <option value="2rem">Spacious</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">Category Gap</span>
              <select
                value={theme.spacing.categoryGap}
                on:change={(e) => updateSpacing("categoryGap", e.currentTarget.value)}
              >
                <option value="1rem">Compact</option>
                <option value="2rem">Normal</option>
                <option value="3rem">Relaxed</option>
                <option value="4rem">Spacious</option>
              </select>
            </label>
          </div>
        </div>

        <div class="display-section">
          <h4 class="section-title">TV Display</h4>
          <div class="fields">
            <label class="field">
              <span class="field-label">Scale Factor: {theme.tv.scaleFactor}x</span>
              <input
                type="range"
                min="1"
                max="2"
                step="0.1"
                value={theme.tv.scaleFactor}
                on:input={(e) => updateTv("scaleFactor", parseFloat(e.currentTarget.value))}
              />
            </label>

            <label class="field">
              <span class="field-label">Column Count</span>
              <select
                value={theme.tv.columnCount}
                on:change={(e) => updateTv("columnCount", parseInt(e.currentTarget.value))}
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    {:else if activeTab === "currency"}
      <div class="currency-panel">
        <h3 class="panel-title">Currency Settings</h3>

        <div class="display-section">
          <h4 class="section-title">Base Currency</h4>
          <div class="fields">
            <label class="field">
              <span class="field-label">Prices are stored in</span>
              <select
                value={theme.currency.baseCurrency}
                on:change={handleBaseCurrencyChange}
              >
                {#each allCurrencies as currency}
                  <option value={currency}>{currency} - {getCurrencyName(currency)}</option>
                {/each}
              </select>
              <span class="hint">All menu item prices should be entered in this currency</span>
            </label>
          </div>
        </div>

        <div class="display-section">
          <h4 class="section-title">Display Currencies</h4>
          <p class="section-hint">Select which currencies to show to customers</p>
          <div class="currency-checkboxes">
            {#each allCurrencies as currency}
              <label class="checkbox-field currency-checkbox">
                <input
                  type="checkbox"
                  checked={isDisplayCurrencyEnabled(currency)}
                  on:change={(e) => toggleDisplayCurrency(currency, e.currentTarget.checked)}
                />
                <span class="currency-label">
                  <strong>{currency}</strong>
                  <span class="currency-name">{getCurrencyName(currency)}</span>
                </span>
              </label>
            {/each}
          </div>
        </div>

        <div class="display-section">
          <h4 class="section-title">Display Mode</h4>
          <div class="radio-group">
            <label class="radio-field">
              <input
                type="radio"
                name="displayMode"
                value="multi"
                checked={theme.currency.displayMode === "multi"}
                on:change={() => updateCurrency("displayMode", "multi")}
              />
              <span class="radio-content">
                <strong>Multi</strong>
                <span class="radio-hint">Show all currencies inline (e.g., 250 Kč · €10 · $11)</span>
              </span>
            </label>
            <label class="radio-field">
              <input
                type="radio"
                name="displayMode"
                value="single"
                checked={theme.currency.displayMode === "single"}
                on:change={() => updateCurrency("displayMode", "single")}
              />
              <span class="radio-content">
                <strong>Single</strong>
                <span class="radio-hint">Show only the first selected currency</span>
              </span>
            </label>
            <label class="radio-field">
              <input
                type="radio"
                name="displayMode"
                value="toggle"
                checked={theme.currency.displayMode === "toggle"}
                on:change={() => updateCurrency("displayMode", "toggle")}
              />
              <span class="radio-content">
                <strong>Toggle</strong>
                <span class="radio-hint">Customers can click to cycle through currencies</span>
              </span>
            </label>
          </div>
        </div>

        <div class="display-section">
          <h4 class="section-title">Exchange Rates</h4>
          <p class="section-hint">Set conversion rates from {theme.currency.baseCurrency}</p>
          <div class="rates-grid">
            {#each allCurrencies as currency}
              {#if currency !== theme.currency.baseCurrency}
                <label class="field rate-field" data-testid="rate-{currency}">
                  <span class="field-label">
                    1 {theme.currency.baseCurrency} =
                  </span>
                  <div class="rate-input-group">
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={theme.currency.rates[currency]}
                      on:input={(e) => {
                        const val = parseFloat(e.currentTarget.value);
                        if (val > 0) updateRate(currency, val);
                      }}
                    />
                    <span class="rate-currency">{currency}</span>
                  </div>
                </label>
              {/if}
            {/each}
          </div>
          <div class="fetch-rates-row">
            <button
              class="fetch-rates-btn"
              on:click={fetchLatestRates}
              disabled={isLoadingRates}
              data-testid="fetch-rates-btn"
            >
              {#if isLoadingRates}
                Fetching...
              {:else}
                Fetch Latest Rates
              {/if}
            </button>
            {#if ratesLastUpdated}
              <span class="rates-updated">Updated at {ratesLastUpdated}</span>
            {/if}
          </div>
        </div>

        <div class="display-section">
          <h4 class="section-title">Formatting Options</h4>
          <div class="fields">
            <label class="checkbox-field">
              <input
                type="checkbox"
                checked={theme.currency.showSymbols}
                on:change={(e) => updateCurrency("showSymbols", e.currentTarget.checked)}
              />
              <span>Show currency symbols (€, $, Kč, ¥)</span>
            </label>

            <label class="checkbox-field">
              <input
                type="checkbox"
                checked={theme.currency.compactMode}
                on:change={(e) => updateCurrency("compactMode", e.currentTarget.checked)}
              />
              <span>Compact mode (no decimals where appropriate)</span>
              <span class="hint">CZK and CNY naturally have no decimals; EUR and USD will also hide .00</span>
            </label>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .theme-editor {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .tabs {
    display: flex;
    gap: var(--space-2);
    border-bottom: 1px solid var(--color-border, var(--border));
    padding-bottom: var(--space-2);
  }

  .tab {
    padding: var(--space-2) var(--space-4);
    border: none;
    background: transparent;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-muted, var(--text-muted));
    cursor: pointer;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .tab:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text, var(--text));
  }

  .tab.active {
    background: var(--color-accent, var(--accent));
    color: white;
  }

  .tab-content {
    padding: var(--space-4) 0;
  }

  .panel-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text, var(--text));
    margin: 0 0 var(--space-4) 0;
  }

  .section-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-muted, var(--text-muted));
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 var(--space-3) 0;
  }

  .color-section,
  .display-section {
    margin-bottom: var(--space-5);
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text, var(--text));
  }

  select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-text, var(--text));
    background: var(--color-bg, var(--bg));
    cursor: pointer;
    max-width: 300px;
  }

  select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  select:focus {
    outline: none;
    border-color: var(--color-accent, var(--accent));
  }

  .checkbox-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    cursor: pointer;
  }

  .checkbox-field > span:first-of-type {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-text, var(--text));
  }

  .checkbox-field input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted, var(--text-muted));
    margin-left: 26px;
  }

  input[type="range"] {
    width: 100%;
    max-width: 300px;
    height: 8px;
    border-radius: 4px;
    background: var(--color-border, var(--border));
    appearance: none;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-accent, var(--accent));
    cursor: pointer;
  }

  /* Currency panel styles */
  .section-hint {
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--text-muted));
    margin-bottom: var(--space-3);
  }

  .currency-checkboxes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-2);
  }

  .currency-checkbox {
    flex-direction: row !important;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg, var(--bg));
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
    transition: border-color 0.15s ease;
  }

  .currency-checkbox:hover {
    border-color: var(--color-accent, var(--accent));
  }

  .currency-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .currency-name {
    font-size: var(--text-xs);
    color: var(--color-text-muted, var(--text-muted));
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .radio-field {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg, var(--bg));
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color 0.15s ease;
  }

  .radio-field:hover {
    border-color: var(--color-accent, var(--accent));
  }

  .radio-field input[type="radio"] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    cursor: pointer;
  }

  .radio-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .radio-hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted, var(--text-muted));
  }

  .rates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
  }

  .rate-field {
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg, var(--bg));
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
  }

  .rate-input-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  .rate-input-group input[type="number"] {
    flex: 1;
    padding: var(--space-2);
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    max-width: 120px;
  }

  .rate-input-group input[type="number"]:focus {
    outline: none;
    border-color: var(--color-accent, var(--accent));
  }

  .rate-currency {
    font-weight: 600;
    color: var(--color-text, var(--text));
    min-width: 36px;
  }

  .fetch-rates-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  .fetch-rates-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: var(--color-surface, var(--surface));
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text, var(--text));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .fetch-rates-btn:hover:not(:disabled) {
    background: var(--color-accent, var(--accent));
    border-color: var(--color-accent, var(--accent));
    color: white;
  }

  .fetch-rates-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .rates-updated {
    font-size: var(--text-xs);
    color: var(--color-available, var(--available));
  }
</style>
