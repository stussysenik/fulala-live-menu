<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let priceTiers: Array<{ quantity: string; price: number }> = [];

  const dispatch = createEventDispatcher<{
    change: Array<{ quantity: string; price: number }>;
  }>();

  // Local mutable copy
  let localTiers: Array<{ quantity: string; price: number }> = [...(priceTiers ?? [])];

  // Common quantity presets
  const presets = ['1ks', '2ks', '3ks', '6ks', '9ks', '12ks', '18ks', '24ks'];

  // Which presets are already used
  $: usedQuantities = new Set(localTiers.map(t => t.quantity.toLowerCase().trim()));
  $: availablePresets = presets.filter(p => !usedQuantities.has(p));

  function addPreset(qty: string) {
    localTiers = [...localTiers, { quantity: qty, price: 0 }];
    emitChange();
  }

  function addCustomTier() {
    localTiers = [...localTiers, { quantity: '', price: 0 }];
    emitChange();
  }

  function removeTier(index: number) {
    localTiers = localTiers.filter((_, i) => i !== index);
    emitChange();
  }

  function emitChange() {
    // Filter out completely empty rows for the dispatched value
    const validTiers = localTiers.filter(t => t.quantity.trim() !== '');
    dispatch('change', validTiers);
  }

  function handleInput() {
    emitChange();
  }
</script>

<section class="editor-section">
  <h3>Price Tiers</h3>
  <p class="section-desc">Set multiple quantity/price options shown on the TV display</p>

  {#if localTiers.length > 0}
    <div class="tiers-list">
      {#each localTiers as tier, index}
        <div class="tier-row">
          <input
            type="text"
            bind:value={tier.quantity}
            placeholder="e.g. 6ks"
            class="tier-qty-input"
            on:input={handleInput}
          />
          <input
            type="number"
            bind:value={tier.price}
            min="0"
            placeholder="Price"
            class="tier-price-input"
            on:input={handleInput}
          />
          <span class="tier-currency">Kc</span>
          <button
            type="button"
            class="remove-btn"
            on:click={() => removeTier(index)}
            title="Remove tier"
          >
            &times;
          </button>
        </div>
      {/each}
    </div>
  {/if}

  {#if availablePresets.length > 0}
    <div class="presets">
      <span class="presets-label">Quick add:</span>
      {#each availablePresets as preset}
        <button
          type="button"
          class="preset-btn"
          on:click={() => addPreset(preset)}
        >
          {preset}
        </button>
      {/each}
    </div>
  {/if}

  <button type="button" class="add-tier-btn" on:click={addCustomTier}>
    + Custom Tier
  </button>
</section>

<style>
  .editor-section {
    padding: var(--space-4, 1rem);
    background: rgba(0, 0, 0, 0.02);
    border-radius: var(--radius-md, 8px);
    margin-top: 0.75rem;
  }

  .editor-section h3 {
    font-size: var(--text-body, 1rem);
    font-weight: 600;
    margin: 0 0 var(--space-2, 0.5rem);
  }

  .section-desc {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-text-muted, #666);
    margin: 0 0 var(--space-3, 0.75rem);
  }

  .tiers-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .tier-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tier-qty-input {
    width: 90px;
    padding: 0.5rem 0.625rem;
    border: 1px solid #E8E8E4;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: #2C2C2C;
    background: white;
  }

  .tier-price-input {
    width: 100px;
    padding: 0.5rem 0.625rem;
    border: 1px solid #E8E8E4;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: #2C2C2C;
    background: white;
  }

  .tier-qty-input:focus,
  .tier-price-input:focus {
    outline: none;
    border-color: #C41E3A;
    box-shadow: 0 0 0 2px rgba(196, 30, 58, 0.1);
  }

  .tier-currency {
    font-size: 0.8125rem;
    color: #6B6B6B;
    min-width: 20px;
  }

  .remove-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: rgba(220, 38, 38, 0.1);
    color: #dc2626;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .remove-btn:hover {
    background: rgba(220, 38, 38, 0.2);
  }

  .presets {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  .presets-label {
    font-size: 0.75rem;
    color: #6B6B6B;
    margin-right: 0.25rem;
  }

  .preset-btn {
    padding: 0.25rem 0.625rem;
    border: 1px solid #E8E8E4;
    border-radius: 1rem;
    background: white;
    font-size: 0.75rem;
    color: #2C2C2C;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-btn:hover {
    border-color: #C41E3A;
    background: rgba(196, 30, 58, 0.05);
  }

  .add-tier-btn {
    padding: 0.375rem 0.75rem;
    border: 1px dashed #E8E8E4;
    border-radius: 0.375rem;
    background: transparent;
    font-size: 0.8125rem;
    color: #6B6B6B;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .add-tier-btn:hover {
    border-color: #C41E3A;
    color: #C41E3A;
  }
</style>
