"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/i18n/provider";
import { positionTitle } from "@/features/organization/model";
import type { Person, Position } from "@/features/organization/types";

function safeImageUrl(value: string | null | undefined) {
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

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function detailDescription(
  person: Person | null,
  position: Position,
  locale: string,
) {
  for (const value of [person, position]) {
    if (!value) continue;
    const record = value as unknown as Record<string, unknown>;

    for (const key of ["biographyTranslations", "descriptionTranslations"]) {
      const translations = record[key];
      if (translations && typeof translations === "object") {
        const translated = (translations as Record<string, unknown>)[locale];
        if (typeof translated === "string" && translated.trim()) {
          return translated.trim();
        }
      }
    }

    for (const key of ["biography", "description"]) {
      const description = record[key];
      if (typeof description === "string" && description.trim()) {
        return description.trim();
      }
    }
  }

  return null;
}

export function OrganizationDetailOverlay({
  open,
  position,
  person,
  onClose,
}: {
  open: boolean;
  position: Position | null;
  person: Person | null;
  parent: Position | null;
  directReportCount: number;
  onClose: () => void;
}) {
  const { locale, dictionary: d } = useI18n();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !position) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
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
  }, [open, position]);

  if (!open || !position || typeof document === "undefined") return null;

  const displayName = person?.displayName ?? d.organization.vacant;
  const imageUrl = safeImageUrl(person?.imageUrl);
  const showImage = Boolean(imageUrl && imageUrl !== failedImageUrl);
  const department =
    position.departmentTranslations?.[locale] ??
    position.department ??
    d.organization.departmentNotSpecified;
  const description = detailDescription(person, position, locale);

  return createPortal(
    <div className="org-person-detail-layer">
      <div
        className="org-person-detail-backdrop"
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="org-person-detail-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeRef}
          className="org-person-detail-close"
          type="button"
          aria-label={d.common.close}
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="org-person-detail-portrait" aria-hidden="true">
          {showImage && imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 1100px) 82vw, 700px"
              unoptimized
              priority
              onError={() => setFailedImageUrl(imageUrl)}
            />
          ) : (
            <span>{initials(displayName) || "—"}</span>
          )}
        </div>

        <article
          className="org-person-detail-content"
          tabIndex={0}
          aria-label={d.organization.selectedDetails}
        >
          <div
            className="org-person-detail-scroll-spacer"
            aria-hidden="true"
          />
          <header className="org-person-detail-heading">
            <h1 id={titleId}>{displayName}</h1>
            <p className="org-person-detail-position">
              {positionTitle(position, locale)}
            </p>
            <p className="org-person-detail-department">{department}</p>
          </header>

          {description ? (
            <div className="org-person-detail-description-scroll">
              <p className="org-person-detail-description">{description}</p>
            </div>
          ) : null}
        </article>
      </div>
    </div>,
    document.body,
  );
}
