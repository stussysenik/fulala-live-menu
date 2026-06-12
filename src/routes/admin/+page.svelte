<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery, useMutation } from "$lib/convex";
  import { api } from "../../../convex/_generated/api";
  import {
    activeHolidays,
    upcomingHolidays,
    type Holiday,
    type UpcomingHoliday,
  } from "$lib/domain/holidays";

  // Get menu stats (only on browser)
  const menuStats = browser ? useQuery(api.archive.getMenuStats, {}) : null;

  // --- Holiday decor: introduce, never assume --------------------------------
  // The engine knows what's active/coming; the dashboard asks ONCE per
  // holiday and the answer is remembered (siteSettings holiday-prefs).
  // Displays only decorate after an explicit "Celebrate".
  const holidayPrefs = browser ? useQuery(api.settings.getHolidayPrefs, {}) : null;
  const setHolidayPref = browser ? useMutation(api.settings.setHolidayPref) : null;

  const now = new Date();
  const active = activeHolidays(now);
  const upcoming = upcomingHolidays(now, 14);

  // First holiday (active first, then soonest upcoming) with no decision yet.
  $: prefs = $holidayPrefs ?? {};
  $: candidates = [...active, ...upcoming] as Array<Holiday & Partial<UpcomingHoliday>>;
  $: introduction = $holidayPrefs === undefined
    ? null
    : (candidates.find((h) => !prefs[h.key]) ?? null);
  $: celebratingNow = active.filter((h) => prefs[h.key] === "enabled");

  async function decide(holidayKey: string, status: "enabled" | "dismissed") {
    await setHolidayPref?.({ holidayKey, status });
  }
</script>

<div class="dashboard">
  <header class="page-header">
    <h1>Dashboard</h1>
    <p class="subtitle">Overview of your restaurant menu system</p>
  </header>

  {#if introduction}
    <section class="holiday-card" style:--holiday-accent={introduction.accentColor ?? "#E83636"}>
      <span class="holiday-emoji">{introduction.emoji}</span>
      <div class="holiday-body">
        <h2>
          {introduction.nameLocal ?? introduction.name}
          {#if introduction.nameLocal}<span class="holiday-name-en">/ {introduction.name}</span>{/if}
        </h2>
        <p>
          {#if "inDays" in introduction && introduction.inDays}
            Coming up in {introduction.inDays} day{introduction.inDays === 1 ? "" : "s"}
            ({introduction.startsOn}).
          {:else}
            Today!
          {/if}
          Want the displays to celebrate? Adds the emoji to the TV header and a
          subtle accent color while it lasts — nothing else changes.
        </p>
        <div class="holiday-actions">
          <button type="button" class="holiday-yes" on:click={() => decide(introduction.key, "enabled")}>
            Celebrate on displays
          </button>
          <button type="button" class="holiday-no" on:click={() => decide(introduction.key, "dismissed")}>
            Not this one
          </button>
        </div>
      </div>
    </section>
  {/if}

  {#if celebratingNow.length > 0}
    <p class="holiday-active-note">
      {#each celebratingNow as h (h.key)}
        <span>{h.emoji} Celebrating {h.nameLocal ?? h.name} on the displays.</span>
        <button type="button" class="holiday-stop" on:click={() => decide(h.key, "dismissed")}>
          Turn off
        </button>
      {/each}
    </p>
  {/if}

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{$menuStats?.totalItems ?? '...'}</span>
        <span class="stat-label">Menu Items</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon available">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{$menuStats?.availableItems ?? '...'}</span>
        <span class="stat-label">Available</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon unavailable">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{$menuStats?.unavailableItems ?? '...'}</span>
        <span class="stat-label">Sold Out</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon changes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{$menuStats?.changesLast24h ?? '...'}</span>
        <span class="stat-label">Changes (24h)</span>
      </div>
    </div>
  </div>

  <div class="quick-actions">
    <h2>Quick Actions</h2>
    <div class="actions-grid">
      <a href="/admin/menu" class="action-card">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <div class="action-content">
          <h3>Menu Items</h3>
          <p>Add, edit, and manage menu items</p>
        </div>
      </a>

      <a href="/admin/schedule" class="action-card">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div class="action-content">
          <h3>Schedule</h3>
          <p>Set week number and date range</p>
        </div>
      </a>

      <a href="/admin/theme" class="action-card">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="13.5" cy="6.5" r="2.5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.563-2.485 5.563-5.537C22 6.408 17.5 2 12 2z" />
          </svg>
        </div>
        <div class="action-content">
          <h3>Customize Theme</h3>
          <p>Edit colors, fonts, and display settings</p>
        </div>
      </a>

      <a href="/admin/print" class="action-card">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        </div>
        <div class="action-content">
          <h3>Print Menu</h3>
          <p>Preview and print A4 menu sheet</p>
        </div>
      </a>

      <a href="/" class="action-card" target="_blank">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <div class="action-content">
          <h3>View Menu</h3>
          <p>Open the customer-facing menu</p>
        </div>
      </a>

      <a href="/admin/analytics" class="action-card">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div class="action-content">
          <h3>View Analytics</h3>
          <p>Display sessions and usage metrics</p>
        </div>
      </a>
    </div>
  </div>
</div>

<style>
  /* Holiday introduction — one calm card, never a takeover. */
  .holiday-card {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    border: 1px solid #e8e8e4;
    border-left: 5px solid var(--holiday-accent, #e83636);
    border-radius: 12px;
    background: #fff;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .holiday-emoji {
    font-size: 2.25rem;
    line-height: 1;
  }

  .holiday-body h2 {
    font-size: 1.05rem;
    font-weight: 650;
    color: #2c2c2c;
    margin-bottom: 0.25rem;
  }

  .holiday-name-en {
    font-weight: 450;
    color: #6b6b6b;
  }

  .holiday-body p {
    font-size: 0.875rem;
    color: #6b6b6b;
    margin-bottom: 0.75rem;
    max-width: 56ch;
  }

  .holiday-actions {
    display: flex;
    gap: 0.75rem;
  }

  .holiday-yes {
    border: none;
    border-radius: 8px;
    background: var(--holiday-accent, #e83636);
    color: #fff;
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 7px 14px;
    cursor: pointer;
  }

  .holiday-no {
    border: 1px solid #e8e8e4;
    border-radius: 8px;
    background: #fff;
    color: #6b6b6b;
    font-size: 0.8125rem;
    padding: 7px 14px;
    cursor: pointer;
  }

  .holiday-active-note {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    font-size: 0.8125rem;
    color: #2c2c2c;
    margin-bottom: 1.25rem;
  }

  .holiday-stop {
    border: none;
    background: none;
    color: #2563eb;
    font-size: 0.8125rem;
    cursor: pointer;
    padding: 0;
  }

  .holiday-stop:hover {
    text-decoration: underline;
  }

  .dashboard {
    max-width: 1200px;
  }

  .page-header {
    margin-bottom: var(--space-5);
  }

  .page-header h1 {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text, var(--text));
    margin-bottom: var(--space-1);
  }

  .subtitle {
    font-size: var(--text-base);
    color: var(--color-text-muted, var(--text-muted));
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-surface, var(--surface));
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border, var(--border));
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(37, 99, 235, 0.1);
    border-radius: var(--radius-md);
    color: var(--color-accent, var(--accent));
  }

  .stat-icon.available {
    background: rgba(22, 163, 74, 0.1);
    color: var(--color-available, var(--available));
  }

  .stat-icon.unavailable {
    background: rgba(220, 38, 38, 0.1);
    color: var(--color-unavailable, var(--unavailable));
  }

  .stat-icon.changes {
    background: rgba(196, 90, 59, 0.1);
    color: var(--color-accent, #c45a3b);
  }

  .stat-icon svg {
    width: 24px;
    height: 24px;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--color-text, var(--text));
    line-height: 1;
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--text-muted));
    margin-top: var(--space-1);
  }

  .quick-actions h2 {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--color-text, var(--text));
    margin-bottom: var(--space-4);
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .action-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-surface, var(--surface));
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border, var(--border));
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .action-card:hover {
    border-color: var(--color-accent, var(--accent));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .action-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(37, 99, 235, 0.1);
    border-radius: var(--radius-md);
    color: var(--color-accent, var(--accent));
    flex-shrink: 0;
  }

  .action-icon svg {
    width: 20px;
    height: 20px;
  }

  .action-content h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text, var(--text));
    margin-bottom: var(--space-1);
  }

  .action-content p {
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--text-muted));
  }
</style>
