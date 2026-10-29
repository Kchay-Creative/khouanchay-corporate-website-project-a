"use client";
import { useI18n } from "@/i18n/provider";
export default function Loading() {
  const { dictionary: d } = useI18n();
  return (
    <main className="status-page" role="status" aria-live="polite">
      <div className="loading-indicator" />
      <p>{d.status.loading}</p>
    </main>
  );
}
