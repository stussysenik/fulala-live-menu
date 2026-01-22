<script lang="ts">
	import { browser } from '$app/environment';
	import { useQuery, useMutation } from '$lib/convex';
	import { api } from '../../../convex/_generated/api';
	import type { Doc } from '../../../convex/_generated/dataModel';

	import LayoutRenderer from '$lib/components/layouts/LayoutRenderer.svelte';
	import ModifierSelector from '$lib/components/modifiers/ModifierSelector.svelte';
	import OrderCart from '$lib/components/order/OrderCart.svelte';
	import OrderReceipt from '$lib/components/order/OrderReceipt.svelte';

	import {
		orderSessionId,
		tableNumber,
		localCart,
		addToCart,
		clearCart,
		resetOrderSession,
		orderNotes,
		isSubmitting,
		orderSubmitted,
		cartItemCount,
		cartTotal,
	} from '$lib/stores/order';

	// Convex mutations
	const addItemMutation = browser ? useMutation(api.orders.addItemToOrder) : null;
	const submitOrderMutation = browser ? useMutation(api.orders.submitOrder) : null;
	const updateTableMutation = browser ? useMutation(api.orders.updateTableNumber) : null;
	const updateNotesMutation = browser ? useMutation(api.orders.updateOrderNotes) : null;

	// UI state
	let selectedItem: Doc<'menuItems'> | null = null;
	let showModifierSelector = false;
	let showCart = false;
	let showReceipt = false;
	let orderNumber = '';
	let orderTime = new Date();
	let showTableInput = false;

	// Handle item selection from layout
	function handleItemSelect(event: CustomEvent<{ item: Doc<'menuItems'>; quantity?: number }>) {
		const { item } = event.detail;

		// Check if item has modifiers that need selection
		const hasModifiers =
			(item.modifiers &&
				Object.values(item.modifiers).some((v) => v && (v as string[]).length > 0)) ||
			item.drinkOptions;

		if (hasModifiers) {
			selectedItem = item;
			showModifierSelector = true;
		} else {
			// Add directly to cart without modifiers
			addToCart({
				menuItemId: item._id,
				name: item.name,
				quantity: 1,
				unitPrice: item.price,
			});

			// Sync with server
			if (addItemMutation) {
				addItemMutation({
					sessionId: $orderSessionId,
					item: {
						menuItemId: item._id,
						name: item.name,
						quantity: 1,
						unitPrice: item.price,
					},
				});
			}
		}
	}

	// Handle adding item with modifiers
	function handleAddToOrder(
		event: CustomEvent<{
			item: Doc<'menuItems'>;
			quantity: number;
			selectedModifiers: any;
		}>
	) {
		const { item, quantity, selectedModifiers } = event.detail;

		addToCart({
			menuItemId: item._id,
			name: item.name,
			quantity,
			unitPrice: item.price,
			selectedModifiers,
		});

		// Sync with server
		if (addItemMutation) {
			addItemMutation({
				sessionId: $orderSessionId,
				item: {
					menuItemId: item._id,
					name: item.name,
					quantity,
					unitPrice: item.price,
					selectedModifiers,
				},
			});
		}

		showModifierSelector = false;
		selectedItem = null;
	}

	function handleCloseModifierSelector() {
		showModifierSelector = false;
		selectedItem = null;
	}

	function toggleCart() {
		showCart = !showCart;
	}

	async function handleCheckout() {
		if ($cartItemCount === 0) return;

		$isSubmitting = true;

		try {
			// Update table number and notes if set
			if ($tableNumber && updateTableMutation) {
				await updateTableMutation({
					sessionId: $orderSessionId,
					tableNumber: $tableNumber,
				});
			}

			if ($orderNotes && updateNotesMutation) {
				await updateNotesMutation({
					sessionId: $orderSessionId,
					notes: $orderNotes,
				});
			}

			// Submit order
			if (submitOrderMutation) {
				await submitOrderMutation({
					sessionId: $orderSessionId,
				});
			}

			// Generate order number and show receipt
			orderNumber = Date.now().toString(36).toUpperCase();
			orderTime = new Date();
			$orderSubmitted = true;
			showCart = false;
			showReceipt = true;
		} catch (error) {
			console.error('Failed to submit order:', error);
			alert('Failed to submit order. Please try again.');
		} finally {
			$isSubmitting = false;
		}
	}

	function handleNewOrder() {
		resetOrderSession();
		clearCart();
		$orderNotes = '';
		$orderSubmitted = false;
		showReceipt = false;
	}

	function handleCloseReceipt() {
		showReceipt = false;
	}

	function handleTableNumberSubmit() {
		showTableInput = false;
		if ($tableNumber && updateTableMutation) {
			updateTableMutation({
				sessionId: $orderSessionId,
				tableNumber: $tableNumber,
			});
		}
	}
</script>

<svelte:head>
	<title>Order | Fulala</title>
	<meta name="description" content="Order your favorite dishes from Fulala" />
</svelte:head>

<div class="order-page">
	<header class="order-header">
		<div class="header-content">
			<a href="/" class="logo">FULALA</a>
			<span class="order-badge">Self Order</span>
		</div>

		<div class="header-actions">
			{#if $tableNumber}
				<button class="table-badge" on:click={() => (showTableInput = true)}>
					Table {$tableNumber}
				</button>
			{:else}
				<button class="set-table-btn" on:click={() => (showTableInput = true)}>
					Set Table #
				</button>
			{/if}

			<button class="cart-btn" on:click={toggleCart} aria-label="Open cart">
				<span class="cart-icon">🛒</span>
				{#if $cartItemCount > 0}
					<span class="cart-badge">{$cartItemCount}</span>
				{/if}
			</button>
		</div>
	</header>

	{#if showTableInput}
		<div class="table-modal-backdrop" on:click={() => (showTableInput = false)}>
			<div class="table-modal" on:click|stopPropagation>
				<h3>Enter Your Table Number</h3>
				<input
					type="text"
					bind:value={$tableNumber}
					placeholder="e.g., 5, A1"
					class="table-input"
					autofocus
					on:keydown={(e) => e.key === 'Enter' && handleTableNumberSubmit()}
				/>
				<div class="table-actions">
					<button class="btn cancel" on:click={() => (showTableInput = false)}>Cancel</button>
					<button class="btn confirm" on:click={handleTableNumberSubmit}>Confirm</button>
				</div>
			</div>
		</div>
	{/if}

	<main class="order-content">
		<LayoutRenderer pageType="order" on:select={handleItemSelect} />
	</main>

	<!-- Floating cart summary -->
	{#if $cartItemCount > 0 && !showCart}
		<button class="cart-fab" on:click={toggleCart}>
			<span class="fab-icon">🛒</span>
			<span class="fab-count">{$cartItemCount}</span>
			<span class="fab-divider"></span>
			<span class="fab-total">
				{($cartTotal / 100).toFixed(2)}
			</span>
		</button>
	{/if}

	<!-- Modifier selector modal -->
	{#if selectedItem}
		<ModifierSelector
			item={selectedItem}
			isOpen={showModifierSelector}
			on:close={handleCloseModifierSelector}
			on:addToOrder={handleAddToOrder}
		/>
	{/if}

	<!-- Cart panel -->
	<OrderCart isOpen={showCart} on:close={toggleCart} on:checkout={handleCheckout} />

	<!-- Receipt modal -->
	<OrderReceipt
		isOpen={showReceipt}
		{orderNumber}
		{orderTime}
		on:close={handleCloseReceipt}
		on:newOrder={handleNewOrder}
	/>
</div>

<style>
	.order-page {
		min-height: 100vh;
		background: var(--color-bg, #faf9f7);
		display: flex;
		flex-direction: column;
	}

	.order-header {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3, 0.75rem) var(--space-4, 1rem);
		background: var(--color-surface, white);
		border-bottom: 1px solid var(--color-border, #e5e5e5);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--space-3, 0.75rem);
	}

	.logo {
		font-size: var(--text-xl, 1.25rem);
		font-weight: 900;
		letter-spacing: 2px;
		color: var(--color-text, #1a1a1a);
		text-decoration: none;
	}

	.order-badge {
		font-size: var(--text-xs, 0.75rem);
		font-weight: 600;
		color: white;
		background: var(--color-accent, #c45a3b);
		padding: 4px 10px;
		border-radius: 20px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
	}

	.table-badge {
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		background: rgba(0, 0, 0, 0.05);
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-sm, 0.875rem);
		font-weight: 600;
		cursor: pointer;
	}

	.set-table-btn {
		padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
		background: transparent;
		border: 1px dashed var(--color-border, #ccc);
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-sm, 0.875rem);
		color: var(--color-text-muted, #666);
		cursor: pointer;
	}

	.set-table-btn:hover {
		border-color: var(--color-accent, #c45a3b);
		color: var(--color-accent, #c45a3b);
	}

	.cart-btn {
		position: relative;
		width: 44px;
		height: 44px;
		border: none;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 50%;
		font-size: 20px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cart-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		width: 20px;
		height: 20px;
		background: var(--color-accent, #c45a3b);
		color: white;
		border-radius: 50%;
		font-size: 12px;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.order-content {
		flex: 1;
		padding: var(--space-4, 1rem);
		padding-bottom: 100px;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	/* Table number modal */
	.table-modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: var(--space-4, 1rem);
	}

	.table-modal {
		background: var(--color-surface, white);
		border-radius: var(--radius-lg, 12px);
		padding: var(--space-5, 1.5rem);
		width: 100%;
		max-width: 300px;
		text-align: center;
	}

	.table-modal h3 {
		margin: 0 0 var(--space-4, 1rem);
		font-size: var(--text-lg, 1.125rem);
	}

	.table-input {
		width: 100%;
		padding: var(--space-3, 0.75rem);
		border: 2px solid var(--color-border, #e5e5e5);
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-xl, 1.25rem);
		text-align: center;
		font-weight: 600;
	}

	.table-input:focus {
		outline: none;
		border-color: var(--color-accent, #c45a3b);
	}

	.table-actions {
		display: flex;
		gap: var(--space-2, 0.5rem);
		margin-top: var(--space-4, 1rem);
	}

	.btn {
		flex: 1;
		padding: var(--space-3, 0.75rem);
		border: none;
		border-radius: var(--radius-md, 8px);
		font-size: var(--text-body, 1rem);
		font-weight: 600;
		cursor: pointer;
	}

	.btn.cancel {
		background: rgba(0, 0, 0, 0.1);
	}

	.btn.confirm {
		background: var(--color-accent, #c45a3b);
		color: white;
	}

	/* Floating cart button */
	.cart-fab {
		position: fixed;
		bottom: var(--space-5, 1.5rem);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-3, 0.75rem) var(--space-5, 1.5rem);
		background: var(--color-accent, #c45a3b);
		color: white;
		border: none;
		border-radius: 30px;
		font-size: var(--text-lg, 1.125rem);
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(196, 90, 59, 0.4);
		z-index: 90;
		animation: slideUp 0.3s ease;
	}

	@keyframes slideUp {
		from {
			transform: translateX(-50%) translateY(100px);
			opacity: 0;
		}
		to {
			transform: translateX(-50%) translateY(0);
			opacity: 1;
		}
	}

	.fab-icon {
		font-size: 24px;
	}

	.fab-count {
		background: white;
		color: var(--color-accent, #c45a3b);
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-sm, 0.875rem);
		font-weight: 700;
	}

	.fab-divider {
		width: 1px;
		height: 24px;
		background: rgba(255, 255, 255, 0.3);
	}

	.fab-total {
		font-family: var(--font-price, system-ui);
	}

	@media (max-width: 480px) {
		.order-content {
			padding: var(--space-3, 0.75rem);
		}
	}
</style>
