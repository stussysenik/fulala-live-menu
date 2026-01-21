<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import { browser } from "$app/environment";
  import { useQuery } from "$lib/convex";
  import { api } from "../../../convex/_generated/api";
  import {
    defaultTheme,
    themeToCssVars,
    getGoogleFontsUrl,
    type ThemeConfig,
  } from "$lib/theme/defaults";

  // Create theme store for context
  const themeStore: Writable<ThemeConfig> = writable(defaultTheme);
  setContext("theme", themeStore);

  // Subscribe to theme from Convex (only on browser)
  const themeQuery = browser ? useQuery(api.settings.getTheme, {}) : null;

  // Track loaded Google Fonts to avoid duplicates
  let loadedFontsUrl: string | null = null;

  // Apply CSS variables to document
  function applyTheme(theme: ThemeConfig) {
    if (!browser) return;

    const vars = themeToCssVars(theme);
    const root = document.documentElement;

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
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

  // Load Google Fonts
  function loadGoogleFonts(theme: ThemeConfig) {
    if (!browser) return;

    const url = getGoogleFontsUrl(theme);

    // Skip if same URL already loaded
    if (url === loadedFontsUrl) return;

    // Remove old font link if exists
    const existingLink = document.getElementById("theme-google-fonts");
    if (existingLink) {
      existingLink.remove();
    }

    if (url) {
      const link = document.createElement("link");
      link.id = "theme-google-fonts";
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
      loadedFontsUrl = url;
    } else {
      loadedFontsUrl = null;
    }
  }

  // React to theme changes
  $: if (themeQuery && $themeQuery) {
    themeStore.set($themeQuery);
    applyTheme($themeQuery);
    loadGoogleFonts($themeQuery);
  }

  // Apply default theme on mount (before Convex loads)
  onMount(() => {
    applyTheme(defaultTheme);
  });
</script>

<slot />
