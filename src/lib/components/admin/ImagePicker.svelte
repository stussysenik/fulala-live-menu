<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let selected: string = '';

  const dispatch = createEventDispatcher();

  const images = [
    { file: '0560_MQ.webp', label: 'Steamed dumplings' },
    { file: '0579_MQ.webp', label: 'Dumplings + sauces' },
    { file: '0622_MQ.webp', label: 'Beef noodle soup' },
    { file: '0625_MQ.webp', label: 'Beef noodle alt' },
    { file: '0642_MQ.webp', label: 'Minced pork noodles' },
    { file: '0659_MQ.webp', label: 'Rice noodles pork' },
    { file: '0684_MQ.webp', label: 'Pan-fried gyoza' },
    { file: '0697_MQ.webp', label: 'White buns' },
    { file: '0704_MQ.webp', label: 'Noodles toppings' },
    { file: '0723_MQ.webp', label: 'Noodle pull shot' },
    { file: '0759_MQ.webp', label: 'Shrimp dumplings' },
    { file: '0779_MQ.webp', label: 'Shumai style' },
    { file: '0795_MQ.webp', label: 'Peach buns' },
  ];

  let customUrl = '';

  // Pre-populate customUrl if selected is not from the predefined set
  $: if (selected && !images.some(img => selected === `/images/menu/${img.file}`)) {
    customUrl = selected;
  }

  function selectImage(file: string) {
    const url = `/images/menu/${file}`;
    selected = url;
    customUrl = '';
    dispatch('select', url);
  }

  function useCustomUrl() {
    if (!customUrl.trim()) return;
    selected = customUrl.trim();
    dispatch('select', selected);
  }

  function clearImage() {
    selected = '';
    customUrl = '';
    dispatch('select', '');
  }
</script>

<div class="image-picker">
  <div class="picker-header">
    <p class="picker-label">Select photo</p>
    {#if selected}
      <button type="button" class="clear-btn" on:click={clearImage}>Clear image</button>
    {/if}
  </div>
  <div class="image-grid">
    {#each images as img}
      <button
        class="image-option"
        class:selected={selected === `/images/menu/${img.file}`}
        on:click={() => selectImage(img.file)}
        title={img.label}
        type="button"
      >
        <img
          src="/images/menu/{img.file}"
          alt={img.label}
          loading="lazy"
          width="80"
          height="80"
        />
      </button>
    {/each}
  </div>

  <div class="custom-url">
    <div class="custom-url-row">
      <input
        type="text"
        bind:value={customUrl}
        placeholder="Or paste image URL..."
        class="custom-url-input"
      />
      <button
        type="button"
        class="use-url-btn"
        on:click={useCustomUrl}
        disabled={!customUrl.trim()}
      >
        Use
      </button>
    </div>
    {#if customUrl && selected === customUrl}
      <div class="custom-preview">
        <img src={customUrl} alt="Custom image" width="48" height="48" />
      </div>
    {/if}
  </div>

  <p class="help-text">To add new photos: place .webp files in /static/images/menu/ and redeploy</p>
</div>

<style>
  .image-picker {
    margin: 0.5rem 0;
  }

  .picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .picker-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #6B6B6B;
    margin: 0;
  }

  .clear-btn {
    font-size: 0.75rem;
    color: #DC2626;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }

  .clear-btn:hover {
    background: rgba(220, 38, 38, 0.05);
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.5rem;
  }

  .image-option {
    border: 2px solid transparent;
    border-radius: 0.5rem;
    overflow: hidden;
    cursor: pointer;
    padding: 0;
    background: none;
    transition: border-color 0.15s ease, transform 0.15s ease;
    aspect-ratio: 1;
  }

  .image-option:hover {
    border-color: #E8E8E4;
    transform: scale(1.05);
  }

  .image-option.selected {
    border-color: #C41E3A;
    box-shadow: 0 0 0 2px rgba(196, 30, 58, 0.2);
  }

  .image-option img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .custom-url {
    margin-top: 0.75rem;
  }

  .custom-url-row {
    display: flex;
    gap: 0.375rem;
  }

  .custom-url-input {
    flex: 1;
    padding: 0.375rem 0.5rem;
    border: 1px solid #E8E8E4;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-family: inherit;
    color: #2C2C2C;
  }

  .custom-url-input:focus {
    outline: none;
    border-color: #C41E3A;
    box-shadow: 0 0 0 2px rgba(196, 30, 58, 0.1);
  }

  .use-url-btn {
    padding: 0.375rem 0.75rem;
    background: #2C2C2C;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    cursor: pointer;
  }

  .use-url-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .use-url-btn:hover:not(:disabled) {
    background: #1a1a1a;
  }

  .custom-preview {
    margin-top: 0.5rem;
  }

  .custom-preview img {
    border-radius: 0.375rem;
    object-fit: cover;
    border: 2px solid #C41E3A;
  }

  .help-text {
    font-size: 0.6875rem;
    color: #9CA3AF;
    margin-top: 0.5rem;
    font-style: italic;
  }
</style>
