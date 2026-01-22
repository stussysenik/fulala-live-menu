<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		localCart,
		cartSubtotal,
		cartTax,
		cartTotal,
		cartItemCount,
		updateCartItemQuantity,
		removeFromCart,
		formatModifiers,
	} from '$lib/stores/order';
	import PriceDisplay from '../PriceDisplay.svelte';

	export let isOpen: boolean = false;

	const dispatch = createEventDispatcher<{
		close: void;
		checkout: void;
	}>();

	function handleClose() {
		dispatch('close');
	}

	function handleCheckout() {
		dispatch('checkout');
	}
</script>

{#if isOpen}
	<div class="cart-backdrop" on:click={handleClose} on:keydown={(e) => e.key === 'Escape' && handleClose()}>
		<aside class="cart-panel" on:click|stopPropagation role="dialog" aria-modal="true">
			<header class="cart-header">
				<h2>Your Order</h2>
				<button class="close-btn" on:click={handleClose} aria-label="Close">
					&times;
				</button>
			</header>

			{#if $localCart.length === 0}
				<div class="cart-empty">
					<div class="empty-icon">🛒</div>
					<p>Your cart is empty</p>
					<p class="empty-hint">Add items from the menu to get started</p>
				</div>
			{:else}
				<div class="cart-items">
					{#each $localCart as item, index (index)}
						<div class="cart-item">
							<div class="item-details">
								<h4 class="item-name">{item.name}</h4>
								{#if item.selectedModifiers}
									{@const modifierText = formatModifiers(item.selectedModifiers)}
									{#if modifierText}
										<p class="item-modifiers">{modifierText}</p>
									{/if}
								{/if}
								<p class="item-price">
									<PriceDisplay price={item.unitPrice} />
									each
								</p>
							</div>

							<div class="item-actions">
								<div class="quantity-controls">
									<button
										class="qty-btn"
										on:click={() => updateCartItemQuantity(index, item.quantity - 1)}
										aria-label="Decrease quantity"
									>
										-
									</button>
									<span class="qty-value">{item.quantity}</span>
									<button
										class="qty-btn"
										on:click={() => updateCartItemQuantity(index, item.quantity + 1)}
										aria-label="Increase quantity"
									>
										+
									</button>
								</div>
								<div class="item-total">
									<PriceDisplay price={item.unitPrice * item.quantity} />
								</div>
								<button
									class="remove-btn"
									on:click={() => removeFromCart(index)}
									aria-label="Remove item"
								>
									🗑️
								</button>
							</div>
						</div>
					{/each}
				</div>

				<div class="cart-summary">
					<div class="summary-row">
						<span>Subtotal ({$cartItemCount} items)</span>
						<span><PriceDisplay price={$cartSubtotal} /></span>
					</div>
					<div class="summary-row">
						<span>Tax (10%)</span>
						<span><PriceDisplay price={$cartTax} /></span>
					</div>
					<div class="summary-row total">
						<span>Total</span>
						<span class="total-price"><PriceDisplay price={$cartTotal} /></span>
					</div>
				</div>

				<footer class="cart-footer">
					<button class="checkout-btn" on:click={handleCheckout}>
						Proceed to Checkout
					</button>
				</footer>
			{/if}
		</aside>
	</div>
{/if}

<!-- Floating cart button (when cart has items) -->
{#if !isOpen && $cartItemCount > 0}
	<button
		class="cart-fab"
		on:click={() => dispatch('close')}
		aria-label="Open cart with {$cartItemCount} items"
	>
		<span class="cart-icon">🛒</span>
		<span class="cart-count">{$cartItemCount}</span>
		<span class="cart-total"><PriceDisplay price={$cartTotal} /></span>
	</button>
{/if}

<style>
	.cart-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
	}

	.cart-panel {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		max-width: 400px;
		background: var(--color-surface, white);
		display: flex;
		flex-direction: column;
		animation: slideIn 0.2s ease;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.cart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-4, 1rem);
		border-bottom: 1px solid var(--color-border, #e5e5e5);
	}

	.cart-header h2 {
		font-size: var(--text-xl, 1.25rem);
		font-weight: 600;
		margin: 0;
	}

	.close-btn {
		width: 36px;
		height: 36px;
		border: none;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 50%;
		font-size: 24px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cart-empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-6, 2rem);
		text-align: center;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: var(--space-3, 0.75rem);
		opacity: 0.5;
	}

	.cart-empty p {
		margin: 0;
		color: var(--color-text-muted, #666);
	}

	.empty-hint {
		font-size: var(--text-sm, 0.875rem);
		margin-top: var(--space-1, 0.25rem) !important;
	}

	.cart-items {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-3, 0.75rem);
	}

	.cart-item {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3, 0.75rem);
		padding: var(--space-3, 0.75rem);
		background: rgba(0, 0, 0, 0.02);
		border-radius: var(--radius-md, 8px);
		margin-bottom: var(--space-2, 0.5rem);
	}

	.item-details {
		flex: 1;
		min-width: 0;
	}

	.item-name {
		font-size: var(--text-body, 1rem);
		font-weight: 600;
		margin: 0 0 var(--space-1, 0.25rem);
	}

	.item-modifiers {
		font-size: var(--text-xs, 0.75rem);
		color: var(--color-text-muted, #666);
		margin: 0 0 var(--space-1, 0.25rem);
	}

	.item-price {
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		margin: 0;
	}

	.item-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--space-2, 0.5rem);
	}

	.quantity-controls {
		display: flex;
		align-items: center;
		gap: var(--space-1, 0.25rem);
		background: white;
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: 20px;
		padding: 2px;
	}

	.qty-btn {
		width: 24px;
		height: 24px;
		border: none;
		background: var(--color-accent, #c45a3b);
		color: white;
		border-radius: 50%;
		font-size: 14px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.qty-value {
		min-width: 24px;
		text-align: center;
		font-weight: 600;
		font-size: var(--text-sm, 0.875rem);
	}

	.item-total {
		font-weight: 700;
		color: var(--color-price, #2d5016);
	}

	.remove-btn {
		border: none;
		background: transparent;
		font-size: 16px;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.15s ease;
	}

	.remove-btn:hover {
		opacity: 1;
	}

	.cart-summary {
		padding: var(--space-4, 1rem);
		border-top: 1px solid var(--color-border, #e5e5e5);
		background: rgba(0, 0, 0, 0.02);
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		margin-bottom: var(--space-2, 0.5rem);
	}

	.summary-row.total {
		font-size: var(--text-lg, 1.125rem);
		font-weight: 700;
		color: var(--color-text, #1a1a1a);
		margin-top: var(--space-3, 0.75rem);
		padding-top: var(--space-3, 0.75rem);
		border-top: 1px solid var(--color-border, #e5e5e5);
		margin-bottom: 0;
	}

	.total-price {
		color: var(--color-price, #2d5016);
	}

	.cart-footer {
		padding: var(--space-4, 1rem);
		border-top: 1px solid var(--color-border, #e5e5e5);
	}

	.checkout-btn {
		width: 100%;
		padding: var(--space-4, 1rem);
		background: var(--color-accent, #c45a3b);
		color: white;
		border: none;
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-lg, 1.125rem);
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.checkout-btn:hover {
		opacity: 0.9;
	}

	/* Floating cart button */
	.cart-fab {
		position: fixed;
		bottom: var(--space-5, 1.5rem);
		right: var(--space-4, 1rem);
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
		background: var(--color-accent, #c45a3b);
		color: white;
		border: none;
		border-radius: 30px;
		font-size: var(--text-body, 1rem);
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		z-index: 100;
		transition: transform 0.15s ease;
	}

	.cart-fab:hover {
		transform: scale(1.05);
	}

	.cart-icon {
		font-size: 20px;
	}

	.cart-count {
		background: white;
		color: var(--color-accent, #c45a3b);
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm, 0.875rem);
	}

	@media (max-width: 480px) {
		.cart-panel {
			max-width: 100%;
		}
	}
</style>
