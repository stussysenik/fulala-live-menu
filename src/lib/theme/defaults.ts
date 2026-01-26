// Theme configuration TypeScript types

import type { CurrencyCode, ExchangeRates } from "$lib/currency";

// Currency display modes
export type CurrencyDisplayMode = "single" | "multi" | "toggle";

// Currency configuration
export interface CurrencyConfig {
  baseCurrency: CurrencyCode;
  displayCurrencies: CurrencyCode[];
  displayMode: CurrencyDisplayMode;
  rates: ExchangeRates;
  showSymbols: boolean;
  compactMode: boolean;
}

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
    price: string;           // Dedicated price color for visual hierarchy
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
    cardPadding?: string;      // Padding inside cards (luxury theme)
    sectionMargin?: string;    // Margin between major sections (luxury theme)
    minTouchTarget?: string;   // Minimum touch target size for accessibility (luxury theme)
  };
  animations?: {
    // Custom easing curves for physics-based motion
    easeEnter: string;         // Overshoot entrance animation
    easeExit: string;          // Smooth exit animation
    easeSpring: string;        // Spring bounce animation
    // Durations for different animation contexts
    durationQuick: string;     // Quick transitions (200ms)
    durationNormal: string;    // Normal transitions (400ms)
    durationSlow: string;      // Slow emphasis transitions (600ms)
    durationPage: string;      // Page layout transitions (800ms)
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

// Default theme based on Tufte principles and menu research:
// - Warm colors (terracotta accent) stimulate appetite
// - No currency symbol - research shows ~8% spending increase
// - Clean typography with good line spacing (1.5)
// - Minimal decoration, high data-ink ratio
export const defaultTheme: ThemeConfig = {
  fonts: {
    headline: "Georgia, serif",
    body: "Helvetica Neue, Arial, sans-serif",
    price: "Helvetica Neue, Arial, sans-serif",
  },
  typography: {
    headlineSize: "1.875rem",     // 30px
    subheadlineSize: "1.25rem",   // 20px
    bodySize: "1rem",             // 16px (min 12pt for readability)
    priceSize: "1rem",
    allergenSize: "0.75rem",
    lineSpacing: 1.5,             // Research: 1.4-1.5x optimal
  },
  colors: {
    text: "#1a1a1a",              // High contrast (15:1) - titles/headings
    textMuted: "#525252",          // Secondary (7:1 contrast)
    price: "#2d5016",              // Distinct price color - deep forest green for instant recognition
    background: "#ffffff",
    surface: "#fafafa",
    accent: "#c45a3b",             // Warm terracotta - appetite stimulating
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
    showCurrencySymbol: false,    // Research: +8% without $
    priceAlignment: "right",
    showImages: false,
    imageSize: "medium",
  },
  tv: {
    scaleFactor: 1.5,
    columnCount: 3,
  },
  currency: {
    baseCurrency: "USD",  // Prices stored in USD cents in DB
    displayCurrencies: ["CZK", "EUR", "USD"],  // CZK first for Czech customers
    displayMode: "single",
    rates: { CZK: 23.5, EUR: 0.92, USD: 1, CNY: 7.25 },
    showSymbols: true,
    compactMode: true,
  },
};

// Pre-built theme presets
export const themePresets: Record<string, ThemeConfig> = {
  classic: defaultTheme,

  modern: {
    ...defaultTheme,
    fonts: {
      headline: "Inter, sans-serif",
      body: "Inter, sans-serif",
      price: "Inter, sans-serif",
    },
    colors: {
      ...defaultTheme.colors,
      price: "#1e40af",             // Deep blue for modern theme
      accent: "#3b82f6",
      surface: "#f8fafc",
    },
  },

  elegant: {
    ...defaultTheme,
    fonts: {
      headline: "Playfair Display, serif",
      body: "Lato, sans-serif",
      price: "Lato, sans-serif",
    },
    colors: {
      ...defaultTheme.colors,
      text: "#1e293b",
      price: "#7c2d12",              // Warm brown for elegant theme
      accent: "#854d0e",
      background: "#fffef7",
      surface: "#fefce8",
    },
  },

  dark: {
    ...defaultTheme,
    colors: {
      text: "#f8fafc",
      textMuted: "#94a3b8",
      price: "#a3e635",              // Vibrant lime for dark mode - instant recognition
      background: "#0f172a",
      surface: "#1e293b",
      accent: "#f97316",
      available: "#22c55e",
      unavailable: "#ef4444",
      border: "#334155",
    },
  },

  luxury: {
    ...defaultTheme,
    fonts: {
      headline: "Cormorant Garamond, serif",
      body: "Inter, sans-serif",
      price: "DM Mono, monospace",
    },
    typography: {
      headlineSize: "2rem",          // 32px - 20% larger for luxury presence
      subheadlineSize: "1.5rem",     // 24px
      bodySize: "1.0625rem",         // 17px - 15% larger for comfort
      priceSize: "1.125rem",         // 18px - emphasized pricing
      allergenSize: "0.875rem",      // 14px - subtle but readable
      lineSpacing: 1.65,             // Generous breathing room
    },
    colors: {
      text: "#5D3F37",               // Dark Walnut - warm, sophisticated
      textMuted: "#8D6F67",          // Lighter Dark Walnut
      price: "#00B085",              // Jungle Green - fresh, premium
      background: "#FFFFFF",         // Pure white
      surface: "#EFE7CA",            // Cornsilk - cream/beige cards
      accent: "#D63330",             // Cinnabar - bold red for CTAs
      available: "#00B085",          // Jungle Green
      unavailable: "#E9A754",        // Honey Bronze - warm, not aggressive
      border: "#E5DCC0",             // Darker Cornsilk variant
    },
    spacing: {
      scale: 1.5,                    // 50% more space everywhere
      itemGap: "1.5rem",             // 24px
      categoryGap: "3rem",           // 48px
      cardPadding: "2rem",           // 32px inside cards
      sectionMargin: "4rem",         // 64px between sections
      minTouchTarget: "3rem",        // 48px accessibility
    },
    animations: {
      // Physics-based "grilling noodles" motion
      easeEnter: "cubic-bezier(0.34, 1.56, 0.64, 1)",      // Overshoot entrance
      easeExit: "cubic-bezier(0.22, 0.61, 0.36, 1)",       // Smooth exit
      easeSpring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // Spring bounce
      durationQuick: "200ms",
      durationNormal: "400ms",
      durationSlow: "600ms",
      durationPage: "800ms",
    },
    display: {
      ...defaultTheme.display,
      showImages: true,              // Luxury benefits from imagery
      imageSize: "large",            // Larger images for premium feel
    },
  },
};

// Helper to convert theme to CSS variables
export function themeToCssVars(theme: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {
    "--font-headline": theme.fonts.headline,
    "--font-body": theme.fonts.body,
    "--font-price": theme.fonts.price,
    "--text-headline": theme.typography.headlineSize,
    "--text-subheadline": theme.typography.subheadlineSize,
    "--text-body": theme.typography.bodySize,
    "--text-price": theme.typography.priceSize,
    "--text-allergen": theme.typography.allergenSize,
    "--line-spacing": String(theme.typography.lineSpacing),
    "--color-text": theme.colors.text,
    "--color-text-muted": theme.colors.textMuted,
    "--color-price": theme.colors.price,
    "--color-bg": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-accent": theme.colors.accent,
    "--color-available": theme.colors.available,
    "--color-unavailable": theme.colors.unavailable,
    "--color-border": theme.colors.border,
    "--spacing-scale": String(theme.spacing.scale),
    "--spacing-item-gap": theme.spacing.itemGap,
    "--spacing-category-gap": theme.spacing.categoryGap,
    "--tv-scale-factor": String(theme.tv.scaleFactor),
    "--tv-column-count": String(theme.tv.columnCount),
  };

  // Add optional spacing variables (luxury theme)
  if (theme.spacing.cardPadding) {
    vars["--spacing-card-padding"] = theme.spacing.cardPadding;
  }
  if (theme.spacing.sectionMargin) {
    vars["--spacing-section-margin"] = theme.spacing.sectionMargin;
  }
  if (theme.spacing.minTouchTarget) {
    vars["--spacing-min-touch-target"] = theme.spacing.minTouchTarget;
  }

  // Add animation variables if defined (luxury theme)
  if (theme.animations) {
    vars["--anim-ease-enter"] = theme.animations.easeEnter;
    vars["--anim-ease-exit"] = theme.animations.easeExit;
    vars["--anim-ease-spring"] = theme.animations.easeSpring;
    vars["--anim-duration-quick"] = theme.animations.durationQuick;
    vars["--anim-duration-normal"] = theme.animations.durationNormal;
    vars["--anim-duration-slow"] = theme.animations.durationSlow;
    vars["--anim-duration-page"] = theme.animations.durationPage;
  }

  return vars;
}

// Helper to get image size dimensions
export function getImageSize(size: "small" | "medium" | "large"): { width: number; height: number } {
  const sizes = {
    small: { width: 60, height: 60 },
    medium: { width: 100, height: 100 },
    large: { width: 150, height: 150 },
  };
  return sizes[size];
}

// Extract Google Fonts URLs from theme
export function getGoogleFontsUrl(theme: ThemeConfig): string | null {
  const fonts = new Set<string>();

  // List of Google Fonts that might be used
  const googleFonts = [
    "Inter",
    "Playfair Display",
    "Lato",
    "Open Sans",
    "Roboto",
    "Merriweather",
    "Source Sans Pro",
    "Montserrat",
    "Raleway",
    "Poppins",
    "Cormorant Garamond",
    "DM Mono",
  ];

  const checkFont = (fontStack: string) => {
    for (const gf of googleFonts) {
      if (fontStack.includes(gf)) {
        fonts.add(gf.replace(/ /g, "+"));
      }
    }
  };

  checkFont(theme.fonts.headline);
  checkFont(theme.fonts.body);
  checkFont(theme.fonts.price);

  if (fonts.size === 0) return null;

  const families = Array.from(fonts).map((f) => `family=${f}:wght@400;500;600;700`);
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
