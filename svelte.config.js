import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		compatibility: {
			componentApi: 4
		}
	},
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			runtime: 'nodejs20.x',
			regions: ['fra1']
		})
	}
};

export default config;
