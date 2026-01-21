<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";

  // Get analytics data (only on browser)
  const summary = browser ? useQuery(api.analytics.getSummary, {}) : null;
  const hourlyData = browser ? useQuery(api.analytics.getHourlyDistribution, {}) : null;
  const recentSessions = browser ? useQuery(api.analytics.getSessions, { limit: 10 }) : null;

  // Format duration
  function formatDuration(ms: number): string {
    if (ms < 60000) {
      return `${Math.round(ms / 1000)}s`;
    } else if (ms < 3600000) {
      return `${Math.round(ms / 60000)}m`;
    } else {
      const hours = Math.floor(ms / 3600000);
      const mins = Math.round((ms % 3600000) / 60000);
      return `${hours}h ${mins}m`;
    }
  }

  // Format time
  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Format date
  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }

  // Get max value for chart scaling
  $: maxHourly = $hourlyData
    ? Math.max(...$hourlyData.map((d) => d.mobile + d.tv), 1)
    : 1;
</script>

<div class="analytics-page">
  <header class="page-header">
    <h1>Analytics</h1>
    <p class="subtitle">Display sessions and usage metrics</p>
  </header>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Active Now</span>
        <span class="stat-badge live">LIVE</span>
      </div>
      <div class="stat-value">{$summary?.active.total ?? "..."}</div>
      <div class="stat-breakdown">
        <span>Mobile: {$summary?.active.mobile ?? 0}</span>
        <span>TV: {$summary?.active.tv ?? 0}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Today's Sessions</span>
      </div>
      <div class="stat-value">{$summary?.today.total ?? "..."}</div>
      <div class="stat-breakdown">
        <span>Mobile: {$summary?.today.mobile ?? 0}</span>
        <span>TV: {$summary?.today.tv ?? 0}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Avg Session (Today)</span>
      </div>
      <div class="stat-value">
        {$summary?.today.avgDurationMs
          ? formatDuration($summary.today.avgDurationMs)
          : "..."}
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">This Week</span>
      </div>
      <div class="stat-value">{$summary?.week.total ?? "..."}</div>
      <div class="stat-detail">
        Avg: {$summary?.week.avgDurationMs
          ? formatDuration($summary.week.avgDurationMs)
          : "..."}
      </div>
    </div>
  </div>

  <div class="charts-section">
    <div class="chart-card">
      <h3>Hourly Distribution (Last 7 Days)</h3>
      <div class="hourly-chart">
        {#if $hourlyData}
          <div class="chart-bars">
            {#each $hourlyData as data}
              <div class="bar-group">
                <div
                  class="bar mobile"
                  style="height: {(data.mobile / maxHourly) * 100}%"
                  title="Mobile: {data.mobile}"
                ></div>
                <div
                  class="bar tv"
                  style="height: {(data.tv / maxHourly) * 100}%"
                  title="TV: {data.tv}"
                ></div>
                <span class="bar-label">{data.hour}</span>
              </div>
            {/each}
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot mobile"></span> Mobile
            </span>
            <span class="legend-item">
              <span class="legend-dot tv"></span> TV
            </span>
          </div>
        {:else}
          <div class="loading">Loading chart...</div>
        {/if}
      </div>
    </div>
  </div>

  <div class="sessions-section">
    <div class="sessions-card">
      <h3>Recent Sessions</h3>
      <div class="sessions-list">
        {#if $recentSessions && $recentSessions.length > 0}
          <table class="sessions-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Started</th>
                <th>Duration</th>
                <th>Viewport</th>
              </tr>
            </thead>
            <tbody>
              {#each $recentSessions as session}
                <tr>
                  <td>
                    <span class="type-badge {session.displayType}">
                      {session.displayType}
                    </span>
                  </td>
                  <td>{formatDate(session.startedAt)}</td>
                  <td>{formatTime(session.startedAt)}</td>
                  <td>
                    {session.endedAt
                      ? formatDuration(session.endedAt - session.startedAt)
                      : "Active"}
                  </td>
                  <td>
                    {session.viewportSize
                      ? `${session.viewportSize.width}x${session.viewportSize.height}`
                      : "-"}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else if $recentSessions}
          <p class="no-data">No sessions recorded yet.</p>
        {:else}
          <p class="loading">Loading sessions...</p>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .analytics-page {
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
    padding: var(--space-4);
    background: var(--color-surface, var(--surface));
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border, var(--border));
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--text-muted));
  }

  .stat-badge {
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }

  .stat-badge.live {
    background: rgba(22, 163, 74, 0.1);
    color: var(--color-available, var(--available));
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .stat-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-text, var(--text));
    line-height: 1;
    margin-bottom: var(--space-2);
  }

  .stat-breakdown {
    display: flex;
    gap: var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--text-muted));
  }

  .stat-detail {
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--text-muted));
  }

  .charts-section {
    margin-bottom: var(--space-6);
  }

  .chart-card,
  .sessions-card {
    padding: var(--space-4);
    background: var(--color-surface, var(--surface));
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border, var(--border));
  }

  .chart-card h3,
  .sessions-card h3 {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text, var(--text));
    margin-bottom: var(--space-4);
  }

  .hourly-chart {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .chart-bars {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 150px;
  }

  .bar-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    height: 100%;
  }

  .bar {
    width: 100%;
    min-height: 2px;
    border-radius: 2px 2px 0 0;
    transition: height 0.3s ease;
  }

  .bar.mobile {
    background: var(--color-accent, var(--accent));
  }

  .bar.tv {
    background: var(--color-available, var(--available));
  }

  .bar-label {
    font-size: 10px;
    color: var(--color-text-muted, var(--text-muted));
    margin-top: auto;
  }

  .chart-legend {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-sm);
    color: var(--color-text-muted, var(--text-muted));
  }

  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .legend-dot.mobile {
    background: var(--color-accent, var(--accent));
  }

  .legend-dot.tv {
    background: var(--color-available, var(--available));
  }

  .sessions-table {
    width: 100%;
    border-collapse: collapse;
  }

  .sessions-table th,
  .sessions-table td {
    padding: var(--space-2) var(--space-3);
    text-align: left;
    border-bottom: 1px solid var(--color-border, var(--border));
  }

  .sessions-table th {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text-muted, var(--text-muted));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sessions-table td {
    font-size: var(--text-sm);
    color: var(--color-text, var(--text));
  }

  .type-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    font-weight: 500;
    text-transform: capitalize;
  }

  .type-badge.mobile {
    background: rgba(37, 99, 235, 0.1);
    color: var(--color-accent, var(--accent));
  }

  .type-badge.tv {
    background: rgba(22, 163, 74, 0.1);
    color: var(--color-available, var(--available));
  }

  .no-data,
  .loading {
    text-align: center;
    padding: var(--space-4);
    color: var(--color-text-muted, var(--text-muted));
    font-size: var(--text-sm);
  }
</style>
