<script lang="ts">
  import { EU_ALLERGENS } from '$lib/allergens';

  export let menu: any[];
  export let schedule: any;
  export let customerInfo: any;

  function availableItems(items: any[]): any[] {
    return items.filter(i => i.isAvailable);
  }
</script>

<div class="printable-menu">
  <header class="print-header">
    <h1 class="restaurant-name">FULALA</h1>
    <p class="tagline">Fresh Noodles & Dumplings</p>
    {#if schedule}
      <p class="schedule">Week #{schedule.weekNumber} — {schedule.monthLabel} {schedule.year}</p>
    {/if}
  </header>

  {#each menu as category}
    <section class="print-category">
      <h2 class="print-category-title">{category.displayName}</h2>
      {#if category.subtitle}
        <p class="print-category-subtitle">{category.subtitle}</p>
      {/if}

      <div class="print-items">
        {#each availableItems(category.items) as item}
          <div class="print-item">
            <div class="print-item-left">
              <span class="print-item-name">
                {item.name}
                {#if item.nameChinese}
                  <span class="print-chinese">{item.nameChinese}</span>
                {/if}
              </span>
              {#if item.allergenCodes?.length}
                <span class="print-allergens">({item.allergenCodes.join(',')})</span>
              {/if}
              {#if item.quantity}
                <span class="print-qty">{item.quantity}</span>
              {/if}
              {#if item.isSweet}
                <span class="print-tag">SWEET</span>
              {/if}
              {#if item.isGlutenFree}
                <span class="print-tag">GF</span>
              {/if}
            </div>
            <span class="print-dots"></span>
            <span class="print-price">{item.price}</span>
          </div>
        {/each}
      </div>
    </section>
  {/each}

  <footer class="print-footer">
    <div class="print-allergen-legend">
      <h3>Allergens / Alergeny</h3>
      <div class="legend-cols">
        {#each EU_ALLERGENS as a}
          <span class="legend-entry">{a.number}. {a.name} / {a.nameCZ}</span>
        {/each}
      </div>
    </div>

    {#if customerInfo?.sections}
      <div class="print-info">
        {#each customerInfo.sections as section}
          <span class="info-entry">
            <strong>{section.title}</strong>: {section.description}
          </span>
        {/each}
      </div>
    {/if}

    <p class="print-note">Prices in CZK. All prices include VAT.</p>
  </footer>
</div>

<style>
  .printable-menu {
    font-family: 'Inter', sans-serif;
    color: #000;
    max-width: 210mm;
    margin: 0 auto;
    padding: 15mm 20mm;
  }

  .print-header {
    text-align: center;
    margin-bottom: 8mm;
    padding-bottom: 4mm;
    border-bottom: 1px solid #000;
  }

  .restaurant-name {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 24pt;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin: 0;
  }

  .tagline {
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #555;
    margin: 2mm 0 0;
  }

  .schedule {
    font-size: 8pt;
    color: #777;
    margin: 1mm 0 0;
  }

  .print-category {
    margin-bottom: 6mm;
  }

  .print-category-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 14pt;
    font-weight: 700;
    margin: 0 0 1mm;
    padding-bottom: 1mm;
    border-bottom: 0.5pt solid #999;
  }

  .print-category-subtitle {
    font-size: 8pt;
    color: #666;
    margin: 0 0 3mm;
  }

  .print-items {
    display: flex;
    flex-direction: column;
    gap: 1.5mm;
  }

  .print-item {
    display: flex;
    align-items: baseline;
    gap: 2mm;
    font-size: 10pt;
    line-height: 1.4;
  }

  .print-item-left {
    display: flex;
    align-items: baseline;
    gap: 1.5mm;
    flex-shrink: 0;
  }

  .print-item-name {
    font-weight: 500;
  }

  .print-chinese {
    font-weight: 400;
    color: #555;
  }

  .print-allergens {
    font-size: 8pt;
    color: #777;
  }

  .print-qty {
    font-size: 8pt;
    color: #777;
  }

  .print-tag {
    font-size: 7pt;
    font-weight: 700;
    padding: 0 2mm;
    border: 0.5pt solid #999;
    border-radius: 2mm;
  }

  .print-dots {
    flex: 1;
    border-bottom: 0.5pt dotted #ccc;
    min-width: 5mm;
    margin: 0 1mm;
  }

  .print-price {
    font-family: 'DM Mono', monospace;
    font-size: 10pt;
    font-weight: 500;
    flex-shrink: 0;
    text-align: right;
    min-width: 8mm;
  }

  .print-footer {
    margin-top: 8mm;
    padding-top: 4mm;
    border-top: 1px solid #000;
  }

  .print-allergen-legend h3 {
    font-size: 9pt;
    font-weight: 600;
    margin: 0 0 2mm;
  }

  .legend-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5mm 4mm;
    font-size: 7pt;
    color: #555;
    margin-bottom: 4mm;
  }

  .legend-entry {
    line-height: 1.3;
  }

  .print-info {
    display: flex;
    gap: 4mm;
    flex-wrap: wrap;
    font-size: 8pt;
    margin-bottom: 3mm;
  }

  .info-entry {
    color: #555;
  }

  .print-note {
    font-size: 7pt;
    color: #999;
    text-align: center;
  }

  @media print {
    .printable-menu {
      padding: 0;
    }
  }
</style>
