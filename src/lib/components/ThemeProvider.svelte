<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import { browser } from "$app/environment";
  import { useQuery } from "$lib/convex";
  import { api } from "../../../convex/_generated/api";
  import {
    defaultTheme,
    themeToCssVars,
    type ThemeConfig,
  } from "$lib/theme/defaults";

  // Create theme store for context
  const themeStore: Writable<ThemeConfig> = writable(defaultTheme);
  setContext("theme", themeStore);

  // Subscribe to theme from Convex (only on browser)
  const themeQuery = browser ? useQuery(api.settings.getTheme, {}) : null;

  // Apply CSS variables to document
  function applyTheme(theme: ThemeConfig) {
    if (!browser) return;

    const vars = themeToCssVars(theme);
    const root = document.documentElement;

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }

    // When animations are disabled, set all durations to 0ms
    if (theme.animationsEnabled === false) {
      root.style.setProperty("--anim-duration-quick", "0ms");
      root.style.setProperty("--anim-duration-normal", "0ms");
      root.style.setProperty("--anim-duration-slow", "0ms");
      root.style.setProperty("--anim-duration-page", "0ms");
    }

    // Also update legacy variables for backwards compatibility
    root.style.setProperty("--font", theme.fonts.body);
    root.style.setProperty("--text", theme.colors.text);
    root.style.setProperty("--text-muted", theme.colors.textMuted);
    root.style.setProperty("--price", theme.colors.price);
    root.style.setProperty("--bg", theme.colors.background);
    root.style.setProperty("--surface", theme.colors.surface);
    root.style.setProperty("--accent", theme.colors.accent);
    root.style.setProperty("--available", theme.colors.available);
    root.style.setProperty("--unavailable", theme.colors.unavailable);
    root.style.setProperty("--border", theme.colors.border);
  }

  // React to theme changes
  $: if (themeQuery && $themeQuery) {
    themeStore.set($themeQuery);
    applyTheme($themeQuery);
  }

  // Apply default theme on mount (before Convex loads)
  onMount(() => {
    applyTheme(defaultTheme);
  });
</script>

<slot />
