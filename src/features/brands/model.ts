import type { Locale } from "@/i18n";
import type {
  Brand,
  BrandCatalog,
  BrandProduct,
  LocalizedBrandText,
} from "./types";

export function localizedBrandText(
  value: LocalizedBrandText,
  locale: Locale,
): string {
  return value[locale]?.trim() || value.en?.trim() || value.lo?.trim() || "";
}

export function sortedBrands(catalog: BrandCatalog): Brand[] {
  return [...catalog.brands].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.id.localeCompare(b.id),
  );
}

export function sortedProducts(brand: Brand): BrandProduct[] {
  return [...brand.products].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.id.localeCompare(b.id),
  );
}

function isLocalizedText(value: unknown): value is LocalizedBrandText {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return ["lo", "en"].every(
    (locale) =>
      candidate[locale] === undefined || typeof candidate[locale] === "string",
  );
}

function isOptionalImageUrl(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isProduct(value: unknown): value is BrandProduct {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const product = value as Partial<BrandProduct>;
  return (
    typeof product.id === "string" &&
    isLocalizedText(product.name) &&
    isLocalizedText(product.description) &&
    isLocalizedText(product.category) &&
    isOptionalImageUrl(product.imageUrl) &&
    typeof product.visible === "boolean" &&
    typeof product.displayOrder === "number" &&
    Number.isFinite(product.displayOrder)
  );
}

function isBrand(value: unknown): value is Brand {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const brand = value as Partial<Brand>;
  return (
    typeof brand.id === "string" &&
    isLocalizedText(brand.name) &&
    isLocalizedText(brand.description) &&
    isOptionalImageUrl(brand.logoUrl) &&
    typeof brand.visible === "boolean" &&
    typeof brand.displayOrder === "number" &&
    Number.isFinite(brand.displayOrder) &&
    Array.isArray(brand.products) &&
    brand.products.every(isProduct) &&
    new Set(brand.products.map((product) => product.id)).size ===
      brand.products.length
  );
}

export function validateBrandCatalog(value: unknown): value is BrandCatalog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const catalog = value as Partial<BrandCatalog>;
  return (
    catalog.schemaVersion === 1 &&
    (catalog.contentRevision === undefined ||
      (typeof catalog.contentRevision === "number" &&
        Number.isInteger(catalog.contentRevision) &&
        catalog.contentRevision >= 0)) &&
    Array.isArray(catalog.brands) &&
    catalog.brands.every(isBrand) &&
    new Set(catalog.brands.map((brand) => brand.id)).size ===
      catalog.brands.length
  );
}

export function safeBrandImageUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:image/")
  ) {
    return trimmed;
  }
  return null;
}
