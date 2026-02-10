// Disable SSR — all Convex queries are browser-only, server renders an empty shell.
// Client-side skeleton loads instantly without the wasteful server round-trip.
export const ssr = false;
