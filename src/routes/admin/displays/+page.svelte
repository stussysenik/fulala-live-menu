<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery, useMutation } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";
  import SectionComposer from "$lib/components/admin/SectionComposer.svelte";

  // In-page composer: clicking "Compose sections" splits this page into a
  // cards rail + composer panel (CSS grid) — no navigation, the live
  // preview opens where you already are. A dedicated edit page exists too
  // (/admin/displays/compose/<slug>) for full-width focus and deep links.
  let composing: string | null = null;

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
      composable: true, // renders from a published section config
    },
    {
      slug: "tv-noodles",
      title: "TV — Noodles",
      subtitle: "Polévky s nudlemi / Noodle soups screen",
      href: "/tv-noodles",
      editHref: "/admin/menu",
      editLabel: "Edit noodle items",
      toggles: ["showImages", "showChinese", "showAllergens"] as const,
      composable: true, // renders from a published section config
    },
    {
      slug: "tv-info",
      title: "TV — Info & Drinks",
      subtitle: "Discounts, extras and drinks screen",
      href: "/tv-info",
      editHref: "/admin/schedule",
      editLabel: "Edit schedule",
      toggles: ["showImages", "showChinese"] as const,
      composable: true, // renders from a published section config
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

  // Management layer: physical screens (tv-*) carry a master switch. Off =
  // the TV shows a branded standby instead of content; the mobile menu
  // (home) is a website, not a display, so it has no switch.
  $: settingsMap = ($pageSettings ?? {}) as Record<string, Record<string, boolean>>;

  function displayOn(
    settings: Record<string, Record<string, boolean>>,
    slug: string,
  ): boolean {
    return !slug.startsWith("tv-") || (settings[slug]?.isActive ?? true);
  }

  $: activePages = MANAGED_PAGES.filter((p) => displayOn(settingsMap, p.slug));
  $: hiddenPages = MANAGED_PAGES.filter((p) => !displayOn(settingsMap, p.slug));
</script>

<div class="displays-admin" class:split={composing !== null}>
  <header class="page-header">
    <h1>Displays</h1>
    <p class="subtitle">
      Manage each screen individually — changes apply live to open displays.
    </p>
  </header>

  <div class="cards-rail">
  {#each [{ title: "Active displays", pages: activePages, off: false }, { title: "Switched off", pages: hiddenPages, off: true }] as group (group.title)}
    {#if group.pages.length > 0}
      <h2 class="group-title" class:group-off={group.off}>{group.title}</h2>
      <div class="display-grid" class:grid-off={group.off}>
    {#each group.pages as p (p.slug)}
      <section class="display-card" class:card-off={group.off}>
        <div class="card-head">
          <div>
            <h2>{p.title}</h2>
            <p class="card-subtitle">{p.subtitle}</p>
          </div>
          <code class="slug">/{p.slug === "home" ? "" : p.slug}</code>
        </div>

        {#if p.slug.startsWith("tv-")}
          <label class="toggle-row master-row">
            <span class="toggle-label master-label">Display on</span>
            <button
              type="button"
              class="switch"
              class:on={displayOn(settingsMap, p.slug)}
              role="switch"
              aria-checked={displayOn(settingsMap, p.slug)}
              aria-label={`Display on — ${p.title}`}
              on:click={() => toggle(p.slug, "isActive")}
            >
              <span class="knob"></span>
            </button>
          </label>
        {/if}

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
          {#if "composable" in p && p.composable}
            <button
              type="button"
              class="action action-btn"
              class:action-active={composing === p.slug}
              on:click={() => (composing = composing === p.slug ? null : p.slug)}
            >
              {composing === p.slug ? "Close composer" : "Compose sections"}
            </button>
            <a class="action" href={`/admin/displays/compose/${p.slug}`}>
              Edit page ↗
            </a>
          {/if}
        </div>
      </section>
    {/each}
      </div>
    {/if}
  {/each}
  </div>

  {#if composing !== null}
    <aside class="composer-panel">
      <div class="composer-panel-head">
        <h2>Compose — <code>/{composing}</code></h2>
        <div class="composer-panel-actions">
          <a class="action" href={`/admin/displays/compose/${composing}`}>
            Open edit page ↗
          </a>
          <button
            type="button"
            class="panel-close"
            aria-label="Close composer"
            on:click={() => (composing = null)}>✕</button
          >
        </div>
      </div>
      {#key composing}
        <SectionComposer slug={composing} />
      {/key}
    </aside>
  {/if}
</div>

<style>
  .displays-admin {
    max-width: 960px;
  }

  /* Split mode: same page divides into a cards rail + composer panel.
     CSS grid keeps it one fluid surface — no navigation, no context loss. */
  .displays-admin.split {
    max-width: none;
    display: grid;
    grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;
  }

  .displays-admin.split .page-header {
    grid-column: 1 / -1;
  }

  .displays-admin.split .display-grid {
    grid-template-columns: 1fr;
  }

  .composer-panel {
    border: 1px solid #e8e8e4;
    border-radius: 12px;
    background: #fff;
    padding: 1rem 1.25rem;
    min-width: 0;
  }

  .composer-panel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f0f0ec;
  }

  .composer-panel-head h2 {
    font-size: 1.05rem;
    font-weight: 650;
    color: #2c2c2c;
  }

  .composer-panel-head code {
    font-size: 0.9rem;
    background: #f5f5f2;
    border-radius: 6px;
    padding: 1px 8px;
  }

  .composer-panel-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .panel-close {
    width: 30px;
    height: 30px;
    border: 1px solid #e8e8e4;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    font-size: 0.875rem;
    line-height: 1;
  }

  .panel-close:hover {
    border-color: #2c2c2c;
  }

  /* Mobile: the panel takes the whole surface; close returns to the cards. */
  @media (max-width: 1000px) {
    .displays-admin.split {
      grid-template-columns: 1fr;
    }

    .displays-admin.split .cards-rail {
      display: none;
    }
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

  .group-title {
    font-size: 0.8125rem;
    font-weight: 650;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #6b6b6b;
    margin: 1.25rem 0 0.625rem;
  }

  .group-off {
    color: #b45309;
  }

  .card-off {
    opacity: 0.65;
    background: #fafaf8;
  }

  .master-row {
    border-bottom: 1px solid #f0f0ec;
    padding-bottom: 0.75rem;
  }

  .master-label {
    font-weight: 650;
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

  .action-btn {
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
  }

  .action-active {
    color: #b45309;
  }
</style>
