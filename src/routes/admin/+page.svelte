<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery } from "$lib/convex";
  import { api } from "../../../convex/_generated/api";

  // Get menu stats (only on browser)
  const menuStats = browser ? useQuery(api.archive.getMenuStats, {}) : null;
</script>

<div class="dashboard">
  <header class="page-header">
    <h1>Dashboard</h1>
    <p class="subtitle">Overview of your restaurant menu system</p>
  </header>

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

      <a href="/tv" class="action-card" target="_blank">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="7" width="20" height="15" rx="2" />
            <polyline points="17 2 12 7 7 2" />
          </svg>
        </div>
        <div class="action-content">
          <h3>TV Display</h3>
          <p>Open the TV display mode</p>
        </div>
      </a>
    </div>
  </div>
</div>

<style>
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
