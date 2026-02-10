<script lang="ts">
	import '$lib/styles/tokens.css';

	// Self-hosted fonts — eliminates Google Fonts waterfall (300-800ms savings)
	import '@fontsource/cormorant-garamond/400.css';
	import '@fontsource/cormorant-garamond/600.css';
	import '@fontsource/cormorant-garamond/700.css';
	import '@fontsource-variable/inter';
	import '@fontsource/dm-mono/400.css';
	import '@fontsource/dm-mono/500.css';

	import { ConvexClientProvider } from '$lib/convex';
	import ThemeProvider from '$lib/components/ThemeProvider.svelte';
	import { lang } from '$lib/i18n/store';
	import { browser } from '$app/environment';

	// Reactively update the html lang attribute
	$: if (browser) {
		document.documentElement.lang = $lang;
	}
</script>

<ConvexClientProvider>
	<ThemeProvider>
		<slot />
	</ThemeProvider>
</ConvexClientProvider>
