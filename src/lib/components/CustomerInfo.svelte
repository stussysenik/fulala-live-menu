<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery } from "$lib/convex";
  import { api } from "../../../convex/_generated/api";
  import { lang, t } from '$lib/i18n/store';

  const customerInfo = browser ? useQuery(api.settings.getCustomerInfo, {}) : null;

  interface InfoSection {
    title: string;
    titleLocal?: string;
    description: string;
    descriptionLocal?: string;
  }

  function isStudentSection(section: InfoSection): boolean {
    const text = `${section.title} ${section.titleLocal ?? ''} ${section.description}`.toLowerCase();
    return text.includes('isic') || text.includes('student') || text.includes('studenti');
  }

  function getTitle(section: InfoSection, currentLang: string): string {
    return currentLang === 'cs' && section.titleLocal ? section.titleLocal : section.title;
  }

  function getDescription(section: InfoSection, currentLang: string): string {
    return currentLang === 'cs' && section.descriptionLocal ? section.descriptionLocal : section.description;
  }

  function getSecondaryDescription(section: InfoSection, currentLang: string): string | undefined {
    return currentLang === 'cs' ? section.description : section.descriptionLocal;
  }
</script>

{#if $customerInfo?.sections?.length}
  <section class="customer-info" aria-label="Customer information">
    <h3 class="info-title">{$t.info}</h3>
    <div class="info-grid">
      {#each $customerInfo.sections as section}
        <div class="info-card" class:isic-card={isStudentSection(section)}>
          {#if isStudentSection(section)}
            <img src="/images/isic-logo.png" alt="ISIC" class="isic-logo" />
          {/if}
          <div class="info-card-title">{getTitle(section, $lang)}</div>
          <div class="info-card-desc">{getDescription(section, $lang)}</div>
          {#if getSecondaryDescription(section, $lang)}
            <div class="info-card-desc-local">{getSecondaryDescription(section, $lang)}</div>
          {/if}
        </div>
      {/each}
    </div>
  </section>
{/if}

<style>
  .customer-info {
    padding-top: 0;
  }

  .info-title {
    font-family: var(--font-headline, serif);
    font-size: var(--text-subheadline, 1.25rem);
    font-weight: 600;
    color: var(--color-text, #2C2C2C);
    margin-bottom: 0.75rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .info-card {
    padding: 0.75rem;
    background: var(--color-surface, #FFFFFF);
    border: 1px solid var(--color-border, #E8E8E4);
    border-radius: 0.5rem;
  }

  .info-card-title {
    font-family: var(--font-body, sans-serif);
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text, #2C2C2C);
    margin-bottom: 0.25rem;
  }

  .info-card-desc {
    font-family: var(--font-body, sans-serif);
    font-size: 0.8125rem;
    color: var(--color-text-muted, #6B6B6B);
    line-height: 1.4;
  }

  .info-card-desc-local {
    font-family: var(--font-body, sans-serif);
    font-size: 0.75rem;
    color: var(--color-text-muted, #6B6B6B);
    opacity: 0.8;
    margin-top: 0.125rem;
  }

  /* ISIC student card teal styling */
  .isic-card {
    border-left: 3px solid #56C1BD;
    background: var(--color-surface, #FFFFFF);
    position: relative;
  }

  .isic-card .info-card-title {
    color: #006B6E;
  }

  .isic-logo {
    width: 3rem;
    height: auto;
    margin-bottom: 0.375rem;
    opacity: 0.9;
  }
</style>
