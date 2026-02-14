<script lang="ts">
	import '$lib/styles/tv-portrait.css';
	import TvPortraitFooter from '$lib/components/tv/TvPortraitFooter.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../convex/_generated/api';

	let currentTime = '';

	const schedule = browser ? useQuery(api.settings.getMenuSchedule, {}) : null;

	onMount(() => {
		const updateTime = () => {
			const now = new Date();
			currentTime = now.toLocaleTimeString('cs-CZ', {
				hour: 'numeric',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
		};

		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});

	function formatDateRange(start: string, end: string): string {
		const s = new Date(start);
		const e = new Date(end);
		const monthCS = s.toLocaleString('cs-CZ', { month: 'long' });
		const monthEN = s.toLocaleString('en-US', { month: 'short' });
		return `${s.getDate()}.–${e.getDate()}. ${monthCS} / ${monthEN} ${s.getDate()}–${e.getDate()}`;
	}
</script>

<!--
	Valentine's Day TV Portrait Layout
	Same rotation wrapper as standard portrait, with warm Valentine styling.
	60/30/10: warm cream / brand red + rose / fortune gold
-->
<div class="tv-rotation-wrapper">
	<div class="tv-valentine-page">
		<!-- Valentine Header — gradient border, pulsing heart, greeting -->
		<header class="v-header">
			<div class="v-header-top">
				<div class="v-brand">
					<h1 class="v-brand-name">
						FULALA.CZ <span class="v-tiger">🐯</span><span class="v-heart">♥</span>
					</h1>
					<p class="v-greeting">♥ Šťastný Valentýn / Happy Valentine's Day ♥</p>
				</div>
				{#if currentTime}
					<time class="v-clock">{currentTime}</time>
				{/if}
			</div>
			{#if $schedule}
				<div class="v-schedule">
					<span class="v-schedule-week">Týden / Week #{$schedule.weekNumber}</span>
					<span class="v-schedule-sep">♥</span>
					<span class="v-schedule-period">{$schedule.monthLabel} {$schedule.year}</span>
					{#if $schedule.startDate && $schedule.endDate}
						<span class="v-schedule-sep">♥</span>
						<span class="v-schedule-dates">{formatDateRange($schedule.startDate, $schedule.endDate)}</span>
					{/if}
				</div>
			{/if}
		</header>

		<main class="v-content">
			<slot />
		</main>

		<TvPortraitFooter />

		<!-- Background watermark: fortune character 福 -->
		<div class="v-watermark" aria-hidden="true">
			<svg viewBox="0 0 200 200" class="v-watermark-fortune">
				<text x="100" y="150" text-anchor="middle" font-size="180" font-family="serif" fill="#E83636" opacity="0.04">福</text>
			</svg>
		</div>

		<!-- Background watermark: heart -->
		<div class="v-watermark-heart" aria-hidden="true">
			<svg viewBox="0 0 100 100">
				<path d="M50 30 C40 10, 10 10, 10 35 C10 60, 50 85, 50 85 C50 85, 90 60, 90 35 C90 10, 60 10, 50 30Z"
					fill="#D4A76A" opacity="0.05"/>
			</svg>
		</div>
	</div>
</div>

<style>
	/* ── Valentine Color Palette (60/30/10) ──────────────────── */
	.tv-valentine-page {
		/* 60% warm cream */
		--color-bg: #FFF8F0;
		--color-surface: #FFFAF5;
		/* 30% brand red + warm rose */
		--color-accent: #E83636;
		--color-border: #E8D8D0;
		/* 10% fortune gold */
		--color-price: #B8860B;
		/* Text */
		--color-text: #2C2C2C;
		--color-text-muted: #6B6B6B;
		/* Status */
		--color-available: #2d5016;
		--color-unavailable: #dc2626;
	}

	/* ── Rotation Wrapper (same as portrait) ─────────────────── */
	:global(html), :global(body) {
		overflow: hidden !important;
		margin: 0;
		padding: 0;
	}

	.tv-rotation-wrapper {
		position: fixed;
		width: 100vh;
		height: 100vw;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(90deg);
		overflow: hidden;
	}

	.tv-valentine-page {
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: var(--tv-page-pad-y, 28px) var(--tv-page-pad-x, 40px);
		background: var(--color-bg, #FFF8F0);
		font-family: var(--font-body, 'Inter', sans-serif);
		box-sizing: border-box;
		position: relative;
	}

	/* ── Valentine Header ────────────────────────────────────── */
	.v-header {
		flex-shrink: 0;
		padding-bottom: 20px;
		/* Gradient border: red → fortune gold */
		border-bottom: none;
		background-image: linear-gradient(90deg, var(--color-accent, #E83636), #D4A76A);
		background-size: 100% 4px;
		background-position: bottom;
		background-repeat: no-repeat;
		margin-bottom: 28px;
	}

	.v-header-top {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.v-brand-name {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-size: var(--tv-header-brand-size, 48px);
		font-weight: 700;
		letter-spacing: 0.04em;
		line-height: 1;
		color: var(--color-text, #2C2C2C);
	}

	.v-tiger {
		color: #E88636;
	}

	.v-heart {
		color: var(--color-accent, #E83636);
		font-size: 0.7em;
		opacity: 0.85;
		display: inline-block;
		margin-left: 0.15em;
		animation: heartbeat 2s ease-in-out infinite;
	}

	@keyframes heartbeat {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.18); }
	}

	@media (prefers-reduced-motion: reduce) {
		.v-heart { animation: none; }
	}

	.v-greeting {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-schedule-size, 24px);
		color: var(--color-accent, #E83636);
		letter-spacing: 0.04em;
		margin-top: 8px;
		opacity: 0.8;
	}

	.v-clock {
		font-family: var(--font-price, 'DM Mono', monospace);
		font-size: var(--tv-clock-size, 32px);
		font-weight: 500;
		color: var(--color-text-muted, #6B6B6B);
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.v-schedule {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 12px;
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: var(--tv-schedule-size, 24px);
		color: var(--color-text-muted, #6B6B6B);
		flex-wrap: wrap;
	}

	.v-schedule-week {
		font-weight: 600;
		color: var(--color-text, #2C2C2C);
	}

	.v-schedule-sep {
		color: var(--color-accent, #E83636);
		opacity: 0.5;
		font-size: 0.8em;
	}

	.v-schedule-dates {
		font-variant-numeric: tabular-nums;
	}

	/* ── Content Area ────────────────────────────────────────── */
	.v-content {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* ── Background Watermarks ───────────────────────────────── */
	.v-watermark {
		position: absolute;
		bottom: 80px;
		right: 30px;
		width: 220px;
		height: 220px;
		pointer-events: none;
		z-index: 0;
	}

	.v-watermark-heart {
		position: absolute;
		top: 120px;
		left: 20px;
		width: 160px;
		height: 160px;
		pointer-events: none;
		z-index: 0;
	}
</style>
