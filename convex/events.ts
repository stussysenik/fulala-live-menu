import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Event Packages

export const getEventPackages = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const packages = await ctx.db.query("eventPackages").collect();

    if (args.activeOnly) {
      return packages.filter((p) => p.isActive);
    }

    return packages;
  },
});

export const getEventPackage = query({
  args: { id: v.id("eventPackages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createEventPackage = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    minGuests: v.number(),
    maxGuests: v.number(),
    pricePerPerson: v.number(),
    depositRequired: v.number(),
    includedItems: v.array(v.id("menuItems")),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("eventPackages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateEventPackage = mutation({
  args: {
    id: v.id("eventPackages"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    minGuests: v.optional(v.number()),
    maxGuests: v.optional(v.number()),
    pricePerPerson: v.optional(v.number()),
    depositRequired: v.optional(v.number()),
    includedItems: v.optional(v.array(v.id("menuItems"))),
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

export const deleteEventPackage = mutation({
  args: { id: v.id("eventPackages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Catering Menus

export const getCateringMenus = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const menus = await ctx.db.query("cateringMenus").collect();

    if (args.activeOnly) {
      return menus.filter((m) => m.isActive);
    }

    return menus;
  },
});

export const getCateringMenu = query({
  args: { id: v.id("cateringMenus") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createCateringMenu = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    minOrderAmount: v.number(),
    deliveryRadius: v.optional(v.number()),
    items: v.array(v.id("menuItems")),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cateringMenus", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateCateringMenu = mutation({
  args: {
    id: v.id("cateringMenus"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    minOrderAmount: v.optional(v.number()),
    deliveryRadius: v.optional(v.number()),
    items: v.optional(v.array(v.id("menuItems"))),
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

export const deleteCateringMenu = mutation({
  args: { id: v.id("cateringMenus") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// School Meals

export const getSchoolMeals = query({
  args: {
    year: v.optional(v.number()),
    weekNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let meals = await ctx.db.query("schoolMeals").collect();

    if (args.year !== undefined) {
      meals = meals.filter((m) => m.year === args.year);
    }

    if (args.weekNumber !== undefined) {
      meals = meals.filter((m) => m.weekNumber === args.weekNumber);
    }

    // Sort by year, week, then day
    const dayOrder = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };
    meals.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
      return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
    });

    return meals;
  },
});

export const getSchoolMeal = query({
  args: { id: v.id("schoolMeals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createSchoolMeal = mutation({
  args: {
    weekNumber: v.number(),
    year: v.number(),
    dayOfWeek: v.union(
      v.literal("monday"),
      v.literal("tuesday"),
      v.literal("wednesday"),
      v.literal("thursday"),
      v.literal("friday")
    ),
    items: v.array(v.id("menuItems")),
    pricePerMeal: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate
    const existing = await ctx.db
      .query("schoolMeals")
      .withIndex("by_week", (q) => q.eq("year", args.year).eq("weekNumber", args.weekNumber))
      .collect();

    const duplicate = existing.find((m) => m.dayOfWeek === args.dayOfWeek);
    if (duplicate) {
      throw new Error(`A meal for ${args.dayOfWeek} in week ${args.weekNumber}, ${args.year} already exists`);
    }

    return await ctx.db.insert("schoolMeals", args);
  },
});

export const updateSchoolMeal = mutation({
  args: {
    id: v.id("schoolMeals"),
    weekNumber: v.optional(v.number()),
    year: v.optional(v.number()),
    dayOfWeek: v.optional(v.union(
      v.literal("monday"),
      v.literal("tuesday"),
      v.literal("wednesday"),
      v.literal("thursday"),
      v.literal("friday")
    )),
    items: v.optional(v.array(v.id("menuItems"))),
    pricePerMeal: v.optional(v.number()),
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

export const deleteSchoolMeal = mutation({
  args: { id: v.id("schoolMeals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
