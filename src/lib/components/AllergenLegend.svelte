<script lang="ts">
  import { EU_ALLERGENS } from '$lib/allergens';
  import { lang, t } from '$lib/i18n/store';
</script>

<section class="allergen-legend" aria-label="Allergen legend">
  <h3 class="legend-title">{$t.allergens}</h3>
  <div class="legend-grid">
    {#each EU_ALLERGENS as allergen}
      <div class="legend-item">
        <span class="legend-number">{allergen.number}</span>
        <div class="legend-names">
          <span class="legend-name-primary">{$lang === 'cs' ? allergen.nameCZ : allergen.name}</span>
          <span class="legend-name-secondary">{$lang === 'cs' ? allergen.name : allergen.nameCZ}</span>
        </div>
      </div>
      {#if allergen.subTypes}
        {#each allergen.subTypes as sub}
          <div class="legend-item legend-subtype">
            <span class="legend-number legend-number-sub">{sub.code}</span>
            <div class="legend-names">
              <span class="legend-name-primary">{$lang === 'cs' ? sub.nameCZ : sub.name}</span>
              <span class="legend-name-secondary">{$lang === 'cs' ? sub.name : sub.nameCZ}</span>
            </div>
          </div>
        {/each}
      {/if}
    {/each}
  </div>
</section>

<style>
  .allergen-legend {
    padding-top: 0;
  }

  .legend-title {
    font-family: var(--font-headline, serif);
    font-size: var(--text-subheadline, 1.25rem);
    font-weight: 600;
    color: var(--color-text, #2C2C2C);
    margin-bottom: 1rem;
  }

  .legend-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem 2rem;
  }

  @media (max-width: 480px) {
    .legend-grid {
      grid-template-columns: 1fr;
    }
  }

  .legend-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }

  .legend-subtype {
    padding-left: 1rem;
  }

  .legend-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2em;
    height: 2em;
    padding: 0 0.2em;
    border-radius: 50%;
    border: 1.5px solid var(--color-accent, #E83636);
    font-size: 0.75rem;
    font-family: var(--font-price, var(--font-body, sans-serif));
    font-weight: 600;
    color: var(--color-accent, #E83636);
    flex-shrink: 0;
  }

  .legend-number-sub {
    font-size: 0.625rem;
    min-width: 1.75em;
    height: 1.75em;
  }

  .legend-names {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .legend-name-primary {
    font-family: var(--font-body, sans-serif);
    font-size: 0.8125rem;
    color: var(--color-text, #2C2C2C);
    font-weight: 500;
  }

  .legend-subtype .legend-name-primary {
    font-size: 0.75rem;
    font-weight: 400;
  }

  .legend-name-secondary {
    font-family: var(--font-body, sans-serif);
    font-size: 0.75rem;
    color: var(--color-text-muted, #6B6B6B);
  }

  .legend-subtype .legend-name-secondary {
    font-size: 0.6875rem;
  }
</style>
