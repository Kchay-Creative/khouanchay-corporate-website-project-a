"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/i18n/provider";

function initials(name: string | null): string {
  if (!name) return "—";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function fitClass(value: string, longAt: number, extraLongAt: number): string {
  const length = Array.from(value.trim()).length;
  if (length >= extraLongAt) return "is-extra-long";
  if (length >= longAt) return "is-long";
  return "";
}

function nameFitClass(value: string): string {
  const length = Array.from(value.trim()).length;
  if (length <= 18) return "is-short";
  if (length >= 36) return "is-extra-long";
  if (length >= 23) return "is-long";
  return "";
}

function safeImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:image/")
  )
    return trimmed;
  return null;
}

export function OrganizationProfileCard({
  positionId,
  personName,
  positionTitle,
  department,
  imageUrl,
  selected,
  matched,
  eagerImage = false,
  onSelect,
}: {
  positionId: string;
  personName: string | null;
  positionTitle: string;
  department?: string | null;
  imageUrl?: string | null;
  selected: boolean;
  matched: boolean;
  eagerImage?: boolean;
  onSelect: (positionId: string) => void;
}) {
  const { dictionary: d } = useI18n();
  const validImageUrl = safeImageUrl(imageUrl);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = Boolean(
    validImageUrl && validImageUrl !== failedImageUrl,
  );
  const displayName = personName ?? d.organization.vacant;
  const displayDepartment = department?.trim() || "—";
  const accessibleDepartment =
    department?.trim() || d.organization.departmentNotSpecified;
  const nameFit = nameFitClass(displayName);
  const positionFit = fitClass(positionTitle, 24, 32);
  const departmentFit = fitClass(displayDepartment, 24, 32);

  return (
    <button
      type="button"
      className={`org-card org-profile-card ${selected ? "is-selected" : ""} ${matched ? "is-match" : ""}`}
      data-position-id={positionId}
      aria-pressed={selected}
      aria-label={`${displayName}, ${positionTitle}, ${accessibleDepartment}`}
      onClick={() => onSelect(positionId)}
    >
      <span className="org-profile-card__text-box" aria-hidden="true" />
      <span className="org-profile-card__copy">
        <strong
          className={`org-profile-card__name ${nameFit}`}
          title={displayName}
        >
          {displayName}
        </strong>
        <span className="org-profile-card__role-group">
          <span
            className={`org-profile-card__position ${positionFit}`}
            title={positionTitle}
          >
            {positionTitle}
          </span>
          <span
            className={`org-profile-card__department ${departmentFit}`}
            title={accessibleDepartment}
          >
            {displayDepartment}
          </span>
        </span>
      </span>
      <span className="org-profile-card__avatar" aria-hidden="true">
        {showImage && validImageUrl ? (
          <Image
            src={validImageUrl}
            alt=""
            width={175}
            height={175}
            unoptimized
            loading={eagerImage ? "eager" : "lazy"}
            draggable={false}
            onError={() => setFailedImageUrl(validImageUrl)}
          />
        ) : (
          <span className="org-profile-card__avatar-placeholder">
            {initials(personName)}
          </span>
        )}
      </span>
    </button>
  );
}
