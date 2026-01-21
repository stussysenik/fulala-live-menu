import { action, mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Sync state management
export const getSyncState = query({
  args: {},
  handler: async (ctx) => {
    const state = await ctx.db.query("syncState").first();
    return state ?? { lastSyncAt: 0, status: "idle" };
  },
});

export const updateSyncState = internalMutation({
  args: {
    status: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("syncState").first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSyncAt: now,
        status: args.status,
        errorMessage: args.errorMessage,
      });
    } else {
      await ctx.db.insert("syncState", {
        lastSyncAt: now,
        status: args.status,
        errorMessage: args.errorMessage,
      });
    }
  },
});

// Batch upsert categories from external source
export const syncCategories = mutation({
  args: {
    categories: v.array(
      v.object({
        name: v.string(),
        displayName: v.string(),
        sortOrder: v.number(),
        isActive: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existingCategories = await ctx.db.query("categories").collect();
    const existingByName = new Map(existingCategories.map((c) => [c.name, c]));

    const results = {
      created: 0,
      updated: 0,
      unchanged: 0,
    };

    for (const category of args.categories) {
      const existing = existingByName.get(category.name);

      if (existing) {
        // Check if update needed
        if (
          existing.displayName !== category.displayName ||
          existing.sortOrder !== category.sortOrder ||
          existing.isActive !== category.isActive
        ) {
          await ctx.db.patch(existing._id, {
            displayName: category.displayName,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
          });
          results.updated++;
        } else {
          results.unchanged++;
        }
      } else {
        await ctx.db.insert("categories", category);
        results.created++;
      }
    }

    return results;
  },
});

// Batch upsert menu items from external source
export const syncMenuItems = mutation({
  args: {
    items: v.array(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        price: v.number(),
        categoryName: v.string(), // We'll resolve to categoryId
        isAvailable: v.boolean(),
        sortOrder: v.number(),
        imageUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db.query("categories").collect();
    const categoryByName = new Map(categories.map((c) => [c.name, c]));

    const existingItems = await ctx.db.query("menuItems").collect();
    const existingByName = new Map(existingItems.map((i) => [i.name, i]));

    const results = {
      created: 0,
      updated: 0,
      unchanged: 0,
      errors: [] as string[],
    };

    const now = Date.now();

    for (const item of args.items) {
      const category = categoryByName.get(item.categoryName);
      if (!category) {
        results.errors.push(`Category not found: ${item.categoryName}`);
        continue;
      }

      const existing = existingByName.get(item.name);

      if (existing) {
        // Check if update needed
        const needsUpdate =
          existing.description !== item.description ||
          existing.price !== item.price ||
          existing.categoryId !== category._id ||
          existing.isAvailable !== item.isAvailable ||
          existing.sortOrder !== item.sortOrder ||
          existing.imageUrl !== item.imageUrl;

        if (needsUpdate) {
          await ctx.db.patch(existing._id, {
            description: item.description,
            price: item.price,
            categoryId: category._id,
            isAvailable: item.isAvailable,
            sortOrder: item.sortOrder,
            imageUrl: item.imageUrl,
            lastModifiedAt: now,
            modificationCount: existing.modificationCount + 1,
          });

          // Archive the update
          const updated = await ctx.db.get(existing._id);
          await ctx.db.insert("menuArchive", {
            menuItemId: existing._id,
            snapshot: updated,
            changeType: "updated",
            changedAt: now,
          });

          results.updated++;
        } else {
          results.unchanged++;
        }
      } else {
        const id = await ctx.db.insert("menuItems", {
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: category._id,
          isAvailable: item.isAvailable,
          sortOrder: item.sortOrder,
          imageUrl: item.imageUrl,
          addedAt: now,
          lastModifiedAt: now,
          modificationCount: 0,
        });

        // Archive the creation
        const created = await ctx.db.get(id);
        await ctx.db.insert("menuArchive", {
          menuItemId: id,
          snapshot: created,
          changeType: "created",
          changedAt: now,
        });

        results.created++;
      }
    }

    return results;
  },
});

// Type definitions for sync results
type SyncResults = { created: number; updated: number; unchanged: number };
type ItemSyncResults = SyncResults & { errors: string[] };

// Google Sheets sync action
export const syncFromGoogleSheets = action({
  args: {
    spreadsheetId: v.string(),
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Update sync state to syncing
    await ctx.runMutation(internal.sync.updateSyncState, { status: "syncing" });

    try {
      // Get API key from environment if not provided
      const apiKey = args.apiKey ?? process.env.GOOGLE_SHEETS_API_KEY;
      if (!apiKey) {
        throw new Error("Google Sheets API key not configured");
      }

      // Fetch categories sheet
      const categoriesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}/values/Categories!A2:D?key=${apiKey}`;
      const categoriesResponse = await fetch(categoriesUrl);

      if (!categoriesResponse.ok) {
        throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`);
      }

      const categoriesData = await categoriesResponse.json() as { values?: string[][] };
      const categories = (categoriesData.values ?? []).map((row: string[]) => ({
        name: row[0] ?? "",
        displayName: row[1] ?? row[0] ?? "",
        sortOrder: parseInt(row[2] ?? "0", 10),
        isActive: (row[3] ?? "true").toLowerCase() === "true",
      }));

      // Fetch menu items sheet
      const itemsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}/values/Menu%20Items!A2:F?key=${apiKey}`;
      const itemsResponse = await fetch(itemsUrl);

      if (!itemsResponse.ok) {
        throw new Error(`Failed to fetch menu items: ${itemsResponse.statusText}`);
      }

      const itemsData = await itemsResponse.json() as { values?: string[][] };
      const items = (itemsData.values ?? []).map((row: string[]) => ({
        name: row[0] ?? "",
        description: row[1] || undefined,
        price: Math.round(parseFloat(row[2] ?? "0") * 100), // Convert to cents
        categoryName: row[3] ?? "",
        isAvailable: (row[4] ?? "true").toLowerCase() === "true",
        sortOrder: parseInt(row[5] ?? "0", 10),
      }));

      // Sync to database
      const categoryResults = await ctx.runMutation(
        internal.sync.syncCategoriesInternal,
        { categories }
      ) as SyncResults;
      const itemResults = await ctx.runMutation(
        internal.sync.syncMenuItemsInternal,
        { items }
      ) as ItemSyncResults;

      // Update sync state to idle
      await ctx.runMutation(internal.sync.updateSyncState, { status: "idle" });

      return {
        success: true,
        categories: categoryResults,
        items: itemResults,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(internal.sync.updateSyncState, {
        status: "error",
        errorMessage,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

// Internal versions for use in actions
export const syncCategoriesInternal = internalMutation({
  args: {
    categories: v.array(
      v.object({
        name: v.string(),
        displayName: v.string(),
        sortOrder: v.number(),
        isActive: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existingCategories = await ctx.db.query("categories").collect();
    const existingByName = new Map(existingCategories.map((c) => [c.name, c]));

    const results = { created: 0, updated: 0, unchanged: 0 };

    for (const category of args.categories) {
      const existing = existingByName.get(category.name);

      if (existing) {
        if (
          existing.displayName !== category.displayName ||
          existing.sortOrder !== category.sortOrder ||
          existing.isActive !== category.isActive
        ) {
          await ctx.db.patch(existing._id, {
            displayName: category.displayName,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
          });
          results.updated++;
        } else {
          results.unchanged++;
        }
      } else {
        await ctx.db.insert("categories", category);
        results.created++;
      }
    }

    return results;
  },
});

export const syncMenuItemsInternal = internalMutation({
  args: {
    items: v.array(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        price: v.number(),
        categoryName: v.string(),
        isAvailable: v.boolean(),
        sortOrder: v.number(),
        imageUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db.query("categories").collect();
    const categoryByName = new Map(categories.map((c) => [c.name, c]));

    const existingItems = await ctx.db.query("menuItems").collect();
    const existingByName = new Map(existingItems.map((i) => [i.name, i]));

    const results = { created: 0, updated: 0, unchanged: 0, errors: [] as string[] };
    const now = Date.now();

    for (const item of args.items) {
      const category = categoryByName.get(item.categoryName);
      if (!category) {
        results.errors.push(`Category not found: ${item.categoryName}`);
        continue;
      }

      const existing = existingByName.get(item.name);

      if (existing) {
        const needsUpdate =
          existing.description !== item.description ||
          existing.price !== item.price ||
          existing.categoryId !== category._id ||
          existing.isAvailable !== item.isAvailable ||
          existing.sortOrder !== item.sortOrder ||
          existing.imageUrl !== item.imageUrl;

        if (needsUpdate) {
          await ctx.db.patch(existing._id, {
            description: item.description,
            price: item.price,
            categoryId: category._id,
            isAvailable: item.isAvailable,
            sortOrder: item.sortOrder,
            imageUrl: item.imageUrl,
            lastModifiedAt: now,
            modificationCount: existing.modificationCount + 1,
          });

          const updated = await ctx.db.get(existing._id);
          await ctx.db.insert("menuArchive", {
            menuItemId: existing._id,
            snapshot: updated,
            changeType: "updated",
            changedAt: now,
          });

          results.updated++;
        } else {
          results.unchanged++;
        }
      } else {
        const id = await ctx.db.insert("menuItems", {
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: category._id,
          isAvailable: item.isAvailable,
          sortOrder: item.sortOrder,
          imageUrl: item.imageUrl,
          addedAt: now,
          lastModifiedAt: now,
          modificationCount: 0,
        });

        const created = await ctx.db.get(id);
        await ctx.db.insert("menuArchive", {
          menuItemId: id,
          snapshot: created,
          changeType: "created",
          changedAt: now,
        });

        results.created++;
      }
    }

    return results;
  },
});
