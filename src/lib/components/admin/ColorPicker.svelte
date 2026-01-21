<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let value: string;
  export let label: string;
  export let contrastWith: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ change: string }>();

  // Calculate relative luminance for WCAG contrast
  function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // Calculate WCAG contrast ratio
  function getContrastRatio(color1: string, color2: string): number {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Get contrast level based on WCAG guidelines
  function getContrastLevel(ratio: number): {
    label: string;
    class: string;
    pass: boolean;
  } {
    if (ratio >= 7) return { label: "AAA", class: "excellent", pass: true };
    if (ratio >= 4.5) return { label: "AA", class: "good", pass: true };
    if (ratio >= 3) return { label: "AA Large", class: "fair", pass: true };
    return { label: "Fail", class: "poor", pass: false };
  }

  $: contrastRatio = contrastWith
    ? getContrastRatio(value, contrastWith)
    : null;
  $: contrastLevel = contrastRatio ? getContrastLevel(contrastRatio) : null;

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch("change", target.value);
  }
</script>

<div class="color-picker">
  <label class="label">
    <span class="label-text">{label}</span>
    <div class="input-group">
      <input
        type="color"
        {value}
        on:input={handleChange}
        class="color-input"
      />
      <input
        type="text"
        {value}
        on:input={handleChange}
        class="text-input"
        pattern="^#[0-9A-Fa-f]{6}$"
        maxlength="7"
      />
    </div>
  </label>

  {#if contrastLevel}
    <div class="contrast-info" class:pass={contrastLevel.pass}>
      <span class="contrast-ratio">{contrastRatio?.toFixed(2)}:1</span>
      <span class="contrast-level {contrastLevel.class}">{contrastLevel.label}</span>
    </div>
  {/if}
</div>

<style>
  .color-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .label {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .label-text {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text, var(--text));
  }

  .input-group {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .color-input {
    width: 40px;
    height: 40px;
    border: 2px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
    padding: 2px;
    cursor: pointer;
    background: transparent;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input::-webkit-color-swatch {
    border: none;
    border-radius: calc(var(--radius-md) - 4px);
  }

  .text-input {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
    font-family: monospace;
    font-size: var(--text-sm);
    color: var(--color-text, var(--text));
    background: var(--color-bg, var(--bg));
    text-transform: uppercase;
  }

  .text-input:focus {
    outline: none;
    border-color: var(--color-accent, var(--accent));
  }

  .contrast-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    background: rgba(220, 38, 38, 0.1);
    border-radius: var(--radius-sm);
  }

  .contrast-info.pass {
    background: rgba(22, 163, 74, 0.1);
  }

  .contrast-ratio {
    font-size: var(--text-xs);
    font-family: monospace;
    color: var(--color-text-muted, var(--text-muted));
  }

  .contrast-level {
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }

  .contrast-level.excellent {
    background: rgba(22, 163, 74, 0.2);
    color: var(--color-available, var(--available));
  }

  .contrast-level.good {
    background: rgba(22, 163, 74, 0.15);
    color: var(--color-available, var(--available));
  }

  .contrast-level.fair {
    background: rgba(234, 179, 8, 0.2);
    color: #a16207;
  }

  .contrast-level.poor {
    background: rgba(220, 38, 38, 0.2);
    color: var(--color-unavailable, var(--unavailable));
  }
</style>
