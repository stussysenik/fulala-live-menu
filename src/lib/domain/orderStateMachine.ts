/**
 * Order lifecycle state machine — the single source of truth for which
 * status moves are legal.
 *
 * Pattern: "functional core, imperative shell". This module is pure TS with
 * zero Convex/Svelte imports, so the same rules run in three places:
 *  - Convex `transitionOrder` mutation (authoritative enforcement)
 *  - the admin order board (hide/disable illegal actions)
 *  - unit tests (exhaustively, without a database)
 *
 * Lifecycle:
 *
 *   active ──▶ submitted ──▶ preparing ──▶ ready ──▶ completed
 *                  │             │           │
 *                  └─────────────┴───────────┴────▶ cancelled
 *
 * `active` is the customer's open cart; everything after `submitted` is
 * kitchen-side. `completed` and `cancelled` are terminal.
 */

export type OrderStatus =
	| 'active'
	| 'submitted'
	| 'preparing'
	| 'ready'
	| 'completed'
	| 'cancelled';

export const ORDER_STATUSES: readonly OrderStatus[] = [
	'active',
	'submitted',
	'preparing',
	'ready',
	'completed',
	'cancelled',
];

/** The live kitchen columns, in board order. */
export const BOARD_STATUSES = ['submitted', 'preparing', 'ready'] as const;

/**
 * Adjacency map: every status lists the statuses it may move to.
 * Encoding transitions as data (instead of if/else chains) makes the rules
 * diffable, testable by iteration, and impossible to bypass piecemeal.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
	active: ['submitted'],
	submitted: ['preparing', 'cancelled'],
	preparing: ['ready', 'cancelled'],
	ready: ['completed', 'cancelled'],
	completed: [],
	cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
	return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Throws when a move is illegal — mutations call this so bad writes never happen. */
export function assertTransition(from: OrderStatus, to: OrderStatus): void {
	if (!canTransition(from, to)) {
		throw new Error(
			`Illegal order transition: ${from} → ${to}. Allowed from ${from}: ${
				ALLOWED_TRANSITIONS[from]?.join(', ') || '(none — terminal status)'
			}`
		);
	}
}

export function isTerminal(status: OrderStatus): boolean {
	return ALLOWED_TRANSITIONS[status].length === 0;
}

/** Cancellations must carry a reason note; other moves don't. */
export function transitionRequiresNote(to: OrderStatus): boolean {
	return to === 'cancelled';
}
