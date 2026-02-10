<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";
  import PrintableMenu from "$lib/components/print/PrintableMenu.svelte";

  const fullMenu = browser ? useQuery(api.menu.getFullMenu, {}) : null;
  const schedule = browser ? useQuery(api.settings.getMenuSchedule, {}) : null;
  const customerInfo = browser ? useQuery(api.settings.getCustomerInfo, {}) : null;

  function handlePrint() {
    window.print();
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap" />
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 20mm;
    }
    @media print {
      .print-controls { display: none !important; }
      .admin-layout { display: block !important; }
      .sidebar { display: none !important; }
      .main-content { padding: 0 !important; }
    }
  </style>
</svelte:head>

<div class="print-page">
  <div class="print-controls">
    <h1>Print Menu</h1>
    <p class="subtitle">Preview and print an A4 menu sheet</p>
    <button class="btn-primary" on:click={handlePrint}>Print Menu</button>
  </div>

  <div class="print-preview">
    {#if $fullMenu}
      <PrintableMenu
        menu={$fullMenu}
        schedule={$schedule}
        customerInfo={$customerInfo}
      />
    {:else}
      <p class="loading">Loading menu...</p>
    {/if}
  </div>
</div>

<style>
  .print-page {
    max-width: 900px;
  }

  .print-controls {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .print-controls h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2C2C2C;
  }

  .subtitle {
    flex: 1;
    font-size: 0.875rem;
    color: #6B6B6B;
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
    flex-shrink: 0;
  }
  .btn-primary:hover { background: #1a1a1a; }

  .print-preview {
    background: white;
    border: 1px solid #E8E8E4;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .loading {
    padding: 3rem;
    text-align: center;
    color: #6B6B6B;
  }
</style>
