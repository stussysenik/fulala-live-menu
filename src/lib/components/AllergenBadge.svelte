<script lang="ts">
  import { getAllergenByCode } from '$lib/allergens';
  import { lang } from '$lib/i18n/store';

  export let code: string;

  $: info = getAllergenByCode(code);
  $: title = info
    ? info.subType
      ? `${info.allergen.name} (${info.subType})`
      : info.allergen.name
    : `Allergen ${code}`;
  $: tooltipText = info
    ? $lang === 'cs'
      ? info.subTypeCZ || info.allergen.nameCZ
      : info.subType || info.allergen.name
    : code;
</script>

<span
  class="allergen-badge"
  {title}
  aria-label={title}
  data-tooltip={tooltipText}
>
  {code}
</span>

<style>
  .allergen-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.75em;
    height: 1.75em;
    padding: 0 0.3em;
    border-radius: 50%;
    border: 1.5px solid var(--color-accent, #E83636);
    font-size: var(--text-allergen, 0.75rem);
    font-family: var(--font-price, var(--font-body, sans-serif));
    font-weight: 600;
    color: var(--color-accent, #E83636);
    line-height: 1;
    cursor: help;
    flex-shrink: 0;
    position: relative;
  }

  .allergen-badge::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--color-text, #2C2C2C);
    color: #fff;
    font-size: 0.6875rem;
    font-weight: 400;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: none;
    z-index: 10;
  }

  .allergen-badge:hover::after,
  .allergen-badge:focus::after {
    opacity: 1;
  }
</style>
