import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Currency types
type CurrencyCode = "CZK" | "EUR" | "USD" | "CNY";
type CurrencyDisplayMode = "single" | "multi" | "toggle";

interface ExchangeRates {
  CZK: number;
  EUR: number;
  USD: number;
  CNY: number;
}

interface CurrencyConfig {
  baseCurrency: CurrencyCode;
  displayCurrencies: CurrencyCode[];
  displayMode: CurrencyDisplayMode;
  rates: ExchangeRates;
  showSymbols: boolean;
  compactMode: boolean;
}

// Theme configuration type (matches TypeScript interface from plan)
export interface ThemeConfig {
  fonts: {
    headline: string;
    body: string;
    price: string;
  };
  typography: {
    headlineSize: string;
    subheadlineSize: string;
    bodySize: string;
    priceSize: string;
    allergenSize: string;
    lineSpacing: number;
  };
  colors: {
    text: string;
    textMuted: string;
    price: string;
    background: string;
    surface: string;
    accent: string;
    available: string;
    unavailable: string;
    border: string;
  };
  spacing: {
    scale: number;
    itemGap: string;
    categoryGap: string;
  };
  display: {
    showCurrencySymbol: boolean;
    priceAlignment: "left" | "right" | "dots";
    showImages: boolean;
    imageSize: "small" | "medium" | "large";
  };
  tv: {
    scaleFactor: number;
    columnCount: number;
  };
  currency: CurrencyConfig;
}

// Default theme based on research (warm colors, no currency symbol, etc.)
export const defaultTheme: ThemeConfig = {
  fonts: {
    headline: "Georgia, serif",
    body: "Helvetica Neue, Arial, sans-serif",
    price: "Helvetica Neue, Arial, sans-serif",
  },
  typography: {
    headlineSize: "1.875rem",
    subheadlineSize: "1.25rem",
    bodySize: "1rem",
    priceSize: "1rem",
    allergenSize: "0.75rem",
    lineSpacing: 1.5,
  },
  colors: {
    text: "#1a1a1a",
    textMuted: "#525252",
    price: "#2d5016",        // Distinct price color - deep forest green
    background: "#ffffff",
    surface: "#fafafa",
    accent: "#c45a3b",       // Warm terracotta - appetite stimulating
    available: "#16a34a",
    unavailable: "#dc2626",
    border: "#e5e5e5",
  },
  spacing: {
    scale: 1,
    itemGap: "1rem",
    categoryGap: "2rem",
  },
  display: {
    showCurrencySymbol: false,  // Research shows ~8% increase without $
    priceAlignment: "right",
    showImages: false,
    imageSize: "medium",
  },
  tv: {
    scaleFactor: 1.5,
    columnCount: 3,
  },
  currency: {
    baseCurrency: "USD",
    displayCurrencies: ["USD", "EUR", "CZK"],
    displayMode: "multi",
    rates: { CZK: 23.5, EUR: 0.92, USD: 1, CNY: 7.25 },
    showSymbols: true,
    compactMode: true,
  },
};

// Get theme settings
export const getTheme = query({
  args: {},
  handler: async (ctx): Promise<ThemeConfig> => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "theme"))
      .first();

    if (!settings) {
      return defaultTheme;
    }

    return settings.value as ThemeConfig;
  },
});

// Update theme settings
export const updateTheme = mutation({
  args: {
    theme: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "theme"))
      .first();

    const themeValue = args.theme as ThemeConfig;

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: themeValue,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("siteSettings", {
        key: "theme",
        value: themeValue,
        updatedAt: Date.now(),
      });
    }
  },
});

// Save theme as preset
export const savePreset = mutation({
  args: {
    name: v.string(),
    theme: v.any(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("themePresets")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    const themeValue = args.theme as ThemeConfig;

    if (existing) {
      await ctx.db.patch(existing._id, {
        theme: themeValue,
        isDefault: args.isDefault ?? false,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("themePresets", {
        name: args.name,
        theme: themeValue,
        isDefault: args.isDefault ?? false,
        createdAt: Date.now(),
      });
    }
  },
});

// Get all presets
export const getPresets = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("themePresets").collect();
  },
});

// Get preset by name
export const getPreset = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("themePresets")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

// Delete preset
export const deletePreset = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const preset = await ctx.db
      .query("themePresets")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (preset) {
      await ctx.db.delete(preset._id);
      return true;
    }
    return false;
  },
});

// Load preset and apply as current theme
export const loadPreset = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const preset = await ctx.db
      .query("themePresets")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!preset) {
      throw new Error(`Preset "${args.name}" not found`);
    }

    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "theme"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: preset.theme,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("siteSettings", {
        key: "theme",
        value: preset.theme,
        updatedAt: Date.now(),
      });
    }
  },
});

// Reset to default theme
export const resetTheme = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "theme"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: defaultTheme,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("siteSettings", {
        key: "theme",
        value: defaultTheme,
        updatedAt: Date.now(),
      });
    }
  },
});
