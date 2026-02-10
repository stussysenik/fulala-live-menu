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

  function selectImage(file: string) {
    const url = `/images/menu/${file}`;
    selected = url;
    dispatch('select', url);
  }
</script>

<div class="image-picker">
  <p class="picker-label">Select photo</p>
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
</div>

<style>
  .image-picker {
    margin: 0.5rem 0;
  }

  .picker-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #6B6B6B;
    margin-bottom: 0.5rem;
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
</style>
