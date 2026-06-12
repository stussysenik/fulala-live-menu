<script lang="ts">
	import '$lib/styles/tv-portrait.css';
	import TvPortraitHeader from '$lib/components/tv/TvPortraitHeader.svelte';
	import TvPortraitFooter from '$lib/components/tv/TvPortraitFooter.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { useQuery } from '$lib/convex';
	import { api } from '../../../convex/_generated/api';
	import { activeHolidays } from '$lib/domain/holidays';

	let currentTime = '';

	// Display master switch (admin "Display on" toggle). When a screen is
	// switched off in /admin/displays it shows a calm branded standby instead
	// of menu content — the TV stays on the same URL, no remote needed.
	const pageSettingsQuery = browser ? useQuery(api.settings.getPageSettings) : null;
	$: slug = $page.url.pathname.replace(/^\//, '');
	$: displayActive = ($pageSettingsQuery?.[slug] as { isActive?: boolean } | undefined)?.isActive ?? true;

	// Holiday decor: only when the owner explicitly enabled this holiday in
	// the dashboard (holiday-prefs memory). Decoration is deliberately tiny —
	// the holiday emoji in the header and one accent-color swap.
	const holidayPrefsQuery = browser ? useQuery(api.settings.getHolidayPrefs, {}) : null;
	$: holiday =
		activeHolidays(new Date()).find((h) => ($holidayPrefsQuery ?? {})[h.key] === 'enabled') ??
		null;

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
</script>

<!--
	Rotation wrapper: TV outputs 1920x1080 landscape, but is physically
	mounted in portrait. We create a 1080x1920 container and rotate it
	90° to fill the landscape viewport correctly for vertical viewing.

	If the TV is mounted the other way, change rotate(90deg) to rotate(-90deg).
-->
<div class="tv-rotation-wrapper">
	<div
		class="tv-portrait-page"
		style:--color-accent={holiday?.accentColor || undefined}
	>
		{#if displayActive}
			<TvPortraitHeader {currentTime} holidayEmoji={holiday?.emoji ?? ''} />
			<main class="tv-portrait-content">
				<slot />
			</main>
			<TvPortraitFooter />
		{:else}
			<div class="tv-standby">
				<img src="/images/fulala-logo.jpg" alt="Fulala" class="tv-standby-logo" />
				<div class="tv-standby-name">FULALA.CZ</div>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(html), :global(body) {
		overflow: hidden !important;
		margin: 0;
		padding: 0;
	}

	.tv-rotation-wrapper {
		position: fixed;
		/* Portrait dimensions: width=viewport height, height=viewport width */
		width: 100vh;
		height: 100vw;
		/* Center in viewport, then rotate */
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(90deg);
		overflow: hidden;
	}

	.tv-portrait-page {
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: var(--tv-page-pad-y, 28px) var(--tv-page-pad-x, 40px);
		background: var(--color-bg, #FFFFFF);
		font-family: var(--font-body, 'Inter', sans-serif);
		box-sizing: border-box;
	}

	.tv-portrait-content {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.tv-standby {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 32px;
	}

	.tv-standby-logo {
		width: 220px;
		height: 220px;
		object-fit: contain;
		border-radius: 50%;
		opacity: 0.9;
	}

	.tv-standby-name {
		font-family: var(--font-headline, 'Cormorant Garamond', serif);
		font-size: 56px;
		font-weight: 700;
		color: var(--color-text-muted, #6B6B6B);
		letter-spacing: 0.06em;
	}
</style>
