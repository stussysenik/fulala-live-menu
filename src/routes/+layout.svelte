<script lang="ts">
	import '$lib/styles/tokens.css';
	import { ConvexClientProvider } from '$lib/convex';
	import ThemeProvider from '$lib/components/ThemeProvider.svelte';
</script>

<ConvexClientProvider>
	<ThemeProvider>
		<slot />
	</ThemeProvider>
</ConvexClientProvider>
