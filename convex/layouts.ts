import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Layout type and config validators
const layoutTypeValidator = v.union(
  v.literal("standard-list"),
  v.literal("dim-sum-grid"),
  v.literal("card-grid"),
  v.literal("traditional-chinese")
);

const pageTypeValidator = v.union(
  v.literal("display"),
  v.literal("order")
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
  showQuantityInput: v.optional(v.boolean()),
  colorScheme: v.optional(v.union(
    v.literal("classic-red"),
    v.literal("jade-green"),
    v.literal("gold")
  )),
});

// Get the active layout for a specific page type
export const getActiveLayout = query({
  args: {
    pageType: v.optional(pageTypeValidator),
  },
  handler: async (ctx, args) => {
    const pageType = args.pageType ?? "display";

    // Try to find an active layout for this page type
    const layouts = await ctx.db
      .query("displayLayouts")
      .withIndex("by_page_type", (q) =>
        q.eq("pageType", pageType).eq("isActive", true)
      )
      .collect();

    // Return the first active layout for this page type
    if (layouts.length > 0) {
      return layouts[0];
    }

    // Fallback: Try to find any active layout (for backwards compatibility)
    const anyActiveLayouts = await ctx.db
      .query("displayLayouts")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (anyActiveLayouts.length > 0) {
      return anyActiveLayouts[0];
    }

    // Default layout
    return {
      _id: null,
      layoutType: "standard-list" as const,
      pageType: pageType,
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

// Get all layouts (optionally filtered by page type)
export const getAllLayouts = query({
  args: {
    pageType: v.optional(pageTypeValidator),
  },
  handler: async (ctx, args) => {
    if (args.pageType) {
      return await ctx.db
        .query("displayLayouts")
        .filter((q) => q.eq(q.field("pageType"), args.pageType))
        .collect();
    }
    return await ctx.db.query("displayLayouts").collect();
  },
});

// Get layouts by page type
export const getLayoutsByPageType = query({
  args: {
    pageType: pageTypeValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("displayLayouts")
      .filter((q) => q.eq(q.field("pageType"), args.pageType))
      .collect();
  },
});

// Create a new layout
export const createLayout = mutation({
  args: {
    layoutType: layoutTypeValidator,
    pageType: pageTypeValidator,
    config: layoutConfigValidator,
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // If this layout is active, deactivate all others of the same page type
    if (args.isActive) {
      const existingLayouts = await ctx.db
        .query("displayLayouts")
        .filter((q) => q.eq(q.field("pageType"), args.pageType))
        .collect();

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
    pageType: v.optional(pageTypeValidator),
    config: v.optional(layoutConfigValidator),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Layout not found");

    const targetPageType = updates.pageType ?? existing.pageType;

    // If activating this layout, deactivate all others of the same page type
    if (updates.isActive === true) {
      const existingLayouts = await ctx.db
        .query("displayLayouts")
        .filter((q) => q.eq(q.field("pageType"), targetPageType))
        .collect();

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

// Set active layout (only deactivates layouts of the same page type)
export const setActiveLayout = mutation({
  args: {
    id: v.id("displayLayouts"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Layout not found");

    // Deactivate all layouts of the same page type
    const allLayouts = await ctx.db
      .query("displayLayouts")
      .filter((q) => q.eq(q.field("pageType"), existing.pageType))
      .collect();

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

// Initialize default layouts (run once) - creates layouts for both page types
export const initializeDefaultLayouts = mutation({
  args: {},
  handler: async (ctx) => {
    const existingLayouts = await ctx.db.query("displayLayouts").collect();
    if (existingLayouts.length > 0) {
      return { message: "Layouts already initialized" };
    }

    // Default layouts for display pages (/ and /tv)
    const displayLayouts = [
      {
        layoutType: "standard-list" as const,
        pageType: "display" as const,
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
        pageType: "display" as const,
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
        pageType: "display" as const,
        config: {
          columnsPerRow: 3,
          showCheckboxes: false,
          showItemNumbers: false,
          showImages: true,
          categoryStyle: "tabs" as const,
        },
        isActive: false,
      },
      {
        layoutType: "traditional-chinese" as const,
        pageType: "display" as const,
        config: {
          columnsPerRow: 2,
          showCheckboxes: false,
          showItemNumbers: true,
          showImages: false,
          categoryStyle: "header" as const,
          showQuantityInput: true,
          colorScheme: "classic-red" as const,
        },
        isActive: false,
      },
    ];

    // Default layouts for order page
    const orderLayouts = [
      {
        layoutType: "dim-sum-grid" as const,
        pageType: "order" as const,
        config: {
          columnsPerRow: 2,
          showCheckboxes: true,
          showItemNumbers: true,
          showImages: false,
          categoryStyle: "colored" as const,
        },
        isActive: true,
      },
      {
        layoutType: "card-grid" as const,
        pageType: "order" as const,
        config: {
          columnsPerRow: 3,
          showCheckboxes: false,
          showItemNumbers: false,
          showImages: true,
          categoryStyle: "tabs" as const,
        },
        isActive: false,
      },
      {
        layoutType: "traditional-chinese" as const,
        pageType: "order" as const,
        config: {
          columnsPerRow: 2,
          showCheckboxes: false,
          showItemNumbers: true,
          showImages: false,
          categoryStyle: "header" as const,
          showQuantityInput: true,
          colorScheme: "classic-red" as const,
        },
        isActive: false,
      },
    ];

    // Insert all layouts
    for (const layout of [...displayLayouts, ...orderLayouts]) {
      await ctx.db.insert("displayLayouts", layout);
    }

    return { message: "Default layouts created for display and order pages" };
  },
});

// Migration helper: Add pageType to existing layouts without it
export const migrateLayoutsToPageType = mutation({
  args: {},
  handler: async (ctx) => {
    const layouts = await ctx.db.query("displayLayouts").collect();
    let migrated = 0;

    for (const layout of layouts) {
      // Check if layout has pageType (using type assertion since old records might not have it)
      const layoutWithPageType = layout as typeof layout & { pageType?: string };
      if (!layoutWithPageType.pageType) {
        // Default existing layouts to "display" page type
        await ctx.db.patch(layout._id, { pageType: "display" as const });
        migrated++;
      }
    }

    return { message: `Migrated ${migrated} layouts to include pageType` };
  },
});
