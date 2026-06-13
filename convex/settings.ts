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

// Default theme - Fulala style
export const defaultTheme: ThemeConfig = {
  fonts: {
    headline: "Cormorant Garamond, serif",
    body: "Inter, sans-serif",
    price: "DM Mono, monospace",
  },
  typography: {
    headlineSize: "1.75rem",
    subheadlineSize: "1.25rem",
    bodySize: "1rem",
    priceSize: "1.125rem",
    allergenSize: "0.8125rem",
    lineSpacing: 1.6,
  },
  colors: {
    text: "#2C2C2C",
    textMuted: "#6B6B6B",
    price: "#16a34a",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    accent: "#E83636",
    available: "#2d5016",
    unavailable: "#dc2626",
    border: "#E8E8E4",
  },
  spacing: {
    scale: 1.25,
    itemGap: "1.25rem",
    categoryGap: "2.5rem",
  },
  display: {
    showCurrencySymbol: true,
    priceAlignment: "right",
    showImages: true,
    imageSize: "large",
  },
  tv: {
    scaleFactor: 1.5,
    columnCount: 3,
  },
  currency: {
    baseCurrency: "CZK",
    displayCurrencies: ["CZK", "EUR"],
    displayMode: "single",
    rates: { CZK: 1, EUR: 0.039, USD: 0.042, CNY: 0.31 },
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

// Get menu schedule
export const getMenuSchedule = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "menu-schedule"))
      .first();
    if (!settings) return null;
    return settings.value as {
      weekNumber: number;
      monthLabel: string;
      year: number;
      startDate: string;
      endDate: string;
    };
  },
});

// Update menu schedule
export const updateMenuSchedule = mutation({
  args: { schedule: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "menu-schedule"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.schedule,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("siteSettings", {
        key: "menu-schedule",
        value: args.schedule,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get customer info
export const getCustomerInfo = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "customer-info"))
      .first();
    if (!settings) return null;
    return settings.value as {
      sections: {
        title: string;
        titleLocal?: string;
        description: string;
        descriptionLocal?: string;
      }[];
    };
  },
});

// Get animations enabled setting
export const getAnimationsEnabled = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "animations-enabled"))
      .first();
    if (!settings) return true;
    return settings.value as boolean;
  },
});

// Update animations enabled setting
export const updateAnimationsEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "animations-enabled"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.enabled,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("siteSettings", {
        key: "animations-enabled",
        value: args.enabled,
        updatedAt: Date.now(),
      });
    }
  },
});

// Ordering kill switch. The /order page is deployed dark: until staff flip
// this on from /admin, customers see a "coming soon" screen and no order
// mutations are reachable from the UI. Defaults to FALSE (unlike animations)
// because an unconfigured deployment must never accept orders.
export const getOrderingEnabled = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "ordering-enabled"))
      .first();
    if (!settings) return false;
    return settings.value as boolean;
  },
});

export const updateOrderingEnabled = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "ordering-enabled"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.enabled,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("siteSettings", {
        key: "ordering-enabled",
        value: args.enabled,
        updatedAt: Date.now(),
      });
    }
  },
});

// ---------------------------------------------------------------------------
// Per-page display settings
//
// Each public/TV page (identified by its route slug, e.g. "tv-dumplings") can
// carry its own lightweight overrides without touching the global theme or the
// menu items themselves. This is what powers "hide the images on this one
// screen" and similar per-display tweaks the staff make on a rolling basis.
//
// Stored as a single siteSettings row (key="page-settings") holding a map of
// slug -> PageSettings, so reads are one document and writes are atomic patches.
// ---------------------------------------------------------------------------

export interface PageSettings {
  showImages?: boolean; // hide/show item photos on this page (default: show)
  showChinese?: boolean; // hide/show Chinese characters (default: show)
  showAllergens?: boolean; // hide/show allergen badges (default: show)
  isActive?: boolean; // display master switch: false = standby screen (default: on)
}

const PAGE_SETTINGS_KEY = "page-settings";

// Get the full slug -> settings map (empty object if never configured).
export const getPageSettings = query({
  args: {},
  handler: async (ctx): Promise<Record<string, PageSettings>> => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", PAGE_SETTINGS_KEY))
      .first();
    if (!settings) return {};
    return (settings.value as Record<string, PageSettings>) ?? {};
  },
});

// Patch one page's settings, merging into any existing values for that slug.
// Only the provided fields are changed; everything else is preserved.
export const updatePageSetting = mutation({
  args: {
    slug: v.string(),
    patch: v.object({
      showImages: v.optional(v.boolean()),
      showChinese: v.optional(v.boolean()),
      showAllergens: v.optional(v.boolean()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", PAGE_SETTINGS_KEY))
      .first();

    const current: Record<string, PageSettings> = existing
      ? ((existing.value as Record<string, PageSettings>) ?? {})
      : {};

    const merged: Record<string, PageSettings> = {
      ...current,
      [args.slug]: { ...(current[args.slug] ?? {}), ...args.patch },
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: merged,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return await ctx.db.insert("siteSettings", {
      key: PAGE_SETTINGS_KEY,
      value: merged,
      updatedAt: Date.now(),
    });
  },
});

// ---------------------------------------------------------------------------
// Holiday decor preferences
//
// The holiday engine (src/lib/domain/holidays.ts) only computes what's
// active; whether a holiday actually decorates the displays is an explicit
// per-holiday decision made once in the dashboard and remembered here:
//   key "holiday-prefs" -> { [holidayKey]: "enabled" | "dismissed" }
// No decision = the dashboard introduces the holiday and asks. Displays
// never decorate without an "enabled" record.
// ---------------------------------------------------------------------------

const HOLIDAY_PREFS_KEY = "holiday-prefs";

export type HolidayPref = "enabled" | "dismissed";

export const getHolidayPrefs = query({
  args: {},
  handler: async (ctx): Promise<Record<string, HolidayPref>> => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", HOLIDAY_PREFS_KEY))
      .first();
    if (!settings) return {};
    return (settings.value as Record<string, HolidayPref>) ?? {};
  },
});

export const setHolidayPref = mutation({
  args: {
    holidayKey: v.string(),
    status: v.union(v.literal("enabled"), v.literal("dismissed")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", HOLIDAY_PREFS_KEY))
      .first();
    const current: Record<string, HolidayPref> = existing
      ? ((existing.value as Record<string, HolidayPref>) ?? {})
      : {};
    const merged = { ...current, [args.holidayKey]: args.status };
    if (existing) {
      await ctx.db.patch(existing._id, { value: merged, updatedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("siteSettings", {
      key: HOLIDAY_PREFS_KEY,
      value: merged,
      updatedAt: Date.now(),
    });
  },
});

// Forget all holiday decisions — every holiday gets introduced again.
export const resetHolidayPrefs = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", HOLIDAY_PREFS_KEY))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value: {}, updatedAt: Date.now() });
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
