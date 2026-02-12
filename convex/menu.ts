import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all active categories sorted by sortOrder
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_sort")
      .collect();
    return categories.filter((c) => c.isActive);
  },
});

// Get all menu items
export const getMenuItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("menuItems").collect();
  },
});

// Get menu items by category
export const getMenuItemsByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
  },
});

// Get full menu (categories with items)
export const getFullMenu = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_sort")
      .collect();

    const menuItems = await ctx.db.query("menuItems").collect();

    return categories
      .filter((c) => c.isActive)
      .map((category) => ({
        ...category,
        items: menuItems
          .filter((item) => item.categoryId === category._id)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }));
  },
});

// Create a new category
export const createCategory = mutation({
  args: {
    name: v.string(),
    displayName: v.string(),
    sortOrder: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", args);
  },
});

// Update a category
export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    displayName: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

// Create a new menu item
export const createMenuItem = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    categoryId: v.id("categories"),
    isAvailable: v.boolean(),
    sortOrder: v.number(),
    imageUrl: v.optional(v.string()),
    nameLocal: v.optional(v.string()),
    nameChinese: v.optional(v.string()),
    allergenNumbers: v.optional(v.array(v.number())),
    allergenCodes: v.optional(v.array(v.string())),
    quantity: v.optional(v.string()),
    priceTiers: v.optional(v.array(v.object({
      quantity: v.string(),
      price: v.number(),
    }))),
    isSweet: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    isGlutenFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("menuItems", {
      ...args,
      addedAt: now,
      lastModifiedAt: now,
      modificationCount: 0,
    });

    // Archive the creation
    await ctx.db.insert("menuArchive", {
      menuItemId: id,
      snapshot: { ...args, addedAt: now, lastModifiedAt: now, modificationCount: 0 },
      changeType: "created",
      changedAt: now,
    });

    return id;
  },
});

// Update a menu item
export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    isAvailable: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    nameLocal: v.optional(v.string()),
    nameChinese: v.optional(v.string()),
    allergenNumbers: v.optional(v.array(v.number())),
    allergenCodes: v.optional(v.array(v.string())),
    quantity: v.optional(v.string()),
    priceTiers: v.optional(v.array(v.object({
      quantity: v.string(),
      price: v.number(),
    }))),
    isSweet: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    isGlutenFree: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Menu item not found");

    const now = Date.now();
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    const newData = {
      ...filteredUpdates,
      lastModifiedAt: now,
      modificationCount: existing.modificationCount + 1,
    };

    await ctx.db.patch(id, newData);

    // Archive the update
    const updatedItem = await ctx.db.get(id);
    await ctx.db.insert("menuArchive", {
      menuItemId: id,
      snapshot: updatedItem,
      changeType: "updated",
      changedAt: now,
    });
  },
});

// Delete a menu item
export const deleteMenuItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Menu item not found");

    // Archive the deletion
    await ctx.db.insert("menuArchive", {
      menuItemId: args.id,
      snapshot: existing,
      changeType: "deleted",
      changedAt: Date.now(),
    });

    await ctx.db.delete(args.id);
  },
});

// Migrate image URLs from .jpg to .webp
export const migrateImagesToWebp = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    let updated = 0;
    for (const item of items) {
      if (item.imageUrl && item.imageUrl.endsWith(".jpg")) {
        await ctx.db.patch(item._id, {
          imageUrl: item.imageUrl.replace(".jpg", ".webp"),
        });
        updated++;
      }
    }
    return { message: `Migrated ${updated} image URLs to .webp` };
  },
});

// Toggle item availability
export const toggleAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Menu item not found");

    const now = Date.now();
    await ctx.db.patch(args.id, {
      isAvailable: !existing.isAvailable,
      lastModifiedAt: now,
      modificationCount: existing.modificationCount + 1,
    });

    // Archive the change
    const updated = await ctx.db.get(args.id);
    await ctx.db.insert("menuArchive", {
      menuItemId: args.id,
      snapshot: updated,
      changeType: "updated",
      changedAt: now,
    });
  },
});
