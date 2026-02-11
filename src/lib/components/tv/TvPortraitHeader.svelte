<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../../convex/_generated/api';

	export let currentTime: string = '';

	const schedule = browser ? useQuery(api.settings.getMenuSchedule, {}) : null;

	function formatDateRange(start: string, end: string): string {
		const s = new Date(start);
		const e = new Date(end);
		const monthCS = s.toLocaleString('cs-CZ', { month: 'long' });
		const monthEN = s.toLocaleString('en-US', { month: 'short' });
		return `${s.getDate()}.–${e.getDate()}. ${monthCS} / ${monthEN} ${s.getDate()}–${e.getDate()}`;
	}
</script>

<header class="tv-header">
	<div class="tv-header-top">
		<div class="tv-brand">
			<h1 class="tv-brand-name">FULALA.CZ</h1>
			<p class="tv-brand-tagline">Fresh Noodles & Dumplings & Snacks</p>
		</div>
		{#if currentTime}
			<time class="tv-clock">{currentTime}</time>
		{/if}
	</div>
	{#if $schedule}
		<div class="tv-schedule">
			<span class="tv-schedule-week">Týden / Week #{$schedule.weekNumber}</span>
			<span class="tv-schedule-sep">·</span>
			<span class="tv-schedule-period">{$schedule.monthLabel} {$schedule.year}</span>
			{#if $schedule.startDate && $schedule.endDate}
				<span class="tv-schedule-sep">·</span>
				<span class="tv-schedule-dates">{formatDateRange($schedule.startDate, $schedule.endDate)}</span>
			{/if}
		</div>
	{/if}
</header>

<style>
	.tv-header {
		flex-shrink: 0;
		padding-bottom: 20px;
		border-bottom: 4px solid var(--color-accent, #E83636);
		margin-bottom: 28px;
	}

	.tv-header-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.tv-brand-name {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-size: var(--tv-header-brand-size, 56px);
		font-weight: 700;
		letter-spacing: 0.04em;
		line-height: 1;
		color: var(--color-text, #2C2C2C);
	}

	.tv-brand-tagline {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-header-tagline-size, 22px);
		color: var(--color-text-muted, #6B6B6B);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin-top: 4px;
	}

	.tv-clock {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-clock-size, 36px);
		font-weight: 500;
		color: var(--color-text-muted, #6B6B6B);
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.tv-schedule {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 12px;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-schedule-size, 24px);
		color: var(--color-text-muted, #6B6B6B);
		flex-wrap: wrap;
	}

	.tv-schedule-week {
		font-weight: 600;
		color: var(--color-text, #2C2C2C);
	}

	.tv-schedule-sep {
		opacity: 0.4;
	}

	.tv-schedule-dates {
		font-variant-numeric: tabular-nums;
	}
</style>
