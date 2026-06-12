import { describe, expect, it } from 'vitest';
import {
	ALLOWED_TRANSITIONS,
	BOARD_STATUSES,
	ORDER_STATUSES,
	assertTransition,
	canTransition,
	isTerminal,
	transitionRequiresNote,
	type OrderStatus,
} from './orderStateMachine';

describe('orderStateMachine', () => {
	it('walks the happy path: active → submitted → preparing → ready → completed', () => {
		expect(canTransition('active', 'submitted')).toBe(true);
		expect(canTransition('submitted', 'preparing')).toBe(true);
		expect(canTransition('preparing', 'ready')).toBe(true);
		expect(canTransition('ready', 'completed')).toBe(true);
	});

	it('allows cancellation from submitted, preparing, and ready only', () => {
		expect(canTransition('submitted', 'cancelled')).toBe(true);
		expect(canTransition('preparing', 'cancelled')).toBe(true);
		expect(canTransition('ready', 'cancelled')).toBe(true);
		expect(canTransition('active', 'cancelled')).toBe(false);
		expect(canTransition('completed', 'cancelled')).toBe(false);
	});

	it('rejects skipping states and moving backwards', () => {
		expect(canTransition('active', 'preparing')).toBe(false);
		expect(canTransition('submitted', 'ready')).toBe(false);
		expect(canTransition('submitted', 'completed')).toBe(false);
		expect(canTransition('preparing', 'submitted')).toBe(false);
		expect(canTransition('ready', 'preparing')).toBe(false);
	});

	it('treats completed and cancelled as terminal', () => {
		expect(isTerminal('completed')).toBe(true);
		expect(isTerminal('cancelled')).toBe(true);
		expect(isTerminal('active')).toBe(false);
		expect(isTerminal('submitted')).toBe(false);
		for (const status of ['completed', 'cancelled'] as OrderStatus[]) {
			expect(ALLOWED_TRANSITIONS[status]).toEqual([]);
		}
	});

	it('rejects self-transitions', () => {
		for (const status of ORDER_STATUSES) {
			expect(canTransition(status, status)).toBe(false);
		}
	});

	it('assertTransition throws a descriptive error on an illegal move', () => {
		expect(() => assertTransition('completed', 'preparing')).toThrowError(
			/completed.*preparing/
		);
		expect(() => assertTransition('submitted', 'preparing')).not.toThrow();
	});

	it('requires a note only for cancellation', () => {
		expect(transitionRequiresNote('cancelled')).toBe(true);
		expect(transitionRequiresNote('completed')).toBe(false);
		expect(transitionRequiresNote('preparing')).toBe(false);
	});

	it('board statuses are the live kitchen columns in order', () => {
		expect(BOARD_STATUSES).toEqual(['submitted', 'preparing', 'ready']);
	});
});
