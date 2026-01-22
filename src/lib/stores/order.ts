// Order store - manages session ID and order state
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// Generate a unique session ID
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

// Get or create session ID from localStorage
function getSessionId(): string {
  if (!browser) return '';

  let sessionId = localStorage.getItem('orderSessionId');

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('orderSessionId', sessionId);
  }

  return sessionId;
}

// Session ID store
export const orderSessionId = writable<string>(getSessionId());

// Reset session (create new order session)
export function resetOrderSession() {
  if (!browser) return;

  const newSessionId = generateSessionId();
  localStorage.setItem('orderSessionId', newSessionId);
  orderSessionId.set(newSessionId);
}

// Table number store (persists in session)
const storedTableNumber = browser ? sessionStorage.getItem('tableNumber') : null;
export const tableNumber = writable<string>(storedTableNumber ?? '');

if (browser) {
  tableNumber.subscribe((value) => {
    if (value) {
      sessionStorage.setItem('tableNumber', value);
    } else {
      sessionStorage.removeItem('tableNumber');
    }
  });
}

// Order item type (client-side)
export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedModifiers?: {
    noodleType?: string;
    temperature?: string;
    spiceLevel?: string;
    brothType?: string;
    fryingDegree?: string;
    addOns?: string[];
  };
}

// Local cart store (for immediate UI updates before sync)
export const localCart = writable<OrderItem[]>([]);

// Calculate totals from local cart
export const cartSubtotal = derived(localCart, ($cart) =>
  $cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
);

export const cartTax = derived(cartSubtotal, ($subtotal) =>
  Math.round($subtotal * 0.1)
);

export const cartTotal = derived([cartSubtotal, cartTax], ([$subtotal, $tax]) =>
  $subtotal + $tax
);

export const cartItemCount = derived(localCart, ($cart) =>
  $cart.reduce((count, item) => count + item.quantity, 0)
);

// Cart actions
export function addToCart(item: OrderItem) {
  localCart.update((items) => {
    // Check if item with same modifiers exists
    const existingIndex = items.findIndex(
      (existing) =>
        existing.menuItemId === item.menuItemId &&
        JSON.stringify(existing.selectedModifiers) === JSON.stringify(item.selectedModifiers)
    );

    if (existingIndex >= 0) {
      // Update quantity of existing item
      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + item.quantity,
      };
      return updated;
    }

    // Add new item
    return [...items, item];
  });
}

export function updateCartItemQuantity(index: number, quantity: number) {
  localCart.update((items) => {
    if (quantity <= 0) {
      return items.filter((_, i) => i !== index);
    }

    const updated = [...items];
    updated[index] = { ...updated[index], quantity };
    return updated;
  });
}

export function removeFromCart(index: number) {
  localCart.update((items) => items.filter((_, i) => i !== index));
}

export function clearCart() {
  localCart.set([]);
}

// Sync local cart with server order
export function syncCartFromServer(items: OrderItem[]) {
  localCart.set(items);
}

// Order notes store
export const orderNotes = writable<string>('');

// Order submission state
export const isSubmitting = writable<boolean>(false);
export const orderSubmitted = writable<boolean>(false);

// Format modifiers for display
export function formatModifiers(modifiers?: OrderItem['selectedModifiers']): string {
  if (!modifiers) return '';

  const parts: string[] = [];

  if (modifiers.temperature) {
    parts.push(modifiers.temperature === 'hot' ? 'Hot' : 'Iced');
  }
  if (modifiers.noodleType) {
    const noodleLabels: Record<string, string> = {
      thin: 'Thin noodles',
      flat: 'Flat noodles',
      thick: 'Thick noodles',
      'hand-pulled': 'Hand-pulled',
      rice: 'Rice noodles',
      glass: 'Glass noodles',
      egg: 'Egg noodles',
    };
    parts.push(noodleLabels[modifiers.noodleType] ?? modifiers.noodleType);
  }
  if (modifiers.spiceLevel) {
    const spiceLabels: Record<string, string> = {
      mild: 'Mild',
      medium: 'Medium spicy',
      hot: 'Hot',
      'extra-hot': 'Extra hot',
    };
    parts.push(spiceLabels[modifiers.spiceLevel] ?? modifiers.spiceLevel);
  }
  if (modifiers.brothType) {
    const brothLabels: Record<string, string> = {
      clear: 'Clear broth',
      bone: 'Bone broth',
      spicy: 'Spicy broth',
      tomato: 'Tomato broth',
      coconut: 'Coconut broth',
    };
    parts.push(brothLabels[modifiers.brothType] ?? modifiers.brothType);
  }
  if (modifiers.fryingDegree) {
    const fryLabels: Record<string, string> = {
      light: 'Light crisp',
      golden: 'Golden',
      crispy: 'Extra crispy',
    };
    parts.push(fryLabels[modifiers.fryingDegree] ?? modifiers.fryingDegree);
  }
  if (modifiers.addOns && modifiers.addOns.length > 0) {
    parts.push(`+ ${modifiers.addOns.join(', ')}`);
  }

  return parts.join(' • ');
}
