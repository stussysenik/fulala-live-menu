<script lang="ts">
  import { browser } from "$app/environment";
  import { useQuery, useMutation } from "$lib/convex";
  import { api } from "../../../../convex/_generated/api";

  const schedule = browser ? useQuery(api.settings.getMenuSchedule, {}) : null;
  const updateSchedule = browser ? useMutation(api.settings.updateMenuSchedule) : null;

  let weekNumber = 2;
  let monthLabel = 'February';
  let year = 2026;
  let startDate = '2026-02-09';
  let endDate = '2026-02-15';
  let saved = false;

  $: if ($schedule) {
    weekNumber = $schedule.weekNumber;
    monthLabel = $schedule.monthLabel;
    year = $schedule.year;
    startDate = $schedule.startDate;
    endDate = $schedule.endDate;
  }

  async function save() {
    await updateSchedule?.({
      schedule: { weekNumber, monthLabel, year, startDate, endDate },
    });
    saved = true;
    setTimeout(() => saved = false, 2000);
  }
</script>

<div class="schedule-admin">
  <header class="page-header">
    <h1>Menu Schedule</h1>
    <p class="subtitle">Set the current menu week and date range</p>
  </header>

  <form class="schedule-form" on:submit|preventDefault={save}>
    <div class="form-row">
      <div class="field">
        <label for="week">Week Number</label>
        <input id="week" type="number" bind:value={weekNumber} min="1" max="53" />
      </div>
      <div class="field">
        <label for="month">Month</label>
        <input id="month" type="text" bind:value={monthLabel} />
      </div>
      <div class="field">
        <label for="year">Year</label>
        <input id="year" type="number" bind:value={year} min="2024" max="2030" />
      </div>
    </div>

    <div class="form-row">
      <div class="field">
        <label for="start">Start Date</label>
        <input id="start" type="date" bind:value={startDate} />
      </div>
      <div class="field">
        <label for="end">End Date</label>
        <input id="end" type="date" bind:value={endDate} />
      </div>
    </div>

    <div class="preview">
      Week #{weekNumber} — {monthLabel} {year} ({startDate} – {endDate})
    </div>

    <button type="submit" class="btn-primary">
      {saved ? 'Saved!' : 'Save Schedule'}
    </button>
  </form>
</div>

<style>
  .schedule-admin { max-width: 600px; }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2C2C2C;
    margin-bottom: 0.25rem;
  }

  .subtitle { font-size: 0.875rem; color: #6B6B6B; }

  .schedule-form {
    padding: 1.5rem;
    background: white;
    border: 1px solid #E8E8E4;
    border-radius: 0.75rem;
  }

  .form-row {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .form-row .field { flex: 1; min-width: 120px; }

  .field {
    margin-bottom: 0.75rem;
  }

  .field label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #2C2C2C;
    margin-bottom: 0.25rem;
  }

  .field input {
    width: 100%;
    padding: 0.5rem 0.625rem;
    border: 1px solid #E8E8E4;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-family: inherit;
    color: #2C2C2C;
    box-sizing: border-box;
  }

  .field input:focus {
    outline: none;
    border-color: #C41E3A;
    box-shadow: 0 0 0 2px rgba(196, 30, 58, 0.1);
  }

  .preview {
    padding: 0.75rem;
    background: #FAFAF8;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #2C2C2C;
    font-weight: 500;
    text-align: center;
    margin-bottom: 1rem;
  }

  .btn-primary {
    padding: 0.5rem 1.25rem;
    background: #2C2C2C;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
  }
  .btn-primary:hover { background: #1a1a1a; }
</style>
