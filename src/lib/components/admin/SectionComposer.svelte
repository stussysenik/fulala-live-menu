<script lang="ts">
  /**
   * Section composer — arrange what a display shows, edit the items inside
   * it, then publish. One surface, no context-switching.
   *
   * Two layers, two write models:
   *  - Section *layout* (which blocks, what order, their props) is a local
   *    draft, autosaved, and only reaches the TV on Publish — versioned and
   *    reversible.
   *  - Item *content* (a dumpling's name, price, photo) is the live menu,
   *    edited inline via SectionItemsEditor and written immediately.
   *
   * The preview renders through the real SectionRenderer (the exact path TVs
   * use), fitted so the whole screen is always visible — what you see is what
   * publishes. Sections collapse to a single line so a long page stays scannable.
   *
   * Design: iA-Writer-leaning editorial restraint — DM Mono labels, Cormorant
   * display headings, Inter inputs (the product's own typefaces), paper/ink
   * palette, one red accent, an 8px rhythm.
   */
  import { browser } from "$app/environment";
  import { flip } from "svelte/animate";
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { Collapsible } from "bits-ui";
  import { useQuery, useMutation } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";
  import type { Id } from "../../../../convex/_generated/dataModel";
  import { SECTION_REGISTRY } from "../sections/registry";
  import SectionItemsEditor from "./SectionItemsEditor.svelte";
  import {
    SECTION_TYPE_SPECS,
    SECTION_TYPES,
    defaultPropsFor,
    validateSectionConfig,
    DEFAULT_SECTION_CONFIGS,
    type DisplaySectionConfig,
    type SectionInstance,
  } from "$lib/domain/sectionConfig";

  /** Page slug to compose. Queries bind at init — wrap in {#key slug} to switch pages. */
  export let slug: string;

  // Section types that point at a menu category — these get the inline item editor.
  const DATA_BACKED = new Set(["menu-category", "category-photo-grid", "extras-list"]);

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
  const generateUploadUrl = browser ? useMutation(api.menu.generateImageUploadUrl) : null;

  // Shared image upload: signed URL → POST → storageId (the menu editor's flow).
  async function uploadImage(file: File): Promise<{ storageId?: string; url: string }> {
    if (!generateUploadUrl) throw new Error("Upload unavailable here.");
    const uploadUrl = await generateUploadUrl({});
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Upload failed.");
    const { storageId } = (await res.json()) as { storageId?: string };
    if (!storageId) throw new Error("No storage id returned.");
    return { storageId, url: URL.createObjectURL(file) };
  }

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

  function touch() {
    if (draft) draft = { ...draft, sections: [...draft.sections] };
  }

  // --- Collapse state (collapsed by default — a long page stays scannable) ---
  let open: Record<string, boolean> = {};

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
    const id = uniqueId(addType);
    draft.sections.push({ id, type: addType, props: defaultPropsFor(addType), visible: true });
    open = { ...open, [id]: true };
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

  function duplicateSection(index: number) {
    if (!draft) return;
    const original = draft.sections[index];
    draft.sections.splice(index + 1, 0, {
      ...structuredClone(original),
      id: uniqueId(original.type),
    });
    touch();
  }

  // --- Canvas selection (Elementor-style: click in preview → open the card) --
  let selectedId: string | null = null;

  function select(id: string) {
    selectedId = id;
    open = { ...open, [id]: true };
    if (browser) {
      document
        .getElementById(`sc-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // --- Drag to reorder ---------------------------------------------------------
  let dragIndex: number | null = null;
  let dropIndex: number | null = null;

  function handleDragStart(index: number, e: DragEvent) {
    dragIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    }
  }

  function handleDragOver(index: number, e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    dropIndex = index;
  }

  function handleDrop(index: number, e: DragEvent) {
    e.preventDefault();
    if (draft && dragIndex !== null && dragIndex !== index) {
      const [moved] = draft.sections.splice(dragIndex, 1);
      draft.sections.splice(index, 0, moved);
      touch();
    }
    dragIndex = null;
    dropIndex = null;
  }

  function handleDragEnd() {
    dragIndex = null;
    dropIndex = null;
  }

  function handleKeyReorder(index: number, e: KeyboardEvent) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    move(index, e.key === "ArrowUp" ? -1 : 1);
  }

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
      if (missing.length > 0) warnings.push({ sectionId: section.id, categoryName, missing });
    }
    return warnings;
  })();

  // --- Save / publish / restore ------------------------------------------------
  let publishNote = "";
  let busy = false;
  let statusMessage = "";
  let mobileView: "edit" | "preview" = "edit";

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

  let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let autosaveState: "idle" | "pending" | "saved" = "idle";

  function scheduleAutosave() {
    autosaveState = "pending";
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(async () => {
      if (!draft || !dirty || errors.length > 0 || busy) return;
      try {
        const snapshot = JSON.stringify(draft);
        await saveDraftMutation?.({ slug, config: draft });
        savedSnapshot = snapshot;
        autosaveState = "saved";
      } catch {
        autosaveState = "idle";
      }
    }, 900);
  }

  $: if (initialized && dirty && errors.length === 0) scheduleAutosave();

  async function publish() {
    if (!draft || errors.length > 0) return;
    busy = true;
    statusMessage = "";
    try {
      await saveDraftMutation?.({ slug, config: draft });
      savedSnapshot = JSON.stringify(draft);
      const result = await publishMutation?.({ slug, note: publishNote.trim() || undefined });
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

  function categoryLabel(section: SectionInstance): string {
    const name = String(section.props.categoryName ?? "");
    return categories.find((c) => c.name === name)?.displayName ?? name;
  }

  // --- Fit-to-box preview: the whole screen is always visible ----------------
  // The canvas is a fixed 1080px-wide layout; we measure the available stage
  // and the canvas's natural height, then scale to fit both — never clipped,
  // never upscaled past 1:1. transform doesn't change layout, so clientHeight
  // reports the true (unscaled) height and the math stays stable.
  let stageW = 0;
  let stageH = 0;
  let canvasH = 0;
  const CANVAS_W = 1080;
  $: scale = stageW && canvasH ? Math.min(stageW / CANVAS_W, stageH / canvasH, 1) : 0.3;
  $: offsetX = Math.max(0, (stageW - CANVAS_W * scale) / 2);
  $: offsetY = Math.max(0, (stageH - canvasH * scale) / 2);
</script>

<div class="composer">
  {#if !initialized}
    <div class="ghost" aria-label="Loading" aria-busy="true">
      {#each [0, 1, 2] as i (i)}
        <div class="ghost-card" style:--ghost-delay={`${i * 120}ms`}></div>
      {/each}
    </div>
  {:else if draft}
    <div class="mobile-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={mobileView === "edit"}
        class:tab-active={mobileView === "edit"}
        on:click={() => (mobileView = "edit")}>Edit</button
      >
      <button
        type="button"
        role="tab"
        aria-selected={mobileView === "preview"}
        class:tab-active={mobileView === "preview"}
        on:click={() => (mobileView = "preview")}>Preview</button
      >
    </div>

    <div class="workspace" class:show-preview={mobileView === "preview"}>
      <!-- ===== Left: controls ===== -->
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
            <strong>{warning.categoryName}</strong> · {warning.missing.length}
            item{warning.missing.length === 1 ? "" : "s"} without a photo — {warning.missing.join(", ")}
          </div>
        {/each}

        <div class="sections">
          {#each draft.sections as section, index (section.id)}
            {@const spec = SECTION_TYPE_SPECS[section.type]}
            {@const dataBacked = DATA_BACKED.has(section.type) && section.props.categoryName}
            <section
              id={`sc-${section.id}`}
              class="card"
              class:hidden-card={!section.visible}
              class:selected-card={selectedId === section.id}
              class:dragging={dragIndex === index}
              class:drop-target={dropIndex === index && dragIndex !== null && dragIndex !== index}
              animate:flip={{ duration: 200, easing: cubicOut }}
              on:dragover={(e) => handleDragOver(index, e)}
              on:drop={(e) => handleDrop(index, e)}
            >
              <Collapsible.Root
                open={open[section.id] ?? false}
                onOpenChange={(v) => (open = { ...open, [section.id]: v })}
              >
                <header class="card-head">
                  <button
                    type="button"
                    class="grip"
                    draggable="true"
                    aria-roledescription="sortable section"
                    aria-label={`Reorder ${spec?.label ?? section.type} — Arrow Up/Down to move`}
                    title="Drag to reorder (or Arrow Up/Down)"
                    on:dragstart={(e) => handleDragStart(index, e)}
                    on:dragend={handleDragEnd}
                    on:keydown={(e) => handleKeyReorder(index, e)}>⠿</button
                  >

                  <Collapsible.Trigger class="card-trigger">
                    <span class="chev" class:chev-open={open[section.id]}>›</span>
                    <span class="card-name">{spec?.label ?? section.type}</span>
                    {#if dataBacked}
                      <span class="card-sub">{categoryLabel(section)}</span>
                    {/if}
                  </Collapsible.Trigger>

                  <div class="card-tools">
                    <button
                      type="button"
                      class="ghost-icon"
                      title={section.visible ? "Hide on TV" : "Hidden"}
                      aria-pressed={!section.visible}
                      on:click={() => toggleVisible(section)}>{section.visible ? "●" : "○"}</button
                    >
                    <button
                      type="button"
                      class="ghost-icon"
                      title="Duplicate"
                      on:click={() => duplicateSection(index)}>⧉</button
                    >
                    <button
                      type="button"
                      class="ghost-icon danger"
                      title="Remove"
                      on:click={() => removeSection(index)}>✕</button
                    >
                  </div>
                </header>

                <Collapsible.Content>
                  <div class="card-body" transition:slide={{ duration: 180, easing: cubicOut }}>
                    {#if spec}
                      <div class="type-row">
                        <span class="micro-label">Block type</span>
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

                      {#if spec.fields.length > 0}
                        <div class="fields">
                          {#each spec.fields as field (field.key)}
                            <label class="field">
                              <span class="micro-label">{field.label}</span>
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
                                <span class="bool-wrap">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(section.props[field.key] ?? field.default)}
                                    on:change={(e) => setProp(section, field.key, e.currentTarget.checked)}
                                  />
                                </span>
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

                      <!-- One/two layers down: edit the items this section shows. -->
                      {#if dataBacked}
                        {#key String(section.props.categoryName)}
                          <SectionItemsEditor
                            categoryName={String(section.props.categoryName)}
                            {uploadImage}
                          />
                        {/key}
                      {/if}
                    {/if}
                  </div>
                </Collapsible.Content>
              </Collapsible.Root>
            </section>
          {/each}
        </div>

        <div class="add-row">
          <select bind:value={addType} aria-label="Block to add">
            {#each SECTION_TYPES as type}
              <option value={type}>{SECTION_TYPE_SPECS[type].label}</option>
            {/each}
          </select>
          <button type="button" class="add-btn" on:click={addSection}>+ Add block</button>
        </div>

        <!-- ===== Publish bar ===== -->
        <div class="toolbar">
          <div class="save-state">
            {#if errors.length > 0 && dirty}
              <span class="badge badge-warn">fix errors to save</span>
            {:else if dirty}
              <span class="badge">Saving…</span>
            {:else if autosaveState === "saved"}
              <span class="badge badge-ok">Draft saved</span>
            {:else}
              <span class="badge badge-muted">Up to date</span>
            {/if}
          </div>
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
        </div>
        {#if statusMessage}
          <p class="status" role="status">{statusMessage}</p>
        {/if}

        <!-- ===== History ===== -->
        <section class="history">
          <h2 class="section-label">Publish history</h2>
          {#if versions.length === 0}
            <p class="history-empty">Nothing published yet — the TV renders its built-in default.</p>
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

      <!-- ===== Right: fitted, always-visible preview ===== -->
      <div class="preview-pane">
        <div class="preview-head">
          <h2 class="section-label">Preview</h2>
          <span class="preview-hint">live data · click a block to edit</span>
        </div>
        <div class="preview-frame">
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <div
            class="preview-stage"
            bind:clientWidth={stageW}
            bind:clientHeight={stageH}
            on:click={() => (selectedId = null)}
          >
            <div
              class="preview-screen"
              bind:clientHeight={canvasH}
              style:transform={`translate(${offsetX}px, ${offsetY}px) scale(${scale})`}
            >
              {#each draft.sections.filter((s) => s.visible) as section (section.id)}
                <div
                  class="canvas-section"
                  class:canvas-selected={selectedId === section.id}
                  role="button"
                  tabindex="0"
                  aria-label={`Select ${SECTION_TYPE_SPECS[section.type]?.label ?? section.type}`}
                  on:click|stopPropagation={() => select(section.id)}
                  on:keydown={(e) => e.key === "Enter" && select(section.id)}
                >
                  {#if SECTION_REGISTRY[section.type]}
                    {#key section.id + JSON.stringify(section.props)}
                      <svelte:component
                        this={SECTION_REGISTRY[section.type].component}
                        {...section.props}
                      />
                    {/key}
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<svelte:window
  on:keydown={(e) => {
    if (e.key === "Escape") selectedId = null;
  }}
/>

<style>
  .composer {
    --paper: #fcfbf8;
    --panel: #ffffff;
    --ink: #1c1b19;
    --muted: #8a857c;
    --faint: #b6b1a6;
    --line: #e7e4db;
    --line-strong: #d9d5ca;
    --accent: #c8412b;
    --accent-soft: #f7ece9;
    --ok: #3f7d4e;
    --mono: "DM Mono", ui-monospace, monospace;
    --serif: "Cormorant Garamond", Georgia, serif;
    --ui: "Inter", system-ui, sans-serif;
    color: var(--ink);
    font-family: var(--ui);
  }

  /* ---- Ghost skeleton ---- */
  .ghost {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .ghost-card {
    height: 52px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--panel);
    position: relative;
    overflow: hidden;
  }
  .ghost-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.04), transparent);
    transform: translateX(-100%);
    animation: ghost-sweep 1.4s ease-in-out infinite;
    animation-delay: var(--ghost-delay, 0ms);
  }
  @keyframes ghost-sweep {
    to {
      transform: translateX(100%);
    }
  }

  /* ---- Layout: controls left, fitted preview right ---- */
  .workspace {
    display: grid;
    grid-template-columns: minmax(360px, 1fr) minmax(300px, 380px);
    gap: 2rem;
    align-items: start;
  }

  .editor-pane {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
  }

  /* Shared micro typography */
  .section-label {
    font-family: var(--mono);
    font-size: 0.6875rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }
  .micro-label {
    font-family: var(--mono);
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* ---- Alerts ---- */
  .errors {
    border: 1px solid #e7b4ab;
    background: var(--accent-soft);
    color: #9a2b1a;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-size: 0.8125rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .photo-warning {
    border: 1px solid #e8d4a3;
    background: #fbf5e6;
    color: #7a5a16;
    border-radius: 10px;
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }

  /* ---- Section cards (collapsible) ---- */
  .sections {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card {
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--panel);
    overflow: hidden;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .hidden-card {
    opacity: 0.55;
  }
  .selected-card {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }
  .dragging {
    opacity: 0.4;
  }
  .drop-target {
    box-shadow: 0 -2px 0 0 var(--accent);
  }

  .card-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.625rem;
  }

  .grip {
    width: 24px;
    height: 28px;
    border: none;
    background: none;
    color: var(--faint);
    font-size: 0.85rem;
    cursor: grab;
    border-radius: 6px;
    line-height: 1;
    flex-shrink: 0;
    touch-action: none;
  }
  .grip:hover,
  .grip:focus-visible {
    color: var(--ink);
    background: var(--paper);
    outline: none;
  }
  .grip:active {
    cursor: grabbing;
  }

  /* bits-ui Collapsible.Trigger renders a <button>; we fill the row with it. */
  :global(.card-trigger) {
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    border: none;
    background: none;
    cursor: pointer;
    padding: 4px 2px;
    text-align: left;
    min-width: 0;
    font-family: inherit;
  }

  .chev {
    color: var(--faint);
    font-size: 1rem;
    line-height: 1;
    transition: transform 0.18s ease, color 0.15s ease;
    flex-shrink: 0;
  }
  .chev-open {
    transform: rotate(90deg);
    color: var(--accent);
  }

  .card-name {
    font-family: var(--serif);
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--ink);
    line-height: 1;
  }
  .card-sub {
    font-family: var(--mono);
    font-size: 0.6875rem;
    color: var(--muted);
    letter-spacing: 0.03em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-tools {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    flex-shrink: 0;
  }
  .ghost-icon {
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    color: var(--faint);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8125rem;
    line-height: 1;
    transition: color 0.15s ease, background 0.15s ease;
  }
  .ghost-icon:hover {
    color: var(--ink);
    background: var(--paper);
  }
  .ghost-icon.danger:hover {
    color: var(--accent);
    background: var(--accent-soft);
  }

  .card-body {
    padding: 0.25rem 0.875rem 0.875rem;
    border-top: 1px solid var(--line);
  }

  .type-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 0 0.5rem;
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.625rem 0.875rem;
    padding-bottom: 0.25rem;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .bool-wrap {
    display: flex;
    align-items: center;
    height: 30px;
  }
  .bool-wrap input {
    width: 18px;
    height: 18px;
    accent-color: var(--accent);
  }

  .card-body input[type="text"],
  .card-body input[type="number"],
  .type-select,
  .card-body select,
  .add-row select,
  .note-input {
    border: 1px solid var(--line-strong);
    border-radius: 7px;
    padding: 6px 9px;
    font-size: 0.875rem;
    font-family: var(--ui);
    color: var(--ink);
    background: var(--panel);
  }
  .card-body input:focus,
  .card-body select:focus,
  .note-input:focus,
  .type-select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .type-select {
    font-weight: 500;
  }

  /* ---- Add block ---- */
  .add-row {
    display: flex;
    gap: 0.5rem;
  }
  .add-row select {
    flex: 1;
  }
  .add-btn {
    border: 1px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    border-radius: 7px;
    padding: 6px 16px;
    font-family: var(--mono);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }
  .add-btn:hover {
    opacity: 0.85;
  }

  /* ---- Publish bar ---- */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-top: 1px solid var(--line);
    padding-top: 1rem;
    flex-wrap: wrap;
  }
  .save-state {
    flex-shrink: 0;
  }
  .note-input {
    flex: 1;
    min-width: 150px;
  }
  .publish-btn {
    border: none;
    border-radius: 7px;
    padding: 8px 18px;
    font-family: var(--mono);
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
    background: var(--accent);
    color: #fff;
  }
  .publish-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .badge {
    font-family: var(--mono);
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  .badge-ok {
    color: var(--ok);
  }
  .badge-muted {
    color: var(--faint);
  }
  .badge-warn {
    color: var(--accent);
  }

  .status {
    font-size: 0.8125rem;
    color: var(--muted);
  }

  /* ---- History ---- */
  .history {
    border-top: 1px solid var(--line);
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .history-empty {
    font-size: 0.8125rem;
    color: var(--muted);
  }
  .history-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .history-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.8125rem;
    padding: 6px 4px;
    border-bottom: 1px solid var(--line);
  }
  .history-version {
    font-family: var(--mono);
    font-weight: 500;
    min-width: 2.25rem;
  }
  .history-date {
    color: var(--muted);
    white-space: nowrap;
    font-family: var(--mono);
    font-size: 0.75rem;
  }
  .history-note {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .restore-btn {
    border: 1px solid var(--line-strong);
    background: var(--panel);
    border-radius: 6px;
    padding: 3px 10px;
    font-size: 0.75rem;
    cursor: pointer;
    color: var(--ink);
  }
  .restore-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
  .restore-btn:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .live-badge {
    font-family: var(--mono);
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ok);
  }

  /* ---- Preview: sticky, fitted so the whole screen always shows ---- */
  .preview-pane {
    position: sticky;
    top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: calc(100vh - 2rem);
  }
  .preview-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .preview-hint {
    font-family: var(--mono);
    font-size: 0.625rem;
    letter-spacing: 0.03em;
    color: var(--faint);
  }
  .preview-frame {
    flex: 1;
    border: 1px solid var(--line-strong);
    border-radius: 14px;
    background: #ece9e2;
    padding: 14px;
    min-height: 0;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  .preview-stage {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 6px;
  }
  .preview-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 1080px;
    background: #fff;
    transform-origin: top left;
    display: flex;
    flex-direction: column;
    gap: 36px;
    padding: 48px;
    box-sizing: border-box;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  }

  .canvas-section {
    position: relative;
    cursor: pointer;
    border-radius: 6px;
    transition: box-shadow 0.15s ease-out;
  }
  .canvas-section:hover {
    box-shadow: 0 0 0 4px rgba(200, 65, 43, 0.25);
  }
  .canvas-selected,
  .canvas-selected:hover {
    box-shadow: 0 0 0 5px var(--accent);
  }

  /* ---- Mobile: tabbed single column ---- */
  .mobile-tabs {
    display: none;
  }
  @media (max-width: 1040px) {
    .workspace {
      grid-template-columns: 1fr;
    }
    .mobile-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      position: sticky;
      top: 0;
      background: var(--paper);
      padding: 0.5rem 0;
      z-index: 10;
    }
    .mobile-tabs button {
      flex: 1;
      padding: 10px;
      font-family: var(--mono);
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid var(--line-strong);
      border-radius: 8px;
      background: var(--panel);
      cursor: pointer;
      min-height: 44px;
    }
    .mobile-tabs button.tab-active {
      background: var(--ink);
      color: var(--paper);
      border-color: var(--ink);
    }
    .workspace:not(.show-preview) .preview-pane {
      display: none;
    }
    .workspace.show-preview .editor-pane {
      display: none;
    }
    .preview-pane {
      position: static;
      height: 70vh;
    }
  }
</style>
