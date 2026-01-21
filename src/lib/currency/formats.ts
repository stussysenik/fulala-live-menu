// Currency formatting configuration and helpers

export type CurrencyCode = "CZK" | "EUR" | "USD" | "CNY";

export interface CurrencyFormat {
  code: CurrencyCode;
  symbol: string;
  symbolPosition: "before" | "after";
  decimals: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

// Currency format definitions based on locale conventions
export const currencyFormats: Record<CurrencyCode, CurrencyFormat> = {
  CZK: {
    code: "CZK",
    symbol: "Kč",
    symbolPosition: "after",
    decimals: 0,
    thousandsSeparator: " ",
    decimalSeparator: ",",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    symbolPosition: "before",
    decimals: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  USD: {
    code: "USD",
    symbol: "$",
    symbolPosition: "before",
    decimals: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  CNY: {
    code: "CNY",
    symbol: "¥",
    symbolPosition: "before",
    decimals: 0,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
};

// Format a number according to currency locale
function formatNumber(
  value: number,
  decimals: number,
  thousandsSeparator: string,
  decimalSeparator: string
): string {
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");

  // Add thousands separators
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  if (decimals === 0) {
    return formattedInt;
  }

  return `${formattedInt}${decimalSeparator}${decPart}`;
}

// Format a price in a specific currency
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  showSymbol: boolean = true,
  compact: boolean = false
): string {
  const format = currencyFormats[currency];
  const formatted = formatNumber(
    amount,
    compact ? 0 : format.decimals,
    format.thousandsSeparator,
    format.decimalSeparator
  );

  if (!showSymbol) {
    return formatted;
  }

  if (format.symbolPosition === "before") {
    return `${format.symbol}${formatted}`;
  } else {
    return `${formatted} ${format.symbol}`;
  }
}

// Get the display name for a currency
export function getCurrencyName(code: CurrencyCode): string {
  const names: Record<CurrencyCode, string> = {
    CZK: "Czech Koruna",
    EUR: "Euro",
    USD: "US Dollar",
    CNY: "Chinese Yuan",
  };
  return names[code];
}

// Get short code for compact display
export function getCurrencyShortDisplay(code: CurrencyCode): string {
  return currencyFormats[code].symbol;
}
