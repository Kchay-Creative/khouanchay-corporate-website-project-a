import type { Locale } from "@/i18n";

export type LocalizedBrandText = Partial<Record<Locale, string>>;

export type BrandProduct = {
  id: string;
  name: LocalizedBrandText;
  description: LocalizedBrandText;
  category: LocalizedBrandText;
  imageUrl: string | null;
  visible: boolean;
  displayOrder: number;
};

export type Brand = {
  id: string;
  name: LocalizedBrandText;
  description: LocalizedBrandText;
  logoUrl: string | null;
  visible: boolean;
  displayOrder: number;
  products: BrandProduct[];
};

export type BrandCatalog = {
  schemaVersion: 1;
  contentRevision?: number;
  brands: Brand[];
};
