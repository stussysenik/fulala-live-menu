import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Layout type and config validators
const layoutTypeValidator = v.union(
  v.literal("standard-list"),
  v.literal("dim-sum-grid"),
  v.literal("card-grid")
);

const layoutConfigValidator = v.object({
  columnsPerRow: v.optional(v.number()),
  showCheckboxes: v.optional(v.boolean()),
  showItemNumbers: v.optional(v.boolean()),
  showImages: v.optional(v.boolean()),
  categoryStyle: v.optional(v.union(
    v.literal("header"),
    v.literal("tabs"),
    v.literal("colored")
  )),
});

// Get the active layout
export const getActiveLayout = query({
  args: {},
  handler: async (ctx) => {
    const layouts = await ctx.db
      .query("displayLayouts")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Return the first active layout, or a default if none exists
    if (layouts.length > 0) {
      return layouts[0];
    }

    // Default layout
    return {
      _id: null,
      layoutType: "standard-list" as const,
      config: {
        columnsPerRow: 1,
        showCheckboxes: false,
        showItemNumbers: false,
        showImages: true,
        categoryStyle: "header" as const,
      },
      isActive: true,
    };
  },
});

// Get all layouts
export const getAllLayouts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("displayLayouts").collect();
  },
});

// Create a new layout
export const createLayout = mutation({
  args: {
    layoutType: layoutTypeValidator,
    config: layoutConfigValidator,
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // If this layout is active, deactivate all others
    if (args.isActive) {
      const existingLayouts = await ctx.db.query("displayLayouts").collect();
      for (const layout of existingLayouts) {
        if (layout.isActive) {
          await ctx.db.patch(layout._id, { isActive: false });
        }
      }
    }

    return await ctx.db.insert("displayLayouts", args);
  },
});

// Update a layout
export const updateLayout = mutation({
  args: {
    id: v.id("displayLayouts"),
    layoutType: v.optional(layoutTypeValidator),
    config: v.optional(layoutConfigValidator),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Layout not found");

    // If activating this layout, deactivate all others
    if (updates.isActive === true) {
      const existingLayouts = await ctx.db.query("displayLayouts").collect();
      for (const layout of existingLayouts) {
        if (layout._id !== id && layout.isActive) {
          await ctx.db.patch(layout._id, { isActive: false });
        }
      }
    }

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, filteredUpdates);
  },
});

// Set active layout
export const setActiveLayout = mutation({
  args: {
    id: v.id("displayLayouts"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Layout not found");

    // Deactivate all layouts
    const allLayouts = await ctx.db.query("displayLayouts").collect();
    for (const layout of allLayouts) {
      if (layout.isActive) {
        await ctx.db.patch(layout._id, { isActive: false });
      }
    }

    // Activate the selected layout
    await ctx.db.patch(args.id, { isActive: true });
  },
});

// Delete a layout
export const deleteLayout = mutation({
  args: { id: v.id("displayLayouts") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Layout not found");

    await ctx.db.delete(args.id);
  },
});

// Initialize default layouts (run once)
export const initializeDefaultLayouts = mutation({
  args: {},
  handler: async (ctx) => {
    const existingLayouts = await ctx.db.query("displayLayouts").collect();
    if (existingLayouts.length > 0) {
      return { message: "Layouts already initialized" };
    }

    // Create default layouts
    const layouts = [
      {
        layoutType: "standard-list" as const,
        config: {
          columnsPerRow: 1,
          showCheckboxes: false,
          showItemNumbers: false,
          showImages: true,
          categoryStyle: "header" as const,
        },
        isActive: true,
      },
      {
        layoutType: "dim-sum-grid" as const,
        config: {
          columnsPerRow: 2,
          showCheckboxes: true,
          showItemNumbers: true,
          showImages: false,
          categoryStyle: "colored" as const,
        },
        isActive: false,
      },
      {
        layoutType: "card-grid" as const,
        config: {
          columnsPerRow: 3,
          showCheckboxes: false,
          showItemNumbers: false,
          showImages: true,
          categoryStyle: "tabs" as const,
        },
        isActive: false,
      },
    ];

    for (const layout of layouts) {
      await ctx.db.insert("displayLayouts", layout);
    }

    return { message: "Default layouts created" };
  },
});
