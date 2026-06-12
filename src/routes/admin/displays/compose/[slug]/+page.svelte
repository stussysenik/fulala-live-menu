<script lang="ts">
  /**
   * Section composer — arrange what a display page shows, then publish.
   *
   * Draft/publish model: edits live in a local working copy, "Save draft"
   * persists it (validated at the write boundary), "Publish" promotes the
   * draft to what TVs render and appends an immutable version row. The
   * props editors are generated from SECTION_TYPE_SPECS — the same pure
   * domain module the save mutation validates with, so the form literally
   * cannot offer a field the backend would reject.
   *
   * The live preview renders through the real SectionRenderer (the exact
   * code path TVs use) inside a scaled 1080px frame — what you see is what
   * publishes.
   */
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { useQuery, useMutation } from "$lib/convex";
  import { api } from "../../../../../../convex/_generated/api";
  import type { Id } from "../../../../../../convex/_generated/dataModel";
  import SectionRenderer from "$lib/components/sections/SectionRenderer.svelte";
  import {
    SECTION_TYPE_SPECS,
    SECTION_TYPES,
    defaultPropsFor,
    validateSectionConfig,
    DEFAULT_SECTION_CONFIGS,
    type DisplaySectionConfig,
    type SectionInstance,
  } from "$lib/domain/sectionConfig";

  // The slug is fixed for the lifetime of this page instance.
  const slug = $page.params.slug ?? "";

  // --- Server state ---------------------------------------------------------
  const draftQuery = browser
    ? useQuery(api.displaySections.getDraftConfig, { slug })
    : null;
  const versionsQuery = browser
    ? useQuery(api.displaySections.getVersions, { slug })
    : null;
  const categoriesQuery = browser ? useQuery(api.menu.getCategories, {}) : null;
  const allItemsQuery = browser ? useQuery(api.menu.getMenuItems, {}) : null;

  const saveDraftMutation = browser ? useMutation(api.displaySections.saveDraft) : null;
  const publishMutation = browser ? useMutation(api.displaySections.publish) : null;
  const restoreMutation = browser ? useMutation(api.displaySections.restoreVersion) : null;

  $: categories = ($categoriesQuery ?? []) as Array<{
    _id: string;
    name: string;
    displayName: string;
  }>;
  $: versions = ($versionsQuery ?? []) as Array<{
    _id: Id<"displayVersions">;
    version: number;
    publishedAt: number;
    note?: string;
    settings: DisplaySectionConfig;
  }>;

  // --- Local working copy ----------------------------------------------------
  // Initialized once from the stored draft (or the page's built-in default);
  // every edit mutates this copy, dirty = differs from the last saved state.
  let draft: DisplaySectionConfig | null = null;
  let savedSnapshot = "";
  let initialized = false;

  $: if (!initialized && $draftQuery !== undefined) {
    const base =
      ($draftQuery as DisplaySectionConfig | null) ??
      DEFAULT_SECTION_CONFIGS[slug] ??
      { sections: [] };
    draft = structuredClone(base);
    savedSnapshot = JSON.stringify(base);
    initialized = true;
  }

  $: dirty = draft !== null && JSON.stringify(draft) !== savedSnapshot;
  $: errors = draft ? validateSectionConfig(draft) : [];

  // Svelte 4 reactivity: array mutations need a reassignment to re-render.
  function touch() {
    if (draft) draft = { ...draft, sections: [...draft.sections] };
  }

  // --- Section list operations -----------------------------------------------
  let addType = SECTION_TYPES[0];

  function uniqueId(type: string): string {
    const ids = new Set(draft?.sections.map((s) => s.id));
    let n = 1;
    while (ids.has(`${type}-${n}`)) n++;
    return `${type}-${n}`;
  }

  function addSection() {
    if (!draft) return;
    draft.sections.push({
      id: uniqueId(addType),
      type: addType,
      props: defaultPropsFor(addType),
      visible: true,
    });
    touch();
  }

  function removeSection(index: number) {
    draft?.sections.splice(index, 1);
    touch();
  }

  function move(index: number, delta: number) {
    if (!draft) return;
    const target = index + delta;
    if (target < 0 || target >= draft.sections.length) return;
    const s = draft.sections;
    [s[index], s[target]] = [s[target], s[index]];
    touch();
  }

  function toggleVisible(section: SectionInstance) {
    section.visible = !section.visible;
    touch();
  }

  // Swapping type keeps the slot but resets props — a photo grid's columns
  // mean nothing to a text banner.
  function swapType(section: SectionInstance, type: string) {
    section.type = type;
    section.props = defaultPropsFor(type);
    touch();
  }

  function setProp(section: SectionInstance, key: string, value: unknown) {
    section.props = { ...section.props, [key]: value };
    touch();
  }

  function numberInput(section: SectionInstance, key: string, raw: string) {
    const n = Number(raw);
    if (Number.isFinite(n)) setProp(section, key, n);
  }

  // --- Photo warnings ---------------------------------------------------------
  // Computed locally from the full item list so warnings track every edit
  // instantly (no per-category re-subscription needed).
  $: photoWarnings = (() => {
    const items = ($allItemsQuery ?? []) as Array<{
      categoryId: string;
      imageUrl?: string;
      nameLocal?: string;
      name: string;
      isAvailable: boolean;
    }>;
    if (!draft || items.length === 0) return [];
    const byName = new Map(categories.map((c) => [c.name, c._id]));
    const warnings: Array<{ sectionId: string; categoryName: string; missing: string[] }> = [];
    for (const section of draft.sections) {
      if (section.type !== "category-photo-grid" || !section.visible) continue;
      const categoryName = String(section.props.categoryName ?? "");
      const categoryId = byName.get(categoryName);
      if (!categoryId) continue;
      const missing = items
        .filter((i) => i.categoryId === categoryId && i.isAvailable && !i.imageUrl)
        .map((i) => i.nameLocal || i.name);
      if (missing.length > 0) {
        warnings.push({ sectionId: section.id, categoryName, missing });
      }
    }
    return warnings;
  })();

  // --- Save / publish / restore ------------------------------------------------
  let publishNote = "";
  let busy = false;
  let statusMessage = "";

  async function saveDraft() {
    if (!draft || errors.length > 0) return;
    busy = true;
    statusMessage = "";
    try {
      await saveDraftMutation?.({ slug, config: draft });
      savedSnapshot = JSON.stringify(draft);
      statusMessage = "Draft saved.";
    } catch (e) {
      statusMessage = `Save failed: ${e instanceof Error ? e.message : e}`;
    } finally {
      busy = false;
    }
  }

  async function publish() {
    if (!draft || errors.length > 0) return;
    busy = true;
    statusMessage = "";
    try {
      // Publish promotes the STORED draft, so persist local edits first.
      await saveDraftMutation?.({ slug, config: draft });
      savedSnapshot = JSON.stringify(draft);
      const result = await publishMutation?.({
        slug,
        note: publishNote.trim() || undefined,
      });
      publishNote = "";
      statusMessage = `Published as version ${result?.version}.`;
    } catch (e) {
      statusMessage = `Publish failed: ${e instanceof Error ? e.message : e}`;
    } finally {
      busy = false;
    }
  }

  async function restore(versionId: Id<"displayVersions">, version: number) {
    if (
      !confirm(
        `Restore version ${version}? It is re-published immediately as a new version and becomes what the TV shows.`,
      )
    )
      return;
    busy = true;
    statusMessage = "";
    try {
      const result = await restoreMutation?.({ versionId });
      const row = versions.find((v) => v._id === versionId);
      if (row) {
        draft = structuredClone(row.settings);
        savedSnapshot = JSON.stringify(row.settings);
      }
      statusMessage = `Restored — live as version ${result?.version}.`;
    } catch (e) {
      statusMessage = `Restore failed: ${e instanceof Error ? e.message : e}`;
    } finally {
      busy = false;
    }
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleString("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<svelte:head>
  <title>Compose — {slug}</title>
</svelte:head>

<div class="composer">
  <header class="page-header">
    <div>
      <h1>Compose sections — <code>/{slug}</code></h1>
      <p class="subtitle">
        Arrange sections, edit their settings, then publish. TVs only change on publish.
      </p>
    </div>
    <a class="back" href="/admin/displays">← Displays</a>
  </header>

  {#if !initialized}
    <p class="loading">Loading draft…</p>
  {:else if draft}
    <div class="workspace">
      <!-- ===== Left: section list + editors ===== -->
      <div class="editor-pane">
        {#if errors.length > 0}
          <div class="errors" role="alert">
            {#each errors as error}
              <div>⚠ {error}</div>
            {/each}
          </div>
        {/if}

        {#each photoWarnings as warning (warning.sectionId)}
          <div class="photo-warning">
            <strong>{warning.categoryName}</strong>: {warning.missing.length}
            item{warning.missing.length === 1 ? "" : "s"} without a photo (placeholder tile
            shows) — {warning.missing.join(", ")}
          </div>
        {/each}

        {#each draft.sections as section, index (section.id)}
          {@const spec = SECTION_TYPE_SPECS[section.type]}
          <section class="section-card" class:hidden-section={!section.visible}>
            <div class="section-head">
              <div class="section-title">
                <span class="order-controls">
                  <button
                    type="button"
                    class="icon-btn"
                    title="Move up"
                    disabled={index === 0}
                    on:click={() => move(index, -1)}>↑</button
                  >
                  <button
                    type="button"
                    class="icon-btn"
                    title="Move down"
                    disabled={index === draft.sections.length - 1}
                    on:click={() => move(index, 1)}>↓</button
                  >
                </span>
                <select
                  class="type-select"
                  value={section.type}
                  aria-label="Section type"
                  on:change={(e) => swapType(section, e.currentTarget.value)}
                >
                  {#each SECTION_TYPES as type}
                    <option value={type}>{SECTION_TYPE_SPECS[type].label}</option>
                  {/each}
                </select>
              </div>
              <div class="section-actions">
                <label class="visibility">
                  <input
                    type="checkbox"
                    checked={section.visible}
                    on:change={() => toggleVisible(section)}
                  />
                  Visible
                </label>
                <button
                  type="button"
                  class="remove-btn"
                  on:click={() => removeSection(index)}>Remove</button
                >
              </div>
            </div>

            {#if spec}
              <p class="section-desc">{spec.description}</p>
              {#if spec.fields.length > 0}
                <div class="fields">
                  {#each spec.fields as field (field.key)}
                    <label class="field">
                      <span class="field-label">{field.label}</span>
                      {#if field.kind === "text"}
                        <input
                          type="text"
                          value={String(section.props[field.key] ?? field.default)}
                          on:input={(e) => setProp(section, field.key, e.currentTarget.value)}
                        />
                      {:else if field.kind === "number"}
                        <input
                          type="number"
                          min={field.min}
                          max={field.max}
                          value={Number(section.props[field.key] ?? field.default)}
                          on:input={(e) => numberInput(section, field.key, e.currentTarget.value)}
                        />
                      {:else if field.kind === "boolean"}
                        <input
                          type="checkbox"
                          checked={Boolean(section.props[field.key] ?? field.default)}
                          on:change={(e) => setProp(section, field.key, e.currentTarget.checked)}
                        />
                      {:else if field.kind === "select"}
                        <select
                          value={String(section.props[field.key] ?? field.default)}
                          on:change={(e) => setProp(section, field.key, e.currentTarget.value)}
                        >
                          {#each field.options ?? [] as option}
                            <option value={option}>{option}</option>
                          {/each}
                        </select>
                      {:else if field.kind === "category"}
                        <select
                          value={String(section.props[field.key] ?? field.default)}
                          on:change={(e) => setProp(section, field.key, e.currentTarget.value)}
                        >
                          {#each categories as category (category._id)}
                            <option value={category.name}>{category.displayName}</option>
                          {/each}
                        </select>
                      {/if}
                    </label>
                  {/each}
                </div>
              {/if}
            {/if}
          </section>
        {/each}

        <div class="add-row">
          <select bind:value={addType} aria-label="Section type to add">
            {#each SECTION_TYPES as type}
              <option value={type}>{SECTION_TYPE_SPECS[type].label}</option>
            {/each}
          </select>
          <button type="button" class="add-btn" on:click={addSection}>+ Add section</button>
        </div>

        <!-- ===== Toolbar ===== -->
        <div class="toolbar">
          <button
            type="button"
            class="save-btn"
            disabled={busy || !dirty || errors.length > 0}
            on:click={saveDraft}>Save draft</button
          >
          <input
            type="text"
            class="note-input"
            placeholder="Publish note (optional)"
            bind:value={publishNote}
          />
          <button
            type="button"
            class="publish-btn"
            disabled={busy || errors.length > 0}
            on:click={publish}>Publish to TV</button
          >
          {#if dirty}
            <span class="dirty-badge">unsaved changes</span>
          {/if}
        </div>
        {#if statusMessage}
          <p class="status" role="status">{statusMessage}</p>
        {/if}

        <!-- ===== Version history ===== -->
        <section class="history">
          <h2>Publish history</h2>
          {#if versions.length === 0}
            <p class="history-empty">
              Nothing published yet — the TV renders its built-in default.
            </p>
          {:else}
            <ul class="history-list">
              {#each versions as row (row._id)}
                <li class="history-row">
                  <span class="history-version">v{row.version}</span>
                  <span class="history-date">{formatDate(row.publishedAt)}</span>
                  <span class="history-note">{row.note ?? ""}</span>
                  {#if row.version !== versions[0]?.version}
                    <button
                      type="button"
                      class="restore-btn"
                      disabled={busy}
                      on:click={() => restore(row._id, row.version)}>Restore</button
                    >
                  {:else}
                    <span class="live-badge">live</span>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      </div>

      <!-- ===== Right: live preview (real SectionRenderer, scaled) ===== -->
      <div class="preview-pane">
        <h2>Preview <span class="preview-hint">(draft, live data)</span></h2>
        <div class="preview-frame">
          <div class="preview-screen">
            {#key JSON.stringify(draft.sections)}
              <SectionRenderer sections={draft.sections} />
            {/key}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .composer {
    max-width: 1280px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c2c2c;
    margin-bottom: 0.25rem;
  }

  .page-header code {
    font-size: 1.15rem;
    background: #f5f5f2;
    border-radius: 6px;
    padding: 1px 8px;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #6b6b6b;
  }

  .back {
    font-size: 0.875rem;
    color: #2563eb;
    text-decoration: none;
    white-space: nowrap;
  }

  .loading {
    color: #6b6b6b;
  }

  .workspace {
    display: grid;
    grid-template-columns: minmax(420px, 1fr) minmax(320px, 460px);
    gap: 1.5rem;
    align-items: start;
  }

  @media (max-width: 1000px) {
    .workspace {
      grid-template-columns: 1fr;
    }
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .errors {
    border: 1px solid #fca5a5;
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .photo-warning {
    border: 1px solid #fcd34d;
    background: #fffbeb;
    color: #92400e;
    border-radius: 8px;
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }

  .section-card {
    border: 1px solid #e8e8e4;
    border-radius: 12px;
    background: #fff;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  .hidden-section {
    opacity: 0.55;
    background: #fafaf8;
  }

  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .order-controls {
    display: flex;
    gap: 2px;
  }

  .icon-btn {
    width: 26px;
    height: 26px;
    border: 1px solid #e8e8e4;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8125rem;
    line-height: 1;
  }

  .icon-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .type-select {
    font-size: 0.9rem;
    font-weight: 600;
    border: 1px solid #e8e8e4;
    border-radius: 6px;
    padding: 4px 8px;
    background: #fff;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .visibility {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    color: #2c2c2c;
    cursor: pointer;
  }

  .remove-btn {
    border: none;
    background: none;
    color: #dc2626;
    font-size: 0.8125rem;
    cursor: pointer;
    padding: 0;
  }

  .remove-btn:hover {
    text-decoration: underline;
  }

  .section-desc {
    font-size: 0.8125rem;
    color: #6b6b6b;
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.625rem 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8125rem;
  }

  .field-label {
    color: #6b6b6b;
  }

  .field input[type="text"],
  .field input[type="number"],
  .field select {
    border: 1px solid #e8e8e4;
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 0.875rem;
    background: #fff;
  }

  .field input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
  }

  .add-row {
    display: flex;
    gap: 0.625rem;
  }

  .add-row select {
    border: 1px solid #e8e8e4;
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 0.875rem;
    background: #fff;
  }

  .add-btn {
    border: 1px dashed #c9c9c4;
    background: #fafaf8;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 0.875rem;
    color: #2c2c2c;
    cursor: pointer;
  }

  .add-btn:hover {
    border-color: #2563eb;
    color: #2563eb;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-top: 1px solid #f0f0ec;
    padding-top: 1rem;
    flex-wrap: wrap;
  }

  .save-btn,
  .publish-btn {
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
  }

  .save-btn {
    background: #f0f0ec;
    color: #2c2c2c;
  }

  .publish-btn {
    background: #16a34a;
    color: #fff;
  }

  .save-btn:disabled,
  .publish-btn:disabled,
  .restore-btn:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .note-input {
    border: 1px solid #e8e8e4;
    border-radius: 8px;
    padding: 7px 10px;
    font-size: 0.8125rem;
    flex: 1;
    min-width: 160px;
  }

  .dirty-badge {
    font-size: 0.75rem;
    color: #92400e;
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: 999px;
    padding: 2px 10px;
  }

  .status {
    font-size: 0.8125rem;
    color: #2c2c2c;
  }

  .history h2,
  .preview-pane h2 {
    font-size: 1rem;
    font-weight: 650;
    color: #2c2c2c;
    margin-bottom: 0.625rem;
  }

  .history {
    border-top: 1px solid #f0f0ec;
    padding-top: 1rem;
  }

  .history-empty {
    font-size: 0.8125rem;
    color: #6b6b6b;
  }

  .history-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .history-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.8125rem;
    padding: 6px 10px;
    border: 1px solid #f0f0ec;
    border-radius: 8px;
  }

  .history-version {
    font-weight: 650;
    color: #2c2c2c;
    min-width: 2.5rem;
  }

  .history-date {
    color: #6b6b6b;
    white-space: nowrap;
  }

  .history-note {
    flex: 1;
    color: #2c2c2c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .restore-btn {
    border: 1px solid #e8e8e4;
    background: #fff;
    border-radius: 6px;
    padding: 3px 10px;
    font-size: 0.75rem;
    cursor: pointer;
    color: #2563eb;
  }

  .live-badge {
    font-size: 0.7rem;
    font-weight: 650;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #16a34a;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 999px;
    padding: 2px 8px;
  }

  /* --- Preview: a 1080px TV-portrait canvas scaled down ------------------- */
  .preview-pane {
    position: sticky;
    top: 1rem;
  }

  .preview-hint {
    font-weight: 400;
    font-size: 0.75rem;
    color: #6b6b6b;
  }

  .preview-frame {
    border: 1px solid #e8e8e4;
    border-radius: 12px;
    background: #2c2c2c;
    padding: 10px;
    overflow: hidden;
  }

  .preview-screen {
    width: 1080px;
    min-height: 1500px;
    background: #fff;
    transform: scale(0.38);
    transform-origin: top left;
    /* Reserve the scaled footprint so the frame hugs the content. */
    margin-bottom: calc(-1500px * (1 - 0.38));
    margin-right: calc(-1080px * (1 - 0.38));
    display: flex;
    flex-direction: column;
    gap: 36px;
    padding: 48px;
    box-sizing: border-box;
  }
</style>
