import { Template, User } from "@/types";

const EUROPE_COUNTRIES = new Set([
  "AT", "BE", "BG", "CH", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GB", "GR",
  "HR", "HU", "IE", "IS", "IT", "LI", "LT", "LU", "LV", "MC", "MT", "NL", "NO", "PL",
  "PT", "RO", "SE", "SI", "SK",
]);

export interface PricingContext {
  countryCode: string;
  currency: "INR" | "USD" | "EUR";
}

const normalizeCountryCode = (value?: string | null): string | null => {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return normalized.length === 2 ? normalized : null;
};

const extractCountryFromLocale = (locale?: string | null): string | null => {
  if (!locale) return null;
  const parts = locale.replace("_", "-").split("-");
  return normalizeCountryCode(parts[1]);
};

export const detectCountryCode = (user?: User | null): string => {
  const localeCandidates = [...(navigator.languages || []), navigator.language, Intl.DateTimeFormat().resolvedOptions().locale];
  const candidates = [normalizeCountryCode(user?.countryCode), ...localeCandidates.map(extractCountryFromLocale)];

  for (const candidate of candidates) {
    if (candidate) {
      return candidate;
    }
  }

  return "IN";
};

export const currencyForCountry = (countryCode: string): PricingContext["currency"] => {
  if (countryCode === "IN") return "INR";
  if (EUROPE_COUNTRIES.has(countryCode)) return "EUR";
  return "USD";
};

export const getPricingContext = (user?: User | null): PricingContext => {
  const countryCode = detectCountryCode(user);
  return { countryCode, currency: currencyForCountry(countryCode) };
};

export const formatMoney = (amount: number, currency: string): string =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const formatTemplatePrice = (
  template: Pick<Template, "isFree" | "displayPrice" | "displayCurrency" | "priceInr">,
): string => {
  if (template.isFree) {
    return "FREE";
  }

  return formatMoney(
    template.displayPrice ?? template.priceInr ?? 0,
    template.displayCurrency || "INR",
  );
};
