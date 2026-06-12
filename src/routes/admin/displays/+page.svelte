<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery, useMutation } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";

  // Single source of truth for every display page the admin manages.
  // Slugs are the keys used in the siteSettings "page-settings" map.
  const MANAGED_PAGES = [
    {
      slug: "tv-dumplings",
      title: "TV — Dumplings",
      subtitle: "Parní knedlíčky / Steamed dumplings screen",
      href: "/tv-dumplings",
      editHref: "/admin/menu",
      editLabel: "Edit dumpling items",
      toggles: ["showImages", "showChinese", "showAllergens"] as const,
    },
    {
      slug: "tv-noodles",
      title: "TV — Noodles",
      subtitle: "Polévky s nudlemi / Noodle soups screen",
      href: "/tv-noodles",
      editHref: "/admin/menu",
      editLabel: "Edit noodle items",
      toggles: ["showImages", "showChinese", "showAllergens"] as const,
    },
    {
      slug: "tv-info",
      title: "TV — Info & Drinks",
      subtitle: "Discounts, extras and drinks screen",
      href: "/tv-info",
      editHref: "/admin/schedule",
      editLabel: "Edit schedule",
      toggles: ["showImages", "showChinese"] as const,
    },
    {
      slug: "home",
      title: "Digital Menu (home)",
      subtitle: "Mobile / web menu at the root URL",
      href: "/",
      editHref: "/admin/menu",
      editLabel: "Edit menu items",
      toggles: ["showImages", "showChinese", "showAllergens"] as const,
    },
  ];

  const TOGGLE_LABELS: Record<string, string> = {
    showImages: "Show images",
    showChinese: "Show Chinese names",
    showAllergens: "Show allergens",
  };

  const pageSettings = browser ? useQuery(api.settings.getPageSettings, {}) : null;
  const updatePageSetting = browser ? useMutation(api.settings.updatePageSetting) : null;

  // A flag is ON unless explicitly saved as false (matches display defaults).
  function flagValue(slug: string, flag: string): boolean {
    const v = ($pageSettings as Record<string, Record<string, boolean>> | undefined)?.[slug]?.[flag];
    return v ?? true;
  }

  async function toggle(slug: string, flag: string) {
    await updatePageSetting?.({
      slug,
      patch: { [flag]: !flagValue(slug, flag) },
    });
  }
</script>

<div class="displays-admin">
  <header class="page-header">
    <h1>Displays</h1>
    <p class="subtitle">
      Manage each screen individually — changes apply live to open displays.
    </p>
  </header>

  <div class="display-grid">
    {#each MANAGED_PAGES as p (p.slug)}
      <section class="display-card">
        <div class="card-head">
          <div>
            <h2>{p.title}</h2>
            <p class="card-subtitle">{p.subtitle}</p>
          </div>
          <code class="slug">/{p.slug === "home" ? "" : p.slug}</code>
        </div>

        <div class="toggles">
          {#each p.toggles as flag (flag)}
            <label class="toggle-row">
              <span class="toggle-label">{TOGGLE_LABELS[flag]}</span>
              <button
                type="button"
                class="switch"
                class:on={flagValue(p.slug, flag)}
                role="switch"
                aria-checked={flagValue(p.slug, flag)}
                aria-label={`${TOGGLE_LABELS[flag]} — ${p.title}`}
                on:click={() => toggle(p.slug, flag)}
              >
                <span class="knob"></span>
              </button>
            </label>
          {/each}
        </div>

        <div class="card-actions">
          <a class="action" href={p.href} target="_blank" rel="noopener">
            Open page ↗
          </a>
          <a class="action" href={p.editHref}>{p.editLabel}</a>
        </div>
      </section>
    {/each}
  </div>
</div>

<style>
  .displays-admin {
    max-width: 960px;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c2c2c;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #6b6b6b;
  }

  .display-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1rem;
  }

  .display-card {
    border: 1px solid #e8e8e4;
    border-radius: 12px;
    padding: 1.25rem;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .card-head h2 {
    font-size: 1.05rem;
    font-weight: 650;
    color: #2c2c2c;
  }

  .card-subtitle {
    font-size: 0.8125rem;
    color: #6b6b6b;
    margin-top: 2px;
  }

  .slug {
    font-size: 0.75rem;
    color: #6b6b6b;
    background: #f5f5f2;
    border-radius: 6px;
    padding: 2px 8px;
    white-space: nowrap;
  }

  .toggles {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .toggle-label {
    font-size: 0.875rem;
    color: #2c2c2c;
  }

  .switch {
    position: relative;
    width: 42px;
    height: 24px;
    border-radius: 999px;
    border: none;
    background: #d4d4d0;
    cursor: pointer;
    transition: background 0.15s ease;
    padding: 0;
    flex-shrink: 0;
  }

  .switch.on {
    background: #16a34a;
  }

  .knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.15s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .switch.on .knob {
    transform: translateX(18px);
  }

  .card-actions {
    display: flex;
    gap: 0.75rem;
    border-top: 1px solid #f0f0ec;
    padding-top: 0.875rem;
  }

  .action {
    font-size: 0.8125rem;
    font-weight: 550;
    color: #2563eb;
    text-decoration: none;
  }

  .action:hover {
    text-decoration: underline;
  }
</style>
