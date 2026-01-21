import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    displayName: v.string(),
    sortOrder: v.number(),
    isActive: v.boolean(),
  }).index("by_sort", ["sortOrder"]),

  menuItems: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),              // cents
    categoryId: v.id("categories"),
    isAvailable: v.boolean(),
    sortOrder: v.number(),
    addedAt: v.number(),
    lastModifiedAt: v.number(),
    modificationCount: v.number(),
    imageUrl: v.optional(v.string()),  // Optional menu item image
    allergens: v.optional(v.array(v.string())),  // Optional allergens list
  })
    .index("by_category", ["categoryId"])
    .index("by_available", ["isAvailable"]),

  menuArchive: defineTable({
    menuItemId: v.id("menuItems"),
    snapshot: v.any(),
    changeType: v.string(),         // "created" | "updated" | "deleted"
    changedAt: v.number(),
  }).index("by_item", ["menuItemId"]),

  syncState: defineTable({
    lastSyncAt: v.number(),
    status: v.string(),             // "idle" | "syncing" | "error"
    errorMessage: v.optional(v.string()),
  }),

  dailySnapshots: defineTable({
    date: v.string(),               // YYYY-MM-DD
    snapshot: v.any(),              // Full menu state
    createdAt: v.number(),
  }).index("by_date", ["date"]),

  // Theme and settings
  siteSettings: defineTable({
    key: v.string(),                // "theme" | "restaurant-info"
    value: v.any(),                 // JSON settings
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  themePresets: defineTable({
    name: v.string(),
    theme: v.any(),
    isDefault: v.boolean(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Display analytics
  displayAnalytics: defineTable({
    sessionId: v.string(),
    displayType: v.string(),        // "mobile" | "tv"
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    viewportSize: v.optional(v.object({ width: v.number(), height: v.number() })),
  })
    .index("by_type", ["displayType"])
    .index("by_date", ["startedAt"]),

  analyticsAggregates: defineTable({
    date: v.string(),               // YYYY-MM-DD
    displayType: v.string(),
    totalSessions: v.number(),
    totalDurationMs: v.number(),
    peakHour: v.optional(v.number()),
  }).index("by_date_type", ["date", "displayType"]),
});
