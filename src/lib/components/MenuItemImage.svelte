<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { ThemeConfig } from "$lib/theme/defaults";
  import { defaultTheme, getImageSize } from "$lib/theme/defaults";

  export let src: string;
  export let alt: string;
  export let size: "small" | "medium" | "large" | undefined = undefined;

  // Get theme from context
  const themeStore = getContext<Writable<ThemeConfig>>("theme");
  $: theme = $themeStore ?? defaultTheme;

  // Use prop or fall back to theme setting
  $: effectiveSize = size ?? theme.display.imageSize;
  $: dimensions = getImageSize(effectiveSize);

  // Track loading state
  let loaded = false;
  let error = false;
  // Load images eagerly — only 11 menu items, lazy loading adds unnecessary delay

  function handleLoad() {
    loaded = true;
  }

  function handleError() {
    error = true;
  }
</script>

<div
  class="image-container"
  style="--img-width: {dimensions.width}px; --img-height: {dimensions.height}px;"
  data-size={effectiveSize}
>
  {#if error}
    <div class="placeholder error" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  {:else}
    {#if !loaded}
      <div class="placeholder loading" aria-hidden="true">
        <div class="shimmer"></div>
      </div>
    {/if}
    <img
      {src}
      {alt}
      width={dimensions.width}
      height={dimensions.height}
      decoding="async"
      class:loaded
      on:load={handleLoad}
      on:error={handleError}
    />
  {/if}
</div>

<style>
  .image-container {
    position: relative;
    width: var(--img-width);
    height: var(--img-height);
    flex-shrink: 0;
    border-radius: var(--radius-md, 0.5rem);
    overflow: hidden;
    background: var(--color-surface, var(--surface));
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.05);
    transition:
      opacity var(--anim-duration-slow, 600ms) var(--anim-ease-exit, ease),
      transform var(--anim-duration-slow, 600ms) var(--anim-ease-exit, ease);
  }

  img.loaded {
    opacity: 1;
    transform: scale(1);
  }

  .placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface, var(--surface));
  }

  .placeholder.loading {
    overflow: hidden;
  }

  .shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shimmer 2s var(--anim-ease-enter, ease) infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .placeholder.error {
    background: var(--color-surface, var(--surface));
  }

  .placeholder.error svg {
    width: 40%;
    height: 40%;
    color: var(--color-text-muted, var(--text-muted));
    opacity: 0.5;
  }

  /* Size variants */
  .image-container[data-size="small"] {
    border-radius: var(--radius-sm, 0.25rem);
  }

  .image-container[data-size="large"] {
    border-radius: var(--radius-lg, 0.75rem);
  }
</style>
