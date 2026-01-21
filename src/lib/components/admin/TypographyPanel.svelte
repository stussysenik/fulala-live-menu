<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ThemeConfig } from "$lib/theme/defaults";

  export let typography: ThemeConfig["typography"];
  export let fonts: ThemeConfig["fonts"];

  const dispatch = createEventDispatcher<{
    changeTypography: { key: keyof ThemeConfig["typography"]; value: string | number };
    changeFonts: { key: keyof ThemeConfig["fonts"]; value: string };
  }>();

  // Predefined font stacks
  const fontOptions = [
    { label: "System Default", value: "Helvetica Neue, Arial, sans-serif" },
    { label: "Georgia (Serif)", value: "Georgia, serif" },
    { label: "Inter", value: "Inter, sans-serif" },
    { label: "Playfair Display", value: "Playfair Display, serif" },
    { label: "Lato", value: "Lato, sans-serif" },
    { label: "Roboto", value: "Roboto, sans-serif" },
    { label: "Open Sans", value: "Open Sans, sans-serif" },
    { label: "Merriweather", value: "Merriweather, serif" },
    { label: "Montserrat", value: "Montserrat, sans-serif" },
    { label: "Source Sans Pro", value: "Source Sans Pro, sans-serif" },
  ];

  // Size presets
  const sizeOptions = [
    { label: "Extra Small", value: "0.75rem" },
    { label: "Small", value: "0.875rem" },
    { label: "Base", value: "1rem" },
    { label: "Large", value: "1.125rem" },
    { label: "Extra Large", value: "1.25rem" },
    { label: "2XL", value: "1.5rem" },
    { label: "3XL", value: "1.875rem" },
    { label: "4XL", value: "2.25rem" },
  ];

  function handleFontChange(key: keyof ThemeConfig["fonts"], event: Event) {
    const target = event.target as HTMLSelectElement;
    dispatch("changeFonts", { key, value: target.value });
  }

  function handleSizeChange(key: keyof ThemeConfig["typography"], event: Event) {
    const target = event.target as HTMLSelectElement;
    dispatch("changeTypography", { key, value: target.value });
  }

  function handleLineSpacingChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch("changeTypography", { key: "lineSpacing", value: parseFloat(target.value) });
  }
</script>

<div class="typography-panel">
  <h3 class="panel-title">Typography</h3>

  <div class="section">
    <h4 class="section-title">Font Families</h4>
    <div class="fields">
      <label class="field">
        <span class="field-label">Headline Font</span>
        <select value={fonts.headline} on:change={(e) => handleFontChange("headline", e)}>
          {#each fontOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <span class="preview" style="font-family: {fonts.headline}">Aa Bb Cc</span>
      </label>

      <label class="field">
        <span class="field-label">Body Font</span>
        <select value={fonts.body} on:change={(e) => handleFontChange("body", e)}>
          {#each fontOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <span class="preview" style="font-family: {fonts.body}">Aa Bb Cc</span>
      </label>

      <label class="field">
        <span class="field-label">Price Font</span>
        <select value={fonts.price} on:change={(e) => handleFontChange("price", e)}>
          {#each fontOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <span class="preview" style="font-family: {fonts.price}">12.50</span>
      </label>
    </div>
  </div>

  <div class="section">
    <h4 class="section-title">Font Sizes</h4>
    <div class="fields">
      <label class="field">
        <span class="field-label">Headline Size</span>
        <select value={typography.headlineSize} on:change={(e) => handleSizeChange("headlineSize", e)}>
          {#each sizeOptions as option}
            <option value={option.value}>{option.label} ({option.value})</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span class="field-label">Subheadline Size</span>
        <select value={typography.subheadlineSize} on:change={(e) => handleSizeChange("subheadlineSize", e)}>
          {#each sizeOptions as option}
            <option value={option.value}>{option.label} ({option.value})</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span class="field-label">Body Size</span>
        <select value={typography.bodySize} on:change={(e) => handleSizeChange("bodySize", e)}>
          {#each sizeOptions as option}
            <option value={option.value}>{option.label} ({option.value})</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span class="field-label">Price Size</span>
        <select value={typography.priceSize} on:change={(e) => handleSizeChange("priceSize", e)}>
          {#each sizeOptions as option}
            <option value={option.value}>{option.label} ({option.value})</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span class="field-label">Allergen/Small Text Size</span>
        <select value={typography.allergenSize} on:change={(e) => handleSizeChange("allergenSize", e)}>
          {#each sizeOptions.slice(0, 4) as option}
            <option value={option.value}>{option.label} ({option.value})</option>
          {/each}
        </select>
      </label>
    </div>
  </div>

  <div class="section">
    <h4 class="section-title">Line Spacing</h4>
    <label class="field">
      <span class="field-label">Line Height: {typography.lineSpacing}</span>
      <input
        type="range"
        min="1"
        max="2"
        step="0.1"
        value={typography.lineSpacing}
        on:input={handleLineSpacingChange}
      />
      <div class="range-labels">
        <span>Tight (1.0)</span>
        <span>Optimal (1.5)</span>
        <span>Loose (2.0)</span>
      </div>
    </label>
  </div>
</div>

<style>
  .typography-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .panel-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text, var(--text));
    margin: 0;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .section-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-muted, var(--text-muted));
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  }

  select:focus {
    outline: none;
    border-color: var(--color-accent, var(--accent));
  }

  .preview {
    font-size: var(--text-lg);
    color: var(--color-text-muted, var(--text-muted));
    padding: var(--space-1) 0;
  }

  input[type="range"] {
    width: 100%;
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

  .range-labels {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-xs);
    color: var(--color-text-muted, var(--text-muted));
    margin-top: var(--space-1);
  }
</style>
