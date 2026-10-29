"use client";

import { useSyncExternalStore } from "react";
import { validateBrandCatalog } from "./model";
import { createInitialBrandCatalog } from "./seed";
import type { BrandCatalog } from "./types";

export const brandCatalogStorageKey = "kcc_brand_catalog_v2";
const brandCatalogUpdateEvent = "kcc-brand-catalog-update";
const serverSnapshot = createInitialBrandCatalog();
let cachedRaw: string | null | undefined;
let cachedData = serverSnapshot;

function readStoredCatalog(): BrandCatalog {
  try {
    const saved = window.localStorage.getItem(brandCatalogStorageKey);
    if (saved === cachedRaw) return cachedData;
    cachedRaw = saved;
    if (!saved) {
      cachedData = createInitialBrandCatalog();
      return cachedData;
    }
    const parsed: unknown = JSON.parse(saved);
    cachedData = validateBrandCatalog(parsed)
      ? { ...parsed, contentRevision: parsed.contentRevision ?? 1 }
      : createInitialBrandCatalog();
    return cachedData;
  } catch {
    cachedData = createInitialBrandCatalog();
    return cachedData;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(brandCatalogUpdateEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(brandCatalogUpdateEvent, callback);
  };
}

export function useBrandCatalog() {
  const data = useSyncExternalStore(
    subscribe,
    readStoredCatalog,
    () => serverSnapshot,
  );

  const save = (next: BrandCatalog) => {
    if (!validateBrandCatalog(next)) return false;
    try {
      const persisted = {
        ...next,
        contentRevision: (cachedData.contentRevision ?? 0) + 1,
      };
      const serialized = JSON.stringify(persisted);
      window.localStorage.setItem(brandCatalogStorageKey, serialized);
      cachedRaw = serialized;
      cachedData = persisted;
      window.dispatchEvent(new Event(brandCatalogUpdateEvent));
      return true;
    } catch {
      return false;
    }
  };

  return { data, ready: true, save };
}
