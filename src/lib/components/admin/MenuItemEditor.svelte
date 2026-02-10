<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ImagePicker from './ImagePicker.svelte';

  export let item: any = null;
  export let categories: any[] = [];

  const dispatch = createEventDispatcher();

  let name = item?.name ?? '';
  let nameLocal = item?.nameLocal ?? '';
  let nameChinese = item?.nameChinese ?? '';
  let description = item?.description ?? '';
  let price = item?.price ?? 0;
  let categoryId = item?.categoryId ?? '';
  let quantity = item?.quantity ?? '';
  let allergenCodesStr = item?.allergenCodes?.join(', ') ?? '';
  let isFeatured = item?.isFeatured ?? false;
  let isSweet = item?.isSweet ?? false;
  let isGlutenFree = item?.isGlutenFree ?? false;
  let isAvailable = item?.isAvailable ?? true;
  let imageUrl = item?.imageUrl ?? '';
  let sortOrder = item?.sortOrder ?? 1;

  function handleImageSelect(e: CustomEvent<string>) {
    imageUrl = e.detail;
  }

  function parseAllergenCodes(str: string): string[] {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }

  function parseAllergenNumbers(codes: string[]): number[] {
    const nums = new Set<number>();
    codes.forEach(code => {
      const n = parseInt(code, 10);
      if (!isNaN(n)) nums.add(n);
    });
    return Array.from(nums).sort((a, b) => a - b);
  }

  function save() {
    const codes = parseAllergenCodes(allergenCodesStr);
    const numbers = parseAllergenNumbers(codes);

    dispatch('save', {
      name,
      nameLocal: nameLocal || undefined,
      nameChinese: nameChinese || undefined,
      description: description || undefined,
      price: Number(price),
      categoryId,
      quantity: quantity || undefined,
      allergenCodes: codes.length ? codes : undefined,
      allergenNumbers: numbers.length ? numbers : undefined,
      isFeatured,
      isSweet,
      isGlutenFree,
      isAvailable,
      imageUrl: imageUrl || undefined,
      sortOrder: Number(sortOrder),
    });
  }

  function cancel() {
    dispatch('cancel');
  }
</script>

<form class="editor" on:submit|preventDefault={save}>
  <div class="form-row">
    <div class="field">
      <label for="ed-name">Name (EN)</label>
      <input id="ed-name" type="text" bind:value={name} required />
    </div>
    <div class="field">
      <label for="ed-chinese">Chinese</label>
      <input id="ed-chinese" type="text" bind:value={nameChinese} placeholder="中文名" />
    </div>
  </div>

  <div class="field">
    <label for="ed-local">Name (CZ)</label>
    <input id="ed-local" type="text" bind:value={nameLocal} />
  </div>

  <div class="field">
    <label for="ed-desc">Description</label>
    <input id="ed-desc" type="text" bind:value={description} />
  </div>

  <div class="form-row">
    <div class="field">
      <label for="ed-price">Price (CZK)</label>
      <input id="ed-price" type="number" bind:value={price} min="0" required />
    </div>
    <div class="field">
      <label for="ed-qty">Quantity</label>
      <input id="ed-qty" type="text" bind:value={quantity} placeholder="e.g. 3ks" />
    </div>
    <div class="field">
      <label for="ed-sort">Sort Order</label>
      <input id="ed-sort" type="number" bind:value={sortOrder} min="1" />
    </div>
  </div>

  <div class="field">
    <label for="ed-cat">Category</label>
    <select id="ed-cat" bind:value={categoryId}>
      {#each categories as cat}
        <option value={cat._id}>{cat.displayName}</option>
      {/each}
    </select>
  </div>

  <div class="field">
    <label for="ed-allergens">Allergen Codes (comma-separated)</label>
    <input id="ed-allergens" type="text" bind:value={allergenCodesStr} placeholder="1a, 2, 6, 11" />
  </div>

  <div class="checkboxes">
    <label class="checkbox"><input type="checkbox" bind:checked={isFeatured} /> Featured</label>
    <label class="checkbox"><input type="checkbox" bind:checked={isSweet} /> Sweet</label>
    <label class="checkbox"><input type="checkbox" bind:checked={isGlutenFree} /> Gluten-Free</label>
    <label class="checkbox"><input type="checkbox" bind:checked={isAvailable} /> Available</label>
  </div>

  <ImagePicker selected={imageUrl} on:select={handleImageSelect} />

  <div class="actions">
    <button type="button" class="btn-secondary" on:click={cancel}>Cancel</button>
    <button type="submit" class="btn-primary">Save</button>
  </div>
</form>

<style>
  .editor {
    padding: 1.5rem;
    background: white;
    border: 1px solid #E8E8E4;
    border-radius: 0.75rem;
  }

  .form-row {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .form-row .field {
    flex: 1;
    min-width: 120px;
  }

  .field {
    margin-bottom: 0.75rem;
  }

  .field label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #2C2C2C;
    margin-bottom: 0.25rem;
  }

  .field input, .field select {
    width: 100%;
    padding: 0.5rem 0.625rem;
    border: 1px solid #E8E8E4;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: #2C2C2C;
    background: white;
    box-sizing: border-box;
  }

  .field input:focus, .field select:focus {
    outline: none;
    border-color: #C41E3A;
    box-shadow: 0 0 0 2px rgba(196, 30, 58, 0.1);
  }

  .checkboxes {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  .checkbox {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    color: #2C2C2C;
    cursor: pointer;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #E8E8E4;
  }

  .btn-primary {
    padding: 0.5rem 1.25rem;
    background: #2C2C2C;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-primary:hover { background: #1a1a1a; }

  .btn-secondary {
    padding: 0.5rem 1.25rem;
    background: white;
    color: #2C2C2C;
    border: 1px solid #E8E8E4;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-secondary:hover { background: #FAFAF8; }
</style>
