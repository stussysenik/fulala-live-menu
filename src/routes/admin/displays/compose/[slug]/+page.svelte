<script lang="ts">
  /**
   * Deep-linkable composer route. The composer itself lives in
   * SectionComposer.svelte and also opens inline on /admin/displays —
   * same component, two doorways.
   */
  import { page } from "$app/stores";
  import SectionComposer from "$lib/components/admin/SectionComposer.svelte";

  $: slug = $page.params.slug ?? "";
</script>

<svelte:head>
  <title>Compose — {slug}</title>
</svelte:head>

<div class="compose-route">
  <header class="page-header">
    <div>
      <h1>Compose sections — <code>/{slug}</code></h1>
      <p class="subtitle">
        Arrange sections, edit their settings, then publish. TVs only change on publish.
      </p>
    </div>
    <a class="back" href="/admin/displays">← Displays</a>
  </header>

  {#key slug}
    <SectionComposer {slug} />
  {/key}
</div>

<style>
  .compose-route {
    max-width: 1280px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c2c2c;
    margin-bottom: 0.25rem;
  }

  .page-header code {
    font-size: 1.15rem;
    background: #f5f5f2;
    border-radius: 6px;
    padding: 1px 8px;
  }

  .subtitle {
    font-size: 0.875rem;
    color: #6b6b6b;
  }

  .back {
    font-size: 0.875rem;
    color: #2563eb;
    text-decoration: none;
    white-space: nowrap;
  }
</style>
