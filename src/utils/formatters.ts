import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import i18n from "@/plugins/i18n";
import type { WidgetPeriod } from "@/models/dashboardWidget";
import { getColorFromPalette, getLightColorFromPalette } from "@/composables";

dayjs.extend(localizedFormat);

export function formatDate(value: string | Date | null | undefined, format: string = "L"): string {
  if (!value) return "";
  return dayjs(value).format(format);
}

export function dayjsFormatDate(value: string | Date | null | undefined, format: string): string {
  if (!value) return "";
  return dayjs(value).format(format);
}

// Number formats
function formatNumberValue(
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions,
): string {
  if (!value && value != 0) {
    return "";
  }

  const numericValue: number = typeof value === "string" ? parseFloat(value) : value;
  return i18n.global.n(numericValue, options as { [key: string]: string | number | boolean });
}

export function formatAmount(
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions,
): string {
  const {
    minimumFractionDigits: userMin,
    maximumFractionDigits: userMax,
    ...restOptions
  } = options ?? {};

  const maxFrac = userMax ?? 2;
  const minFrac = userMin ?? Math.min(2, maxFrac);

  return formatNumberValue(value, {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
    ...restOptions,
  });
}

export interface CurrencyFormatOptions extends Intl.NumberFormatOptions {
  compact?: boolean;
}

/**
 * Format a number as currency with locale support.
 * Uses Intl.NumberFormat for proper localization.
 *
 * @example
 * formatCurrency(125400)                          // → "$125,400.00"
 * formatCurrency(125400, { compact: true })       // → "$125K"
 * formatCurrency(1500000, { compact: true })      // → "$1.5M"
 * formatCurrency(85, { maximumFractionDigits: 0 }) // → "$85"
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: CurrencyFormatOptions,
): string {
  const {
    compact,
    minimumFractionDigits: userMin,
    maximumFractionDigits: userMax,
    ...restOptions
  } = options ?? {};

  // Determine fraction digits, ensuring min <= max
  const maxFrac = userMax ?? (compact ? 1 : 2);
  const minFrac = userMin ?? (compact ? 0 : Math.min(2, maxFrac));

  return formatNumberValue(value, {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
    ...(compact ? { notation: "compact" } : {}),
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
    ...restOptions,
  });
}

/**
 * Create subtitle items array for widget header based on period
 */
export function createPeriodSubtitleItems(
  period: WidgetPeriod,
  showColors: boolean = false,
  mainColor: string = getColorFromPalette(0),
  compareColor: string = getLightColorFromPalette(0),
): { title: string; color: string | undefined }[] {
  const items: { title: string; color: string | undefined }[] = [];

  // Main period
  const mainLabel = `${formatDate(period.dateFrom, "MMM DD")} - ${formatDate(period.dateTo, "ll")}`;
  if (mainLabel) {
    items.push({ title: mainLabel, color: showColors ? mainColor : undefined });
  }

  // Compare period (if present)
  if (period.compareDateFrom && period.compareDateTo) {
    const compareLabel = `${formatDate(period.compareDateFrom, "MMM DD")} - ${formatDate(period.compareDateTo, "ll")}`;
    if (compareLabel) {
      items.push({ title: compareLabel, color: showColors ? compareColor : undefined });
    }
  }

  return items;
}
