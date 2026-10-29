"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { Brand } from "@/features/brands/types";
import { localizedBrandText, sortedProducts } from "@/features/brands/model";
import { useI18n } from "@/i18n/provider";
import { BrandMedia } from "./brand-media";

export function BrandDetailsModal({
  brand,
  onClose,
}: {
  brand: Brand | null;
  onClose: () => void;
}) {
  const { locale, dictionary: d } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!brand) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [brand, onClose]);

  if (!brand || typeof document === "undefined") return null;

  const name = localizedBrandText(brand.name, locale);
  const description = localizedBrandText(brand.description, locale);
  const products = sortedProducts(brand).filter((product) => product.visible);

  return createPortal(
    <div className="brand-modal-layer">
      <button
        className="brand-modal-overlay"
        type="button"
        aria-label={d.brands.closeDetails}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="brand-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeRef}
          className="brand-modal-close"
          type="button"
          aria-label={d.brands.closeDetails}
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <header className="brand-modal-header">
          <BrandMedia
            imageUrl={brand.logoUrl}
            name={name}
            sizes="(max-width: 640px) 120px, 160px"
            className="brand-modal-logo"
          />
          <div>
            <h2 id={titleId}>{name}</h2>
            <p>{description || d.brands.descriptionPending}</p>
          </div>
        </header>
        <section
          className="brand-modal-products"
          aria-labelledby={`${titleId}-products`}
        >
          <h3 id={`${titleId}-products`}>{d.brands.productsTitle}</h3>
          {products.length ? (
            <div className="brand-product-grid">
              {products.map((product) => {
                const productName = localizedBrandText(product.name, locale);
                const category = localizedBrandText(product.category, locale);
                const productDescription = localizedBrandText(
                  product.description,
                  locale,
                );
                return (
                  <article className="brand-product" key={product.id}>
                    <BrandMedia
                      imageUrl={product.imageUrl}
                      name={productName}
                      sizes="(max-width: 640px) 100vw, 260px"
                      className="brand-product-image"
                    />
                    <div className="brand-product-copy">
                      {category ? <span>{category}</span> : null}
                      <h4>{productName}</h4>
                      <p>{productDescription || d.brands.descriptionPending}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="brand-modal-empty">{d.brands.noProducts}</p>
          )}
        </section>
      </div>
    </div>,
    document.body,
  );
}
