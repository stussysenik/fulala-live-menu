import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Get archive history for a specific menu item
export const getItemHistory = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuArchive")
      .withIndex("by_item", (q) => q.eq("menuItemId", args.menuItemId))
      .order("desc")
      .collect();
  },
});

// Get all recent changes
export const getRecentChanges = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const changes = await ctx.db.query("menuArchive").order("desc").take(limit);
    return changes;
  },
});

// Get changes within a time range
export const getChangesByDateRange = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const allChanges = await ctx.db.query("menuArchive").order("desc").collect();
    return allChanges.filter(
      (change) =>
        change.changedAt >= args.startTime && change.changedAt <= args.endTime
    );
  },
});

// Create a daily snapshot (internal, called by cron)
export const createDailySnapshot = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if snapshot already exists for today
    const existing = await ctx.db
      .query("dailySnapshots")
      .withIndex("by_date", (q) => q.eq("date", dateStr))
      .first();

    if (existing) {
      // Update existing snapshot
      const categories = await ctx.db.query("categories").collect();
      const menuItems = await ctx.db.query("menuItems").collect();
      await ctx.db.patch(existing._id, {
        snapshot: { categories, menuItems },
      });
      return existing._id;
    }

    // Create new snapshot
    const categories = await ctx.db.query("categories").collect();
    const menuItems = await ctx.db.query("menuItems").collect();

    return await ctx.db.insert("dailySnapshots", {
      date: dateStr,
      snapshot: { categories, menuItems },
      createdAt: Date.now(),
    });
  },
});

// Get a daily snapshot
export const getDailySnapshot = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailySnapshots")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
  },
});

// Get available snapshot dates
export const getSnapshotDates = query({
  args: {},
  handler: async (ctx) => {
    const snapshots = await ctx.db.query("dailySnapshots").order("desc").collect();
    return snapshots.map((s) => s.date);
  },
});

// Analytics: Get item statistics
export const getItemStats = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.menuItemId);
    if (!item) return null;

    const history = await ctx.db
      .query("menuArchive")
      .withIndex("by_item", (q) => q.eq("menuItemId", args.menuItemId))
      .collect();

    const priceChanges = history.filter(
      (h, i, arr) =>
        i > 0 && h.snapshot?.price !== arr[i - 1].snapshot?.price
    );

    const availabilityChanges = history.filter(
      (h) => h.changeType === "updated" && h.snapshot?.isAvailable !== undefined
    );

    return {
      item,
      totalModifications: item.modificationCount,
      priceChangeCount: priceChanges.length,
      availabilityChangeCount: availabilityChanges.length,
      daysSinceAdded: Math.floor(
        (Date.now() - item.addedAt) / (1000 * 60 * 60 * 24)
      ),
      lastModified: item.lastModifiedAt,
    };
  },
});

// Analytics: Get menu-wide statistics
export const getMenuStats = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const menuItems = await ctx.db.query("menuItems").collect();
    const recentChanges = await ctx.db
      .query("menuArchive")
      .order("desc")
      .take(100);

    const today = Date.now();
    const dayAgo = today - 24 * 60 * 60 * 1000;
    const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

    const changesLast24h = recentChanges.filter((c) => c.changedAt > dayAgo);
    const changesLastWeek = recentChanges.filter((c) => c.changedAt > weekAgo);

    const availableItems = menuItems.filter((i) => i.isAvailable);
    const unavailableItems = menuItems.filter((i) => !i.isAvailable);

    const avgPrice =
      menuItems.length > 0
        ? menuItems.reduce((sum, i) => sum + i.price, 0) / menuItems.length
        : 0;

    return {
      totalCategories: categories.length,
      activeCategories: categories.filter((c) => c.isActive).length,
      totalItems: menuItems.length,
      availableItems: availableItems.length,
      unavailableItems: unavailableItems.length,
      averagePrice: Math.round(avgPrice),
      changesLast24h: changesLast24h.length,
      changesLastWeek: changesLastWeek.length,
    };
  },
});
