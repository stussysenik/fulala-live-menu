import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  validateSelections,
  legacyToOptionGroups,
  type OptionSelections,
} from "../src/lib/domain/optionValidation";

// Order item validator
const orderItemValidator = v.object({
  menuItemId: v.id("menuItems"),
  name: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
  selectedModifiers: v.optional(v.object({
    noodleType: v.optional(v.string()),
    temperature: v.optional(v.string()),
    spiceLevel: v.optional(v.string()),
    brothType: v.optional(v.string()),
    fryingDegree: v.optional(v.string()),
    sugarLevel: v.optional(v.string()),
    addOns: v.optional(v.array(v.string())),
  })),
});

type SelectedModifiers = {
  noodleType?: string;
  temperature?: string;
  spiceLevel?: string;
  brothType?: string;
  fryingDegree?: string;
  sugarLevel?: string;
  addOns?: string[];
};

// The stored order line uses fixed modifier keys; validation speaks in
// group-keyed selections. Dropping undefined entries keeps "not selected"
// distinct from "selected nothing".
function toSelections(modifiers: SelectedModifiers | undefined): OptionSelections {
  const selections: OptionSelections = {};
  for (const [key, value] of Object.entries(modifiers ?? {})) {
    if (value !== undefined) selections[key] = value;
  }
  return selections;
}

// Authoritative option check — the same domain function the modifier sheet
// runs client-side. Throws a readable error so the UI can surface it.
async function assertValidSelections(
  ctx: { db: any },
  menuItemId: string,
  selectedModifiers: SelectedModifiers | undefined,
  context: string,
) {
  const menuItem = await ctx.db.get(menuItemId);
  if (!menuItem) throw new Error(`${context}: menu item not found`);
  const issues = validateSelections(
    legacyToOptionGroups(menuItem),
    toSelections(selectedModifiers),
  );
  if (issues.length > 0) {
    throw new Error(
      `${context}: invalid options for "${menuItem.name}" — ${issues
        .map((i) => i.message)
        .join("; ")}`,
    );
  }
}

// Get order by session ID
export const getOrder = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("customerOrders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Return the active order if exists
    return orders.find((o) => o.status === "active") ?? null;
  },
});

// Get all orders (for admin)
export const getAllOrders = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("submitted"), v.literal("completed"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let orders;
    const statusFilter = args.status;

    if (statusFilter) {
      orders = await ctx.db
        .query("customerOrders")
        .withIndex("by_status", (q) => q.eq("status", statusFilter))
        .collect();
    } else {
      orders = await ctx.db.query("customerOrders").collect();
    }

    // Sort by creation date, newest first
    orders.sort((a, b) => b.createdAt - a.createdAt);

    if (args.limit) {
      return orders.slice(0, args.limit);
    }

    return orders;
  },
});

// Create a new order
export const createOrder = mutation({
  args: {
    sessionId: v.string(),
    tableNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("customerOrders", {
      sessionId: args.sessionId,
      status: "active",
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      tableNumber: args.tableNumber,
      createdAt: now,
    });
  },
});

// Add item to order
export const addItemToOrder = mutation({
  args: {
    sessionId: v.string(),
    item: orderItemValidator,
  },
  handler: async (ctx, args) => {
    // Truth at the boundary: an order line with options the kitchen can't
    // honor never gets stored.
    await assertValidSelections(
      ctx,
      args.item.menuItemId,
      args.item.selectedModifiers,
      "addItemToOrder",
    );

    // Find or create active order for this session
    const orders = await ctx.db
      .query("customerOrders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    let order = orders.find((o) => o.status === "active");

    if (!order) {
      // Create new order
      const orderId = await ctx.db.insert("customerOrders", {
        sessionId: args.sessionId,
        status: "active",
        items: [args.item],
        subtotal: args.item.unitPrice * args.item.quantity,
        tax: 0,
        total: args.item.unitPrice * args.item.quantity,
        createdAt: Date.now(),
      });
      return orderId;
    }

    // Add to existing order
    const newItems = [...order.items, args.item];
    const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const total = subtotal + tax;

    await ctx.db.patch(order._id, {
      items: newItems,
      subtotal,
      tax,
      total,
      updatedAt: Date.now(),
    });

    return order._id;
  },
});

// Update item quantity in order
export const updateItemQuantity = mutation({
  args: {
    sessionId: v.string(),
    itemIndex: v.number(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("customerOrders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const order = orders.find((o) => o.status === "active");
    if (!order) throw new Error("No active order found");

    let newItems = [...order.items];

    if (args.quantity <= 0) {
      // Remove item
      newItems.splice(args.itemIndex, 1);
    } else {
      // Update quantity
      newItems[args.itemIndex] = {
        ...newItems[args.itemIndex],
        quantity: args.quantity,
      };
    }

    const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    await ctx.db.patch(order._id, {
      items: newItems,
      subtotal,
      tax,
      total,
      updatedAt: Date.now(),
    });
  },
});

// Remove item from order
export const removeItemFromOrder = mutation({
  args: {
    sessionId: v.string(),
    itemIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("customerOrders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const order = orders.find((o) => o.status === "active");
    if (!order) throw new Error("No active order found");

    const newItems = order.items.filter((_, i) => i !== args.itemIndex);
    const subtotal = newItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    await ctx.db.patch(order._id, {
      items: newItems,
      subtotal,
      tax,
      total,
      updatedAt: Date.now(),
    });
  },
});

// Update order notes
export const updateOrderNotes = mutation({
  args: {
    sessionId: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("customerOrders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const order = orders.find((o) => o.status === "active");
    if (!order) throw new Error("No active order found");

    await ctx.db.patch(order._id, {
      notes: args.notes,
      updatedAt: Date.now(),
    });
  },
});

// Update table number
export const updateTableNumber = mutation({
  args: {
    sessionId: v.string(),
    tableNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("customerOrders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const order = orders.find((o) => o.status === "active");
    if (!order) throw new Error("No active order found");

    await ctx.db.patch(order._id, {
      tableNumber: args.tableNumber,
      updatedAt: Date.now(),
    });
  },
});

// Submit order
export const submitOrder = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("customerOrders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const order = orders.find((o) => o.status === "active");
    if (!order) throw new Error("No active order found");
    if (order.items.length === 0) throw new Error("Cannot submit empty order");

    // Re-validate every line at submission: option configs may have changed
    // (or required groups been added) since the item went into the cart.
    for (const item of order.items) {
      await assertValidSelections(
        ctx,
        item.menuItemId,
        item.selectedModifiers,
        "submitOrder",
      );
    }

    await ctx.db.patch(order._id, {
      status: "submitted",
      updatedAt: Date.now(),
    });

    return order._id;
  },
});

// Complete order (admin action)
export const completeOrder = mutation({
  args: {
    orderId: v.id("customerOrders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.orderId, {
      status: "completed",
      updatedAt: Date.now(),
    });
  },
});

// Clear order
export const clearOrder = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("customerOrders")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const order = orders.find((o) => o.status === "active");
    if (!order) return;

    await ctx.db.patch(order._id, {
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      updatedAt: Date.now(),
    });
  },
});

// Delete order
export const deleteOrder = mutation({
  args: {
    orderId: v.id("customerOrders"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.orderId);
  },
});
