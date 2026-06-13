<script lang="ts">
  /**
   * Inline item editor — the layer below section composition.
   *
   * A section says "show the dumplings category"; this is where you reach
   * into that category and edit the dumplings themselves — text, price,
   * availability, photo — and add new ones, without leaving the composer.
   *
   * Boundary note: section *layout* is draft/publish-gated (siteSettings),
   * but item *content* is the live menu. Edits here write straight to the
   * menu the moment you make them (debounced), exactly like /admin/menu —
   * that is deliberate: a sold-out drink or a price fix should not wait for
   * a layout publish. The header states this so it is never a surprise.
   *
   * Query binds at init, so the parent keys this block on categoryName.
   */
  import { browser } from "$app/environment";
  import { useQuery, useMutation } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";
  import type { Id } from "../../../../convex/_generated/dataModel";
  import ImagePicker from "./ImagePicker.svelte";
  import { menuItemReadiness, readinessSummary } from "$lib/domain/menuItem";

  export let categoryName: string;
  export let uploadImage:
    | ((file: File) => Promise<{ storageId?: string; url: string }>)
    | null = null;

  const catQuery = browser
    ? useQuery(api.menu.getCategoryWithItems, { name: categoryName })
    : null;
  const updateItem = browser ? useMutation(api.menu.updateMenuItem) : null;
  const createItem = browser ? useMutation(api.menu.createMenuItem) : null;

  type Item = {
    _id: Id<"menuItems">;
    name: string;
    nameLocal?: string;
    nameChinese?: string;
    price: number;
    quantity?: string;
    allergenCodes?: string[];
    isAvailable: boolean;
    imageUrl?: string;
    imageStorageId?: Id<"_storage">;
    sortOrder: number;
  };
  $: category = $catQuery as
    | { _id: Id<"categories">; displayName: string; items: Item[] }
    | null
    | undefined;
  $: items = category?.items ?? [];

  // Debounced live patch — typing stays smooth, the menu lands a moment later.
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  function patch(id: Id<"menuItems">, field: string, value: unknown, delay = 550) {
    const key = `${id}:${field}`;
    const prev = timers.get(key);
    if (prev) clearTimeout(prev);
    timers.set(
      key,
      setTimeout(() => {
        updateItem?.({ id, [field]: value });
        timers.delete(key);
      }, delay),
    );
  }

  function priceInput(id: Id<"menuItems">, raw: string) {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) patch(id, "price", n);
  }

  function allergensInput(id: Id<"menuItems">, raw: string) {
    const codes = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const numbers = Array.from(
      new Set(
        codes.map((c) => parseInt(c, 10)).filter((n) => !Number.isNaN(n)),
      ),
    ).sort((a, b) => a - b);
    patch(id, "allergenCodes", codes, 700);
    // numbers follow the codes; send on the same debounce window
    const key = `${id}:allergenNumbers`;
    const prev = timers.get(key);
    if (prev) clearTimeout(prev);
    timers.set(
      key,
      setTimeout(() => {
        updateItem?.({ id, allergenNumbers: numbers });
        timers.delete(key);
      }, 700),
    );
  }

  function toggleAvailable(id: Id<"menuItems">, current: boolean) {
    updateItem?.({ id, isAvailable: !current });
  }

  let expanded: Id<"menuItems"> | null = null;
  let imageOpen: Id<"menuItems"> | null = null;

  function onImageSelect(
    id: Id<"menuItems">,
    e: CustomEvent<{
      imageUrl: string;
      imageStorageId?: string;
      clearImage?: boolean;
      clearImageStorage?: boolean;
    }>,
  ) {
    const d = e.detail;
    updateItem?.({
      id,
      imageUrl: d.imageUrl || undefined,
      imageStorageId: d.imageStorageId as Id<"_storage"> | undefined,
      clearImage: d.clearImage,
      clearImageStorage: d.clearImageStorage,
    });
  }

  let adding = false;
  async function addItem() {
    if (!category || !createItem) return;
    adding = true;
    try {
      const maxSort = items.reduce((m, i) => Math.max(m, i.sortOrder), 0);
      const id = await createItem({
        name: "New item",
        nameLocal: "Nová položka",
        price: 0,
        categoryId: category._id,
        isAvailable: true,
        sortOrder: maxSort + 1,
      });
      expanded = (id as Id<"menuItems">) ?? null;
    } finally {
      adding = false;
    }
  }
</script>

<div class="items">
  <div class="items-head">
    <span class="eyebrow">Items</span>
    <span class="live-note">edits go live to the menu</span>
  </div>

  {#if category === undefined}
    <p class="muted">Loading items…</p>
  {:else if !category}
    <p class="muted">No category matches “{categoryName}”.</p>
  {:else}
    <ul class="rows">
      {#each items as item (item._id)}
        <li class="row" class:row-off={!item.isAvailable}>
          <div class="row-main">
            <button
              type="button"
              class="thumb"
              title="Change photo"
              on:click={() => (imageOpen = imageOpen === item._id ? null : item._id)}
            >
              {#if item.imageUrl}
                <img src={item.imageUrl} alt={item.nameLocal || item.name} />
              {:else}
                <span class="thumb-empty">photo</span>
              {/if}
            </button>

            <input
              class="name-input"
              type="text"
              value={item.nameLocal ?? ""}
              placeholder="Název (CZ)"
              aria-label="Name (CZ)"
              on:input={(e) => patch(item._id, "nameLocal", e.currentTarget.value)}
            />

            <div class="price-wrap">
              <input
                class="price-input"
                type="number"
                min="0"
                value={item.price}
                aria-label="Price"
                on:input={(e) => priceInput(item._id, e.currentTarget.value)}
              />
              <span class="price-unit">Kč</span>
            </div>

            <button
              type="button"
              class="avail"
              class:avail-on={item.isAvailable}
              role="switch"
              aria-checked={item.isAvailable}
              title={item.isAvailable ? "Available" : "Sold out"}
              on:click={() => toggleAvailable(item._id, item.isAvailable)}
            >
              <span class="avail-knob"></span>
            </button>

            <button
              type="button"
              class="expand"
              class:expand-open={expanded === item._id}
              aria-label="More fields"
              on:click={() => (expanded = expanded === item._id ? null : item._id)}
            >
              ›
            </button>
          </div>

          {#if !menuItemReadiness(item).ready}
            <p class="draft-flag" data-testid="item-draft-flag">
              Draft · hidden from screens — {readinessSummary(item)}
            </p>
          {/if}

          {#if imageOpen === item._id}
            <div class="image-panel">
              <ImagePicker
                selected={item.imageUrl ?? ""}
                selectedStorageId={item.imageStorageId ?? null}
                {uploadImage}
                on:select={(e) => onImageSelect(item._id, e)}
              />
            </div>
          {/if}

          {#if expanded === item._id}
            <div class="more">
              <label class="more-field">
                <span>Name (EN)</span>
                <input
                  type="text"
                  value={item.name ?? ""}
                  on:input={(e) => patch(item._id, "name", e.currentTarget.value)}
                />
              </label>
              <label class="more-field">
                <span>中文</span>
                <input
                  type="text"
                  value={item.nameChinese ?? ""}
                  placeholder="中文名"
                  on:input={(e) => patch(item._id, "nameChinese", e.currentTarget.value)}
                />
              </label>
              <label class="more-field">
                <span>Quantity</span>
                <input
                  type="text"
                  value={item.quantity ?? ""}
                  placeholder="3ks"
                  on:input={(e) => patch(item._id, "quantity", e.currentTarget.value)}
                />
              </label>
              <label class="more-field">
                <span>Allergens</span>
                <input
                  type="text"
                  value={item.allergenCodes?.join(", ") ?? ""}
                  placeholder="1a, 6, 11"
                  on:input={(e) => allergensInput(item._id, e.currentTarget.value)}
                />
              </label>
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    <button type="button" class="add-item" disabled={adding} on:click={addItem}>
      {adding ? "Adding…" : "+ Add item"}
    </button>
  {/if}
</div>

<style>
  .items {
    --line: #e5e2d9;
    --ink: #1c1b19;
    --muted: #8a857c;
    --accent: #c8412b;
    --mono: "DM Mono", ui-monospace, monospace;
    margin-top: 0.875rem;
    padding-top: 0.875rem;
    border-top: 1px solid var(--line);
  }

  .items-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 0.625rem;
  }

  .eyebrow {
    font-family: var(--mono);
    font-size: 0.6875rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .live-note {
    font-family: var(--mono);
    font-size: 0.625rem;
    letter-spacing: 0.04em;
    color: var(--accent);
    opacity: 0.85;
  }

  .muted {
    font-size: 0.8125rem;
    color: var(--muted);
  }

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .row {
    border-bottom: 1px solid var(--line);
    padding: 0.5rem 0;
  }

  .row:first-child {
    border-top: 1px solid var(--line);
  }

  .row-off .name-input,
  .row-off .price-input {
    color: var(--muted);
    text-decoration: line-through;
  }

  .draft-flag {
    margin: 0.25rem 0 0.125rem 50px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--accent, #C41E3A);
    letter-spacing: 0.01em;
  }

  .row-main {
    display: grid;
    grid-template-columns: 40px 1fr auto auto 24px;
    align-items: center;
    gap: 0.625rem;
  }

  .thumb {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--line);
    overflow: hidden;
    padding: 0;
    cursor: pointer;
    background: #fff;
    transition: border-color 0.15s ease;
  }

  .thumb:hover {
    border-color: var(--accent);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .thumb-empty {
    font-family: var(--mono);
    font-size: 0.5rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #c4bfb4;
  }

  .name-input {
    border: none;
    background: none;
    font-family: "Inter", sans-serif;
    font-size: 0.9rem;
    color: var(--ink);
    padding: 4px 2px;
    border-bottom: 1px solid transparent;
    min-width: 0;
  }

  .name-input:focus {
    outline: none;
    border-bottom-color: var(--accent);
  }

  .price-wrap {
    display: flex;
    align-items: baseline;
    gap: 3px;
  }

  .price-input {
    width: 56px;
    border: none;
    background: none;
    font-family: var(--mono);
    font-size: 0.875rem;
    color: var(--ink);
    text-align: right;
    padding: 4px 2px;
    border-bottom: 1px solid transparent;
    font-variant-numeric: tabular-nums;
  }

  .price-input:focus {
    outline: none;
    border-bottom-color: var(--accent);
  }

  .price-unit {
    font-family: var(--mono);
    font-size: 0.75rem;
    color: var(--muted);
  }

  .avail {
    width: 34px;
    height: 20px;
    border-radius: 999px;
    border: none;
    background: #d6d2c8;
    position: relative;
    cursor: pointer;
    padding: 0;
    transition: background 0.15s ease;
  }

  .avail-on {
    background: var(--accent);
  }

  .avail-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.15s ease;
  }

  .avail-on .avail-knob {
    transform: translateX(14px);
  }

  .expand {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    color: var(--muted);
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    transition: transform 0.18s ease, color 0.15s ease;
  }

  .expand:hover {
    color: var(--ink);
  }

  .expand-open {
    transform: rotate(90deg);
    color: var(--accent);
  }

  .image-panel {
    margin: 0.625rem 0 0.25rem 50px;
  }

  .more {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem 0.875rem;
    margin: 0.625rem 0 0.25rem 50px;
  }

  .more-field {
    display: flex;
    flex-direction: column;
    gap: 0.1875rem;
  }

  .more-field span {
    font-family: var(--mono);
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .more-field input {
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 0.8125rem;
    font-family: "Inter", sans-serif;
    color: var(--ink);
    background: #fff;
  }

  .more-field input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .add-item {
    margin-top: 0.75rem;
    width: 100%;
    border: 1px dashed #cbc6ba;
    background: none;
    border-radius: 8px;
    padding: 8px;
    font-family: var(--mono);
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    color: var(--muted);
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .add-item:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }

  .add-item:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
