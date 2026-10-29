"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { localizedBrandText, sortedBrands } from "@/features/brands/model";
import { useBrandCatalog } from "@/features/brands/storage";
import type { Brand } from "@/features/brands/types";
import { useI18n } from "@/i18n/provider";
import { BrandDetailsModal } from "./brand-details-modal";
import { BrandMedia } from "./brand-media";

type BrandLayoutMode = "desktop" | "tablet" | "mobile" | "compact";

const ROW_PATTERNS: Record<BrandLayoutMode, readonly [number, number]> = {
  desktop: [10, 9],
  tablet: [6, 5],
  mobile: [4, 3],
  compact: [3, 2],
};

function getLayoutMode(): BrandLayoutMode {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth >= 1200) return "desktop";
  if (window.innerWidth >= 720) return "tablet";
  if (window.innerWidth >= 440) return "mobile";
  return "compact";
}

function subscribeToViewport(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange, { passive: true });
  return () => window.removeEventListener("resize", onStoreChange);
}

function planBrandSlotRows(
  brands: Brand[],
  pattern: readonly [number, number],
) {
  const rows: Array<Array<Brand | null>> = [];
  let start = 0;
  let rowIndex = 0;

  while (start < brands.length) {
    const capacity = pattern[rowIndex % pattern.length];
    const slots: Array<Brand | null> = Array.from(
      { length: capacity },
      () => null,
    );
    const visibleCount = Math.min(capacity, brands.length - start);

    for (let index = 0; index < visibleCount; index += 1) {
      slots[index] = brands[start + index];
    }

    rows.push(slots);
    start += visibleCount;
    rowIndex += 1;
  }

  return rows;
}

export function BrandsDirectory() {
  const { locale, dictionary: d } = useI18n();
  const { data } = useBrandCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const brands = useMemo(
    () => sortedBrands(data).filter((brand) => brand.visible),
    [data],
  );
  const layoutMode = useSyncExternalStore<BrandLayoutMode>(
    subscribeToViewport,
    getLayoutMode,
    () => "desktop",
  );
  const rows = useMemo(
    () => planBrandSlotRows(brands, ROW_PATTERNS[layoutMode]),
    [brands, layoutMode],
  );
  const selectedBrand = brands.find((brand) => brand.id === selectedId) ?? null;
  const closeDetails = useCallback(() => setSelectedId(null), []);

  return (
    <section className="brand-directory content-section">
      <div className="container">
        <header className="brand-directory-heading">
          <h2>{d.brands.directoryTitle}</h2>
          <p>{d.brands.directoryIntro}</p>
        </header>
        {brands.length ? (
          <div
            className="brand-honeycomb"
            data-layout={layoutMode}
            aria-label={d.brands.directoryTitle}
          >
            {rows.map((slots, rowIndex) => (
              <div
                className="brand-honeycomb-row"
                key={`${layoutMode}-${rowIndex}`}
              >
                {slots.map((brand, slotIndex) => {
                  if (!brand) {
                    return (
                      <span
                        className="brand-honeycomb-slot is-reserved"
                        aria-hidden="true"
                        key={`slot-${slotIndex}`}
                      />
                    );
                  }

                  const name = localizedBrandText(brand.name, locale);
                  return (
                    <span
                      className="brand-honeycomb-slot"
                      key={`slot-${slotIndex}`}
                    >
                      <button
                        className="brand-hex"
                        type="button"
                        data-brand-id={brand.id}
                        aria-label={d.brands.openDetails.replace("{name}", name)}
                        onClick={() => setSelectedId(brand.id)}
                      >
                        <span className="brand-hex-surface">
                          <BrandMedia
                            imageUrl={brand.logoUrl}
                            name={name}
                            sizes="(max-width: 719px) 42px, (max-width: 1199px) 48px, 54px"
                            className="brand-hex-logo"
                          />
                          <strong>{name}</strong>
                        </span>
                      </button>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="brand-directory-empty">
            <h3>{d.brands.emptyTitle}</h3>
            <p>{d.brands.emptyBody}</p>
          </div>
        )}
      </div>
      <BrandDetailsModal brand={selectedBrand} onClose={closeDetails} />
    </section>
  );
}
