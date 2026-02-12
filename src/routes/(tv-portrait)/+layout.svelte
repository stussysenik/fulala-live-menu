<script lang="ts">
	import '$lib/styles/tv-portrait.css';
	import TvPortraitHeader from '$lib/components/tv/TvPortraitHeader.svelte';
	import TvPortraitFooter from '$lib/components/tv/TvPortraitFooter.svelte';
	import { onMount } from 'svelte';

	let currentTime = '';

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
	<div class="tv-portrait-page">
		<TvPortraitHeader {currentTime} />
		<main class="tv-portrait-content">
			<slot />
		</main>
		<TvPortraitFooter />
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
</style>
