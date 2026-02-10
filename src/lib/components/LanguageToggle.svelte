<script lang="ts">
  import { lang, toggleLang } from '$lib/i18n/store';
</script>

<button
  class="lang-toggle"
  on:click={toggleLang}
  aria-label="Switch language to {$lang === 'cs' ? 'English' : 'Czech'}"
  title="{$lang === 'cs' ? 'Switch to English' : 'Přepnout do češtiny'}"
>
  <span class="lang-option" class:active={$lang === 'cs'}>CZ</span>
  <span class="lang-divider">/</span>
  <span class="lang-option" class:active={$lang === 'en'}>EN</span>
</button>

<style>
  .lang-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.25rem 0.625rem;
    border: 1px solid var(--color-border, #E8E8E4);
    border-radius: 1rem;
    background: var(--color-surface, #FFFFFF);
    cursor: pointer;
    font-family: var(--font-body, sans-serif);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    transition: border-color 200ms ease;
  }

  .lang-toggle:hover {
    border-color: var(--color-accent, #E83636);
  }

  .lang-option {
    color: var(--color-text-muted, #6B6B6B);
    transition: color 200ms ease;
  }

  .lang-option.active {
    color: var(--color-accent, #E83636);
  }

  .lang-divider {
    color: var(--color-border, #E8E8E4);
    font-weight: 400;
  }
</style>
