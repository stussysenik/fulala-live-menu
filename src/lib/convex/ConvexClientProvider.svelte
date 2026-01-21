<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getConvexClient, setConvexClient } from './index';
	import { browser } from '$app/environment';

	let client: ReturnType<typeof getConvexClient> | null = null;

	if (browser) {
		client = getConvexClient();
		setConvexClient(client);
	}

	onDestroy(() => {
		// Client cleanup if needed
	});
</script>

<slot />
