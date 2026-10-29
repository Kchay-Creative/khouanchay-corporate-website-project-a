"use client";

import Image from "next/image";
import { useState } from "react";
import { safeBrandImageUrl } from "@/features/brands/model";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function BrandMedia({
  imageUrl,
  name,
  sizes,
  className = "",
}: {
  imageUrl: string | null;
  name: string;
  sizes: string;
  className?: string;
}) {
  const validUrl = safeBrandImageUrl(imageUrl);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  return (
    <span className={`brand-media ${className}`}>
      {validUrl && failedUrl !== validUrl ? (
        <Image
          src={validUrl}
          alt=""
          fill
          sizes={sizes}
          unoptimized
          onError={() => setFailedUrl(validUrl)}
        />
      ) : (
        <span className="brand-media__placeholder" aria-hidden="true">
          {initials(name) || "KCC"}
        </span>
      )}
    </span>
  );
}
