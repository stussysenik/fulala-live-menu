import { ConvexClient } from 'convex/browser';
import { getContext, setContext, onMount, onDestroy } from 'svelte';
import { readable, type Readable } from 'svelte/store';
import type { FunctionReference, FunctionReturnType, OptionalRestArgs } from 'convex/server';

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

// Convex client singleton
let client: ConvexClient | null = null;

export function getConvexClient(): ConvexClient {
	if (!client) {
		if (!CONVEX_URL) {
			throw new Error('VITE_CONVEX_URL environment variable is not set');
		}
		client = new ConvexClient(CONVEX_URL);
	}
	return client;
}

// Context key for the Convex client
const CONVEX_CLIENT_KEY = Symbol('convex-client');

export function setConvexClient(convexClient: ConvexClient) {
	setContext(CONVEX_CLIENT_KEY, convexClient);
}

export function getConvexClientFromContext(): ConvexClient {
	const client = getContext<ConvexClient>(CONVEX_CLIENT_KEY);
	if (!client) {
		throw new Error('Convex client not found in context. Did you wrap your app in ConvexClientProvider?');
	}
	return client;
}

// Reactive query hook
export function useQuery<Query extends FunctionReference<'query'>>(
	query: Query,
	...args: OptionalRestArgs<Query>
): Readable<FunctionReturnType<Query> | undefined> {
	const client = getConvexClientFromContext();

	return readable<FunctionReturnType<Query> | undefined>(undefined, (set) => {
		const unsubscribe = client.onUpdate(query, args[0] ?? {}, (result) => {
			set(result as FunctionReturnType<Query>);
		});

		return () => {
			unsubscribe();
		};
	});
}

// Mutation hook
export function useMutation<Mutation extends FunctionReference<'mutation'>>(
	mutation: Mutation
): (...args: OptionalRestArgs<Mutation>) => Promise<FunctionReturnType<Mutation>> {
	const client = getConvexClientFromContext();

	return async (...args: OptionalRestArgs<Mutation>) => {
		return client.mutation(mutation, args[0] ?? {}) as Promise<FunctionReturnType<Mutation>>;
	};
}

// Action hook
export function useAction<Action extends FunctionReference<'action'>>(
	action: Action
): (...args: OptionalRestArgs<Action>) => Promise<FunctionReturnType<Action>> {
	const client = getConvexClientFromContext();

	return async (...args: OptionalRestArgs<Action>) => {
		return client.action(action, args[0] ?? {}) as Promise<FunctionReturnType<Action>>;
	};
}

// Export the provider component path
export { default as ConvexClientProvider } from './ConvexClientProvider.svelte';
