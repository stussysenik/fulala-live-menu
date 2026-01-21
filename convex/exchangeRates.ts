import { action, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

// Exchange rates type
interface ExchangeRates {
  CZK: number;
  EUR: number;
  USD: number;
  CNY: number;
}

// Frankfurter API response type
interface FrankfurterResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

/**
 * Fetch live exchange rates from Frankfurter API
 * Free, no API key required, no rate limits
 * https://api.frankfurter.dev/v1
 */
export const fetchLiveRates = action({
  args: {},
  handler: async (): Promise<ExchangeRates> => {
    // Fetch rates with USD as base
    const response = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=USD&symbols=CZK,EUR,CNY"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }

    const data: FrankfurterResponse = await response.json();

    // Build rates object with USD = 1
    const rates: ExchangeRates = {
      USD: 1,
      CZK: data.rates.CZK ?? 23.5, // Fallback to approximate values
      EUR: data.rates.EUR ?? 0.92,
      CNY: data.rates.CNY ?? 7.25,
    };

    return rates;
  },
});

/**
 * Internal mutation to update exchange rates in theme settings
 */
export const updateExchangeRatesInTheme = internalMutation({
  args: {
    rates: v.object({
      USD: v.number(),
      CZK: v.number(),
      EUR: v.number(),
      CNY: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Get current theme
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "theme"))
      .first();

    if (!settings) {
      // No theme exists yet, nothing to update
      return null;
    }

    // Type assertion for theme value
    const theme = settings.value as {
      currency?: { rates?: ExchangeRates };
      [key: string]: unknown;
    };

    // Update rates in theme
    const updatedTheme = {
      ...theme,
      currency: {
        ...(theme.currency ?? {}),
        rates: args.rates,
      },
    };

    await ctx.db.patch(settings._id, {
      value: updatedTheme,
      updatedAt: Date.now(),
    });

    return settings._id;
  },
});

/**
 * Fetch and update exchange rates - combines fetch and update
 * Call this from admin UI or cron job
 */
export const refreshExchangeRates = action({
  args: {},
  handler: async (ctx): Promise<ExchangeRates> => {
    // Fetch live rates
    const response = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=USD&symbols=CZK,EUR,CNY"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }

    const data: FrankfurterResponse = await response.json();

    const rates: ExchangeRates = {
      USD: 1,
      CZK: data.rates.CZK ?? 23.5,
      EUR: data.rates.EUR ?? 0.92,
      CNY: data.rates.CNY ?? 7.25,
    };

    // Update theme with new rates
    await ctx.runMutation(internal.exchangeRates.updateExchangeRatesInTheme, {
      rates,
    });

    return rates;
  },
});

/**
 * Internal action for cron job - refreshes rates automatically
 */
export const cronRefreshRates = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    try {
      const response = await fetch(
        "https://api.frankfurter.dev/v1/latest?base=USD&symbols=CZK,EUR,CNY"
      );

      if (!response.ok) {
        console.error(`Failed to fetch exchange rates: ${response.statusText}`);
        return;
      }

      const data: FrankfurterResponse = await response.json();

      const rates: ExchangeRates = {
        USD: 1,
        CZK: data.rates.CZK ?? 23.5,
        EUR: data.rates.EUR ?? 0.92,
        CNY: data.rates.CNY ?? 7.25,
      };

      await ctx.runMutation(internal.exchangeRates.updateExchangeRatesInTheme, {
        rates,
      });

      console.log(`Exchange rates updated: CZK=${rates.CZK}, EUR=${rates.EUR}, CNY=${rates.CNY}`);
    } catch (error) {
      console.error("Failed to refresh exchange rates:", error);
    }
  },
});
