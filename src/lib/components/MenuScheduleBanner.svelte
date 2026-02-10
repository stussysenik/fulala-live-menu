<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery } from "$lib/convex";
  import { api } from "../../../convex/_generated/api";
  import { lang, t } from '$lib/i18n/store';

  const schedule = browser ? useQuery(api.settings.getMenuSchedule, {}) : null;

  function formatDateRange(start: string, end: string, currentLang: string): string {
    const s = new Date(start);
    const e = new Date(end);
    if (currentLang === 'cs') {
      const month = s.toLocaleString('cs-CZ', { month: 'long' });
      return `${s.getDate()}. – ${e.getDate()}. ${month}`;
    }
    const month = s.toLocaleString('en-US', { month: 'short' });
    return `${month} ${s.getDate()} – ${e.getDate()}`;
  }

  function formatMonth(monthLabel: string, currentLang: string): string {
    // monthLabel is stored in English (e.g. "February")
    if (currentLang === 'cs') {
      // Create a date from the month label to get Czech translation
      const d = new Date(`${monthLabel} 1, 2026`);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('cs-CZ', { month: 'long' });
      }
    }
    return monthLabel;
  }
</script>

{#if $schedule}
  <div class="schedule-banner" aria-label="Menu schedule">
    <span class="schedule-week">{$t.schedulePrefix} #{$schedule.weekNumber}</span>
    <span class="schedule-separator">·</span>
    <span class="schedule-period">{formatMonth($schedule.monthLabel, $lang)} {$schedule.year}</span>
    {#if $schedule.startDate && $schedule.endDate}
      <span class="schedule-separator">·</span>
      <span class="schedule-dates">{formatDateRange($schedule.startDate, $schedule.endDate, $lang)}</span>
    {/if}
  </div>
{/if}

<style>
  .schedule-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    font-family: var(--font-body, sans-serif);
    font-size: 0.8125rem;
    color: var(--color-text-muted, #6B6B6B);
    letter-spacing: 0.02em;
    flex-wrap: wrap;
  }

  .schedule-week {
    font-weight: 600;
    color: var(--color-text, #2C2C2C);
  }

  .schedule-separator {
    opacity: 0.4;
  }

  .schedule-dates {
    font-variant-numeric: tabular-nums;
  }
</style>
