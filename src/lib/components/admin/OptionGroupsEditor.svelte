<script lang="ts">
  /**
   * Option groups editor — the admin side of order option correctness.
   *
   * Edits the authoritative `optionGroups` config on a menu item: per group
   * a key, label, allowed values, and the required / multi toggles. The
   * preview underneath runs the SAME validateSelections the customer sheet
   * and the order mutations run, so the admin sees exactly what a customer
   * will be forced to pick.
   *
   * When the item has no explicit groups yet, the legacy `modifiers` /
   * `drinkOptions` conversion is offered as a starting point — one click
   * imports them, then required flags can be set per group.
   */
  import { createEventDispatcher } from 'svelte';
  import {
    validateSelections,
    legacyToOptionGroups,
    type OptionGroupConfig,
    type LegacyOptionFields,
  } from '$lib/domain/optionValidation';

  export let optionGroups: OptionGroupConfig[] = [];
  /** The full item, for the legacy-import starting point. */
  export let item: LegacyOptionFields | null = null;

  const dispatch = createEventDispatcher<{ change: OptionGroupConfig[] }>();

  function emit() {
    optionGroups = [...optionGroups];
    dispatch('change', optionGroups);
  }

  // What would a customer hit with an empty selection? Exactly the
  // missing-required issues — the live validation preview.
  $: previewIssues = validateSelections(optionGroups, {});

  $: legacyGroups =
    optionGroups.length === 0 && item ? legacyToOptionGroups(item) : [];

  function importLegacy() {
    optionGroups = legacyGroups.map((g) => ({ ...g }));
    emit();
  }

  let newKey = '';

  function addGroup() {
    const key = newKey.trim();
    if (!key || optionGroups.some((g) => g.key === key)) return;
    optionGroups.push({ key, values: [], required: false });
    newKey = '';
    emit();
  }

  function removeGroup(index: number) {
    optionGroups.splice(index, 1);
    emit();
  }

  function setValues(group: OptionGroupConfig, raw: string) {
    group.values = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    emit();
  }
</script>

<div class="og-editor">
  <h3>Order options</h3>
  <p class="og-desc">
    Groups a customer picks from when ordering. <strong>Required</strong> groups
    block add-to-cart until chosen; <strong>multi</strong> allows several picks
    (add-ons).
  </p>

  {#if optionGroups.length === 0 && legacyGroups.length > 0}
    <button type="button" class="og-import" on:click={importLegacy}>
      Import {legacyGroups.length} group{legacyGroups.length === 1 ? '' : 's'} from
      legacy modifiers ({legacyGroups.map((g) => g.key).join(', ')})
    </button>
  {/if}

  {#each optionGroups as group, index (group.key)}
    <div class="og-group">
      <div class="og-group-head">
        <code class="og-key">{group.key}</code>
        <input
          type="text"
          class="og-label"
          placeholder="Label (optional)"
          value={group.label ?? ''}
          on:input={(e) => {
            group.label = e.currentTarget.value || undefined;
            emit();
          }}
        />
        <label class="og-flag">
          <input
            type="checkbox"
            checked={group.required}
            on:change={(e) => {
              group.required = e.currentTarget.checked;
              emit();
            }}
          />
          Required
        </label>
        <label class="og-flag">
          <input
            type="checkbox"
            checked={group.multi ?? false}
            on:change={(e) => {
              group.multi = e.currentTarget.checked || undefined;
              emit();
            }}
          />
          Multi
        </label>
        <button type="button" class="og-remove" on:click={() => removeGroup(index)}>
          Remove
        </button>
      </div>
      <input
        type="text"
        class="og-values"
        placeholder="Allowed values, comma-separated"
        value={group.values.join(', ')}
        on:change={(e) => setValues(group, e.currentTarget.value)}
      />
      {#if group.values.length === 0}
        <p class="og-group-warn">No values — customers can't pick anything.</p>
      {/if}
    </div>
  {/each}

  <div class="og-add">
    <input
      type="text"
      placeholder="New group key (e.g. spiceLevel)"
      bind:value={newKey}
    />
    <button type="button" on:click={addGroup} disabled={!newKey.trim()}>
      + Add group
    </button>
  </div>

  {#if optionGroups.length > 0}
    <div class="og-preview" class:og-preview-blocking={previewIssues.length > 0}>
      {#if previewIssues.length > 0}
        Customer must choose before adding:
        <strong>
          {previewIssues.map((i) => i.groupKey).join(', ')}
        </strong>
      {:else}
        All groups optional — customers can add this item straight away.
      {/if}
    </div>
  {/if}
</div>

<style>
  .og-editor {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }

  .og-editor h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }

  .og-desc {
    font-size: 0.8125rem;
    color: var(--color-text-muted, #666);
    margin: 0;
  }

  .og-import {
    align-self: flex-start;
    border: 1px dashed #c9c9c4;
    background: #fff;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.8125rem;
    cursor: pointer;
    color: #2563eb;
  }

  .og-group {
    border: 1px solid var(--color-border, #e5e5e5);
    border-radius: 8px;
    background: #fff;
    padding: 0.625rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .og-group-head {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex-wrap: wrap;
  }

  .og-key {
    font-size: 0.8125rem;
    background: #f5f5f2;
    border-radius: 6px;
    padding: 2px 8px;
    font-weight: 600;
  }

  .og-label {
    flex: 1;
    min-width: 120px;
    border: 1px solid var(--color-border, #e5e5e5);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 0.8125rem;
  }

  .og-flag {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8125rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .og-remove {
    border: none;
    background: none;
    color: #dc2626;
    font-size: 0.8125rem;
    cursor: pointer;
    padding: 0;
  }

  .og-values {
    border: 1px solid var(--color-border, #e5e5e5);
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 0.8125rem;
  }

  .og-group-warn {
    font-size: 0.75rem;
    color: #b45309;
    margin: 0;
  }

  .og-add {
    display: flex;
    gap: 0.5rem;
  }

  .og-add input {
    flex: 1;
    border: 1px solid var(--color-border, #e5e5e5);
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 0.8125rem;
  }

  .og-add button {
    border: 1px dashed #c9c9c4;
    background: #fff;
    border-radius: 6px;
    padding: 5px 12px;
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .og-add button:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .og-preview {
    font-size: 0.8125rem;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .og-preview-blocking {
    background: #fffbeb;
    border-color: #fcd34d;
    color: #92400e;
  }
</style>
