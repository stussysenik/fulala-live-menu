import { defineConfig } from 'vitest/config';

// Unit tests only — pure TS domain modules. Playwright owns tests/*.spec.ts.
export default defineConfig({
	test: {
		include: ['src/**/*.test.ts'],
	},
});
