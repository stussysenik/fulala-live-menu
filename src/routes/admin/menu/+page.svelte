<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery, useMutation } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";
  import MenuItemEditor from "$lib/components/admin/MenuItemEditor.svelte";

  const fullMenu = browser ? useQuery(api.menu.getFullMenu, {}) : null;
  const allCategories = browser ? useQuery(api.menu.getCategories, {}) : null;
  const createItem = browser ? useMutation(api.menu.createMenuItem) : null;
  const updateItem = browser ? useMutation(api.menu.updateMenuItem) : null;
  const deleteItem = browser ? useMutation(api.menu.deleteMenuItem) : null;
  const toggleAvail = browser ? useMutation(api.menu.toggleAvailability) : null;

  let editingId: string | null = null;
  let showNew = false;

  function startEdit(id: string) {
    editingId = id;
    showNew = false;
  }

  function startNew() {
    showNew = true;
    editingId = null;
  }

  function cancelEdit() {
    editingId = null;
    showNew = false;
  }

  async function handleSave(e: CustomEvent<any>) {
    const data = e.detail;
    if (editingId) {
      await updateItem?.({ id: editingId as any, ...data });
    } else {
      await createItem?.(data);
    }
    cancelEdit();
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this menu item?')) {
      await deleteItem?.({ id: id as any });
    }
  }

  async function handleToggle(id: string) {
    await toggleAvail?.({ id: id as any });
  }

  function findItem(id: string): any {
    if (!$fullMenu) return null;
    for (const cat of $fullMenu) {
      const found = cat.items.find((i: any) => i._id === id);
      if (found) return found;
    }
    return null;
  }
</script>

<div class="menu-admin">
  <header class="page-header">
    <div>
      <h1>Menu Items</h1>
      <p class="subtitle">Manage your menu items, photos, and allergens</p>
    </div>
    <button class="btn-primary" on:click={startNew}>+ Add Item</button>
  </header>

  {#if showNew && $allCategories}
    <MenuItemEditor
      categories={$allCategories}
      on:save={handleSave}
      on:cancel={cancelEdit}
    />
  {/if}

  {#if $fullMenu}
    {#each $fullMenu as category}
      <section class="category-section">
        <h2 class="category-name">{category.displayName}</h2>
        <div class="items-list">
          {#each category.items as item (item._id)}
            {#if editingId === item._id && $allCategories}
              <MenuItemEditor
                {item}
                categories={$allCategories}
                on:save={handleSave}
                on:cancel={cancelEdit}
              />
            {:else}
              <div class="item-row" class:unavailable={!item.isAvailable}>
                {#if item.imageUrl}
                  <img class="item-thumb" src={item.imageUrl} alt="" />
                {/if}
                <div class="item-info">
                  <div class="item-name">
                    {item.name}
                    {#if item.nameChinese}
                      <span class="chinese">{item.nameChinese}</span>
                    {/if}
                  </div>
                  <div class="item-meta">
                    {#if item.quantity}<span>{item.quantity}</span>{/if}
                    <span>{item.price} Kč</span>
                    {#if item.allergenCodes?.length}
                      <span class="allergens">({item.allergenCodes.join(', ')})</span>
                    {/if}
                    {#if item.isFeatured}<span class="badge">Featured</span>{/if}
                    {#if item.isSweet}<span class="badge sweet">Sweet</span>{/if}
                    {#if item.isGlutenFree}<span class="badge gf">GF</span>{/if}
                  </div>
                </div>
                <div class="item-actions">
                  <button class="btn-sm" on:click={() => handleToggle(item._id)}>
                    {item.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  <button class="btn-sm" on:click={() => startEdit(item._id)}>Edit</button>
                  <button class="btn-sm danger" on:click={() => handleDelete(item._id)}>Delete</button>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </section>
    {/each}
  {:else}
    <p class="loading">Loading menu...</p>
  {/if}
</div>

<style>
  .menu-admin { max-width: 900px; }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2C2C2C;
    margin-bottom: 0.25rem;
  }

  .subtitle { font-size: 0.875rem; color: #6B6B6B; }

  .btn-primary {
    padding: 0.5rem 1rem;
    background: #2C2C2C;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
  }
  .btn-primary:hover { background: #1a1a1a; }

  .category-section {
    margin-bottom: 2rem;
  }

  .category-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2C2C2C;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #C41E3A;
    margin-bottom: 0.75rem;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid #E8E8E4;
    border-radius: 0.5rem;
  }

  .item-row.unavailable { opacity: 0.5; }

  .item-thumb {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 0.375rem;
    flex-shrink: 0;
  }

  .item-info { flex: 1; min-width: 0; }

  .item-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #2C2C2C;
  }

  .item-name .chinese {
    font-weight: 400;
    color: #6B6B6B;
    margin-left: 0.375rem;
  }

  .item-meta {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    font-size: 0.75rem;
    color: #6B6B6B;
    margin-top: 0.125rem;
  }

  .allergens { opacity: 0.7; }

  .badge {
    padding: 1px 6px;
    background: rgba(196, 30, 58, 0.1);
    color: #C41E3A;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.6875rem;
  }
  .badge.sweet { background: rgba(212, 167, 106, 0.15); color: #8B6914; }
  .badge.gf { background: rgba(45, 80, 22, 0.1); color: #2d5016; }

  .item-actions {
    display: flex;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .btn-sm {
    padding: 0.25rem 0.625rem;
    border: 1px solid #E8E8E4;
    border-radius: 0.25rem;
    background: white;
    font-size: 0.75rem;
    cursor: pointer;
    color: #2C2C2C;
  }
  .btn-sm:hover { background: #FAFAF8; }
  .btn-sm.danger { color: #DC2626; border-color: #FCA5A5; }
  .btn-sm.danger:hover { background: #FEF2F2; }

  .loading { color: #6B6B6B; padding: 2rem; text-align: center; }
</style>
