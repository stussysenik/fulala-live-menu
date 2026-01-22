<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		localCart,
		cartSubtotal,
		cartTax,
		cartTotal,
		tableNumber,
		orderNotes,
		formatModifiers,
	} from '$lib/stores/order';
	import PriceDisplay from '../PriceDisplay.svelte';

	export let isOpen: boolean = false;
	export let orderNumber: string = '';
	export let orderTime: Date = new Date();

	const dispatch = createEventDispatcher<{
		close: void;
		print: void;
		newOrder: void;
	}>();

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	}

	function handlePrint() {
		window.print();
		dispatch('print');
	}

	function handleNewOrder() {
		dispatch('newOrder');
	}

	function handleClose() {
		dispatch('close');
	}
</script>

{#if isOpen}
	<div class="receipt-backdrop" on:click={handleClose}>
		<div class="receipt-container" on:click|stopPropagation role="dialog" aria-modal="true">
			<div class="receipt" id="printable-receipt">
				<header class="receipt-header">
					<div class="logo">FULALA</div>
					<p class="tagline">Asian Fusion Kitchen</p>
					<div class="receipt-meta">
						<p class="order-number">Order #{orderNumber || '---'}</p>
						<p class="order-date">{formatDate(orderTime)}</p>
						<p class="order-time">{formatTime(orderTime)}</p>
						{#if $tableNumber}
							<p class="table-number">Table: {$tableNumber}</p>
						{/if}
					</div>
				</header>

				<div class="divider dashed"></div>

				<section class="receipt-items">
					{#each $localCart as item, index}
						<div class="receipt-item">
							<div class="item-qty">{item.quantity}x</div>
							<div class="item-details">
								<span class="item-name">{item.name}</span>
								{#if item.selectedModifiers}
									{@const modifierText = formatModifiers(item.selectedModifiers)}
									{#if modifierText}
										<span class="item-mods">{modifierText}</span>
									{/if}
								{/if}
							</div>
							<div class="item-price">
								<PriceDisplay price={item.unitPrice * item.quantity} />
							</div>
						</div>
					{/each}
				</section>

				<div class="divider"></div>

				<section class="receipt-totals">
					<div class="total-row">
						<span>Subtotal</span>
						<span><PriceDisplay price={$cartSubtotal} /></span>
					</div>
					<div class="total-row">
						<span>Tax</span>
						<span><PriceDisplay price={$cartTax} /></span>
					</div>
					<div class="divider thin"></div>
					<div class="total-row grand-total">
						<span>TOTAL</span>
						<span><PriceDisplay price={$cartTotal} /></span>
					</div>
				</section>

				{#if $orderNotes}
					<div class="divider dashed"></div>
					<section class="receipt-notes">
						<p class="notes-label">Notes:</p>
						<p class="notes-text">{$orderNotes}</p>
					</section>
				{/if}

				<div class="divider dashed"></div>

				<footer class="receipt-footer">
					<p class="thank-you">Thank you for your order!</p>
					<p class="status">Order Submitted</p>
					<p class="website">www.fulala.cz</p>
				</footer>
			</div>

			<div class="receipt-actions no-print">
				<button class="action-btn print" on:click={handlePrint}>
					<span class="icon">🖨️</span>
					Print Receipt
				</button>
				<button class="action-btn new-order" on:click={handleNewOrder}>
					<span class="icon">➕</span>
					Start New Order
				</button>
				<button class="action-btn close" on:click={handleClose}>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.receipt-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4, 1rem);
	}

	.receipt-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-4, 1rem);
		max-height: 90vh;
		overflow-y: auto;
	}

	.receipt {
		background: white;
		width: 320px;
		padding: var(--space-4, 1rem);
		font-family: 'Courier New', Courier, monospace;
		font-size: 14px;
		line-height: 1.4;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.receipt-header {
		text-align: center;
		padding-bottom: var(--space-3, 0.75rem);
	}

	.logo {
		font-size: 28px;
		font-weight: 900;
		letter-spacing: 4px;
		margin-bottom: 4px;
	}

	.tagline {
		font-size: 12px;
		color: #666;
		margin: 0 0 var(--space-3, 0.75rem);
	}

	.receipt-meta {
		font-size: 12px;
	}

	.receipt-meta p {
		margin: 2px 0;
	}

	.order-number {
		font-weight: bold;
		font-size: 16px;
	}

	.table-number {
		font-weight: bold;
		margin-top: var(--space-2, 0.5rem) !important;
	}

	.divider {
		border: none;
		border-top: 1px solid #000;
		margin: var(--space-3, 0.75rem) 0;
	}

	.divider.dashed {
		border-top-style: dashed;
	}

	.divider.thin {
		border-top-width: 1px;
		margin: var(--space-2, 0.5rem) 0;
	}

	.receipt-items {
		display: flex;
		flex-direction: column;
		gap: var(--space-2, 0.5rem);
	}

	.receipt-item {
		display: flex;
		gap: var(--space-2, 0.5rem);
	}

	.item-qty {
		flex-shrink: 0;
		width: 30px;
	}

	.item-details {
		flex: 1;
		min-width: 0;
	}

	.item-name {
		display: block;
		font-weight: bold;
	}

	.item-mods {
		display: block;
		font-size: 11px;
		color: #666;
	}

	.item-price {
		flex-shrink: 0;
		text-align: right;
	}

	.receipt-totals {
		display: flex;
		flex-direction: column;
		gap: var(--space-1, 0.25rem);
	}

	.total-row {
		display: flex;
		justify-content: space-between;
	}

	.grand-total {
		font-size: 18px;
		font-weight: bold;
		padding-top: var(--space-2, 0.5rem);
	}

	.receipt-notes {
		font-size: 12px;
	}

	.notes-label {
		font-weight: bold;
		margin: 0 0 4px;
	}

	.notes-text {
		margin: 0;
		white-space: pre-wrap;
	}

	.receipt-footer {
		text-align: center;
	}

	.receipt-footer p {
		margin: 4px 0;
	}

	.thank-you {
		font-weight: bold;
		font-size: 16px;
	}

	.status {
		display: inline-block;
		background: #000;
		color: #fff;
		padding: 4px 12px;
		margin-top: var(--space-2, 0.5rem) !important;
	}

	.website {
		font-size: 11px;
		color: #666;
		margin-top: var(--space-3, 0.75rem) !important;
	}

	.receipt-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-2, 0.5rem);
		width: 320px;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-3, 0.75rem);
		border: none;
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-body, 1rem);
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.action-btn:hover {
		opacity: 0.9;
	}

	.action-btn.print {
		background: var(--color-accent, #c45a3b);
		color: white;
	}

	.action-btn.new-order {
		background: #16a34a;
		color: white;
	}

	.action-btn.close {
		background: rgba(0, 0, 0, 0.1);
		color: var(--color-text, #1a1a1a);
	}

	.icon {
		font-size: 18px;
	}

	@media print {
		.receipt-backdrop {
			position: relative;
			background: none;
			padding: 0;
		}

		.receipt {
			box-shadow: none;
		}

		.no-print {
			display: none !important;
		}
	}
</style>
