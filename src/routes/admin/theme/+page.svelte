<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { browser } from "$app/environment";
  import type { Writable } from "svelte/store";
  import ThemeEditor from "$lib/components/admin/ThemeEditor.svelte";
  import { useQuery, useMutation } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";
  import type { ThemeConfig } from "$lib/theme/defaults";
  import { defaultTheme, themePresets } from "$lib/theme/defaults";

  // Get current theme from context
  const themeStore = getContext<Writable<ThemeConfig>>("theme");
  $: currentTheme = $themeStore ?? defaultTheme;

  // Local working copy of theme
  let workingTheme: ThemeConfig = { ...currentTheme };
  let hasChanges = false;

  // Query presets from database (only on browser)
  const presetsQuery = browser ? useQuery(api.settings.getPresets, {}) : null;

  // Mutations (only on browser)
  const updateThemeMutation = browser ? useMutation(api.settings.updateTheme) : null;
  const savePresetMutation = browser ? useMutation(api.settings.savePreset) : null;
  const loadPresetMutation = browser ? useMutation(api.settings.loadPreset) : null;
  const resetThemeMutation = browser ? useMutation(api.settings.resetTheme) : null;

  // Preset management
  let presetName = "";
  let showSavePreset = false;
  let saving = false;

  // Toast notifications
  let toast: { message: string; type: "success" | "error" | "info" } | null = null;
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Track last edited property for visual feedback
  let lastEditedProperty: string | null = null;
  let propertyTimeout: ReturnType<typeof setTimeout> | null = null;

  function showToast(message: string, type: "success" | "error" | "info" = "success") {
    if (toastTimeout) clearTimeout(toastTimeout);
    toast = { message, type };
    toastTimeout = setTimeout(() => {
      toast = null;
    }, 3000);
  }

  function highlightProperty(property: string) {
    if (propertyTimeout) clearTimeout(propertyTimeout);
    lastEditedProperty = property;
    propertyTimeout = setTimeout(() => {
      lastEditedProperty = null;
    }, 2000);
  }

  // Sync working theme when context changes
  $: {
    if (!hasChanges) {
      workingTheme = { ...currentTheme };
    }
  }

  function handleThemeChange(event: CustomEvent<ThemeConfig>) {
    workingTheme = event.detail;
    hasChanges = true;
  }

  async function saveTheme() {
    saving = true;
    try {
      await updateThemeMutation?.({ theme: workingTheme });
      hasChanges = false;
      showToast("Theme saved! Changes are now live on / and /tv", "success");
    } catch (error) {
      showToast("Failed to save theme", "error");
    } finally {
      saving = false;
    }
  }

  async function saveAsPreset() {
    if (!presetName.trim()) return;
    saving = true;
    try {
      await savePresetMutation?.({
        name: presetName.trim(),
        theme: workingTheme,
      });
      presetName = "";
      showSavePreset = false;
      showToast(`Preset "${presetName}" saved!`, "success");
    } catch (error) {
      showToast("Failed to save preset", "error");
    } finally {
      saving = false;
    }
  }

  async function loadPreset(name: string) {
    saving = true;
    try {
      await loadPresetMutation?.({ name });
      hasChanges = false;
      showToast(`Preset "${name}" loaded!`, "success");
    } catch (error) {
      showToast("Failed to load preset", "error");
    } finally {
      saving = false;
    }
  }

  async function loadBuiltInPreset(name: string) {
    const preset = themePresets[name];
    if (preset) {
      workingTheme = { ...preset };
      hasChanges = true;
      showToast(`"${name}" preset applied. Save to make it live.`, "info");
    }
  }

  async function resetToDefault() {
    saving = true;
    try {
      await resetThemeMutation?.({});
      hasChanges = false;
      showToast("Theme reset to default!", "success");
    } catch (error) {
      showToast("Failed to reset theme", "error");
    } finally {
      saving = false;
    }
  }

  function discardChanges() {
    workingTheme = { ...currentTheme };
    hasChanges = false;
    showToast("Changes discarded", "info");
  }

  // Open preview in new window side-by-side
  function openPreview(url: string) {
    const width = 400;
    const height = 700;
    const left = window.screen.width - width - 50;
    const top = 100;
    window.open(url, `preview-${url}`, `width=${width},height=${height},left=${left},top=${top}`);
  }
</script>

<div class="theme-page">
  <!-- Toast notification -->
  {#if toast}
    <div class="toast toast-{toast.type}" class:show={toast}>
      <span class="toast-icon">
        {#if toast.type === "success"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        {:else if toast.type === "error"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        {/if}
      </span>
      <span class="toast-message">{toast.message}</span>
    </div>
  {/if}

  <header class="page-header">
    <div class="header-content">
      <h1>Theme Editor</h1>
      <p class="subtitle">Customize colors, fonts, and display settings for <strong>/</strong> and <strong>/tv</strong></p>
    </div>
    <div class="header-actions">
      {#if hasChanges}
        <span class="unsaved-indicator">
          <span class="pulse-dot"></span>
          Unsaved changes
        </span>
        <button class="btn btn-secondary" on:click={discardChanges} disabled={saving}>
          Discard
        </button>
      {/if}
      <button
        class="btn btn-primary"
        class:btn-saving={saving}
        on:click={saveTheme}
        disabled={saving || !hasChanges}
      >
        {#if saving}
          <span class="spinner"></span>
          Saving...
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save Changes
        {/if}
      </button>
    </div>
  </header>

  <!-- Quick info banner -->
  <div class="info-banner">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
    <span>Changes apply instantly to preview. Click <strong>Save Changes</strong> to make them permanent across all displays.</span>
  </div>

  <div class="content-grid">
    <div class="editor-section">
      <ThemeEditor theme={workingTheme} on:change={handleThemeChange} />
    </div>

    <aside class="sidebar-section">
      <div class="presets-card">
        <h3>Theme Presets</h3>

        <div class="preset-group">
          <h4>Built-in Presets</h4>
          <div class="preset-list">
            {#each Object.keys(themePresets) as name}
              <button class="preset-btn" on:click={() => loadBuiltInPreset(name)}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </button>
            {/each}
          </div>
        </div>

        {#if $presetsQuery && $presetsQuery.length > 0}
          <div class="preset-group">
            <h4>Saved Presets</h4>
            <div class="preset-list">
              {#each $presetsQuery as preset}
                <button class="preset-btn" on:click={() => loadPreset(preset.name)}>
                  {preset.name}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <div class="preset-actions">
          {#if showSavePreset}
            <div class="save-preset-form">
              <input
                type="text"
                bind:value={presetName}
                placeholder="Preset name"
                on:keydown={(e) => e.key === "Enter" && saveAsPreset()}
              />
              <button class="btn btn-primary btn-sm" on:click={saveAsPreset} disabled={!presetName.trim()}>
                Save
              </button>
              <button class="btn btn-secondary btn-sm" on:click={() => (showSavePreset = false)}>
                Cancel
              </button>
            </div>
          {:else}
            <button class="btn btn-secondary" on:click={() => (showSavePreset = true)}>
              Save as Preset
            </button>
          {/if}

          <button class="btn btn-danger" on:click={resetToDefault}>
            Reset to Default
          </button>
        </div>
      </div>

      <div class="preview-card">
        <h3>Live Preview</h3>
        <p class="preview-hint">Open preview windows to see changes in real-time as you edit.</p>
        <div class="preview-links">
          <button class="preview-link" on:click={() => openPreview("/")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Open Menu Preview
            <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
          <button class="preview-link" on:click={() => openPreview("/tv")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="15" rx="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
            Open TV Preview
            <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>
        <p class="preview-note">Tip: Position preview windows side-by-side with this editor!</p>
      </div>

      <!-- Property mapping guide -->
      <div class="mapping-card">
        <h3>What You're Editing</h3>
        <div class="mapping-list">
          <div class="mapping-item">
            <span class="mapping-label">Colors Tab</span>
            <span class="mapping-desc">Menu background, text, prices, status badges</span>
          </div>
          <div class="mapping-item">
            <span class="mapping-label">Typography Tab</span>
            <span class="mapping-desc">Category headers, item names, descriptions, prices</span>
          </div>
          <div class="mapping-item">
            <span class="mapping-label">Display Tab</span>
            <span class="mapping-desc">Price format, images, spacing, TV columns</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</div>

<style>
  .theme-page {
    max-width: 1400px;
    position: relative;
  }

  /* Toast notifications */
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    background: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .toast-success {
    border-left: 4px solid var(--color-available, #16a34a);
  }

  .toast-error {
    border-left: 4px solid var(--color-unavailable, #dc2626);
  }

  .toast-info {
    border-left: 4px solid var(--color-accent, #2563eb);
  }

  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-icon svg {
    width: 20px;
    height: 20px;
  }

  .toast-success .toast-icon {
    color: var(--color-available, #16a34a);
  }

  .toast-error .toast-icon {
    color: var(--color-unavailable, #dc2626);
  }

  .toast-info .toast-icon {
    color: var(--color-accent, #2563eb);
  }

  .toast-message {
    font-size: var(--text-sm);
    color: var(--color-text, var(--text));
  }

  /* Info banner */
  .info-banner {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: rgba(37, 99, 235, 0.08);
    border: 1px solid rgba(37, 99, 235, 0.2);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-4);
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--text-muted));
  }

  .info-banner svg {
    width: 18px;
    height: 18px;
    color: var(--color-accent, #2563eb);
    flex-shrink: 0;
  }

  .info-banner strong {
    color: var(--color-accent, #2563eb);
    font-family: monospace;
    background: rgba(37, 99, 235, 0.1);
    padding: 0 4px;
    border-radius: 3px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-4);
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .header-content h1 {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text, var(--text));
    margin-bottom: var(--space-1);
  }

  .subtitle {
    font-size: var(--text-base);
    color: var(--color-text-muted, var(--text-muted));
  }

  .subtitle strong {
    color: var(--color-accent, #2563eb);
    font-family: monospace;
    background: rgba(37, 99, 235, 0.1);
    padding: 0 4px;
    border-radius: 3px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .unsaved-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--color-accent, var(--accent));
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: var(--color-accent, var(--accent));
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }

  .btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn svg {
    width: 16px;
    height: 16px;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--color-accent, var(--accent));
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  .btn-saving {
    background: var(--color-available, #16a34a);
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .btn-secondary {
    background: var(--color-surface, var(--surface));
    color: var(--color-text, var(--text));
    border: 1px solid var(--color-border, var(--border));
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-border, var(--border));
  }

  .btn-danger {
    background: transparent;
    color: var(--color-unavailable, var(--unavailable));
    border: 1px solid var(--color-unavailable, var(--unavailable));
  }

  .btn-danger:hover:not(:disabled) {
    background: rgba(220, 38, 38, 0.1);
  }

  .btn-sm {
    padding: var(--space-1) var(--space-2);
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: var(--space-5);
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  .editor-section {
    background: var(--color-surface, var(--surface));
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border, var(--border));
    padding: var(--space-5);
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .presets-card,
  .preview-card,
  .mapping-card {
    background: var(--color-surface, var(--surface));
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border, var(--border));
    padding: var(--space-4);
  }

  .presets-card h3,
  .preview-card h3,
  .mapping-card h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text, var(--text));
    margin-bottom: var(--space-3);
  }

  .preset-group {
    margin-bottom: var(--space-4);
  }

  .preset-group h4 {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-muted, var(--text-muted));
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-2);
  }

  .preset-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .preset-btn {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
    background: var(--color-bg, var(--bg));
    color: var(--color-text, var(--text));
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .preset-btn:hover {
    border-color: var(--color-accent, var(--accent));
    color: var(--color-accent, var(--accent));
  }

  .preset-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .save-preset-form {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .save-preset-form input {
    flex: 1;
    min-width: 120px;
    padding: var(--space-2);
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .save-preset-form input:focus {
    outline: none;
    border-color: var(--color-accent, var(--accent));
  }

  .preview-hint {
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--text-muted));
    margin-bottom: var(--space-3);
  }

  .preview-note {
    font-size: var(--text-xs);
    color: var(--color-text-muted, var(--text-muted));
    margin-top: var(--space-3);
    padding-top: var(--space-2);
    border-top: 1px dashed var(--color-border, var(--border));
  }

  .preview-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .preview-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border, var(--border));
    border-radius: var(--radius-md);
    background: var(--color-bg, var(--bg));
    color: var(--color-text, var(--text));
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .preview-link:hover {
    border-color: var(--color-accent, var(--accent));
    color: var(--color-accent, var(--accent));
  }

  .preview-link svg {
    width: 18px;
    height: 18px;
  }

  .preview-link .external-icon {
    width: 14px;
    height: 14px;
    margin-left: auto;
    opacity: 0.5;
  }

  /* Property mapping card */
  .mapping-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .mapping-item {
    padding: var(--space-2);
    background: var(--color-bg, var(--bg));
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--color-accent, var(--accent));
  }

  .mapping-label {
    display: block;
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text, var(--text));
    margin-bottom: 2px;
  }

  .mapping-desc {
    display: block;
    font-size: var(--text-xs);
    color: var(--color-text-muted, var(--text-muted));
  }
</style>
